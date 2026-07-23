import {
    Counter,
    Trend,
    Rate,
} from 'k6/metrics';

/*
 * Transaction Metrics
 */
export const trxCounter =
    new Counter('pef_transaction_count');

export const trxDuration =
    new Trend('pef_transaction_duration');

export const transactionFailureRate =
    new Rate('pef_transaction_failure_rate');

/*
 * Scenario Metrics
 */
export const scenarioCounter =
    new Counter('pef_scenario_count');

export const scenarioDuration =
    new Trend('pef_scenario_duration');

/*
 * Checkpoint Metrics
 */
export const checkpointCount =
    new Counter('pef_checkpoint_count');

export const checkpointPass =
    new Counter('pef_checkpoint_pass');

export const checkpointFail =
    new Counter('pef_checkpoint_fail');

export const checkpointDuration =
    new Trend('pef_checkpoint_duration');

export const checkpointErrorRate =
    new Rate('pef_checkpoint_error_rate');

/*
 * Think Time / Pacing Metrics
 */
export const thinkTime =
    new Trend('pef_think_time');

export const pacingTime =
    new Trend('pef_pacing_time');

/*
 * Main Page Metrics
 */
export const mainHttpRequests =
    new Counter('pef_main_http_requests');

export const mainResponseTime =
    new Trend('pef_main_response_time');

export const mainErrorRate =
    new Rate('pef_main_error_rate');

/*
 * Login Metrics
 */
export const loginHttpRequests =
    new Counter('pef_login_http_requests');

export const loginResponseTime =
    new Trend('pef_login_response_time');

export const loginErrorRate =
    new Rate('pef_login_error_rate');

/*
 * Product List Metrics
 */
export const productListHttpRequests =
    new Counter('pef_product_list_http_requests');

export const productListResponseTime =
    new Trend('pef_product_list_response_time');

export const productListErrorRate =
    new Rate('pef_product_list_error_rate');

/*
 * Product Detail Metrics
 */
export const productDetailHttpRequests =
    new Counter('pef_product_detail_http_requests');

export const productDetailResponseTime =
    new Trend('pef_product_detail_response_time');

export const productDetailErrorRate =
    new Rate('pef_product_detail_error_rate');

/*
 * Order Metrics
 */
export const orderHttpRequests =
    new Counter('pef_order_http_requests');

export const orderResponseTime =
    new Trend('pef_order_response_time');

export const orderErrorRate =
    new Rate('pef_order_error_rate');
