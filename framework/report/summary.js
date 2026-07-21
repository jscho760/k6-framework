const LINE =
    '============================================================';

const TABLE_LINE =
    '------------------------------------------------------------';

const SCENARIOS = [
    {
        name: 'Main',
        requestMetric: 'pef_main_http_requests',
        responseMetric: 'pef_main_response_time',
        errorMetric: 'pef_main_error_rate',
    },
    {
        name: 'Login',
        requestMetric: 'pef_login_http_requests',
        responseMetric: 'pef_login_response_time',
        errorMetric: 'pef_login_error_rate',
    },
    {
        name: 'Product List',
        requestMetric: 'pef_product_list_http_requests',
        responseMetric: 'pef_product_list_response_time',
        errorMetric: 'pef_product_list_error_rate',
    },
    {
        name: 'Product Detail',
        requestMetric: 'pef_product_detail_http_requests',
        responseMetric: 'pef_product_detail_response_time',
        errorMetric: 'pef_product_detail_error_rate',
    },
    {
        name: 'Order',
        requestMetric: 'pef_order_http_requests',
        responseMetric: 'pef_order_response_time',
        errorMetric: 'pef_order_error_rate',
    },
];

const TRANSACTIONS = [
    'Login',
    'Product List',
    'Product Detail',
    'Order',
];

export function generateSummary(data) {
    const report = buildReport(data);

    return {
        stdout: buildConsoleReport(report),
        'reports/summary.json': JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                ...report,
                rawState: data.state || {},
            },
            null,
            2
        ),
        'reports/report.html': buildHtmlReport(report),
        'reports/scenario_summary.csv': buildCsvReport(report),
    };
}

function buildReport(data) {
    const scenarios = SCENARIOS.map((definition) => {
        const requestValues = getValues(
            data,
            definition.requestMetric
        );

        const responseValues = getValues(
            data,
            definition.responseMetric
        );

        const errorValues = getValues(
            data,
            definition.errorMetric
        );

        return {
            name: definition.name,
            count: numberValue(requestValues.count),
            tps: numberValue(requestValues.rate),
            avg: numberValue(responseValues.avg),
            p95: numberValue(responseValues['p(95)']),
            max: numberValue(responseValues.max),
            errorRate: numberValue(errorValues.rate),
        };
    });

    const transactions = TRANSACTIONS.map((name) => {
        const failureRate = getTransactionFailureRate(
            data,
            name
        );

        return {
            name,
            failureRate,
            result:
                failureRate === null
                    ? 'N/A'
                    : failureRate === 0
                        ? 'PASS'
                        : 'FAIL',
        };
    });

    const checkpointPass = getCounterCount(
        data,
        'pef_checkpoint_pass'
    );

    const checkpointFail = getCounterCount(
        data,
        'pef_checkpoint_fail'
    );

    return {
        scenarios,
        totalTps: scenarios.reduce(
            (total, scenario) => total + scenario.tps,
            0
        ),
        transactions,
        checkpoints: {
            pass: checkpointPass,
            fail: checkpointFail,
            total: checkpointPass + checkpointFail,
        },
    };
}

function buildConsoleReport(report) {
    const rows = report.scenarios.map((scenario) => {
        return [
            padRight(scenario.name, 20),
            padLeft(formatNumber(scenario.tps, 1), 7),
            padLeft(formatMs(scenario.avg), 10),
            padLeft(formatMs(scenario.p95), 10),
            padLeft(formatPercent(scenario.errorRate), 9),
        ].join('');
    });

    const transactionRows = report.transactions.map(
        (transaction) => {
            const dots = '.'.repeat(
                Math.max(2, 32 - transaction.name.length)
            );

            return `${transaction.name}${dots}${transaction.result}`;
        }
    );

    return [
        '',
        LINE,
        '',
        '              PEF Performance Report',
        '',
        LINE,
        '',
        [
            padRight('Scenario', 20),
            padLeft('TPS', 7),
            padLeft('Avg', 10),
            padLeft('P95', 10),
            padLeft('Error', 9),
        ].join(''),
        TABLE_LINE,
        ...rows,
        TABLE_LINE,
        `TOTAL TPS${padLeft(
            formatNumber(report.totalTps, 1),
            44
        )}`,
        '',
        LINE,
        '',
        'Transaction Summary',
        '',
        ...transactionRows,
        '',
        LINE,
        '',
        'Checkpoint Summary',
        '',
        `PASS : ${formatInteger(report.checkpoints.pass)}`,
        `FAIL : ${formatInteger(report.checkpoints.fail)}`,
        '',
        LINE,
        '',
    ].join('\n');
}

