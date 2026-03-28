const { Client } = require('pg');
require('dotenv').config();

/**
 * Creates the database if it doesn't exist
 * Connects to 'postgres' database first, then creates the target database
 */
async function createDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // Connect to default postgres database
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        const dbName = process.env.DB_NAME || 'predictive_maintenance';
        
        // Check if database exists
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (result.rows.length === 0) {
            // Database doesn't exist, create it
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✓ Database '${dbName}' created successfully`);
        } else {
            console.log(`✓ Database '${dbName}' already exists`);
        }
    } catch (error) {
        console.error('Failed to create database:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();
