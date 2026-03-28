const { Alert, Machine } = require('./src/models');

async function checkAlerts() {
  try {
    console.log('\n=== CHECKING ALERTS ===\n');
    
    const alerts = await Alert.findAll({
      include: [
        {
          model: Machine,
          as: 'machine',
          attributes: ['id', 'hostname']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total alerts found: ${alerts.length}\n`);
    
    alerts.forEach((alert, index) => {
      console.log(`Alert ${index + 1}:`);
      console.log(`  ID: ${alert.id}`);
      console.log(`  Machine: ${alert.machine?.hostname || 'Unknown'} (ID: ${alert.machine_id})`);
      console.log(`  Type: ${alert.alert_type}`);
      console.log(`  Severity: ${alert.severity}`);
      console.log(`  Status: ${alert.status}`);
      console.log(`  Title: ${alert.title}`);
      console.log(`  Created: ${alert.created_at}`);
      console.log(`  Age: ${Math.round((Date.now() - new Date(alert.created_at)) / (1000 * 60 * 60))} hours ago`);
      console.log('---');
    });
    
    // Check recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await Alert.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: oneDayAgo
        }
      }
    });
    
    console.log(`\nAlerts in last 24 hours: ${recentAlerts}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAlerts();
