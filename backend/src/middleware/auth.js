const { Agent } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware for user login
 * Verifies JWT token and attaches user info to request
 */
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Format d\'en-tête d\'autorisation invalide'
            });
        }
        
        const token = parts[1];
        
        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Token invalide ou expiré'
                });
            }
            
            // Attach user info to request
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'authentification'
        });
    }
}

/**
 * Simple API token verification for internal services (agents)
 * Checks against API_TOKEN environment variable
 */
function verifyApiToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Missing authentication token'
            });
        }
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Invalid authorization header format. Expected: Bearer <token>'
            });
        }
        
        const token = parts[1];
        const validToken = process.env.API_TOKEN || 'dev-token-12345';
        
        if (token !== validToken) {
            return res.status(401).json({
                error: 'Invalid authentication token'
            });
        }
        
        next();
    } catch (error) {
        console.error('API token verification error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication'
        });
    }
}

/**
 * Authentication middleware
 * Requirements: 7.3, 7.4, 11.1, 11.2, 11.3
 * 
 * Verifies the authentication token from the Authorization header
 * Attaches the agent object to req.agent if valid
 * Returns 401 Unauthorized if token is missing or invalid
 */
async function verifyToken(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Missing authentication token'
            });
        }
        
        // Check for Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Invalid authorization header format. Expected: Bearer <token>'
            });
        }
        
        const token = parts[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'Missing authentication token'
            });
        }
        
        // Query Agent table to verify token existence
        const agent = await Agent.findOne({
            where: { token },
            include: ['machine']
        });
        
        if (!agent) {
            return res.status(401).json({
                error: 'Invalid authentication token'
            });
        }
        
        // Attach agent object to request for use in controllers
        req.agent = agent;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication'
        });
    }
}

/**
 * Admin-only middleware
 * Must be used after authenticateToken
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits administrateur requis.'
        });
    }
    next();
}

module.exports = { verifyToken, verifyApiToken, authenticateToken, requireAdmin };
