/**
 * Cleanup script to remove ghost machines (machines without any metrics data)
 * These were created by the initial seeding but never used
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

async function cleanupGhostMachines() {
  try {
    console.log('\n=== Cleaning Up Ghost Machines ===\n');
    
    // Find machines with no metrics
    const ghostMachines = await pool.query(`
      SELECT m.id, m.hostname, m.ip_address
      FROM machines m
      LEFT JOIN system_metrics sm ON m.id = sm.machine_id
      WHERE sm.id IS NULL
    `);
    
    console.log(`Found ${ghostMachines.rows.length} ghost machines (no metrics data):\n`);
    
    ghostMachines.rows.forEach(machine => {
      console.log(`  - ID ${machine.id}: ${machine.hostname} (${machine.ip_address})`);
    });
    
    if (ghostMachines.rows.length === 0) {
      console.log('\nNo ghost machines to clean up!');
      await pool.end();
      return;
    }
    
    console.log('\nDeleting ghost machines...');
    
    // Delete ghost machines
    const result = await pool.query(`
      DELETE FROM machines
      WHERE id IN (
        SELECT m.id
        FROM machines m
        LEFT JOIN system_metrics sm ON m.id = sm.machine_id
        WHERE sm.id IS NULL
      )
    `);
    
    console.log(`\n✓ Deleted ${result.rowCount} ghost machines`);
    
    // Verify remaining machines
    const remaining = await pool.query('SELECT COUNT(*) as count FROM machines');
    console.log(`✓ ${remaining.rows[0].count} machines remaining in database`);
    
    await pool.end();
    console.log('\nCleanup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupGhostMachines();
