/**
 * Payload size limit middleware
 * Requirements: 13.3, 13.4
 * 
 * Limits request body size to 1MB maximum
 * Returns 413 Payload Too Large if exceeded
 * 
 * Note: This is configured in Express app.use(express.json({ limit: '1mb' }))
 * This file provides a custom handler for payload too large errors
 */

function payloadTooLargeHandler(err, req, res, next) {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request body must not exceed 1MB'
        });
    }
    next(err);
}

module.exports = { payloadTooLargeHandler };
