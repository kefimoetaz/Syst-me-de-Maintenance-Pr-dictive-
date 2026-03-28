/**
 * Fast seeding: Add 10 machines with 7 days of data (instead of 15 machines with 30 days)
 * Much faster for demo purposes
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function seedFast() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 FAST SEEDING: 10 machines with 7 days of data\n');
    
    // Machines data
    const machines = [
      // HEALTHY (3 machines)
      { hostname: 'PC-HR-04', ip: '192.168.1.104', serial: 'SN-2024-004-HR', os: 'Windows 11 Pro', cpu: [20, 35], temp: [45, 53], mem: [40, 55], disk: [35, 45], smart: 'GOOD', errors: [0, 0] },
      { hostname: 'PC-FINANCE-05', ip: '192.168.1.105', serial: 'SN-2024-005-FIN', os: 'Windows 10 Enterprise', cpu: [35, 55], temp: [50, 60], mem: [50, 65], disk: [45, 55], smart: 'GOOD', errors: [0, 0] },
      { hostname: 'PC-SALES-07', ip: '192.168.1.107', serial: 'SN-2024-007-SALES', os: 'Windows 10 Pro', cpu: [30, 50], temp: [50, 60], mem: [50, 65], disk: [50, 60], smart: 'GOOD', errors: [0, 0] },
      
      // MEDIUM RISK (4 machines)
      { hostname: 'PC-DESIGN-09', ip: '192.168.1.109', serial: 'SN-2024-009-DESIGN', os: 'Windows 10 Enterprise', cpu: [60, 85], temp: [65, 80], mem: [70, 85], disk: [60, 75], smart: 'WARNING', errors: [0, 3] },
      { hostname: 'PC-VIDEO-10', ip: '192.168.1.110', serial: 'SN-2024-010-VIDEO', os: 'Windows 11 Pro', cpu: [70, 90], temp: [70, 85], mem: [75, 90], disk: [70, 85], smart: 'WARNING', errors: [0, 4] },
      { hostname: 'PC-DATA-11', ip: '192.168.1.111', serial: 'SN-2024-011-DATA', os: 'Windows 10 Enterprise', cpu: [50, 70], temp: [60, 72], mem: [65, 80], disk: [65, 80], smart: 'WARNING', errors: [0, 5] },
      { hostname: 'PC-QA-12', ip: '192.168.1.112', serial: 'SN-2024-012-QA', os: 'Windows 11 Pro', cpu: [55, 75], temp: [62, 74], mem: [60, 75], disk: [55, 70], smart: 'WARNING', errors: [0, 3] },
      
      // HIGH RISK (3 machines)
      { hostname: 'PC-OLD-SERVER-14', ip: '192.168.1.114', serial: 'SN-2024-014-OLDSRV', os: 'Windows Server 2016', cpu: [75, 95], temp: [75, 95], mem: [80, 95], disk: [85, 95], smart: 'CRITICAL', errors: [0, 10] },
      { hostname: 'PC-LEGACY-15', ip: '192.168.1.115', serial: 'SN-2024-015-LEGACY', os: 'Windows 7 Pro', cpu: [70, 95], temp: [72, 90], mem: [75, 95], disk: [88, 98], smart: 'CRITICAL', errors: [0, 15] },
      { hostname: 'PC-ARCHIVE-18', ip: '192.168.1.118', serial: 'SN-2024-018-ARCH', os: 'Windows Server 2012', cpu: [68, 95], temp: [80, 95], mem: [78, 95], disk: [90, 98], smart: 'CRITICAL', errors: [0, 20] }
    ];
    
    console.log(`📊 Adding ${machines.length} machines with 7 days (168 hours) of data each...\n`);
    
    for (const machine of machines) {
      console.log(`  Processing: ${machine.hostname}...`);
      
      // Insert machine
      await client.query(`
        INSERT INTO machines (hostname, ip_address, serial_number, os)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (serial_number) DO NOTHING
      `, [machine.hostname, machine.ip, machine.serial, machine.os]);
      
      // Get machine ID
      const result = await client.query(
        'SELECT id FROM machines WHERE serial_number = $1',
        [machine.serial]
      );
      
      if (result.rows.length === 0) {
        console.log(`    ⚠️  Machine already exists, skipping`);
        continue;
      }
      
      const machineId = result.rows[0].id;
      
      // Insert agent
      const agentId = `550e8400-e29b-41d4-a716-4466554400${String(machineId).padStart(2, '0')}`;
      await client.query(`
        INSERT INTO agents (agent_id, machine_id, token)
        VALUES ($1, $2, $3)
        ON CONFLICT (agent_id) DO NOTHING
      `, [agentId, machineId, `token_${machine.hostname.toLowerCase()}_2024`]);
      
      // Insert 168 hours (7 days) of metrics
      for (let hour = 0; hour < 168; hour++) {
        const cpu = machine.cpu[0] + Math.random() * (machine.cpu[1] - machine.cpu[0]);
        const temp = machine.temp[0] + Math.random() * (machine.temp[1] - machine.temp[0]);
        const mem = machine.mem[0] + Math.random() * (machine.mem[1] - machine.mem[0]);
        const disk = machine.disk[0] + Math.random() * (machine.disk[1] - machine.disk[0]);
        
        await client.query(`
          INSERT INTO system_metrics (
            machine_id, timestamp, cpu_usage, cpu_temperature,
            memory_usage, memory_available, memory_total,
            disk_usage, disk_free, disk_total
          ) VALUES ($1, NOW() - INTERVAL '1 hour' * $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          machineId, hour, cpu, temp, mem,
          Math.floor(4096 + Math.random() * 4096), 16384,
          disk, Math.floor(100000 + Math.random() * 100000), 512000
        ]);
        
        // Insert SMART data
        const readErrors = Math.floor(Math.random() * (machine.errors[1] + 1));
        const writeErrors = Math.floor(Math.random() * (machine.errors[1] + 1));
        const smartTemp = 35 + Math.random() * 30;
        
        await client.query(`
          INSERT INTO smart_data (
            machine_id, timestamp, health_status,
            read_errors, write_errors, temperature
          ) VALUES ($1, NOW() - INTERVAL '1 hour' * $2, $3, $4, $5, $6)
        `, [machineId, hour, machine.smart, readErrors, writeErrors, smartTemp]);
      }
      
      console.log(`    ✅ Added 168 hours of data`);
    }
    
    // Verify
    const count = await client.query('SELECT COUNT(*) FROM machines');
    const metricsCount = await client.query('SELECT COUNT(*) FROM system_metrics');
    
    console.log('\n✅ SEEDING COMPLETE!');
    console.log(`📊 Total machines: ${count.rows[0].count}`);
    console.log(`📈 Total metrics: ${metricsCount.rows[0].count}`);
    console.log('\n🎯 Next steps:');
    console.log('   1. Retrain: cd ..\\ml-service && python -m src.training_pipeline');
    console.log('   2. Predict: python run_predictions_once.py\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedFast()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
