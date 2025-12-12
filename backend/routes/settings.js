const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Settings = require('../models/Settings');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/settings
 * @desc    Obtenir tous les paramètres
 * @access  Private (Admin)
 */
router.get('/', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const { category } = req.query;

      const query = {};
      if (category) query.category = category;

      const settings = await Settings.find(query)
        .populate('lastModifiedBy', 'username firstName lastName')
        .sort({ category: 1, key: 1 });

      // Grouper par catégorie
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      }, {});

      res.json({
        success: true,
        data: { 
          settings,
          grouped: groupedSettings
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des paramètres', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/settings/:key
 * @desc    Obtenir un paramètre par clé
 * @access  Private (Admin)
 */
router.get('/:key', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const setting = await Settings.findOne({ key: req.params.key })
        .populate('lastModifiedBy', 'username firstName lastName');

      if (!setting) {
        return res.status(404).json({ 
          success: false, 
          message: 'Paramètre non trouvé' 
        });
      }

      res.json({
        success: true,
        data: { setting }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du paramètre', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/settings
 * @desc    Créer un nouveau paramètre
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  isAdmin,
  body('key').trim().notEmpty(),
  body('value').exists(),
  body('category').isIn(['general', 'security', 'appearance', 'notifications', 'system']),
  validate
], async (req, res) => {
  try {
    const { key, value, category, description, isModifiable } = req.body;

    const existingSetting = await Settings.findOne({ key });
    if (existingSetting) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce paramètre existe déjà' 
      });
    }

    const setting = new Settings({
      key,
      value,
      category,
      description,
      isModifiable: isModifiable !== undefined ? isModifiable : true,
      lastModifiedBy: req.userId
    });

    await setting.save();

    const populatedSetting = await Settings.findById(setting._id)
      .populate('lastModifiedBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Paramètre créé avec succès',
      data: { setting: populatedSetting }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du paramètre', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/settings/:key
 * @desc    Mettre à jour un paramètre
 * @access  Private (Admin)
 */
router.put('/:key', [
  authenticate,
  isAdmin,
  validate
], async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paramètre non trouvé' 
      });
    }

    if (!setting.isModifiable) {
      return res.status(403).json({ 
        success: false, 
        message: 'Ce paramètre ne peut pas être modifié' 
      });
    }

    const updates = req.body;
    const allowedFields = ['value', 'description', 'category'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setting[field] = updates[field];
      }
    });

    setting.lastModifiedBy = req.userId;
    await setting.save();

    const populatedSetting = await Settings.findById(setting._id)
      .populate('lastModifiedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Paramètre mis à jour avec succès',
      data: { setting: populatedSetting }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
        message: 'Erreur lors de la mise à jour du paramètre', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/settings/:key
 * @desc    Supprimer un paramètre
 * @access  Private (Admin)
 */
router.delete('/:key', 
  authenticate, 
  isAdmin,
  async (req, res) => {
    try {
      const setting = await Settings.findOne({ key: req.params.key });

      if (!setting) {
        return res.status(404).json({ 
          success: false, 
          message: 'Paramètre non trouvé' 
        });
      }

      if (!setting.isModifiable) {
        return res.status(403).json({ 
          success: false, 
          message: 'Ce paramètre ne peut pas être supprimé' 
        });
      }

      await setting.deleteOne();

      res.json({
        success: true,
        message: 'Paramètre supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du paramètre', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
