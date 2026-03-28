const { logger } = require('./error');

/**
 * Request logging middleware
 * Requirements: 12.2, 12.4
 * 
 * Logs all incoming requests with method, URL, and timestamp
 * Logs response status codes with appropriate log levels
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    
    // Log incoming request
    logger.info({
        type: 'request',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
    });
    
    // Capture the original res.json to log response
    const originalJson = res.json.bind(res);
    res.json = function(body) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // Determine log level based on status code
        let logLevel = 'info';
        if (statusCode >= 500) {
            logLevel = 'error';
        } else if (statusCode >= 400) {
            logLevel = 'warn';
        }
        
        logger[logLevel]({
            type: 'response',
            method: req.method,
            url: req.url,
            statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
        
        return originalJson(body);
    };
    
    next();
}

module.exports = { requestLogger };
