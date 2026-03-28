/**
 * Script to trigger prediction generation via ML service API
 */
const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:5000';
const ML_SERVICE_TOKEN = 'dev-token-12345';

async function triggerPredictions() {
  try {
    console.log('\n=== Triggering Prediction Generation ===\n');
    
    // First check if ML service is running
    try {
      const health = await axios.get(`${ML_SERVICE_URL}/health`);
      console.log('✓ ML service is running');
      console.log(`  Status: ${health.data.status}`);
    } catch (error) {
      console.error('✗ ML service is not running!');
      console.error('  Please start the ML service first:');
      console.error('  cd ml-service && python -m src.app');
      process.exit(1);
    }
    
    // Get list of machines
    const { Pool } = require('pg');
    require('dotenv').config();
    
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'predictive_maintenance',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123'
    });
    
    const machines = await pool.query('SELECT id, hostname FROM machines ORDER BY id');
    console.log(`\nFound ${machines.rows.length} machines`);
    
    // For each machine, check if prediction exists
    console.log('\nChecking predictions...\n');
    
    for (const machine of machines.rows) {
      try {
        const response = await axios.get(
          `${ML_SERVICE_URL}/api/predictions/${machine.id}`,
          {
            headers: { 'Authorization': `Bearer ${ML_SERVICE_TOKEN}` },
            timeout: 5000
          }
        );
        
        console.log(`✓ Machine ${machine.id} (${machine.hostname}): ${response.data.risk_level} risk (${response.data.failure_probability_30d}%)`);
        
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`✗ Machine ${machine.id} (${machine.hostname}): No prediction found`);
        } else {
          console.log(`✗ Machine ${machine.id} (${machine.hostname}): Error - ${error.message}`);
        }
      }
    }
    
    await pool.end();
    
    console.log('\n=== Summary ===');
    console.log('If predictions are missing, you need to run the prediction scheduler:');
    console.log('  cd ml-service');
    console.log('  python -m src.prediction_scheduler');
    console.log('\nOr start the ML service with scheduler enabled.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

triggerPredictions();
