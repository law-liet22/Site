const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticate, authorize, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs
 * @access  Private (permission user.read)
 */
router.get('/', 
  authenticate, 
  authorize('user.read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role, isActive } = req.query;

      const query = {};
      
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const users = await User.find(query)
        .populate('role')
        .populate('assignedMissions')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          total: count
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des utilisateurs', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Private (permission user.read)
 */
router.get('/:id', 
  authenticate, 
  authorize('user.read'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions'
          }
        })
        .populate('assignedMissions');

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de l\'utilisateur', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/users
 * @desc    Créer un nouvel utilisateur
 * @access  Private (permission user.create)
 */
router.post('/', [
  authenticate,
  authorize('user.create'),
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('roleId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roleId, phone } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou nom d\'utilisateur déjà utilisé' 
      });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rôle non trouvé' 
      });
    }

    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: roleId,
      phone
    });

    await user.save();

    const populatedUser = await User.findById(user._id).populate('role');

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { user: populatedUser }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (permission user.update)
 */
router.put('/:id', [
  authenticate,
  authorize('user.update'),
  validate
], async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['username', 'email', 'firstName', 'lastName', 'phone', 'roleId', 'isActive', 'avatar'];
    const updateFields = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'roleId') {
          updateFields.role = updates[key];
        } else {
          updateFields[key] = updates[key];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('role');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (permission user.delete)
 */
router.delete('/:id', 
  authenticate, 
  authorize('user.delete'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }

      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de l\'utilisateur', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   PUT /api/users/:id/toggle-active
 * @desc    Activer/désactiver un compte utilisateur
 * @access  Private (Admin)
 */
router.put('/:id/toggle-active', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `Compte ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors du changement de statut', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
