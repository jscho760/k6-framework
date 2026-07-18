class FrameworkConfig {
    constructor() {
        this.reset();
    }

    reset() {
        this.values = {
            environment: 'local',
            baseUrl: 'http://localhost:8080',
            logLevel: 'INFO',

            transactionLoggingEnabled: true,
            checkpointLoggingEnabled: true,
            correlationLoggingEnabled: true,
            scenarioLoggingEnabled: true,
            thinkTimeLoggingEnabled: true,
            pacingLoggingEnabled: true,

            thinkTimeEnabled: true,
            pacingEnabled: true,

            failOnCheckpointError: false,
        };

        return this;
    }

    load(values) {
        if (
            values === null ||
            typeof values !== 'object' ||
            Array.isArray(values)
        ) {
            throw new Error(
                'Framework configuration must be an object.'
            );
        }

        this.values = Object.assign(
            {},
            this.values,
            values
        );

        return this;
    }

    set(name, value) {
        this.values[name] = value;
        return this;
    }

    get(name, defaultValue) {
        if (!Object.prototype.hasOwnProperty.call(
            this.values,
            name
        )) {
            return defaultValue === undefined
                ? null
                : defaultValue;
        }

        return this.values[name];
    }

    getAll() {
        return Object.assign({}, this.values);
    }

    url(path) {
        if (!path) {
            return this.values.baseUrl;
        }

        if (
            path.startsWith('http://') ||
            path.startsWith('https://')
        ) {
            return path;
        }

        const baseUrl =
            String(this.values.baseUrl || '')
                .replace(/\/+$/, '');

        const normalizedPath =
            path.startsWith('/')
                ? path
                : `/${path}`;

        return `${baseUrl}${normalizedPath}`;
    }
}

export default new FrameworkConfig();