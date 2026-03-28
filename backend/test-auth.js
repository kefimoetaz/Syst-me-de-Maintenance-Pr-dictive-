const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Test 1: Register new user
    console.log('1️⃣  Testing REGISTER...');
    try {
      const registerResponse = await axios.post(`${API_URL}/register`, {
        email: `test${Date.now()}@test.com`,
        password: 'test123',
        full_name: 'Test User'
      });
      console.log('✅ Register successful');
      console.log(`   Token: ${registerResponse.data.token.substring(0, 20)}...`);
      console.log(`   User: ${registerResponse.data.user.email} (${registerResponse.data.user.role})\n`);
    } catch (error) {
      console.log(`❌ Register failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 2: Login with admin
    console.log('2️⃣  Testing LOGIN (admin)...');
    try {
      const loginResponse = await axios.post(`${API_URL}/login`, {
        email: 'admin@maintenance.com',
        password: 'admin123'
      });
      console.log('✅ Login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   User: ${loginResponse.data.user.email} (${loginResponse.data.user.role})`);
      
      const token = loginResponse.data.token;

      // Test 3: Get profile
      console.log('\n3️⃣  Testing GET PROFILE...');
      try {
        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get profile successful');
        console.log(`   Name: ${profileResponse.data.user.full_name}`);
        console.log(`   Email: ${profileResponse.data.user.email}`);
        console.log(`   Role: ${profileResponse.data.user.role}\n`);
      } catch (error) {
        console.log(`❌ Get profile failed: ${error.response?.data?.message || error.message}\n`);
      }

    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 4: Login with wrong password
    console.log('4️⃣  Testing LOGIN with wrong password...');
    try {
      await axios.post(`${API_URL}/login`, {
        email: 'admin@maintenance.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed but succeeded\n');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password');
      console.log(`   Message: ${error.response?.data?.message}\n`);
    }

    // Test 5: Access protected route without token
    console.log('5️⃣  Testing protected route WITHOUT token...');
    try {
      await axios.get(`${API_URL}/profile`);
      console.log('❌ Should have failed but succeeded\n');
    } catch (error) {
      console.log('✅ Correctly rejected request without token');
      console.log(`   Message: ${error.response?.data?.message}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All authentication tests completed!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuth();
