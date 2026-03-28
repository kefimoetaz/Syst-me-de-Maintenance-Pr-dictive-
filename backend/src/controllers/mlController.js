/**
 * ML Prediction Service Controller
 * Proxies requests to Python ML service
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
const axios = require('axios');
const { logger } = require('../middleware/error');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_SERVICE_TOKEN = process.env.ML_SERVICE_TOKEN || 'dev-token-12345';

/**
 * Get prediction for a specific machine
 * GET /api/ml/predictions/:machineId
 */
async function getPrediction(req, res) {
    try {
        const { machineId } = req.params;
        
        logger.info(`Fetching prediction for machine ${machineId}`);
        
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/predictions/${machineId}`,
            {
                headers: {
                    'Authorization': `Bearer ${ML_SERVICE_TOKEN}`
                },
                timeout: 5000
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        logger.error(`Error fetching prediction: ${error.message}`);
        
        if (error.response) {
            // ML service returned an error
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Could not connect to prediction service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

/**
 * Get all high-risk machines
 * GET /api/ml/predictions/high-risk
 */
async function getHighRiskMachines(req, res) {
    try {
        logger.info('Fetching high-risk machines');
        
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/predictions/high-risk`,
            {
                headers: {
                    'Authorization': `Bearer ${ML_SERVICE_TOKEN}`
                },
                timeout: 5000
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        logger.error(`Error fetching high-risk machines: ${error.message}`);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Could not connect to prediction service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

/**
 * Get anomalies with optional filtering
 * GET /api/ml/anomalies
 */
async function getAnomalies(req, res) {
    try {
        const { machine_id, severity, days } = req.query;
        
        logger.info('Fetching anomalies', { machine_id, severity, days });
        
        const params = new URLSearchParams();
        if (machine_id) params.append('machine_id', machine_id);
        if (severity) params.append('severity', severity);
        if (days) params.append('days', days);
        
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/anomalies?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${ML_SERVICE_TOKEN}`
                },
                timeout: 5000
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        logger.error(`Error fetching anomalies: ${error.message}`);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Could not connect to prediction service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

/**
 * Get all ML models
 * GET /api/ml/models
 */
async function getModels(req, res) {
    try {
        logger.info('Fetching ML models');
        
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/ml/models`,
            {
                headers: {
                    'Authorization': `Bearer ${ML_SERVICE_TOKEN}`
                },
                timeout: 5000
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        logger.error(`Error fetching models: ${error.message}`);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Could not connect to prediction service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

/**
 * Trigger model training
 * POST /api/ml/train
 */
async function triggerTraining(req, res) {
    try {
        logger.info('Triggering model training');
        
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/train`,
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${ML_SERVICE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        logger.error(`Error triggering training: ${error.message}`);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Could not connect to prediction service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

/**
 * Get LSTM time-series prediction for a machine
 * GET /api/ml/lstm/predict/:machineId
 */
async function getLSTMPrediction(req, res) {
    try {
        const { machineId } = req.params;
        logger.info(`LSTM prediction for machine ${machineId}`);

        const response = await axios.get(
            `${ML_SERVICE_URL}/api/lstm/predict/${machineId}`,
            {
                headers: { 'Authorization': `Bearer ${ML_SERVICE_TOKEN}` },
                timeout: 10000
            }
        );
        res.json(response.data);
    } catch (error) {
        logger.error(`LSTM prediction error: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'ML service unavailable' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = {
    getPrediction,
    getHighRiskMachines,
    getAnomalies,
    getModels,
    triggerTraining,
    getLSTMPrediction
};
