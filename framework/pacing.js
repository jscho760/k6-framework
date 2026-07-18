//usage
// pacing.start();
//pacing.fixed(10);
//pacing.random(10, 15);

import { sleep } from 'k6';

import context from './core/context.js';
import logger from './core/logger.js';
import config from './config.js';

import {
    pacingWaitDuration,
} from './core/metrics.js';

class Pacing {
    constructor() {
        this.iterationStartTime = null;
    }

    start() {
        this.iterationStartTime = Date.now();

        if (config.get('pacingLoggingEnabled')) {
            logger.debug('Pacing timer started');
        }

        return this;
    }

    fixed(targetSeconds) {
        this.validateSeconds(targetSeconds);

        return this.wait(
            targetSeconds,
            'FIXED'
        );
    }

    random(minSeconds, maxSeconds) {
        this.validateRange(
            minSeconds,
            maxSeconds
        );

        const targetSeconds =
            minSeconds +
            Math.random() *
            (maxSeconds - minSeconds);

        return this.wait(
            targetSeconds,
            'RANDOM'
        );
    }

    wait(targetSeconds, mode) {
        if (this.iterationStartTime === null) {
            throw new Error(
                'Pacing has not started. Call pacing.start() first.'
            );
        }

        const elapsedSeconds =
            (Date.now() - this.iterationStartTime) /
            1000;

        const waitSeconds = Math.max(
            0,
            targetSeconds - elapsedSeconds
        );

        if (config.get('pacingLoggingEnabled')) {
            logger.debug('Pacing calculated', {
                mode,
                targetSeconds: this.round(targetSeconds),
                elapsedSeconds: this.round(elapsedSeconds),
                waitSeconds: this.round(waitSeconds),
            });
        }

        pacingWaitDuration.add(
            waitSeconds * 1000,
            context.getTags({
                mode,
            })
        );

        if (
            config.get('pacingEnabled') &&
            waitSeconds > 0
        ) {
            sleep(waitSeconds);
        }

        this.iterationStartTime = null;

        return waitSeconds;
    }

    validateSeconds(seconds) {
        if (
            typeof seconds !== 'number' ||
            Number.isNaN(seconds) ||
            seconds < 0
        ) {
            throw new Error(
                'Pacing must be a number greater than or equal to 0.'
            );
        }
    }

    validateRange(minSeconds, maxSeconds) {
        this.validateSeconds(minSeconds);
        this.validateSeconds(maxSeconds);

        if (minSeconds > maxSeconds) {
            throw new Error(
                'Minimum pacing cannot exceed maximum pacing.'
            );
        }
    }

    round(value) {
        return Math.round(value * 1000) / 1000;
    }
}

export default new Pacing();