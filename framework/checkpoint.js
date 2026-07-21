import { fail } from 'k6';

import context from './core/context.js';
import logger from './core/logger.js';
import config from './config.js';

import {
    checkpointCount,
    checkpointPass,
    checkpointFail,
    checkpointErrorRate,
} from './core/metrics.js';

class Checkpoint {
    constructor() {
        this.PASS = 'PASS';
        this.FAIL = 'FAIL';
    }

    status(response, expected, name) {
        const actual = response.status;

        return this.record(
            name || `Status_${expected}`,
            'status',
            actual === expected,
            actual,
            expected
        );
    }

    text(response, expected, name) {
        const body =
            response && response.body !== undefined
                ? String(response.body)
                : '';

        return this.record(
            name || `Text_${expected}`,
            'text',
            body.includes(String(expected)),
            expected,
            expected
        );
    }

    notText(response, unexpected, name) {
        const body =
            response && response.body !== undefined
                ? String(response.body)
                : '';

        return this.record(
            name || `NotText_${unexpected}`,
            'not_text',
            !body.includes(String(unexpected)),
            unexpected,
            `NOT ${unexpected}`
        );
    }

    header(response, headerName, expected, name) {
        const actual = this.getHeader(
            response.headers,
            headerName
        );

        const passed =
            actual !== null &&
            String(actual).includes(String(expected));

        return this.record(
            name || `Header_${headerName}`,
            'header',
            passed,
            actual,
            expected
        );
    }

    json(response, path, expected, name) {
        let body;

        try {
            body = response.json();
        } catch (error) {
            return this.record(
                name || `JSON_${path}`,
                'json',
                false,
                'INVALID_JSON',
                expected
            );
        }

        const actual = resolvePath(body, path);

        const passed =
            expected === undefined
                ? actual !== undefined
                : actual === expected;

        return this.record(
            name || `JSON_${path}`,
            'json',
            passed,
            actual,
            expected === undefined
                ? 'DEFINED'
                : expected
        );
    }

    responseTime(response, maximumMs, name) {
        const actual =
            response.timings &&
            response.timings.duration !== undefined
                ? response.timings.duration
                : Number.POSITIVE_INFINITY;

        return this.record(
            name || `ResponseTime_${maximumMs}`,
            'response_time',
            actual <= maximumMs,
            actual,
            maximumMs
        );
    }

    record(name, type, passed, actual, expected) {
        const result = passed
            ? this.PASS
            : this.FAIL;

        const tags = context.getTags({
            checkpoint: name,
            type,
            result,
        });

        checkpointCount.add(1, tags);
        checkpointErrorRate.add(!passed, tags);

        if (passed) {
            checkpointPass.add(1, tags);
        } else {
            checkpointFail.add(1, tags);
        }

        if (config.get('checkpointLoggingEnabled')) {
            const data = {
                type,
                result,
                actual,
                expected,
            };

            if (passed) {
                logger.info(
                    `Checkpoint '${name}' passed`,
                    data
                );
            } else {
                logger.error(
                    `Checkpoint '${name}' failed`,
                    data
                );
            }
        }

        if (
            !passed &&
            config.get('failOnCheckpointError')
        ) {
            fail(`Checkpoint '${name}' failed.`);
        }

        return passed;
    }

    getHeader(headers, requestedName) {
        if (!headers) {
            return null;
        }

        const target =
            String(requestedName).toLowerCase();

        const names = Object.keys(headers);

        for (let index = 0; index < names.length; index += 1) {
            if (names[index].toLowerCase() === target) {
                return headers[names[index]];
            }
        }

        return null;
    }
}

function resolvePath(value, path) {
    const normalized = String(path)
        .replace(/^\$\.?/, '')
        .replace(/\[(\d+)\]/g, '.$1');

    if (!normalized) {
        return value;
    }

    const parts = normalized.split('.');
    let current = value;

    for (let index = 0; index < parts.length; index += 1) {
        if (
            current === null ||
            current === undefined ||
            !Object.prototype.hasOwnProperty.call(
                current,
                parts[index]
            )
        ) {
            return undefined;
        }

        current = current[parts[index]];
    }

    return current;
}

export default new Checkpoint();