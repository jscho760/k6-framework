export const SCENARIO_CONFIG = [
    {
        order: 1,
        key: '01_main_page',
        name: 'Main_Page',
        displayName: '01_Main',

        exec: 'mainPage',
        vus: 10,

        workload: 'main',
        business: 'Main_Page',

        requestMetric: 'pef_main_http_requests',
        responseMetric: 'pef_main_response_time',
        errorMetric: 'pef_main_error_rate',

        aliases: [
            'main',
            'main_page',
            'main page',
            'homepage',
        ],
    },

    {
        order: 2,
        key: '02_login',
        name: 'Login',
        displayName: '02_Login',

        exec: 'login',
        vus: 10,

        workload: 'login',
        business: 'Login',

        requestMetric: 'pef_login_http_requests',
        responseMetric: 'pef_login_response_time',
        errorMetric: 'pef_login_error_rate',

        aliases: [
            'login',
        ],
    },

    {
        order: 3,
        key: '03_product_list',
        name: 'Product_List',
        displayName: '03_Product List',

        exec: 'productList',
        vus: 50,

        workload: 'product_list',
        business: 'Product_List',

        requestMetric: 'pef_product_list_http_requests',
        responseMetric: 'pef_product_list_response_time',
        errorMetric: 'pef_product_list_error_rate',

        aliases: [
            'product_list',
            'product list',
            'productlist',
        ],
    },

    {
        order: 4,
        key: '04_product_detail',
        name: 'Product_Detail',
        displayName: '04_Product Detail',

        exec: 'productDetail',
        vus: 20,

        workload: 'product_detail',
        business: 'Product_Detail',

        requestMetric: 'pef_product_detail_http_requests',
        responseMetric: 'pef_product_detail_response_time',
        errorMetric: 'pef_product_detail_error_rate',

        aliases: [
            'product_detail',
            'product detail',
            'productdetail',
        ],
    },

    {
        order: 5,
        key: '05_order',
        name: 'Order',
        displayName: '05_Order',

        exec: 'order',
        vus: 10,

        workload: 'order',
        business: 'Order',

        requestMetric: 'pef_order_http_requests',
        responseMetric: 'pef_order_response_time',
        errorMetric: 'pef_order_error_rate',

        aliases: [
            'order',
        ],
    },
];

export function resolveScenarioConfig(name) {
    if (!name) {
        return null;
    }

    const normalizedName = String(name)
        .trim()
        .toLowerCase();

    return SCENARIO_CONFIG.find((definition) => {
        if (
            String(definition.name)
                .trim()
                .toLowerCase() === normalizedName
        ) {
            return true;
        }

        if (
            String(definition.key)
                .trim()
                .toLowerCase() === normalizedName
        ) {
            return true;
        }

        return (
            Array.isArray(definition.aliases) &&
            definition.aliases.some(
                (alias) =>
                    String(alias)
                        .trim()
                        .toLowerCase() === normalizedName
            )
        );
    }) || null;
}