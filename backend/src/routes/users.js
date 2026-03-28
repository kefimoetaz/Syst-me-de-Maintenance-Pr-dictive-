const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.put('/:id/role', userController.updateRole);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
