/**
 * Chatbot Routes
 */
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST /api/chatbot - Send a message
router.post('/', chatbotController.chat);

// GET /api/chatbot/suggestions - Get suggested questions
router.get('/suggestions', chatbotController.getSuggestions);

module.exports = router;
