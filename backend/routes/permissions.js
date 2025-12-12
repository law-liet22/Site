const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Permission = require('../models/Permission');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/permissions
 * @desc    Obtenir toutes les permissions
 * @access  Private (Admin)
 */
router.get('/', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const { category, isActive } = req.query;

      const query = {};
      if (category) query.category = category;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const permissions = await Permission.find(query).sort({ category: 1, name: 1 });

      // Grouper par catégorie
      const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      }, {});

      res.json({
        success: true,
        data: { 
          permissions,
          grouped: groupedPermissions
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des permissions', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/permissions
 * @desc    Créer une nouvelle permission
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  isAdmin,
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['user', 'mission', 'equipment', 'vehicle', 'role', 'permission', 'settings', 'admin']),
  validate
], async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette permission existe déjà' 
      });
    }

    const permission = new Permission({
      name,
      description,
      category
    });

    await permission.save();

    res.status(201).json({
      success: true,
      message: 'Permission créée avec succès',
      data: { permission }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la permission', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/permissions/:id
 * @desc    Mettre à jour une permission
 * @access  Private (Admin)
 */
router.put('/:id', [
  authenticate,
  isAdmin,
  validate
], async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ['description', 'category', 'isActive'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!permission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Permission non trouvée' 
      });
    }

    res.json({
      success: true,
      message: 'Permission mise à jour avec succès',
      data: { permission }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de la permission', 
        error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/permissions/:id
 * @desc    Supprimer une permission
 * @access  Private (Admin)
 */
router.delete('/:id', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const permission = await Permission.findByIdAndDelete(req.params.id);

      if (!permission) {
        return res.status(404).json({ 
          success: false, 
          message: 'Permission non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Permission supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de la permission', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   PUT /api/permissions/:id/toggle
 * @desc    Activer/désactiver une permission
 * @access  Private (Admin)
 */
router.put('/:id/toggle', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const permission = await Permission.findById(req.params.id);

      if (!permission) {
        return res.status(404).json({ 
          success: false, 
          message: 'Permission non trouvée' 
        });
      }

      permission.isActive = !permission.isActive;
      await permission.save();

      res.json({
        success: true,
        message: `Permission ${permission.isActive ? 'activée' : 'désactivée'} avec succès`,
        data: { permission }
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
