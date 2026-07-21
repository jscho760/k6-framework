import { Counter, Trend, Rate } from 'k6/metrics';

/*
 * Transaction metrics
 */
export const trxCounter =
    new Counter('pef_trx_count');

export const trxDuration =
    new Trend('pef_trx_duration', true);

export const transactionFailureRate =
    new Rate('pef_transaction_failure_rate');

/*
 * Scenario metrics
 */
export const scenarioCounter =
    new Counter('pef_scenario_count');

export const scenarioDuration =
    new Trend('pef_scenario_duration', true);

/*
 * Checkpoint metrics
 */
export const checkpointCount =
    new Counter('pef_checkpoint_count');

export const checkpointPass =
    new Counter('pef_checkpoint_pass');

export const checkpointFail =
    new Counter('pef_checkpoint_fail');

export const checkpointDuration =
    new Trend('pef_checkpoint_duration', true);

export const checkpointErrorRate =
    new Rate('pef_checkpoint_error_rate');
    /*
 * Think time metrics
 */
export const thinkTime =
    new Trend('pef_think_time', true);

/*
 * Pacing metrics
 */
export const pacingTime =
    new Trend('pef_pacing_time', true);

/*
 * HTTP error metrics
 */
export const httpErrorRate =
    new Rate('pef_http_error_rate');

/*
 * Scenario iteration counters
 */
export const mainIterations =
    new Counter('pef_main_iterations');

export const loginIterations =
    new Counter('pef_login_iterations');

export const productListIterations =
    new Counter('pef_product_list_iterations');

export const productDetailIterations =
    new Counter('pef_product_detail_iterations');

export const orderIterations =
    new Counter('pef_order_iterations');

/*
 * Scenario HTTP request counters
 */
export const mainHttpRequests =
    new Counter('pef_main_http_requests');

export const loginHttpRequests =
    new Counter('pef_login_http_requests');

export const productListHttpRequests =
    new Counter('pef_product_list_http_requests');

export const productDetailHttpRequests =
    new Counter('pef_product_detail_http_requests');

export const orderHttpRequests =
    new Counter('pef_order_http_requests');

/*
 * Scenario response-time trends
 */
export const mainResponseTime =
    new Trend('pef_main_response_time', true);

export const loginResponseTime =
    new Trend('pef_login_response_time', true);

export const productListResponseTime =
    new Trend('pef_product_list_response_time', true);

export const productDetailResponseTime =
    new Trend('pef_product_detail_response_time', true);

export const orderResponseTime =
    new Trend('pef_order_response_time', true);


/*
 * Scenario error-rate metrics
 */
export const mainErrorRate =
    new Rate('pef_main_error_rate');

export const loginErrorRate =
    new Rate('pef_login_error_rate');

export const productListErrorRate =
    new Rate('pef_product_list_error_rate');

export const productDetailErrorRate =
    new Rate('pef_product_detail_error_rate');

export const orderErrorRate =
    new Rate('pef_order_error_rate');