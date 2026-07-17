import { Trend, Counter } from 'k6/metrics';

const trxDuration = new Trend('transaction_duration');
const trxCount = new Counter('transaction_count');

class Transaction {
    constructor() {
        this.startTime = {};
        this.PASS = 'PASS';
        this.FAIL = 'FAIL';
    }

    start(name) {
        if (!name) {
            throw new Error('Transaction name is empty.');
        }

        if (this.startTime[name] !== undefined) {
            throw new Error(`Transaction '${name}' already started.`);
        }

        this.startTime[name] = Date.now();

        console.log(
            `[TRX START] ${name} | VU=${__VU} | ITER=${__ITER}`
        );
    }

    end(name, result) {
        if (this.startTime[name] === undefined) {
            throw new Error(`Transaction '${name}' not started.`);
        }

        const transactionResult =
            result === undefined ? this.PASS : result;

        const elapsed =
            Date.now() - this.startTime[name];

        trxDuration.add(elapsed, {
            transaction: name,
            result: transactionResult,
        });

        trxCount.add(1, {
            transaction: name,
            result: transactionResult,
        });

        console.log(
            `[TRX END] ${name} | RESULT=${transactionResult} | ELAPSED=${elapsed} ms | VU=${__VU} | ITER=${__ITER}`
        );

        delete this.startTime[name];

        return elapsed;
    }
}

export default new Transaction();