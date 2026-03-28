/**
 * Seed diverse machines with varied health patterns
 * This adds 15 more machines (5 healthy, 5 medium risk, 5 high risk)
 * to improve ML model training and predictions
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function seedDiverseMachines() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting diverse machine seeding...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'src', 'database', 'seeders', '003_seed_diverse_machines.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Seeding data:');
    console.log('  - 5 Healthy machines (LOW risk)');
    console.log('  - 5 Medium risk machines');
    console.log('  - 5 High risk machines (CRITICAL)');
    console.log('  - 30 days of historical data per machine');
    console.log('  - System metrics + SMART data\n');
    
    // Execute the seeding
    console.log('⏳ Executing SQL...');
    await client.query(sql);
    
    console.log('✅ Seeding completed!\n');
    
    // Verify the results
    console.log('📈 Verification:');
    
    const machineCount = await client.query('SELECT COUNT(*) FROM machines');
    console.log(`  Total machines: ${machineCount.rows[0].count}`);
    
    const metricsCount = await client.query('SELECT COUNT(*) FROM system_metrics');
    console.log(`  Total metrics records: ${metricsCount.rows[0].count}`);
    
    const smartCount = await client.query('SELECT COUNT(*) FROM smart_data');
    console.log(`  Total SMART records: ${smartCount.rows[0].count}`);
    
    // Show machine breakdown
    console.log('\n🖥️  Machine breakdown:');
    const machines = await client.query(`
      SELECT hostname, serial_number, os 
      FROM machines 
      ORDER BY id
    `);
    
    machines.rows.forEach((machine, index) => {
      console.log(`  ${index + 1}. ${machine.hostname} (${machine.serial_number})`);
    });
    
    console.log('\n✨ Done! You can now:');
    console.log('  1. Retrain the ML model: cd ml-service && python -m src.training_pipeline');
    console.log('  2. Run predictions: python run_predictions_once.py');
    console.log('  3. Check the dashboard for varied risk levels\n');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeder
seedDiverseMachines()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
