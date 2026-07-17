import { SharedArray } from 'k6/data';

/**
 * CSV Parser
 * 첫 번째 행을 Header로 사용
 */
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);

    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {

        const values = line.split(',');

        const row = {};

        headers.forEach((header, index) => {
            row[header.trim()] = values[index].trim();
        });

        return row;
    });
}

class Parameter {

    constructor() {
        this.tables = {};
        this.index = {};
    }

    load(name, file) {

        this.tables[name] = new SharedArray(name, () => {

            return parseCSV(open(file));

        });

        this.index[name] = 0;
    }

    next(name) {

        const table = this.tables[name];

        const row = table[this.index[name]];

        this.index[name]++;

        if (this.index[name] >= table.length) {
            this.index[name] = 0;
        }

        return row;
    }

    random(name) {

        const table = this.tables[name];

        const idx = Math.floor(Math.random() * table.length);

        return table[idx];
    }

    byVU(name) {

        const table = this.tables[name];

        return table[(__VU - 1) % table.length];
    }

    byITER(name) {

        const table = this.tables[name];

        return table[__ITER % table.length];
    }
}

export default new Parameter();