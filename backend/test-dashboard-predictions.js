/**
 * Test script for dashboard endpoints with predictions
 */
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

async function testDashboardEndpoints() {
    console.log('\n' + '='.repeat(80));
    console.log('DASHBOARD ENDPOINTS WITH PREDICTIONS TEST');
    console.log('='.repeat(80));
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
    
    const tests = [
        {
            name: 'Get Dashboard Overview (with high-risk count)',
            method: 'GET',
            url: '/api/dashboard/overview'
        },
        {
            name: 'Get Machines List (with predictions)',
            method: 'GET',
            url: '/api/dashboard/machines'
        },
        {
            name: 'Get Machine 1 Metrics (with prediction details)',
            method: 'GET',
            url: '/api/dashboard/machines/1/metrics'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log('='.repeat(80));
        console.log(test.name);
        console.log('='.repeat(80));
        
        try {
            const response = await axios({
                method: test.method,
                url: `${BACKEND_URL}${test.url}`,
                timeout: 10000
            });
            
            console.log(`Status Code: ${response.status}`);
            console.log('Response:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log();
            
            results.push({ name: test.name, status: 'PASS' });
            
        } catch (error) {
            console.log(`ERROR: ${error.message}`);
            if (error.response) {
                console.log(`Status Code: ${error.response.status}`);
                console.log('Response:');
                console.log(JSON.stringify(error.response.data, null, 2));
            }
            console.log();
            
            results.push({ name: test.name, status: 'FAIL' });
        }
    }
    
    // Print summary
    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    results.forEach(result => {
        console.log(`${result.name}: ${result.status}`);
    });
    
    const passed = results.filter(r => r.status === 'PASS').length;
    console.log(`\nTotal: ${passed}/${results.length} tests passed`);
}

// Run tests
testDashboardEndpoints().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
