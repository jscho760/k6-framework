import http from 'k6/http';
import { sleep } from 'k6';

import transaction from "../framework/transaction.js";

export const options = {
    vus: 2,
    iterations: 10
};

export default function () {

    // -------------------------
    // Products
    // -------------------------
    transaction.start("Products");

    const productRes = http.get("http://localhost:8080/products", {
        headers: {
            Authorization: "Bearer TEST"
        }
    });

    transaction.end(
        "Products",
        productRes.status === 200
            ? transaction.PASS
            : transaction.FAIL
    );

    // -------------------------
    // Login (Sample)
    // -------------------------
    transaction.start("Login");

    sleep(1);

    transaction.end("Login", transaction.PASS);

    // -------------------------
    // Product Search (Sample)
    // -------------------------
    transaction.start("Product_Search");

    sleep(0.5);

    transaction.end("Product_Search", transaction.PASS);

    // -------------------------
    // Order (Sample)
    // -------------------------
    transaction.start("Order");

    sleep(0.3);

    transaction.end("Order", transaction.PASS);

    // -------------------------
    // Payment (Sample)
    // -------------------------
    transaction.start("Payment");

    sleep(0.2);

    transaction.end("Payment", transaction.PASS);

    console.log(
        `[TRX END] ${name} | ${transactionResult} | ${elapsed} ms`
    );

//    console.log(
//       `VU=${__VU} STATUS=${productRes.status}`
//    );
}