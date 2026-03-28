/**
 * Verify machine diversity and data distribution
 * Shows if the seeding created proper varied patterns
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function verifyDiversity() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 MACHINE DIVERSITY VERIFICATION\n');
    console.log('=' .repeat(60));
    
    // 1. Total counts
    const machineCount = await client.query('SELECT COUNT(*) FROM machines');
    const metricsCount = await client.query('SELECT COUNT(*) FROM system_metrics');
    const smartCount = await client.query('SELECT COUNT(*) FROM smart_data');
    
    console.log('\n📊 Database Statistics:');
    console.log(`  Total Machines: ${machineCount.rows[0].count}`);
    console.log(`  Total Metrics: ${metricsCount.rows[0].count}`);
    console.log(`  Total SMART Data: ${smartCount.rows[0].count}`);
    
    // 2. Machine list
    console.log('\n🖥️  All Machines:');
    const machines = await client.query(`
      SELECT id, hostname, serial_number, os 
      FROM machines 
      ORDER BY id
    `);
    
    machines.rows.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.hostname.padEnd(20)} ${m.serial_number}`);
    });
    
    // 3. Average metrics per machine (last 24 hours)
    console.log('\n📈 Average Metrics (Last 24h):');
    console.log('  ' + 'Machine'.padEnd(20) + ' CPU%  Temp°C  Mem%  Disk%');
    console.log('  ' + '-'.repeat(55));
    
    const avgMetrics = await client.query(`
      SELECT 
        m.hostname,
        ROUND(AVG(sm.cpu_usage)::numeric, 1) as avg_cpu,
        ROUND(AVG(sm.cpu_temperature)::numeric, 1) as avg_temp,
        ROUND(AVG(sm.memory_usage)::numeric, 1) as avg_mem,
        ROUND(AVG(sm.disk_usage)::numeric, 1) as avg_disk
      FROM machines m
      JOIN system_metrics sm ON m.id = sm.machine_id
      WHERE sm.timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY m.hostname
      ORDER BY m.hostname
    `);
    
    avgMetrics.rows.forEach(row => {
      const cpu = String(row.avg_cpu).padStart(5);
      const temp = String(row.avg_temp).padStart(6);
      const mem = String(row.avg_mem).padStart(5);
      const disk = String(row.avg_disk).padStart(5);
      console.log(`  ${row.hostname.padEnd(20)} ${cpu}  ${temp}  ${mem}  ${disk}`);
    });
    
    // 4. SMART health distribution
    console.log('\n🔧 SMART Health Distribution (Last 24h):');
    const smartHealth = await client.query(`
      SELECT 
        m.hostname,
        sd.health_status,
        ROUND(AVG(sd.read_errors)::numeric, 1) as avg_read_errors,
        ROUND(AVG(sd.write_errors)::numeric, 1) as avg_write_errors,
        ROUND(AVG(sd.temperature)::numeric, 1) as avg_temp
      FROM machines m
      JOIN smart_data sd ON m.id = sd.machine_id
      WHERE sd.timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY m.hostname, sd.health_status
      ORDER BY 
        CASE sd.health_status 
          WHEN 'GOOD' THEN 1 
          WHEN 'WARNING' THEN 2 
          WHEN 'CRITICAL' THEN 3 
        END,
        m.hostname
    `);
    
    let goodCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    
    console.log('  ' + 'Machine'.padEnd(20) + ' Status    R.Err  W.Err  Temp°C');
    console.log('  ' + '-'.repeat(60));
    
    smartHealth.rows.forEach(row => {
      const status = row.health_status.padEnd(9);
      const readErr = String(row.avg_read_errors).padStart(5);
      const writeErr = String(row.avg_write_errors).padStart(5);
      const temp = String(row.avg_temp).padStart(6);
      
      let icon = '✅';
      if (row.health_status === 'GOOD') {
        goodCount++;
      } else if (row.health_status === 'WARNING') {
        warningCount++;
        icon = '⚠️ ';
      } else if (row.health_status === 'CRITICAL') {
        criticalCount++;
        icon = '🔴';
      }
      
      console.log(`  ${icon} ${row.hostname.padEnd(18)} ${status} ${readErr}  ${writeErr}  ${temp}`);
    });
    
    // 5. Summary
    console.log('\n📊 Health Summary:');
    console.log(`  ✅ GOOD:     ${goodCount} machines`);
    console.log(`  ⚠️  WARNING:  ${warningCount} machines`);
    console.log(`  🔴 CRITICAL: ${criticalCount} machines`);
    
    // 6. Risk assessment
    console.log('\n🎯 Expected ML Risk Distribution:');
    console.log('  After retraining, you should see:');
    console.log(`  - LOW risk (0-30%):      ~${goodCount} machines (GOOD health)`);
    console.log(`  - MEDIUM risk (30-50%):  ~${Math.floor(warningCount / 2)} machines`);
    console.log(`  - HIGH risk (50-70%):    ~${Math.ceil(warningCount / 2)} machines`);
    console.log(`  - CRITICAL risk (70%+):  ~${criticalCount} machines (CRITICAL health)`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification complete!\n');
    
    if (machineCount.rows[0].count >= 20) {
      console.log('✨ Great! You have enough diverse data.');
      console.log('📝 Next steps:');
      console.log('   1. Retrain ML model: cd ml-service && python -m src.training_pipeline');
      console.log('   2. Run predictions: python run_predictions_once.py');
      console.log('   3. Check dashboard for varied risk levels\n');
    } else {
      console.log('⚠️  You have less than 20 machines.');
      console.log('📝 To add more:');
      console.log('   node seed-diverse-machines.js\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDiversity()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
