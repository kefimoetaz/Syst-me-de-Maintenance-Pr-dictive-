const bcrypt = require('bcrypt');
const User = require('../models/User');

// List all users (admin only)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'last_login', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Map full_name → username for frontend compatibility
    const mapped = users.map(u => ({
      ...u.toJSON(),
      username: u.full_name || u.email
    }));

    res.json({ success: true, users: mapped });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Create technician (admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, username, role } = req.body;
    const name = full_name || username;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, mot de passe et nom sont requis' });
    }

    const allowedRoles = ['admin', 'user', 'technician'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash, full_name: name, role: userRole });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'utilisateur' });
  }
};

// Update user role (admin only)
exports.updateRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const { role } = req.body;
    const allowedRoles = ['admin', 'user', 'technician'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre rôle' });
    }

    await user.update({ role });
    res.json({ success: true, message: 'Rôle mis à jour', role: user.role });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du rôle' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

// Toggle user active status (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    await user.update({ is_active: !user.is_active });
    res.json({ success: true, message: `Compte ${user.is_active ? 'activé' : 'désactivé'}`, is_active: user.is_active });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
  }
};