function buildHtmlReport(report) {
    const scenarioRows = report.scenarios
        .map((scenario) => {
            const status =
                scenario.errorRate === 0
                    ? 'PASS'
                    : 'CHECK';

            return `
                <tr>
                    <td>${escapeHtml(scenario.name)}</td>
                    <td>${formatInteger(scenario.count)}</td>
                    <td>${formatNumber(scenario.tps, 1)}</td>
                    <td>${formatMs(scenario.avg)}</td>
                    <td>${formatMs(scenario.p95)}</td>
                    <td>${formatMs(scenario.max)}</td>
                    <td>${formatPercent(
                        scenario.errorRate
                    )}</td>
                    <td>
                        <span class="status ${status.toLowerCase()}">
                            ${status}
                        </span>
                    </td>
                </tr>`;
        })
        .join('');

    const transactionRows = report.transactions
        .map((transaction) => {
            const cssClass =
                transaction.result === 'PASS'
                    ? 'pass'
                    : transaction.result === 'FAIL'
                        ? 'fail'
                        : 'na';

            return `
                <tr>
                    <td>${escapeHtml(transaction.name)}</td>
                    <td>
                        <span class="status ${cssClass}">
                            ${transaction.result}
                        </span>
                    </td>
                    <td>${
                        transaction.failureRate === null
                            ? '-'
                            : formatPercent(
                                transaction.failureRate
                            )
                    }</td>
                </tr>`;
        })
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>PEF Performance Report</title>

    <style>
        :root {
            color-scheme: light;
            font-family:
                Inter, Arial, Helvetica, sans-serif;
        }

        body {
            margin: 0;
            background: #f4f6f8;
            color: #1f2937;
        }

        .container {
            width: min(1180px, calc(100% - 40px));
            margin: 40px auto;
        }

        .header {
            padding: 28px 32px;
            border-radius: 12px;
            background: #111827;
            color: white;
        }

        .header h1 {
            margin: 0 0 8px;
            font-size: 30px;
        }

        .header p {
            margin: 0;
            color: #d1d5db;
        }

        .cards {
            display: grid;
            grid-template-columns:
                repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }

        .card,
        .section {
            border-radius: 12px;
            background: white;
            box-shadow:
                0 2px 12px rgba(0, 0, 0, 0.07);
        }

        .card {
            padding: 22px;
        }

        .card .label {
            color: #6b7280;
            font-size: 13px;
        }

        .card .value {
            margin-top: 8px;
            font-size: 28px;
            font-weight: 700;
        }

        .section {
            margin-top: 24px;
            padding: 24px;
            overflow-x: auto;
        }

        .section h2 {
            margin: 0 0 18px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 13px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: right;
            white-space: nowrap;
        }

        th:first-child,
        td:first-child {
            text-align: left;
        }

        th {
            background: #f9fafb;
            color: #4b5563;
            font-size: 13px;
        }

        .status {
            display: inline-block;
            min-width: 54px;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
        }

        .status.pass {
            background: #dcfce7;
            color: #166534;
        }

        .status.fail {
            background: #fee2e2;
            color: #991b1b;
        }

        .status.check {
            background: #fef3c7;
            color: #92400e;
        }

        .status.na {
            background: #e5e7eb;
            color: #4b5563;
        }

        .footer {
            padding: 24px 0;
            color: #6b7280;
            font-size: 13px;
            text-align: center;
        }
    </style>
</head>

<body>
    <main class="container">
        <header class="header">
            <h1>PEF Performance Report</h1>
            <p>
                Performance Engineering Framework ·
                ${escapeHtml(new Date().toISOString())}
            </p>
        </header>

        <section class="cards">
            <div class="card">
                <div class="label">Total TPS</div>
                <div class="value">
                    ${formatNumber(report.totalTps, 1)}
                </div>
            </div>

            <div class="card">
                <div class="label">Checkpoint PASS</div>
                <div class="value">
                    ${formatInteger(report.checkpoints.pass)}
                </div>
            </div>

            <div class="card">
                <div class="label">Checkpoint FAIL</div>
                <div class="value">
                    ${formatInteger(report.checkpoints.fail)}
                </div>
            </div>
        </section>

        <section class="section">
            <h2>Scenario Summary</h2>

            <table>
                <thead>
                    <tr>
                        <th>Scenario</th>
                        <th>Requests</th>
                        <th>TPS</th>
                        <th>Avg</th>
                        <th>P95</th>
                        <th>Max</th>
                        <th>Error</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${scenarioRows}
                </tbody>
            </table>
        </section>

        <section class="section">
            <h2>Transaction Summary</h2>

            <table>
                <thead>
                    <tr>
                        <th>Transaction</th>
                        <th>Status</th>
                        <th>Failure Rate</th>
                    </tr>
                </thead>

                <tbody>
                    ${transactionRows}
                </tbody>
            </table>
        </section>

        <footer class="footer">
            Generated by PEF Report Engine v0.2
        </footer>
    </main>
</body>
</html>`;
}

function buildCsvReport(report) {
    const header = [
        'Scenario',
        'Requests',
        'TPS',
        'AvgMs',
        'P95Ms',
        'MaxMs',
        'ErrorRate',
    ].join(',');

    const rows = report.scenarios.map((scenario) => {
        return [
            csvValue(scenario.name),
            scenario.count,
            formatNumber(scenario.tps, 3),
            formatNumber(scenario.avg, 3),
            formatNumber(scenario.p95, 3),
            formatNumber(scenario.max, 3),
            formatNumber(scenario.errorRate, 6),
        ].join(',');
    });

    return [header, ...rows].join('\n');
}

function getValues(data, metricName) {
    const metric =
        data &&
        data.metrics &&
        data.metrics[metricName];

    return metric && metric.values
        ? metric.values
        : {};
}

function getCounterCount(data, metricName) {
    const values = getValues(data, metricName);

    return numberValue(values.count);
}

function getTransactionFailureRate(data, transactionName) {
    const normalizedNames = [
        transactionName,
        transactionName.replace(/ /g, '_'),
    ];

    const metricKeys = Object.keys(
        data && data.metrics
            ? data.metrics
            : {}
    );

    for (
        let index = 0;
        index < metricKeys.length;
        index += 1
    ) {
        const metricKey = metricKeys[index];

        const isTransactionMetric =
            metricKey.startsWith(
                'pef_transaction_failure_rate{'
            );

        const matchesTransaction =
            normalizedNames.some((name) => {
                return (
                    metricKey.includes(
                        `transaction:${name}`
                    ) ||
                    metricKey.includes(
                        `transaction="${name}"`
                    )
                );
            });

        if (
            isTransactionMetric &&
            matchesTransaction
        ) {
            const values = getValues(
                data,
                metricKey
            );

            return numberValue(values.rate);
        }
    }

    return null;
}

function numberValue(value) {
    return typeof value === 'number' &&
        Number.isFinite(value)
        ? value
        : 0;
}

function formatNumber(value, digits) {
    return numberValue(value).toFixed(digits);
}

function formatInteger(value) {
    const integerValue = Math.round(numberValue(value));
    const sign = integerValue < 0 ? '-' : '';
    const absoluteValue = Math.abs(integerValue);

    const formatted = String(absoluteValue).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ','
    );

    return `${sign}${formatted}`;
}

function formatMs(value) {
    return `${Math.round(numberValue(value))}ms`;
}

function formatPercent(value) {
    return `${(numberValue(value) * 100).toFixed(1)}%`;
}

function padRight(value, length) {
    return String(value).padEnd(length, ' ');
}

function padLeft(value, length) {
    return String(value).padStart(length, ' ');
}

function csvValue(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
