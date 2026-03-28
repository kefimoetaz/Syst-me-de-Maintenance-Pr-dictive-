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
  SELECT machine_id, risk_level, failure_probability_30d, prediction_date
  FROM (
    SELECT DISTINCT ON (machine_id)
      machine_id, risk_level, failure_probability_30d, prediction_date
    FROM predictions
    ORDER BY machine_id, prediction_date DESC
  ) latest
  ORDER BY risk_level, machine_id
`).then(r => {
  console.log('Total machines with predictions:', r.rows.length);
  const counts = {};
  r.rows.forEach(row => { counts[row.risk_level] = (counts[row.risk_level] || 0) + 1; });
  console.log('By risk level:', JSON.stringify(counts));
  r.rows.forEach(row => {
    console.log('  Machine ' + row.machine_id + ': ' + row.risk_level + ' (' + row.failure_probability_30d + '%) - ' + row.prediction_date);
  });
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
