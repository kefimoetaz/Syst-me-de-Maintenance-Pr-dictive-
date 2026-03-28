const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

pool.query(`
  SELECT machine_id, health_status, COUNT(*) as count
  FROM (
    SELECT DISTINCT ON (machine_id) machine_id, health_status
    FROM smart_data
    ORDER BY machine_id, created_at DESC
  ) latest
  GROUP BY machine_id, health_status
  ORDER BY health_status
`).then(r => {
  const counts = {};
  r.rows.forEach(row => { counts[row.health_status] = (counts[row.health_status] || 0) + 1; });
  console.log('Latest health_status per machine:', counts);
  r.rows.forEach(row => console.log('  Machine ' + row.machine_id + ': ' + row.health_status));
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
