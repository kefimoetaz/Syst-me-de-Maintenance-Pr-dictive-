/**
 * Test script for alerts API
 */
const axios = require('axios');

async function testAlerts() {
  try {
    console.log('\n=== Testing Alerts API ===\n');
    
    // Test 1: Create an alert
    console.log('1. Creating test alert...');
    const alertData = {
      machine_id: 1,
      alert_type: 'PREDICTION',
      severity: 'HIGH',
      title: 'Test High Risk Alert',
      message: 'This is a test alert for machine PC-ADMIN-01',
      details: {
        failure_probability_30d: 55.95,
        risk_level: 'HIGH'
      }
    };
    
    const createResponse = await axios.post(
      'http://localhost:3000/api/alerts',
      alertData,
      {
        headers: {
          'Authorization': 'Bearer dev-token-12345'
        }
      }
    );
    
    console.log('✓ Alert created:', createResponse.data.id);
    const alertId = createResponse.data.id;
    
    // Test 2: Get all alerts
    console.log('\n2. Getting all alerts...');
    const allAlertsResponse = await axios.get(
      'http://localhost:3000/api/alerts',
      {
        headers: {
          'Authorization': 'Bearer dev-token-12345'
        }
      }
    );
    
    console.log(`✓ Found ${allAlertsResponse.data.total} alerts`);
    
    // Test 3: Get active alerts
    console.log('\n3. Getting active alerts...');
    const activeAlertsResponse = await axios.get(
      'http://localhost:3000/api/alerts/active',
      {
        headers: {
          'Authorization': 'Bearer dev-token-12345'
        }
      }
    );
    
    console.log(`✓ Found ${activeAlertsResponse.data.count} active alerts`);
    
    // Test 4: Acknowledge alert
    console.log('\n4. Acknowledging alert...');
    const ackResponse = await axios.patch(
      `http://localhost:3000/api/alerts/${alertId}/acknowledge`,
      { acknowledged_by: 'test-user' },
      {
        headers: {
          'Authorization': 'Bearer dev-token-12345'
        }
      }
    );
    
    console.log(`✓ Alert acknowledged: ${ackResponse.data.status}`);
    
    // Test 5: Get alert stats
    console.log('\n5. Getting alert statistics...');
    const statsResponse = await axios.get(
      'http://localhost:3000/api/alerts/stats',
      {
        headers: {
          'Authorization': 'Bearer dev-token-12345'
        }
      }
    );
    
    console.log('✓ Alert stats:', JSON.stringify(statsResponse.data, null, 2));
    
    console.log('\n=== All Tests Passed! ===\n');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAlerts();
