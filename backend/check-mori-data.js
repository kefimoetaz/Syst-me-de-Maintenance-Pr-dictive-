/**
 * Check recent data from Mori machine
 */
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'predictive_maintenance',
    user: 'postgres',
    password: '123'
});

async function checkMoriData() {
    try {
        console.log('\n=== Checking Mori Machine Data ===\n');
        
        // Find Mori machine
        const machineResult = await pool.query(`
            SELECT id, hostname, serial_number, ip_address, os, created_at
            FROM machines
            WHERE hostname = 'Mori'
            ORDER BY id DESC
            LIMIT 1
        `);
        
        if (machineResult.rows.length === 0) {
            console.log('❌ Mori machine not found in database');
            return;
        }
        
        const machine = machineResult.rows[0];
        console.log('✅ Machine Found:');
        console.log(`   ID: ${machine.id}`);
        console.log(`   Hostname: ${machine.hostname}`);
        console.log(`   Serial: ${machine.serial_number}`);
        console.log(`   IP: ${machine.ip_address}`);
        console.log(`   OS: ${machine.os}`);
        console.log(`   Created: ${machine.created_at}`);
        
        // Get recent metrics (last 10)
        const metricsResult = await pool.query(`
            SELECT 
                timestamp,
                cpu_usage,
                memory_usage,
                disk_usage,
                cpu_temperature
            FROM system_metrics
            WHERE machine_id = $1
            ORDER BY timestamp DESC
            LIMIT 10
        `, [machine.id]);
        
        console.log(`\n📊 Recent Metrics (last 10 records):\n`);
        
        if (metricsResult.rows.length === 0) {
            console.log('   ❌ No metrics found');
        } else {
            metricsResult.rows.forEach((row, index) => {
                const date = new Date(row.timestamp);
                const now = new Date();
                const diffMinutes = Math.floor((now - date) / 1000 / 60);
                
                console.log(`   ${index + 1}. ${date.toLocaleString()}`);
                console.log(`      (${diffMinutes} minutes ago)`);
                console.log(`      CPU: ${row.cpu_usage}%, RAM: ${row.memory_usage}%, Disk: ${row.disk_usage}%`);
                console.log(`      Temp: ${row.cpu_temperature || 'N/A'}°C`);
                console.log('');
            });
            
            // Check if data is recent (within last 2 hours)
            const latestTimestamp = new Date(metricsResult.rows[0].timestamp);
            const now = new Date();
            const diffHours = (now - latestTimestamp) / 1000 / 60 / 60;
            
            console.log('\n📈 Collection Status:');
            if (diffHours < 1.5) {
                console.log(`   ✅ Agent is collecting data (last: ${Math.floor(diffHours * 60)} minutes ago)`);
                console.log(`   ✅ Next collection expected in ~${Math.ceil(60 - (diffHours * 60))} minutes`);
            } else {
                console.log(`   ⚠️  Last data is ${diffHours.toFixed(1)} hours old`);
                console.log(`   ⚠️  Agent may not be running`);
            }
        }
        
        // Count total records
        const countResult = await pool.query(`
            SELECT COUNT(*) as total
            FROM system_metrics
            WHERE machine_id = $1
        `, [machine.id]);
        
        console.log(`\n📦 Total Records: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkMoriData();
