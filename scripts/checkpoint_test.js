import http from 'k6/http';

import checkpoint from "../framework/checkpoint.js";

export const options = {

    vus: 1,

    iterations: 1

};

export default function () {

    const res = http.get("http://localhost:8080/products");

    checkpoint.status(res, 200);

    checkpoint.text(res, "product");

    checkpoint.header(
        res,
        "Content-Type",
        "application/json"
    );

    checkpoint.status(res, 200);

    checkpoint.contains(res, "SUCCESS");

    checkpoint.notContains(res, "ERROR");

    checkpoint.json(res, "$.user.id");

    checkpoint.jsonValue(res, "$.result", "SUCCESS");

    checkpoint.responseTime(res, 3000);

    checkpoint.status(res, 200, { stopOnFail: true });


}