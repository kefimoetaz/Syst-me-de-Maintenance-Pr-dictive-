/**
 * Chatbot Controller
 * Handles chat requests from frontend
 */
const chatbotService = require('../services/chatbotService');

/**
 * POST /api/chat
 * Process a chat message
 */
async function chat(req, res) {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await chatbotService.processQuestion(message);
    
    res.json(result);
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET /api/chat/suggestions
 * Get suggested questions
 */
function getSuggestions(req, res) {
  const suggestions = [
    "Quelles machines sont à risque élevé?",
    "Montre-moi les alertes critiques",
    "Quel est l'état de la machine Mori?",
    "Combien de machines sont surveillées?",
    "Quelles sont les prédictions récentes?"
  ];
  
  res.json({
    success: true,
    suggestions
  });
}

module.exports = {
  chat,
  getSuggestions
};
