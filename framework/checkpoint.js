import { Counter } from 'k6/metrics';

const checkpointCount = new Counter("checkpoint_count");

class Checkpoint {

    PASS = "PASS";
    FAIL = "FAIL";

    status(response, expected) {

        const pass = response.status === expected;

        checkpointCount.add(1, {
            type: "status",
            result: pass ? this.PASS : this.FAIL
        });

        console.log(
            `[CHECK ${pass ? "PASS" : "FAIL"}] Status = ${response.status}`
        );

        return pass;
    }

    text(response, expected) {

        const pass = response.body.includes(expected);

        checkpointCount.add(1, {
            type: "text",
            result: pass ? this.PASS : this.FAIL
        });

        console.log(
            `[CHECK ${pass ? "PASS" : "FAIL"}] Text = ${expected}`
        );

        return pass;
    }

    header(response, headerName, expected) {

        const actual = response.headers[headerName];

        const pass = actual && actual.includes(expected);

        checkpointCount.add(1, {
            type: "header",
            result: pass ? this.PASS : this.FAIL
        });

        console.log(
            `[CHECK ${pass ? "PASS" : "FAIL"}] Header ${headerName}`
        );

        return pass;
    }

}

export default new Checkpoint();