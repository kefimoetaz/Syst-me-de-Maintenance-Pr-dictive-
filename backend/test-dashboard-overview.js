/**
 * Test script to check dashboard overview endpoint
 */
const axios = require('axios');

async function testOverview() {
  try {
    console.log('\n=== Testing Dashboard Overview ===\n');
    
    const response = await axios.get('http://localhost:3000/api/dashboard/overview');
    
    console.log('Overview data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testOverview();
