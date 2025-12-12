const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Equipment = require('../models/Equipment');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/equipment
 * @desc    Obtenir tous les équipements
 * @access  Private (permission equipment.read)
 */
router.get('/', 
  authenticate, 
  authorize('equipment.read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, category, isAvailable, search } = req.query;

      const query = {};
      
      if (category) query.category = category;
      if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const equipment = await Equipment.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ name: 1 });

      const count = await Equipment.countDocuments(query);

      res.json({
        success: true,
        data: {
          equipment,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          total: count
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des équipements', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/equipment/:id
 * @desc    Obtenir un équipement par ID
 * @access  Private (permission equipment.read)
 */
router.get('/:id', 
  authenticate, 
  authorize('equipment.read'),
  async (req, res) => {
    try {
      const equipment = await Equipment.findById(req.params.id);

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Équipement non trouvé' 
        });
      }

      res.json({
        success: true,
        data: { equipment }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de l\'équipement', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/equipment
 * @desc    Créer un nouvel équipement
 * @access  Private (permission equipment.create)
 */
router.post('/', [
  authenticate,
  authorize('equipment.create'),
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['arme', 'protection', 'communication', 'medical', 'surveillance', 'autre']),
  validate
], async (req, res) => {
  try {
    const { name, code, description, category, specifications, quantity, image } = req.body;

    const existingEquipment = await Equipment.findOne({ code });
    if (existingEquipment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code d\'équipement existe déjà' 
      });
    }

    const equipment = new Equipment({
      name,
      code,
      description,
      category,
      specifications: specifications || {},
      quantity: quantity || 0,
      image
    });

    await equipment.save();

    res.status(201).json({
      success: true,
      message: 'Équipement créé avec succès',
      data: { equipment }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'équipement', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/equipment/:id
 * @desc    Mettre à jour un équipement
 * @access  Private (permission equipment.update)
 */
router.put('/:id', [
  authenticate,
  authorize('equipment.update'),
  validate
], async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ['name', 'code', 'description', 'category', 'specifications', 'quantity', 'isAvailable', 'image'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Équipement non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Équipement mis à jour avec succès',
      data: { equipment }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de l\'équipement', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Supprimer un équipement
 * @access  Private (permission equipment.delete)
 */
router.delete('/:id', 
  authenticate, 
  authorize('equipment.delete'),
  async (req, res) => {
    try {
      const equipment = await Equipment.findByIdAndDelete(req.params.id);

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Équipement non trouvé' 
        });
      }

      res.json({
        success: true,
        message: 'Équipement supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de l\'équipement', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
