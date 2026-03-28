/**
 * Quick script to check predictions in database
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function checkPredictions() {
  try {
    console.log('\n=== Checking Predictions ===\n');
    
    const result = await pool.query(`
      SELECT 
        id, machine_id, prediction_date,
        failure_probability_7d, failure_probability_14d, failure_probability_30d,
        risk_level, model_version
      FROM predictions
      ORDER BY prediction_date DESC
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} predictions:\n`);
    
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Machine: ${row.machine_id}`);
      console.log(`Date: ${row.prediction_date}`);
      console.log(`Risk: ${row.risk_level}`);
      console.log(`Probabilities: 7d=${row.failure_probability_7d}%, 14d=${row.failure_probability_14d}%, 30d=${row.failure_probability_30d}%`);
      console.log(`Model: ${row.model_version}`);
      console.log('---');
    });
    
    await pool.end();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPredictions();
