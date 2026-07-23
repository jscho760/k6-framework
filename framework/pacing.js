import { sleep } from 'k6';

class Pacing {
    constructor() {
        this.startTimes = {};
    }

    start() {
        this.startTimes[__VU] = Date.now();
    }

    fixed(seconds = 1) {
        const startedAt =
            this.startTimes[__VU];

        if (
            startedAt === undefined ||
            startedAt === null
        ) {
            throw new Error(
                'Pacing has not started. Call pacing.start() first.'
            );
        }

        const elapsedSeconds =
            (Date.now() - startedAt) / 1000;

        const sleepSeconds =
            seconds - elapsedSeconds;

        if (sleepSeconds > 0) {
            sleep(sleepSeconds);
        }

        delete this.startTimes[__VU];
    }
}

export default new Pacing();