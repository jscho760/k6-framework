import logger from './core/logger.js';
import config from './config.js';

class Correlation {
    constructor() {
        this.values = {};
    }

    save(name, value) {
        this.validateName(name);

        this.values[name] = value;

        if (config.get('correlationLoggingEnabled')) {
            logger.debug(
                `Correlation '${name}' saved`,
                {
                    value,
                }
            );
        }

        return value;
    }

    get(name, defaultValue) {
        this.validateName(name);

        if (!Object.prototype.hasOwnProperty.call(
            this.values,
            name
        )) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }

            throw new Error(
                `Correlation '${name}' not found.`
            );
        }

        return this.values[name];
    }

    exists(name) {
        return Object.prototype.hasOwnProperty.call(
            this.values,
            name
        );
    }

    remove(name) {
        delete this.values[name];
        return this;
    }

    clear() {
        this.values = {};
        return this;
    }

    json(response, name, path) {
        let body;

        try {
            body = response.json();
        } catch (error) {
            throw new Error(
                `Correlation '${name}' failed: response is not JSON.`
            );
        }

        const value = resolvePath(body, path);

        if (value === undefined) {
            throw new Error(
                `Correlation '${name}' failed: JSON path '${path}' not found.`
            );
        }

        return this.save(name, value);
    }

    regex(response, name, pattern, group) {
        const body = String(response.body || '');
        const regex =
            pattern instanceof RegExp
                ? pattern
                : new RegExp(pattern);

        const match = regex.exec(body);

        if (!match) {
            throw new Error(
                `Correlation '${name}' failed: regex did not match.`
            );
        }

        const groupIndex =
            group === undefined ? 1 : group;

        const value =
            match[groupIndex] !== undefined
                ? match[groupIndex]
                : match[0];

        return this.save(name, value);
    }

    boundary(response, name, leftBoundary, rightBoundary) {
        const body = String(response.body || '');
        const start = body.indexOf(leftBoundary);

        if (start < 0) {
            throw new Error(
                `Correlation '${name}' failed: left boundary not found.`
            );
        }

        const valueStart =
            start + leftBoundary.length;

        const end = body.indexOf(
            rightBoundary,
            valueStart
        );

        if (end < 0) {
            throw new Error(
                `Correlation '${name}' failed: right boundary not found.`
            );
        }

        return this.save(
            name,
            body.substring(valueStart, end)
        );
    }

    header(response, name, headerName) {
        const headers = response.headers || {};
        const target = String(headerName).toLowerCase();
        const keys = Object.keys(headers);

        for (let index = 0; index < keys.length; index += 1) {
            if (keys[index].toLowerCase() === target) {
                return this.save(
                    name,
                    headers[keys[index]]
                );
            }
        }

        throw new Error(
            `Correlation '${name}' failed: header '${headerName}' not found.`
        );
    }

    validateName(name) {
        if (
            typeof name !== 'string' ||
            name.trim().length === 0
        ) {
            throw new Error(
                'Correlation name is empty.'
            );
        }
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

export default new Correlation();