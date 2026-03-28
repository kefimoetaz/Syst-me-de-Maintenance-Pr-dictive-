/**
 * Insert 10 smart_data rows for every machine in the DB
 * Run from project root: node backend/seed-smart-data-all-machines.js
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
        const { rows: machines } = await client.query('SELECT id FROM machines');
        console.log(`Found ${machines.length} machines`);

        for (const machine of machines) {
            // Check if already has enough data
            const { rows } = await client.query(
                'SELECT COUNT(*) as cnt FROM smart_data WHERE machine_id = $1',
                [machine.id]
            );
            if (parseInt(rows[0].cnt) >= 5) {
                console.log(`Machine ${machine.id}: already has ${rows[0].cnt} rows, skipping`);
                continue;
            }

            // Vary pattern by machine id: every 3rd = critical, every 3rd+1 = warning, rest = good
            const pattern = machine.id % 3;

            for (let i = 0; i < 10; i++) {
                const ts = new Date(Date.now() - (10 - i) * 60 * 60 * 1000);

                let readErrors, writeErrors, temp, status;
                if (pattern === 0) {          // critical degradation
                    readErrors  = i * 3;
                    writeErrors = i * 2;
                    temp        = 35 + i * 1.5;
                    status      = i < 4 ? 'GOOD' : i < 7 ? 'WARNING' : 'CRITICAL';
                } else if (pattern === 1) {   // warning trend
                    readErrors  = Math.floor(i * 1.2);
                    writeErrors = Math.floor(i * 0.6);
                    temp        = 33 + i * 0.8;
                    status      = i < 6 ? 'GOOD' : 'WARNING';
                } else {                      // healthy
                    readErrors  = Math.floor(Math.random() * 2);
                    writeErrors = 0;
                    temp        = 30 + Math.random() * 8;
                    status      = 'GOOD';
                }

                await client.query(
                    `INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [machine.id, ts, status, readErrors, writeErrors, parseFloat(temp.toFixed(2))]
                );
            }
            console.log(`Machine ${machine.id}: inserted 10 rows (pattern: ${['critical','warning','good'][pattern]})`);
        }
        console.log('Done.');
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);
