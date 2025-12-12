const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { authenticate, authorize, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/roles
 * @desc    Obtenir tous les rôles
 * @access  Private (permission role.read)
 */
router.get('/', 
  authenticate, 
  authorize('role.read'),
  async (req, res) => {
    try {
      const { isActive } = req.query;

      const query = {};
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const roles = await Role.find(query)
        .populate('permissions')
        .sort({ level: -1 });

      res.json({
        success: true,
        data: { roles }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des rôles', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/roles/:id
 * @desc    Obtenir un rôle par ID
 * @access  Private (permission role.read)
 */
router.get('/:id', 
  authenticate, 
  authorize('role.read'),
  async (req, res) => {
    try {
      const role = await Role.findById(req.params.id).populate('permissions');

      if (!role) {
        return res.status(404).json({ 
          success: false, 
          message: 'Rôle non trouvé' 
        });
      }

      res.json({
        success: true,
        data: { role }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du rôle', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/roles
 * @desc    Créer un nouveau rôle
 * @access  Private (permission role.create)
 */
router.post('/', [
  authenticate,
  authorize('role.create'),
  body('name').trim().notEmpty(),
  body('displayName').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('level').isInt({ min: 0, max: 100 }),
  validate
], async (req, res) => {
  try {
    const { name, displayName, description, level, permissions } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce nom de rôle existe déjà' 
      });
    }

    const role = new Role({
      name,
      displayName,
      description,
      level,
      permissions: permissions || []
    });

    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');

    res.status(201).json({
      success: true,
      message: 'Rôle créé avec succès',
      data: { role: populatedRole }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du rôle', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/roles/:id
 * @desc    Mettre à jour un rôle
 * @access  Private (permission role.update)
 */
router.put('/:id', [
  authenticate,
  authorize('role.update'),
  validate
], async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rôle non trouvé' 
      });
    }

    // Empêcher la modification des rôles système critiques
    if (role.isSystemRole && role.name === 'administrateur') {
      return res.status(403).json({ 
        success: false, 
        message: 'Le rôle administrateur ne peut pas être modifié' 
      });
    }

    const updates = req.body;
    const allowedFields = ['displayName', 'description', 'level', 'permissions', 'isActive'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        role[field] = updates[field];
      }
    });

    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      data: { role: populatedRole }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du rôle', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/roles/:id
 * @desc    Supprimer un rôle
 * @access  Private (permission role.delete)
 */
router.delete('/:id', 
  authenticate, 
  authorize('role.delete'),
  async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);

      if (!role) {
        return res.status(404).json({ 
          success: false, 
          message: 'Rôle non trouvé' 
        });
      }

      // Empêcher la suppression des rôles système
      if (role.isSystemRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'Les rôles système ne peuvent pas être supprimés' 
        });
      }

      await role.deleteOne();

      res.json({
        success: true,
        message: 'Rôle supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du rôle', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   PUT /api/roles/:id/permissions
 * @desc    Modifier les permissions d'un rôle
 * @access  Private (Admin)
 */
router.put('/:id/permissions', [
  authenticate,
  isAdmin,
  body('permissions').isArray(),
  validate
], async (req, res) => {
  try {
    const { permissions } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rôle non trouvé' 
      });
    }

    // Vérifier que toutes les permissions existent
    const validPermissions = await Permission.find({ 
      _id: { $in: permissions } 
    });

    if (validPermissions.length !== permissions.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Certaines permissions sont invalides' 
      });
    }

    role.permissions = permissions;
    await role.save();

    const populatedRole = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: 'Permissions du rôle mises à jour avec succès',
      data: { role: populatedRole }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour des permissions', 
      error: error.message 
    });
  }
});

module.exports = router;
