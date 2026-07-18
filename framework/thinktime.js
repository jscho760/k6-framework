//usage
//thinktime.fixed(3);
//thinktime.random(1, 5);
//thinktime.disabled();
//thinktime.enabled();


import { sleep } from 'k6';

class ThinkTime {
    constructor() {
        this.isEnabled = true;
    }

    fixed(seconds) {
        this.validateSeconds(seconds, 'ThinkTime');

        if (!this.isEnabled) {
            console.log(
                `[THINK TIME SKIP] FIXED=${seconds}s | VU=${__VU} | ITER=${__ITER}`
            );

            return 0;
        }

        console.log(
            `[THINK TIME] FIXED=${seconds}s | VU=${__VU} | ITER=${__ITER}`
        );

        sleep(seconds);

        return seconds;
    }

    random(minSeconds, maxSeconds) {
        this.validateRange(minSeconds, maxSeconds);

        const seconds =
            minSeconds + Math.random() * (maxSeconds - minSeconds);

        const roundedSeconds =
            Math.round(seconds * 1000) / 1000;

        if (!this.isEnabled) {
            console.log(
                `[THINK TIME SKIP] RANDOM=${roundedSeconds}s | RANGE=${minSeconds}-${maxSeconds}s | VU=${__VU} | ITER=${__ITER}`
            );

            return 0;
        }

        console.log(
            `[THINK TIME] RANDOM=${roundedSeconds}s | RANGE=${minSeconds}-${maxSeconds}s | VU=${__VU} | ITER=${__ITER}`
        );

        sleep(roundedSeconds);

        return roundedSeconds;
    }

    enabled() {
        this.isEnabled = true;

        console.log('[THINK TIME CONFIG] ENABLED');
    }

    disabled() {
        this.isEnabled = false;

        console.log('[THINK TIME CONFIG] DISABLED');
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
        this.validateSeconds(minSeconds, 'Minimum think time');
        this.validateSeconds(maxSeconds, 'Maximum think time');

        if (minSeconds > maxSeconds) {
            throw new Error(
                'Minimum think time cannot be greater than maximum think time.'
            );
        }
    }
}

export default new ThinkTime();