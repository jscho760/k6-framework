import http from 'k6/http';

import correlation from "../framework/correlation.js";

export const options = {

    vus: 1,

    iterations: 1

};

export default function () {

    const res = http.get(
        "https://jsonplaceholder.typicode.com/todos/1"
    );

    correlation.json(
        res,
        "TODO_ID",
        "$.id"
    );

    console.log(
        correlation.get("TODO_ID")
    );

}