/**
 * Test script for ML proxy endpoints
 * Tests backend proxy to Python ML service
 */
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

async function testMLProxyEndpoints() {
    console.log('\n' + '='.repeat(80));
    console.log('ML PROXY ENDPOINTS TEST');
    console.log('='.repeat(80));
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
    
    const tests = [
        {
            name: 'Get Prediction for Machine 1',
            method: 'GET',
            url: '/api/ml/predictions/1'
        },
        {
            name: 'Get High-Risk Machines',
            method: 'GET',
            url: '/api/ml/predictions/high-risk'
        },
        {
            name: 'Get Anomalies',
            method: 'GET',
            url: '/api/ml/anomalies'
        },
        {
            name: 'Get Anomalies (filtered)',
            method: 'GET',
            url: '/api/ml/anomalies?severity=CRITICAL&days=7'
        },
        {
            name: 'Get Models',
            method: 'GET',
            url: '/api/ml/models'
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
                timeout: 5000
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
testMLProxyEndpoints().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
