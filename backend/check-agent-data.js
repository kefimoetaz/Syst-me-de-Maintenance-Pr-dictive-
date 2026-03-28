const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function checkData() {
  try {
    const result = await pool.query(`
      SELECT 
        m.hostname, 
        m.serial_number, 
        sm.cpu_usage, 
        sm.memory_usage, 
        sm.disk_usage,
        sd.health_status, 
        sm.created_at 
      FROM machines m 
      JOIN system_metrics sm ON m.id = sm.machine_id 
      JOIN smart_data sd ON m.id = sd.machine_id 
      WHERE m.hostname = 'Mori'
      ORDER BY sm.created_at DESC 
      LIMIT 1
    `);
    
    console.log('\n=== Latest Agent Data ===');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('\n✓ Agent data successfully stored in database!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
