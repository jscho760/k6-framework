import { SharedArray } from 'k6/data';

class Parameter {
    constructor() {
        this.datasets = {};
        this.cursors = {};
    }

    load(name, filePath) {
        this.validateName(name);

        if (
            typeof filePath !== 'string' ||
            filePath.trim().length === 0
        ) {
            throw new Error(
                'Parameter file path is empty.'
            );
        }

        const dataset = new SharedArray(
            `PEF_PARAMETER_${name}`,
            function () {
                return parseCSV(open(import.meta.resolve(filePath)));
                //return parseCSV(open(filePath));
            }
        );

        if (dataset.length === 0) {
            throw new Error(
                `Parameter '${name}' contains no data.`
            );
        }

        this.datasets[name] = dataset;
        this.cursors[name] = 0;

        return this;
    }

    next(name) {
        const dataset = this.getDataset(name);
        const index = this.cursors[name] % dataset.length;

        this.cursors[name] += 1;

        return dataset[index];
    }

    random(name) {
        const dataset = this.getDataset(name);
        const index = Math.floor(
            Math.random() * dataset.length
        );

        return dataset[index];
    }

    byVU(name) {
        const dataset = this.getDataset(name);
        const vu = typeof __VU === 'undefined' ? 1 : __VU;
        const index = (vu - 1) % dataset.length;

        return dataset[index];
    }

    byITER(name) {
        const dataset = this.getDataset(name);
        const iteration =
            typeof __ITER === 'undefined' ? 0 : __ITER;

        return dataset[iteration % dataset.length];
    }

    size(name) {
        return this.getDataset(name).length;
    }

    getDataset(name) {
        if (!Object.prototype.hasOwnProperty.call(
            this.datasets,
            name
        )) {
            throw new Error(
                `Parameter '${name}' is not loaded.`
            );
        }

        return this.datasets[name];
    }

    validateName(name) {
        if (
            typeof name !== 'string' ||
            name.trim().length === 0
        ) {
            throw new Error(
                'Parameter name is empty.'
            );
        }
    }
}

function parseCSV(content) {
    const lines = String(content)
        .replace(/\r/g, '')
        .split('\n')
        .filter(function (line) {
            return line.trim().length > 0;
        });

    if (lines.length < 2) {
        return [];
    }

    const headers = splitCSVLine(lines[0]);

    return lines.slice(1).map(function (line) {
        const values = splitCSVLine(line);
        const row = {};

        headers.forEach(function (header, index) {
            row[header.trim()] =
                values[index] === undefined
                    ? ''
                    : values[index].trim();
        });

        return row;
    });
}

function splitCSVLine(line) {
    const values = [];
    let current = '';
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === '"') {
            if (
                quoted &&
                line[index + 1] === '"'
            ) {
                current += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }

            continue;
        }

        if (character === ',' && !quoted) {
            values.push(current);
            current = '';
            continue;
        }

        current += character;
    }

    values.push(current);

    return values;
}

export default new Parameter();