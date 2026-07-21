import http from 'k6/http';

import config from '../framework/config.js';
import logger from '../framework/core/logger.js';

import parameter from '../framework/parameter.js';
import scenario from '../framework/scenario.js';
import transaction from '../framework/transaction.js';
import checkpoint from '../framework/checkpoint.js';
import correlation from '../framework/correlation.js';

// ---------------------------------------------------------
// PEF 설정
// ---------------------------------------------------------

config.load({
    environment: __ENV.ENV || 'local',

    baseUrl:
        __ENV.BASE_URL ||
        'http://localhost:8080',

    logLevel:
        __ENV.LOG_LEVEL ||
        'DEBUG',

    loginPath:
        __ENV.LOGIN_PATH ||
        '/auth/login',

    loginExpectedStatus:
        Number(__ENV.LOGIN_STATUS || 200),

    loginTokenPath:
        __ENV.TOKEN_PATH ||
        '$.accessToken',

    loginTimeout:
        __ENV.LOGIN_TIMEOUT ||
        '10s',

    transactionLoggingEnabled: true,
    checkpointLoggingEnabled: true,
    correlationLoggingEnabled: false,
    scenarioLoggingEnabled: true,

    thinkTimeEnabled: false,
    pacingEnabled: false,

    failOnCheckpointError: false,
});

logger.setLevel(
    config.get('logLevel')
);

// ---------------------------------------------------------
// Parameter
// ---------------------------------------------------------

parameter.load(
    'USERS',
    '../data/users.csv'
);

// ---------------------------------------------------------
// 부하 모델
//
// 로그인 업무만 5분 동안 50 TPS 수행
// 최대 100 VU 범위에서 처리
// ---------------------------------------------------------

export const options = {
    scenarios: {
        login: {
            executor: 'constant-arrival-rate',

            exec: 'login',

            rate: Number(
                __ENV.LOGIN_TPS || 50
            ),

            timeUnit: '1s',

            duration:
                __ENV.DURATION ||
                '5m',

            preAllocatedVUs: Number(
                __ENV.PRE_VUS || 100
            ),

            maxVUs: Number(
                __ENV.MAX_VUS || 100
            ),

            gracefulStop: '10s',

            tags: {
                business: 'Login',
                workload: 'login',
            },
        },
    },
/*
export const options = {
    scenarios: {
        login: {
            executor: 'shared-iterations',
            exec: 'login',
            vus: 1,
            iterations: 1,
            maxDuration: '30s',
        },
    },
*/
    thresholds: {
        /*
         * HTTP 오류율 1% 미만
         */
        http_req_failed: [
            'rate<0.01',
        ],

        /*
         * 로그인 HTTP 응답시간
         */
        'http_req_duration{name:POST_Login}': [
            'p(95)<3000',
            'p(99)<5000',
        ],

        /*
         * PEF Login Transaction 응답시간
         */
        'pef_transaction_duration{transaction:Login}': [
            'p(95)<3000',
            'p(99)<5000',
        ],

        /*
         * Transaction 실패율
         */
        'pef_transaction_failure_rate{transaction:Login}': [
            'rate<0.01',
        ],

        /*
         * Checkpoint 실패율
         */
        pef_checkpoint_error_rate: [
            'rate<0.01',
        ],

        /*
         * VU 부족으로 누락된 실행 건수
         */
        dropped_iterations: [
            'count==0',
        ],
    },

    systemTags: [
        'status',
        'method',
        'name',
        'scenario',
        'expected_response',
    ],
};

// ---------------------------------------------------------
// 로그인 업무
// ---------------------------------------------------------

export function login() {
    correlation.clear();

    const user =
        parameter.byVU('USERS');

    scenario.begin('Login');
    scenario.step('Submit_Login');

    transaction.start('Login');

    const payload = JSON.stringify({
        username: user.USER_ID,
        password: user.PASSWORD,
    });

    const response = http.post(
        config.url(
            config.get('loginPath')
        ),
        payload,
        {
            headers: {
                'Content-Type':
                    'application/json',
            },

            tags: {
                name: 'POST_Login',
                business: 'Login',
                transaction: 'Login',
            },

            timeout:
                config.get('loginTimeout'),
        }
    );

    console.log(
    `[LOGIN RESPONSE] status=${response.status}, body=${response.body}`
);
    // -----------------------------------------------------
    // Checkpoint 1: HTTP 상태코드 검증
    // -----------------------------------------------------

    const statusPassed =
        checkpoint.status(
            response,
            config.get(
                'loginExpectedStatus'
            ),
            'Login_Status'
        );

    // -----------------------------------------------------
    // Checkpoint 2: Token 존재 여부 검증
    // -----------------------------------------------------

    let tokenPassed = false;

    if (statusPassed) {
        tokenPassed =
            checkpoint.json(
                response,
                config.get(
                    'loginTokenPath'
                ),
                undefined,
                'Login_Token'
            );
    }

    // -----------------------------------------------------
    // Correlation: Token 저장
    // -----------------------------------------------------

    if (
        statusPassed &&
        tokenPassed
    ) {
        try {
            correlation.json(
                response,
                'ACCESS_TOKEN',
                config.get(
                    'loginTokenPath'
                )
            );
        } catch (error) {
            logger.error(
                'Login token correlation failed',
                {
                    message:
                        error.message,
                }
            );

            tokenPassed = false;
        }
    }

    const passed =
        statusPassed &&
        tokenPassed;

    // -----------------------------------------------------
    // Transaction 종료
    // -----------------------------------------------------

    transaction.end(
        'Login',
        passed
    );

    // -----------------------------------------------------
    // Scenario 종료
    // -----------------------------------------------------

    scenario.end(
        'Login',
        passed
            ? 'PASS'
            : 'FAIL'
    );
}