const Joi = require('joi');

/**
 * Joi schema for data payload validation
 * Requirements: 7.2, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
const dataPayloadSchema = Joi.object({
    agent_id: Joi.string().uuid({ version: 'uuidv4' }).required()
        .messages({
            'string.guid': 'agent_id must be a valid UUID (RFC 4122)',
            'any.required': 'agent_id is required'
        }),
    
    machine: Joi.object({
        hostname: Joi.string().required()
            .messages({
                'any.required': 'machine.hostname is required'
            }),
        ip_address: Joi.string().ip().required()
            .messages({
                'string.ip': 'machine.ip_address must be a valid IP address',
                'any.required': 'machine.ip_address is required'
            }),
        serial_number: Joi.string().required()
            .messages({
                'any.required': 'machine.serial_number is required'
            }),
        os: Joi.string().required()
            .messages({
                'any.required': 'machine.os is required'
            })
    }).required(),
    
    timestamp: Joi.date().iso().required()
        .messages({
            'date.format': 'timestamp must be in ISO 8601 format',
            'any.required': 'timestamp is required'
        }),
    
    system_metrics: Joi.object({
        cpu_usage: Joi.number().min(0).max(100).required()
            .messages({
                'number.min': 'system_metrics.cpu_usage must be between 0 and 100',
                'number.max': 'system_metrics.cpu_usage must be between 0 and 100',
                'any.required': 'system_metrics.cpu_usage is required'
            }),
        cpu_temperature: Joi.number().min(-50).max(150).required()
            .messages({
                'number.min': 'system_metrics.cpu_temperature must be between -50 and 150°C',
                'number.max': 'system_metrics.cpu_temperature must be between -50 and 150°C',
                'any.required': 'system_metrics.cpu_temperature is required'
            }),
        memory_usage: Joi.number().min(0).max(100).required()
            .messages({
                'number.min': 'system_metrics.memory_usage must be between 0 and 100',
                'number.max': 'system_metrics.memory_usage must be between 0 and 100',
                'any.required': 'system_metrics.memory_usage is required'
            }),
        memory_available: Joi.number().positive().required()
            .messages({
                'number.positive': 'system_metrics.memory_available must be a positive number',
                'any.required': 'system_metrics.memory_available is required'
            }),
        memory_total: Joi.number().positive().required()
            .messages({
                'number.positive': 'system_metrics.memory_total must be a positive number',
                'any.required': 'system_metrics.memory_total is required'
            }),
        disk_usage: Joi.number().min(0).max(100).required()
            .messages({
                'number.min': 'system_metrics.disk_usage must be between 0 and 100',
                'number.max': 'system_metrics.disk_usage must be between 0 and 100',
                'any.required': 'system_metrics.disk_usage is required'
            }),
        disk_free: Joi.number().positive().required()
            .messages({
                'number.positive': 'system_metrics.disk_free must be a positive number',
                'any.required': 'system_metrics.disk_free is required'
            }),
        disk_total: Joi.number().positive().required()
            .messages({
                'number.positive': 'system_metrics.disk_total must be a positive number',
                'any.required': 'system_metrics.disk_total is required'
            })
    }).required(),
    
    smart_data: Joi.object({
        health_status: Joi.string().valid('GOOD', 'WARNING', 'CRITICAL').required()
            .messages({
                'any.only': 'smart_data.health_status must be one of: GOOD, WARNING, CRITICAL',
                'any.required': 'smart_data.health_status is required'
            }),
        read_errors: Joi.number().integer().min(0).required()
            .messages({
                'number.min': 'smart_data.read_errors must be non-negative',
                'number.integer': 'smart_data.read_errors must be an integer',
                'any.required': 'smart_data.read_errors is required'
            }),
        write_errors: Joi.number().integer().min(0).required()
            .messages({
                'number.min': 'smart_data.write_errors must be non-negative',
                'number.integer': 'smart_data.write_errors must be an integer',
                'any.required': 'smart_data.write_errors is required'
            }),
        temperature: Joi.number().min(-50).max(150).required()
            .messages({
                'number.min': 'smart_data.temperature must be between -50 and 150°C',
                'number.max': 'smart_data.temperature must be between -50 and 150°C',
                'any.required': 'smart_data.temperature is required'
            })
    }).required()
});

/**
 * Validation middleware
 * Validates req.body against the Joi schema
 * Returns 400 with validation details if invalid
 */
function validateDataPayload(req, res, next) {
    const { error, value } = dataPayloadSchema.validate(req.body, {
        abortEarly: false, // Return all errors, not just the first one
        stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
}

module.exports = { validateDataPayload, dataPayloadSchema };
