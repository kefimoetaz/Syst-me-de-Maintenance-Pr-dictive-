const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'predictive_maintenance',
  user: 'postgres',
  password: '123'
});

async function checkMachines() {
  try {
    await client.connect();
    
    // Get all machines
    const machinesResult = await client.query('SELECT id, hostname, ip_address, serial_number FROM machines ORDER BY id');
    console.log('=== MACHINES IN DATABASE ===');
    machinesResult.rows.forEach(m => {
      console.log(`ID: ${m.id}, Hostname: ${m.hostname}, IP: ${m.ip_address}, Serial: ${m.serial_number}`);
    });
    
    // Get metrics count per machine
    const metricsResult = await client.query('SELECT machine_id, COUNT(*) as metric_count FROM system_metrics GROUP BY machine_id ORDER BY machine_id');
    console.log('\n=== METRICS COUNT PER MACHINE ===');
    metricsResult.rows.forEach(m => {
      console.log(`Machine ID ${m.machine_id}: ${m.metric_count} metrics`);
    });
    
    // Get latest metrics for each machine
    const latestMetrics = await client.query(`
      SELECT m.id, m.hostname, 
             sm.cpu_usage, sm.memory_usage, sm.disk_usage, sm.timestamp
      FROM machines m
      LEFT JOIN LATERAL (
        SELECT cpu_usage, memory_usage, disk_usage, timestamp
        FROM system_metrics
        WHERE machine_id = m.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) sm ON true
      ORDER BY m.id
    `);
    console.log('\n=== LATEST METRICS PER MACHINE ===');
    latestMetrics.rows.forEach(m => {
      if (m.cpu_usage) {
        console.log(`${m.hostname} (ID: ${m.id}): CPU=${m.cpu_usage}%, RAM=${m.memory_usage}%, Disk=${m.disk_usage}%, Time=${m.timestamp}`);
      } else {
        console.log(`${m.hostname} (ID: ${m.id}): NO METRICS DATA`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkMachines();
