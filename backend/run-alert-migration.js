/**
 * Run alerts table migration only
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function runAlertMigration() {
  try {
    console.log('\n=== Running Alerts Table Migration ===\n');
    
    const migrationPath = path.join(__dirname, 'src/database/migrations/008_create_alerts_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✓ Alerts table created successfully');
    
    // Verify table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alerts'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n✓ Alerts table has ${result.rows.length} columns:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    await pool.end();
    console.log('\nMigration complete!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runAlertMigration();
