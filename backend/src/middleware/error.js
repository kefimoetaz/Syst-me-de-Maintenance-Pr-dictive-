const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: process.env.LOG_FILE || 'backend.log',
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

/**
 * Centralized error handling middleware
 * Requirements: 12.1, 12.2, 12.3
 * 
 * Captures all errors and returns appropriate responses
 * Logs errors with full context for debugging
 */
function errorHandler(err, req, res, next) {
    // Log the error with full context
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
        statusCode: err.statusCode || 500
    });
    
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Database validation failed',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }
    
    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Duplicate entry',
            details: err.errors.map(e => ({
                field: e.path,
                message: `${e.path} already exists`
            }))
        });
    }
    
    // Handle Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Foreign key constraint violation'
        });
    }
    
    // Handle Sequelize connection errors
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            error: 'Service temporarily unavailable'
        });
    }
    
    // Handle Sequelize timeout errors
    if (err.name === 'SequelizeTimeoutError') {
        return res.status(504).json({
            error: 'Database timeout'
        });
    }
    
    // Handle Joi validation errors (if they somehow reach here)
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.details
        });
    }
    
    // Handle unauthorized errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    
    // Default to 500 Internal Server Error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal server error' : err.message
    });
}

module.exports = { errorHandler, logger };
