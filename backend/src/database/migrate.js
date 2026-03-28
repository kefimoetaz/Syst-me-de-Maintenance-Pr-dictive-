const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

/**
 * Database migration runner
 * Executes SQL migration files in order
 */
async function runMigrations() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'predictive_maintenance',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files`);

        for (const file of files) {
            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await client.query(sql);
            console.log(`✓ Completed: ${file}`);
        }

        console.log('\n✓ All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
