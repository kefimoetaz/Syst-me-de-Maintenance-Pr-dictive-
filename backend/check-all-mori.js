/**
 * Check all Mori machines in database
 */
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'predictive_maintenance',
    user: 'postgres',
    password: '123'
});

async function checkAllMori() {
    try {
        console.log('\n=== Checking All Mori Machines ===\n');
        
        // Find all machines with "Mori" in hostname
        const result = await pool.query(`
            SELECT 
                id, 
                hostname, 
                serial_number, 
                ip_address, 
                os, 
                created_at,
                updated_at
            FROM machines
            WHERE hostname ILIKE '%Mori%'
            ORDER BY id
        `);
        
        console.log(`Found ${result.rows.length} machine(s) with "Mori" in hostname:\n`);
        
        result.rows.forEach((machine, index) => {
            console.log(`${index + 1}. Machine ID: ${machine.id}`);
            console.log(`   Hostname: ${machine.hostname}`);
            console.log(`   Serial: ${machine.serial_number}`);
            console.log(`   IP: ${machine.ip_address}`);
            console.log(`   OS: ${machine.os}`);
            console.log(`   Created: ${machine.created_at}`);
            console.log(`   Updated: ${machine.updated_at}`);
            console.log('');
        });
        
        // Count metrics for each
        for (const machine of result.rows) {
            const metricsResult = await pool.query(`
                SELECT COUNT(*) as count
                FROM system_metrics
                WHERE machine_id = $1
            `, [machine.id]);
            
            console.log(`   Machine ${machine.id} (${machine.hostname}): ${metricsResult.rows[0].count} metrics records`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAllMori();
