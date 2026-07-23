import context from './core/context.js';
import logger from './core/logger.js';
import config from './config.js';

import {
    scenarioCounter,
    scenarioDuration
} from "./core/metrics.js";

class Scenario {
    constructor() {
        this.startTimes = {};
    }

    begin(name) {
        this.validateName(name);

        if (Object.prototype.hasOwnProperty.call(
            this.startTimes,
            name
        )) {
            throw new Error(
                `Scenario '${name}' already started.`
            );
        }

        context.reset();
        context.setScenario(name);

        this.startTimes[name] = Date.now();

        if (config.get('scenarioLoggingEnabled')) {
            logger.info('Scenario started');
        }

        return this;
    }

    step(name) {
        context.setStep(name);

        if (config.get('scenarioLoggingEnabled')) {
            logger.debug(`Scenario step: ${name}`);
        }

        return this;
    }

    clearStep() {
        context.clearStep();
        return this;
    }

    end(name, result) {
        const scenarioName =
            name || context.getScenario();

        this.validateName(scenarioName);

        if (!Object.prototype.hasOwnProperty.call(
            this.startTimes,
            scenarioName
        )) {
            throw new Error(
                `Scenario '${scenarioName}' not started.`
            );
        }

        const scenarioResult =
            result || 'PASS';

        const elapsed =
            Date.now() -
            this.startTimes[scenarioName];

        const tags = context.getTags({
            scenario: scenarioName,
            result: scenarioResult,
        });

        scenarioDuration.add(elapsed, tags);
        scenarioCounter.add(1, tags);

        if (config.get('scenarioLoggingEnabled')) {
            logger.info('Scenario ended', {
                result: scenarioResult,
                elapsedMs: elapsed,
            });
        }

        delete this.startTimes[scenarioName];
        context.reset();

        return elapsed;
    }

    current() {
        return context.getScenario();
    }

    validateName(name) {
        if (
            typeof name !== 'string' ||
            name.trim().length === 0
        ) {
            throw new Error(
                'Scenario name is empty.'
            );
        }
    }
}

export default new Scenario();