
const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/shop',
    'http://localhost:3000/about',
    'http://localhost:3000/contact',
    'http://localhost:3000/login',
    'http://localhost:3000/register',
    'http://localhost:3000/cart',
    'http://localhost:3000/checkout'
];

const fs = require('fs');

async function checkRoutes() {
    console.log('Starting Route Audit...');
    let output = 'Route Audit Results:\n====================\n';
    let allPassed = true;

    for (const url of urls) {
        try {
            const start = Date.now();
            const res = await fetch(url);
            const duration = Date.now() - start;

            if (res.ok) {
                const msg = `[PASS] ${url} - Status: ${res.status} (${duration}ms)`;
                console.log(msg);
                output += msg + '\n';
            } else {
                const msg = `[FAIL] ${url} - Status: ${res.status}`;
                console.error(msg);
                output += msg + '\n';
                allPassed = false;
            }
        } catch (error) {
            const msg = `[CRITICAL] ${url} - Error: ${error.message}`;
            console.error(msg);
            output += msg + '\n';
            allPassed = false;
        }
    }

    if (allPassed) {
        output += '\nAll routes are accessible!';
    } else {
        output += '\nSome routes failed.';
    }

    fs.writeFileSync('audit_results.txt', output);
    console.log('Results written to audit_results.txt');
}

checkRoutes();
