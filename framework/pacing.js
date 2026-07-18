//usage
// pacing.start();
//pacing.fixed(10);
//pacing.random(10, 15);

import { sleep } from 'k6';

class Pacing {
    constructor() {
        this.iterationStartTime = null;
    }

    start() {
        this.iterationStartTime = Date.now();

        console.log(
            `[PACING START] VU=${__VU} | ITER=${__ITER}`
        );

        return this.iterationStartTime;
    }

    fixed(targetSeconds) {
        this.validateSeconds(targetSeconds, 'Pacing');

        const elapsedSeconds = this.getElapsedSeconds();
        const waitSeconds = Math.max(
            0,
            targetSeconds - elapsedSeconds
        );

        console.log(
            `[PACING END] MODE=FIXED | TARGET=${targetSeconds}s | ELAPSED=${this.round(elapsedSeconds)}s | WAIT=${this.round(waitSeconds)}s | VU=${__VU} | ITER=${__ITER}`
        );

        if (waitSeconds > 0) {
            sleep(waitSeconds);
        }

        this.iterationStartTime = null;

        return waitSeconds;
    }

    random(minSeconds, maxSeconds) {
        this.validateRange(minSeconds, maxSeconds);

        const targetSeconds =
            minSeconds + Math.random() * (maxSeconds - minSeconds);

        const elapsedSeconds = this.getElapsedSeconds();
        const waitSeconds = Math.max(
            0,
            targetSeconds - elapsedSeconds
        );

        console.log(
            `[PACING END] MODE=RANDOM | TARGET=${this.round(targetSeconds)}s | RANGE=${minSeconds}-${maxSeconds}s | ELAPSED=${this.round(elapsedSeconds)}s | WAIT=${this.round(waitSeconds)}s | VU=${__VU} | ITER=${__ITER}`
        );

        if (waitSeconds > 0) {
            sleep(waitSeconds);
        }

        this.iterationStartTime = null;

        return waitSeconds;
    }

    getElapsedSeconds() {
        if (this.iterationStartTime === null) {
            throw new Error(
                'Pacing has not started. Call pacing.start() at the beginning of the iteration.'
            );
        }

        return (
            Date.now() - this.iterationStartTime
        ) / 1000;
    }

    validateSeconds(seconds, type) {
        if (
            typeof seconds !== 'number' ||
            Number.isNaN(seconds) ||
            seconds < 0
        ) {
            throw new Error(
                `${type} seconds must be a number greater than or equal to 0.`
            );
        }
    }

    validateRange(minSeconds, maxSeconds) {
        this.validateSeconds(
            minSeconds,
            'Minimum pacing'
        );

        this.validateSeconds(
            maxSeconds,
            'Maximum pacing'
        );

        if (minSeconds > maxSeconds) {
            throw new Error(
                'Minimum pacing cannot be greater than maximum pacing.'
            );
        }
    }

    round(value) {
        return Math.round(value * 1000) / 1000;
    }
}

export default new Pacing();