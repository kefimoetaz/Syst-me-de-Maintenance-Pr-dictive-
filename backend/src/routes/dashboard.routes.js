const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/machines', dashboardController.getMachines);
router.get('/machines/:id/metrics', dashboardController.getMachineMetrics);
router.get('/alerts', dashboardController.getAlerts);

module.exports = router;
