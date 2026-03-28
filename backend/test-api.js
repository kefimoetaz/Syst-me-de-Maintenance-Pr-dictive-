/**
 * Simple API test script
 * Tests the POST /api/data endpoint with valid data
 */

const testData = {
    agent_id: "550e8400-e29b-41d4-a716-446655440001",
    machine: {
        hostname: "PC-TEST-01",
        ip_address: "192.168.1.150",
        serial_number: "SN-2024-TEST-001",
        os: "Windows 11 Pro"
    },
    timestamp: new Date().toISOString(),
    system_metrics: {
        cpu_usage: 45.5,
        cpu_temperature: 55.0,
        memory_usage: 60.0,
        memory_available: 4096,
        memory_total: 16384,
        disk_usage: 70.0,
        disk_free: 153600,
        disk_total: 512000
    },
    smart_data: {
        health_status: "GOOD",
        read_errors: 0,
        write_errors: 0,
        temperature: 40.0
    }
};

async function testAPI() {
    try {
        console.log('Testing POST /api/data endpoint...\n');
        
        const response = await fetch('http://localhost:3000/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token_admin_2024_secure_001'
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.status === 201) {
            console.log('\n✓ Test PASSED - Data received successfully!');
        } else {
            console.log('\n✗ Test FAILED - Unexpected status code');
        }
        
    } catch (error) {
        console.error('✗ Test FAILED - Error:', error.message);
    }
}

// Test invalid token
async function testInvalidToken() {
    try {
        console.log('\n\nTesting with invalid token...\n');
        
        const response = await fetch('http://localhost:3000/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_123'
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('\n✓ Test PASSED - Invalid token rejected correctly!');
        } else {
            console.log('\n✗ Test FAILED - Should return 401');
        }
        
    } catch (error) {
        console.error('✗ Test FAILED - Error:', error.message);
    }
}

// Test missing fields
async function testMissingFields() {
    try {
        console.log('\n\nTesting with missing fields...\n');
        
        const invalidData = {
            agent_id: "550e8400-e29b-41d4-a716-446655440001",
            machine: {
                hostname: "PC-TEST-01"
                // Missing required fields
            }
        };
        
        const response = await fetch('http://localhost:3000/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token_admin_2024_secure_001'
            },
            body: JSON.stringify(invalidData)
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.status === 400) {
            console.log('\n✓ Test PASSED - Validation working correctly!');
        } else {
            console.log('\n✗ Test FAILED - Should return 400');
        }
        
    } catch (error) {
        console.error('✗ Test FAILED - Error:', error.message);
    }
}

// Run all tests
async function runTests() {
    await testAPI();
    await testInvalidToken();
    await testMissingFields();
    console.log('\n\nAll tests completed!');
}

runTests();
