import context from './context.js';

class Logger {
    constructor() {
        this.levels = {
            DEBUG: 10,
            INFO: 20,
            WARN: 30,
            ERROR: 40,
            OFF: 100,
        };

        this.currentLevelName = 'INFO';
        this.currentLevel = this.levels.INFO;
    }

    setLevel(level) {
        const normalizedLevel =
            String(level || 'INFO').toUpperCase();

        if (!Object.prototype.hasOwnProperty.call(
            this.levels,
            normalizedLevel
        )) {
            throw new Error(
                `Unsupported log level: ${level}`
            );
        }

        this.currentLevelName = normalizedLevel;
        this.currentLevel = this.levels[normalizedLevel];

        return this;
    }

    getLevel() {
        return this.currentLevelName;
    }

    debug(message, data) {
        this.write('DEBUG', message, data);
    }

    info(message, data) {
        this.write('INFO', message, data);
    }

    warn(message, data) {
        this.write('WARN', message, data);
    }

    error(message, data) {
        this.write('ERROR', message, data);
    }

    write(level, message, data) {
        if (this.levels[level] < this.currentLevel) {
            return;
        }

        const execution = context.snapshot();

        let output =
            `[PEF]` +
            `[${level}]` +
            `[VU=${execution.vu}]` +
            `[ITER=${execution.iteration}]`;

        if (execution.scenario) {
            output += `[SCENARIO=${execution.scenario}]`;
        }

        if (execution.transaction) {
            output += `[TRX=${execution.transaction}]`;
        }

        if (execution.step) {
            output += `[STEP=${execution.step}]`;
        }

        output += ` ${message}`;

        if (data !== undefined) {
            output += ` | ${this.serialize(data)}`;
        }

        if (level === 'ERROR') {
            console.error(output);
            return;
        }

        if (level === 'WARN') {
            console.warn(output);
            return;
        }

        console.log(output);
    }

    serialize(data) {
        if (typeof data === 'string') {
            return data;
        }

        try {
            return JSON.stringify(data);
        } catch (error) {
            return String(data);
        }
    }
}

export default new Logger();