import {
    scenarioCounter,

    mainHttpRequests,
    mainResponseTime,
    mainErrorRate,

    loginHttpRequests,
    loginResponseTime,
    loginErrorRate,

    productListHttpRequests,
    productListResponseTime,
    productListErrorRate,

    productDetailHttpRequests,
    productDetailResponseTime,
    productDetailErrorRate,

    orderHttpRequests,
    orderResponseTime,
    orderErrorRate,
} from './core/metrics.js';

/*
 * Scenario 이름과 Metric 객체 연결
 */
const SCENARIO_METRICS = {
    Main_Page: {
        requestCounter: mainHttpRequests,
        responseTrend: mainResponseTime,
        errorRate: mainErrorRate,
    },

    Login: {
        requestCounter: loginHttpRequests,
        responseTrend: loginResponseTime,
        errorRate: loginErrorRate,
    },

    Product_List: {
        requestCounter: productListHttpRequests,
        responseTrend: productListResponseTime,
        errorRate: productListErrorRate,
    },

    Product_Detail: {
        requestCounter: productDetailHttpRequests,
        responseTrend: productDetailResponseTime,
        errorRate: productDetailErrorRate,
    },

    Order: {
        requestCounter: orderHttpRequests,
        responseTrend: orderResponseTime,
        errorRate: orderErrorRate,
    },
};

const SCENARIO_ALIASES = {
    main: 'Main_Page',
    main_page: 'Main_Page',
    'main page': 'Main_Page',
    homepage: 'Main_Page',

    login: 'Login',

    product_list: 'Product_List',
    'product list': 'Product_List',
    productlist: 'Product_List',

    product_detail: 'Product_Detail',
    'product detail': 'Product_Detail',
    productdetail: 'Product_Detail',

    order: 'Order',
};

class ScenarioRecorder {
    start(name) {
        return this.resolveName(name);
    }

    begin(name) {
        return this.resolveName(name);
    }

    record(name, response, options = {}) {
        const scenarioName =
            this.resolveName(name);

        const metricSet =
            SCENARIO_METRICS[scenarioName];

        if (!response) {
            throw new Error(
                `HTTP response is required for Scenario '${scenarioName}'.`
            );
        }

        const status =
            Number(response.status || 0);

        const duration =
            response.timings &&
            typeof response.timings.duration === 'number'
                ? response.timings.duration
                : 0;

        const failed =
            this.isFailed(status, options);

        const tags = {
            pef_scenario: scenarioName,
            result: failed ? 'FAIL' : 'PASS',
            status: String(status),
        };

        metricSet.requestCounter.add(
            1,
            tags
        );

        metricSet.responseTrend.add(
            duration,
            tags
        );

        metricSet.errorRate.add(
            failed,
            tags
        );

        return {
            scenario: scenarioName,
            status,
            duration,
            passed: !failed,
            failed,
            result: failed ? 'FAIL' : 'PASS',
        };
    }

    end(name, result = 'PASS') {
        const scenarioName =
            this.resolveName(name);

        const normalizedResult =
            this.normalizeResult(result);

        scenarioCounter.add(
            1,
            {
                pef_scenario: scenarioName,
                result: normalizedResult,
            }
        );

        return normalizedResult;
    }

    fail(name) {
        return this.end(
            name,
            'FAIL'
        );
    }

    resolveName(name) {
        if (!name) {
            throw new Error(
                'Scenario name is required.'
            );
        }

        if (SCENARIO_METRICS[name]) {
            return name;
        }

        const aliasKey =
            String(name)
                .trim()
                .toLowerCase();

        const resolved =
            SCENARIO_ALIASES[aliasKey];

        if (!resolved) {
            throw new Error(
                `Unknown Scenario '${name}'. ` +
                `Available scenarios: ${Object.keys(
                    SCENARIO_METRICS
                ).join(', ')}`
            );
        }

        return resolved;
    }

    isFailed(status, options) {
        if (typeof options.failed === 'boolean') {
            return options.failed;
        }

        if (typeof options.passed === 'boolean') {
            return !options.passed;
        }

        if (options.expectedStatus !== undefined) {
            if (Array.isArray(options.expectedStatus)) {
                return !options.expectedStatus.includes(
                    status
                );
            }

            return status !== Number(
                options.expectedStatus
            );
        }

        return status < 200 || status >= 400;
    }

    normalizeResult(result) {
        if (
            result === false ||
            String(result).toUpperCase() === 'FAIL'
        ) {
            return 'FAIL';
        }

        return 'PASS';
    }
}

const scenario =
    new ScenarioRecorder();

export {
    ScenarioRecorder,
    scenario,
};

export default scenario;
