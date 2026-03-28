/**
 * Script to seed degradation data for ML predictions demo
 * This adds realistic degradation patterns to show the ML system in action
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function seedDegradationData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting degradation data seeding...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'src', 'database', 'seeders', '002_seed_degradation_data_fixed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Inserting degradation patterns...');
    console.log('   - Machine 1 (PC-ADMIN-01): CPU degradation → HIGH RISK');
    console.log('   - Machine 2 (PC-DEV-02): Memory leak → MEDIUM RISK');
    console.log('   - Machine 3 (PC-SUPPORT-03): Disk failure → CRITICAL RISK');
    console.log('   - Machine 4 (Mori): Erratic behavior → MEDIUM RISK');
    console.log('   - Machine 5 (PC-TEST-01): Healthy → LOW RISK\n');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Degradation data seeded successfully!\n');
    
    // Count inserted records
    const metricsCount = await client.query('SELECT COUNT(*) FROM system_metrics');
    const smartCount = await client.query('SELECT COUNT(*) FROM smart_data');
    const anomaliesCount = await client.query('SELECT COUNT(*) FROM anomalies');
    
    console.log('📈 Database Statistics:');
    console.log(`   - System Metrics: ${metricsCount.rows[0].count} records`);
    console.log(`   - SMART Data: ${smartCount.rows[0].count} records`);
    console.log(`   - Anomalies: ${anomaliesCount.rows[0].count} records\n`);
    
    console.log('🤖 Next Steps:');
    console.log('   1. Retrain the ML model with new data:');
    console.log('      cd ml-service');
    console.log('      .\\venv\\Scripts\\Activate.ps1  (Windows)');
    console.log('      python -c "from src.training_pipeline import TrainingPipeline; TrainingPipeline().run_training()"\n');
    console.log('   2. Generate predictions:');
    console.log('      python -c "from src.prediction_scheduler import PredictionScheduler; PredictionScheduler().run_prediction_job()"\n');
    console.log('   3. Refresh the dashboard at http://localhost:5173\n');
    console.log('🎉 You should now see different risk levels and predictions!');
    
  } catch (error) {
    console.error('❌ Error seeding degradation data:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeder
seedDegradationData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
