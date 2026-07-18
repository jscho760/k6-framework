import http from 'k6/http';

import transaction from '../framework/transaction.js';
import thinktime from '../framework/thinktime.js';
import pacing from '../framework/pacing.js';

export const options = {
    vus: 1,
    iterations: 3,
};

export default function () {
    pacing.start();
    
    transaction.start('Products');

    const productRes = http.get(
        'http://localhost:8080/products',
        {
            headers: {
                Authorization: 'Bearer TEST',
            },
        }
    );

    transaction.end(
        'Products',
        productRes.status === 200
            ? transaction.PASS
            : transaction.FAIL
    );

    thinktime.fixed(1);

    transaction.start('Product_Search');

    const searchRes = http.get(
        'http://localhost:8080/products',
        {
            headers: {
                Authorization: 'Bearer TEST',
            },
            tags: {
                request_name: 'Product_Search',
            },
        }
    );

    transaction.end(
        'Product_Search',
        searchRes.status === 200
            ? transaction.PASS
            : transaction.FAIL
    );

    thinktime.random(0.5, 1.5);

    pacing.fixed(5);
}