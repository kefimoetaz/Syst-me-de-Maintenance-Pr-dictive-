const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'predictive_maintenance',
  user: 'postgres',
  password: '123'
});

async function test() {
  const query = `
    SELECT m.id, m.hostname, m.ip_address,
           p.failure_probability_30d as failure_probability, p.risk_level
    FROM machines m
    LEFT JOIN predictions p ON m.id = p.machine_id AND p.created_at = (
      SELECT MAX(created_at) FROM predictions WHERE machine_id = m.id
    )
    WHERE m.hostname ILIKE $1
    LIMIT 5
  `;
  
  const result = await pool.query(query, ['%PC-LEGACY-15%']);
  console.log('Found:', result.rows);
  await pool.end();
}

test().catch(console.error);
