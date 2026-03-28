const express = require('express');
require('dotenv').config();

const { testConnection } = require('./config/database');
const dataRoutes = require('./routes/data.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const mlRoutes = require('./routes/ml.routes');
const alertRoutes = require('./routes/alerts');
const chatbotRoutes = require('./routes/chatbot');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const machinesRoutes = require('./routes/machines');
const { requestLogger } = require('./middleware/requestLogger');
const { payloadTooLargeHandler } = require('./middleware/payloadLimit');
const { errorHandler, logger } = require('./middleware/error');

/**
 * Main Express application
 * Requirements: 12.5
 */
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json({ limit: '1mb' })); // Parse JSON with 1MB limit

// CORS middleware for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(requestLogger); // Log all requests
app.use(payloadTooLargeHandler); // Handle payload too large errors

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api', dataRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.url
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start server
 */
async function startServer() {
    try {
        // Test database connection
        const connected = await testConnection();
        if (!connected) {
            logger.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
        
        // Start listening
        app.listen(PORT, () => {
            logger.info(`✓ Server started on port ${PORT}`);
            logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`✓ API endpoint: http://localhost:${PORT}/api/data`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app;
