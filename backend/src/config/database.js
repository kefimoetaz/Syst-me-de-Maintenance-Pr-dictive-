const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Sequelize database configuration
 * Requirements: 13.2 - Connection pool configuration
 */
const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'predictive_maintenance',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    
    // Connection pool configuration for performance
    pool: {
        min: 5,
        max: 20,
        acquire: 30000,
        idle: 10000
    },
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Timezone configuration
    timezone: '+00:00',
    
    // Define options for all models
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
});

/**
 * Test database connection
 */
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');
        return true;
    } catch (error) {
        console.error('✗ Unable to connect to database:', error.message);
        return false;
    }
}

module.exports = { sequelize, testConnection };
