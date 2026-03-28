const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { verifyToken } = require('../middleware/auth');
const { validateDataPayload } = require('../middleware/validation');

/**
 * POST /api/data
 * Requirements: 7.1
 * 
 * Receives data from agents
 * Middleware chain: auth → validation → controller
 */
router.post('/data',
    verifyToken,
    validateDataPayload,
    dataController.receiveData
);

module.exports = router;
