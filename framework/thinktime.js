//usage
//thinktime.fixed(3);
//thinktime.random(1, 5);
//thinktime.disabled();
//thinktime.enabled();


import { sleep } from 'k6';

import context from './core/context.js';
import logger from './core/logger.js';
import config from './config.js';

import {
    thinkTimeDuration,
} from './core/metrics.js';

class ThinkTime {
    fixed(seconds) {
        this.validateSeconds(seconds);

        if (!config.get('thinkTimeEnabled')) {
            return 0;
        }

        if (config.get('thinkTimeLoggingEnabled')) {
            logger.debug('Think time started', {
                mode: 'FIXED',
                seconds,
            });
        }

        thinkTimeDuration.add(
            seconds * 1000,
            context.getTags({
                mode: 'FIXED',
            })
        );

        sleep(seconds);

        return seconds;
    }

    random(minSeconds, maxSeconds) {
        this.validateRange(
            minSeconds,
            maxSeconds
        );

        const seconds =
            minSeconds +
            Math.random() *
            (maxSeconds - minSeconds);

        const rounded =
            Math.round(seconds * 1000) / 1000;

        if (!config.get('thinkTimeEnabled')) {
            return 0;
        }

        if (config.get('thinkTimeLoggingEnabled')) {
            logger.debug('Think time started', {
                mode: 'RANDOM',
                seconds: rounded,
                minimum: minSeconds,
                maximum: maxSeconds,
            });
        }

        thinkTimeDuration.add(
            rounded * 1000,
            context.getTags({
                mode: 'RANDOM',
            })
        );

        sleep(rounded);

        return rounded;
    }

    validateSeconds(seconds) {
        if (
            typeof seconds !== 'number' ||
            Number.isNaN(seconds) ||
            seconds < 0
        ) {
            throw new Error(
                'Think time must be a number greater than or equal to 0.'
            );
        }
    }

    validateRange(minSeconds, maxSeconds) {
        this.validateSeconds(minSeconds);
        this.validateSeconds(maxSeconds);

        if (minSeconds > maxSeconds) {
            throw new Error(
                'Minimum think time cannot exceed maximum think time.'
            );
        }
    }
}

export default new ThinkTime();