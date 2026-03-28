/**
 * Verification script - Run after restarting backend
 * Tests that alert system is working end-to-end
 */
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function verify() {
  console.log('\n🔍 VERIFYING ALERT SYSTEM...\n');
  
  try {
    // Test 1: Check backend is running
    console.log('1️⃣  Checking backend server...');
    try {
      const health = await axios.get('http://localhost:3000/health');
      console.log('   ✅ Backend is running');
    } catch (error) {
      console.log('   ❌ Backend is NOT running!');
      console.log('   👉 Please restart backend: cd backend && node src/index.js');
      process.exit(1);
    }
    
    // Test 2: Check alert API endpoint exists
    console.log('\n2️⃣  Checking alert API...');
    try {
      const response = await axios.get(
        'http://localhost:3000/api/alerts/active',
        {
          headers: { 'Authorization': 'Bearer dev-token-12345' }
        }
      );
      console.log(`   ✅ Alert API working (${response.data.count} active alerts)`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   ❌ Alert API not found - Backend needs restart!');
        console.log('   👉 Stop backend (Ctrl+C) and restart: node src/index.js');
        process.exit(1);
      } else {
        console.log(`   ⚠️  Alert API error: ${error.message}`);
      }
    }
    
    // Test 3: Check alerts table exists
    console.log('\n3️⃣  Checking alerts table...');
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'alerts'
    `);
    
    if (tableCheck.rows[0].count === '1') {
      console.log('   ✅ Alerts table exists');
      
      // Count existing alerts
      const alertCount = await pool.query('SELECT COUNT(*) as count FROM alerts');
      console.log(`   📊 Current alerts in database: ${alertCount.rows[0].count}`);
    } else {
      console.log('   ❌ Alerts table missing!');
      console.log('   👉 Run: node run-alert-migration.js');
      process.exit(1);
    }
    
    // Test 4: Check email configuration
    console.log('\n4️⃣  Checking email configuration...');
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      console.log('   ✅ Email configured');
      console.log(`   📧 SMTP: ${process.env.SMTP_HOST}`);
      console.log(`   👤 User: ${process.env.SMTP_USER}`);
      console.log(`   📬 Recipients: ${process.env.ALERT_EMAIL_RECIPIENTS || process.env.SMTP_USER}`);
    } else {
      console.log('   ⚠️  Email NOT configured (alerts will be created but not emailed)');
      console.log('   👉 Add SMTP settings to backend/.env');
    }
    
    // Test 5: Check ML service
    console.log('\n5️⃣  Checking ML service...');
    try {
      const mlHealth = await axios.get('http://localhost:5000/health');
      console.log('   ✅ ML service is running');
    } catch (error) {
      console.log('   ⚠️  ML service not running (needed for automatic alerts)');
      console.log('   👉 Start ML service: cd ml-service && python -m src.app');
    }
    
    await pool.end();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALERT SYSTEM IS READY!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('   1. Run predictions: cd ml-service && python run_predictions_once.py');
    console.log('   2. Check alerts: node -e "..." (see ALERT_SYSTEM_SETUP.md)');
    console.log('   3. Check your email for alert notifications\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verify();
