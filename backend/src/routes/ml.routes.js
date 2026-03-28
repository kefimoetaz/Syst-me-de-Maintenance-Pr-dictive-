/**
 * ML Prediction Service Routes
 * Proxy routes to Python ML service
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { authenticateToken } = require('../middleware/auth');

// All ML routes require authentication
router.use(authenticateToken);

// Prediction routes
router.get('/predictions/high-risk', mlController.getHighRiskMachines);
router.get('/predictions/:machineId', mlController.getPrediction);

// Anomaly routes
router.get('/anomalies', mlController.getAnomalies);

// Model management routes
router.get('/models', mlController.getModels);
router.post('/train', mlController.triggerTraining);

// LSTM time-series prediction
router.get('/lstm/predict/:machineId', mlController.getLSTMPrediction);

module.exports = router;
