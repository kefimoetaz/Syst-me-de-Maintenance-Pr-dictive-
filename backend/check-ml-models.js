/**
 * Quick script to check ML models in database
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

async function checkModels() {
  try {
    console.log('\n=== Checking ML Models ===\n');
    
    const result = await pool.query(`
      SELECT 
        id, model_id, model_type, version, is_active,
        accuracy, file_path,
        trained_at, created_at
      FROM ml_models
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${result.rows.length} models:\n`);
    
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Model ID: ${row.model_id}`);
      console.log(`Type: ${row.model_type}`);
      console.log(`Version: ${row.version}`);
      console.log(`Active: ${row.is_active}`);
      console.log(`Accuracy: ${row.accuracy}`);
      console.log(`File: ${row.file_path}`);
      console.log(`Trained: ${row.trained_at}`);
      console.log('---');
    });
    
    await pool.end();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkModels();
