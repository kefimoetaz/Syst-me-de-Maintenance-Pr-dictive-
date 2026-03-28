/**
 * Alert Controller
 * Manages alert creation, retrieval, and acknowledgment
 */
const { Alert, Machine } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');
const { logger } = require('../middleware/error');

/**
 * GET /api/alerts
 * Get all alerts with optional filtering
 */
exports.getAlerts = async (req, res, next) => {
    try {
        const {
            status,
            severity,
            machine_id,
            alert_type,
            limit = 50,
            offset = 0
        } = req.query;

        // Build where clause
        const where = {};
        
        if (status) {
            where.status = status;
        }
        
        if (severity) {
            where.severity = severity;
        }
        
        if (machine_id) {
            where.machine_id = parseInt(machine_id);
        }
        
        if (alert_type) {
            where.alert_type = alert_type;
        }

        const alerts = await Alert.findAll({
            where,
            include: [
                {
                    model: Machine,
                    as: 'machine',
                    attributes: ['id', 'hostname', 'ip_address']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const total = await Alert.count({ where });

        res.json({
            alerts,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/alerts/active
 * Get active (unacknowledged) alerts
 */
exports.getActiveAlerts = async (req, res, next) => {
    try {
        const alerts = await Alert.findAll({
            where: {
                status: 'ACTIVE'
            },
            include: [
                {
                    model: Machine,
                    as: 'machine',
                    attributes: ['id', 'hostname', 'ip_address']
                }
            ],
            order: [
                ['severity', 'DESC'], // CRITICAL first
                ['created_at', 'DESC']
            ],
            limit: 100
        });

        res.json({
            alerts,
            count: alerts.length
        });

    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/alerts
 * Create a new alert
 */
exports.createAlert = async (req, res, next) => {
    try {
        const {
            machine_id,
            alert_type,
            severity,
            title,
            message,
            details
        } = req.body;

        // Validate required fields
        if (!machine_id || !alert_type || !severity || !title || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['machine_id', 'alert_type', 'severity', 'title', 'message']
            });
        }

        // Check if machine exists
        const machine = await Machine.findByPk(machine_id);
        if (!machine) {
            return res.status(404).json({
                error: 'Machine not found'
            });
        }

        // Create alert
        const alert = await Alert.create({
            machine_id,
            alert_type,
            severity,
            title,
            message,
            details: details || null,
            status: 'ACTIVE'
        });

        // Send email notification for HIGH and CRITICAL alerts
        if (severity === 'HIGH' || severity === 'CRITICAL') {
            try {
                const emailSent = await emailService.sendAlertEmail(alert, machine);
                if (emailSent) {
                    await alert.update({
                        email_sent: true,
                        email_sent_at: new Date()
                    });
                }
            } catch (emailError) {
                logger.error(`Failed to send email for alert ${alert.id}: ${emailError.message}`);
                // Don't fail the request if email fails
            }
        }

        // Fetch alert with machine data
        const alertWithMachine = await Alert.findByPk(alert.id, {
            include: [
                {
                    model: Machine,
                    as: 'machine',
                    attributes: ['id', 'hostname', 'ip_address']
                }
            ]
        });

        res.status(201).json(alertWithMachine);

    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/alerts/:id/acknowledge
 * Acknowledge an alert
 */
exports.acknowledgeAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { acknowledged_by } = req.body;

        const alert = await Alert.findByPk(id);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        if (alert.status !== 'ACTIVE') {
            return res.status(400).json({
                error: 'Alert is not active',
                current_status: alert.status
            });
        }

        await alert.update({
            status: 'ACKNOWLEDGED',
            acknowledged_at: new Date(),
            acknowledged_by: acknowledged_by || 'system'
        });

        res.json(alert);

    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/alerts/:id/resolve
 * Resolve an alert
 */
exports.resolveAlert = async (req, res, next) => {
    try {
        const { id } = req.params;

        const alert = await Alert.findByPk(id);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        await alert.update({
            status: 'RESOLVED',
            resolved_at: new Date()
        });

        res.json(alert);

    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/alerts/:id/dismiss
 * Dismiss an alert
 */
exports.dismissAlert = async (req, res, next) => {
    try {
        const { id } = req.params;

        const alert = await Alert.findByPk(id);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        await alert.update({
            status: 'DISMISSED'
        });

        res.json(alert);

    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
exports.getAlertStats = async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Count by severity
        const bySeverity = await Alert.count({
            where: {
                created_at: {
                    [Op.gte]: startDate
                }
            },
            group: ['severity']
        });

        // Count by status
        const byStatus = await Alert.count({
            where: {
                created_at: {
                    [Op.gte]: startDate
                }
            },
            group: ['status']
        });

        // Count by type
        const byType = await Alert.count({
            where: {
                created_at: {
                    [Op.gte]: startDate
                }
            },
            group: ['alert_type']
        });

        // Active alerts count
        const activeCount = await Alert.count({
            where: {
                status: 'ACTIVE'
            }
        });

        res.json({
            active_alerts: activeCount,
            by_severity: bySeverity,
            by_status: byStatus,
            by_type: byType,
            period_days: parseInt(days)
        });

    } catch (error) {
        next(error);
    }
};

module.exports = exports;
