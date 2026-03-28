const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

/**
 * Database seeder
 * Populates database with test data
 */
async function runSeeders() {
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

        const seedersDir = path.join(__dirname, 'seeders');
        const files = fs.readdirSync(seedersDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} seeder files`);

        for (const file of files) {
            console.log(`Running seeder: ${file}`);
            const sql = fs.readFileSync(path.join(seedersDir, file), 'utf8');
            await client.query(sql);
            console.log(`✓ Completed: ${file}`);
        }

        console.log('\n✓ All seeders completed successfully');
        console.log('\nTest data created:');
        console.log('- 3 machines (PC-ADMIN-01, PC-DEV-02, PC-SUPPORT-03)');
        console.log('- 3 agents with authentication tokens');
        console.log('- 72 system metrics records (24 hours per machine)');
        console.log('- 72 SMART data records (24 hours per machine)');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runSeeders();
