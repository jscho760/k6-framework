import http from 'k6/http';

import config from '../framework/config.js';
import logger from '../framework/core/logger.js';

import scenario from '../framework/scenario.js';
import transaction from '../framework/transaction.js';
import checkpoint from '../framework/checkpoint.js';
import correlation from '../framework/correlation.js';
import thinktime from '../framework/thinktime.js';
import pacing from '../framework/pacing.js';

config.load({
    environment: 'local',
    baseUrl: 'http://localhost:8080',
    logLevel: 'DEBUG',
    thinkTimeEnabled: true,
    pacingEnabled: true,
});

logger.setLevel(
    config.get('logLevel')
);

export const options = {
    vus: 1,
    iterations: 2,
};

export default function () {
    pacing.start();

    scenario.begin('Product_Flow');

    scenario.step('Product_List');

    transaction.start('Products');

    const response = http.get(
        config.url('/products')
    );

    checkpoint.status(
        response,
        200,
        'Products_Status'
    );

    checkpoint.header(
        response,
        'Content-Type',
        'application/json',
        'Products_ContentType'
    );

    transaction.end(
        'Products',
        response
    );

    correlation.save(
        'PRODUCT_STATUS',
        response.status
    );

    logger.info(
        'Saved correlation value',
        {
            productStatus:
                correlation.get('PRODUCT_STATUS'),
        }
    );

    thinktime.fixed(1);

    scenario.clearStep();

    scenario.end(
        'Product_Flow',
        response.status === 200
            ? 'PASS'
            : 'FAIL'
    );

    pacing.fixed(3);
}