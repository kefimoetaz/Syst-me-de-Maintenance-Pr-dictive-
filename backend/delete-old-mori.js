/**
 * Delete old duplicate Mori machines (IDs: 92, 93) and keep real PC Mori (ID: 94)
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

const IDS_TO_DELETE = [92, 93];

async function deleteOldMori() {
  try {
    console.log('\n=== Deleting Old Mori Machines (IDs: 92, 93) ===\n');
    
    // Show all Mori machines first
    const moriMachines = await pool.query(`
      SELECT id, hostname, serial_number, ip_address, created_at
      FROM machines
      WHERE hostname ILIKE '%mori%'
      ORDER BY id
    `);
    
    console.log('Current Mori machines:');
    moriMachines.rows.forEach(m => {
      console.log(`  ID ${m.id}: ${m.hostname} - ${m.serial_number} (${m.ip_address})`);
    });
    
    // Delete each old machine and its related data
    for (const id of IDS_TO_DELETE) {
      console.log(`\nDeleting machine ID ${id} and all related data...`);
      
      await pool.query('DELETE FROM predictions WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM anomalies WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM alerts WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM smart_data WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM system_metrics WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM agents WHERE machine_id = $1', [id]);
      await pool.query('DELETE FROM machines WHERE id = $1', [id]);
      
      console.log(`  ✓ Machine ${id} deleted`);
    }
    
    // Verify only one Mori remains
    const remaining = await pool.query(`
      SELECT id, hostname, serial_number, ip_address
      FROM machines
      WHERE hostname ILIKE '%mori%'
    `);
    
    console.log('\n=== Result ===');
    console.log(`Remaining Mori machines: ${remaining.rows.length}`);
    remaining.rows.forEach(m => {
      console.log(`  ✓ ID ${m.id}: ${m.hostname} - ${m.serial_number} (${m.ip_address})`);
    });
    
    await pool.end();
    console.log('\n✓ Cleanup complete! Only your real PC Mori (ID 94) remains.\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

deleteOldMori();
