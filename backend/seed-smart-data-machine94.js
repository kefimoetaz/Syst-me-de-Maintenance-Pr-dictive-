/**
 * Insert 10 smart_data rows for machine 94 to test LSTM prediction
 */
const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'predictive_maintenance',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123'
});

async function seed() {
    const client = await pool.connect();
    try {
        // Insert 10 rows with increasing degradation for machine 94
        for (let i = 0; i < 10; i++) {
            const ts = new Date(Date.now() - (10 - i) * 60 * 60 * 1000); // 1h apart
            const readErrors  = i * 3;
            const writeErrors = i * 2;
            const temp        = 35 + i * 1.5;
            const status      = i < 4 ? 'GOOD' : i < 7 ? 'WARNING' : 'CRITICAL';

            await client.query(`
                INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [94, ts, status, readErrors, writeErrors, temp]);
        }
        console.log('Inserted 10 smart_data rows for machine 94');
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);
