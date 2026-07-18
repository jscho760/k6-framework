import {
    Trend,
    Counter,
    Rate,
} from 'k6/metrics';

export const transactionDuration =
    new Trend('pef_transaction_duration', true);

export const transactionCount =
    new Counter('pef_transaction_count');

export const transactionFailureRate =
    new Rate('pef_transaction_failure_rate');

export const checkpointCount =
    new Counter('pef_checkpoint_count');

export const checkpointFailureRate =
    new Rate('pef_checkpoint_failure_rate');

export const scenarioDuration =
    new Trend('pef_scenario_duration', true);

export const scenarioCount =
    new Counter('pef_scenario_count');

export const thinkTimeDuration =
    new Trend('pef_thinktime_duration', true);

export const pacingWaitDuration =
    new Trend('pef_pacing_wait_duration', true);