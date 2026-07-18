class Correlation {

    constructor() {
        this.values = {};
    }

    json(response, name, path) {

        let obj;

        try {
            obj = response.json();
        } catch (e) {
            throw new Error("Response is not JSON.");
        }

        const key = path.replace("$.", "");

        if (!(key in obj)) {
            throw new Error(`JSON path '${path}' not found.`);
        }

        this.values[name] = obj[key];

        console.log(
            `[CORRELATION] ${name} = ${this.values[name]}`
        );

        return this.values[name];
    }

    save(name, value) {

        this.values[name] = value;

        console.log(
            `[CORRELATION SAVE] ${name} = ${value}`
        );

        return value;
    }

    get(name) {

        if (!(name in this.values)) {
            throw new Error(
                `Correlation '${name}' not found.`
            );
        }

        return this.values[name];
    }

    exists(name) {
        return name in this.values;
    }

    clear() {
        this.values = {};
    }

}

export default new Correlation();