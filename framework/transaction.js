import context from './core/context.js';
import logger from './core/logger.js';
import config from './config.js';

import {
    transactionDuration,
    transactionCount,
    transactionFailureRate,
} from './core/metrics.js';

class Transaction {
    constructor() {
        this.PASS = 'PASS';
        this.FAIL = 'FAIL';
        this.AUTO = 'AUTO';

        this.startTimes = {};
    }

    start(name) {
        this.validateName(name);

        if (Object.prototype.hasOwnProperty.call(
            this.startTimes,
            name
        )) {
            throw new Error(
                `Transaction '${name}' already started.`
            );
        }

        this.startTimes[name] = Date.now();
        context.setTransaction(name);

        if (config.get('transactionLoggingEnabled')) {
            logger.info('Transaction started');
        }

        return this;
    }

    end(name, result) {
        this.validateName(name);

        if (!Object.prototype.hasOwnProperty.call(
            this.startTimes,
            name
        )) {
            throw new Error(
                `Transaction '${name}' not started.`
            );
        }

        const transactionResult =
            this.resolveResult(result);

        const elapsed =
            Date.now() - this.startTimes[name];

        const tags = context.getTags({
            transaction: name,
            result: transactionResult,
        });

        transactionDuration.add(elapsed, tags);
        transactionCount.add(1, tags);
        transactionFailureRate.add(
            transactionResult === this.FAIL,
            tags
        );

        if (config.get('transactionLoggingEnabled')) {
            logger.info('Transaction ended', {
                result: transactionResult,
                elapsedMs: elapsed,
            });
        }

        delete this.startTimes[name];
        context.clearTransaction();

        return elapsed;
    }

    fail(name) {
        return this.end(name, this.FAIL);
    }

    resolveResult(result) {
        if (result === undefined || result === null) {
            return this.PASS;
        }

        if (result === this.PASS || result === this.FAIL) {
            return result;
        }

        if (
            typeof result === 'object' &&
            typeof result.status === 'number'
        ) {
            return result.status >= 200 &&
                result.status < 400
                ? this.PASS
                : this.FAIL;
        }

        if (typeof result === 'boolean') {
            return result
                ? this.PASS
                : this.FAIL;
        }

        throw new Error(
            `Unsupported transaction result: ${result}`
        );
    }

    validateName(name) {
        if (
            typeof name !== 'string' ||
            name.trim().length === 0
        ) {
            throw new Error(
                'Transaction name is empty.'
            );
        }
    }
}

export default new Transaction();