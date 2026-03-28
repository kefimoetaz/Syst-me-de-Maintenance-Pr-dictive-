/**
 * Alert Routes
 * API endpoints for alert management
 */
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, verifyApiToken } = require('../middleware/auth');

// POST /api/alerts - Create new alert (uses simple API token for ML service)
router.post('/', verifyApiToken, alertController.createAlert);

// All other routes require agent authentication
router.use(verifyToken);

// GET /api/alerts - Get all alerts with filtering
router.get('/', alertController.getAlerts);

// GET /api/alerts/active - Get active alerts
router.get('/active', alertController.getActiveAlerts);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', alertController.getAlertStats);

// PATCH /api/alerts/:id/acknowledge - Acknowledge alert
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);

// PATCH /api/alerts/:id/resolve - Resolve alert
router.patch('/:id/resolve', alertController.resolveAlert);

// PATCH /api/alerts/:id/dismiss - Dismiss alert
router.patch('/:id/dismiss', alertController.dismissAlert);

module.exports = router;
