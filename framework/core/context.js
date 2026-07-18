class ExecutionContext {
    constructor() {
        this.reset();
    }

    reset() {
        this.scenarioName = null;
        this.transactionName = null;
        this.stepName = null;
        this.attributes = {};
    }

    setScenario(name) {
        this.validateName(name, 'Scenario');
        this.scenarioName = name;
        return this;
    }

    getScenario() {
        return this.scenarioName;
    }

    clearScenario() {
        this.scenarioName = null;
        return this;
    }

    setTransaction(name) {
        this.validateName(name, 'Transaction');
        this.transactionName = name;
        return this;
    }

    getTransaction() {
        return this.transactionName;
    }

    clearTransaction() {
        this.transactionName = null;
        return this;
    }

    setStep(name) {
        this.validateName(name, 'Step');
        this.stepName = name;
        return this;
    }

    getStep() {
        return this.stepName;
    }

    clearStep() {
        this.stepName = null;
        return this;
    }

    setAttribute(name, value) {
        this.validateName(name, 'Attribute');
        this.attributes[name] = value;
        return this;
    }

    getAttribute(name, defaultValue) {
        if (!Object.prototype.hasOwnProperty.call(this.attributes, name)) {
            return defaultValue === undefined ? null : defaultValue;
        }

        return this.attributes[name];
    }

    removeAttribute(name) {
        delete this.attributes[name];
        return this;
    }

    getTags(extraTags) {
        return Object.assign(
            {
                scenario: this.scenarioName || 'UNDEFINED',
                transaction: this.transactionName || 'UNDEFINED',
                step: this.stepName || 'UNDEFINED',
            },
            extraTags || {}
        );
    }

    snapshot() {
        return {
            vu: typeof __VU === 'undefined' ? 0 : __VU,
            iteration: typeof __ITER === 'undefined' ? 0 : __ITER,
            scenario: this.scenarioName,
            transaction: this.transactionName,
            step: this.stepName,
            attributes: Object.assign({}, this.attributes),
        };
    }

    validateName(name, type) {
        if (
            typeof name !== 'string' ||
            name.trim().length === 0
        ) {
            throw new Error(
                `${type} name must be a non-empty string.`
            );
        }
    }
}

export default new ExecutionContext();