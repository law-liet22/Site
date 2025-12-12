const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/vehicles
 * @desc    Obtenir tous les véhicules
 * @access  Private (permission vehicle.read)
 */
router.get('/', 
  authenticate, 
  authorize('vehicle.read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, type, status, search } = req.query;

      const query = {};
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ];
      }

      const vehicles = await Vehicle.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ name: 1 });

      const count = await Vehicle.countDocuments(query);

      res.json({
        success: true,
        data: {
          vehicles,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          total: count
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des véhicules', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Obtenir un véhicule par ID
 * @access  Private (permission vehicle.read)
 */
router.get('/:id', 
  authenticate, 
  authorize('vehicle.read'),
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({ 
          success: false, 
          message: 'Véhicule non trouvé' 
        });
      }

      res.json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du véhicule', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/vehicles
 * @desc    Créer un nouveau véhicule
 * @access  Private (permission vehicle.create)
 */
router.post('/', [
  authenticate,
  authorize('vehicle.create'),
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('type').isIn(['terrestre', 'aerien', 'maritime', 'amphibie', 'autre']),
  body('capacity').isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { name, code, type, model, capacity, specifications, image } = req.body;

    const existingVehicle = await Vehicle.findOne({ code });
    if (existingVehicle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code de véhicule existe déjà' 
      });
    }

    const vehicle = new Vehicle({
      name,
      code,
      type,
      model,
      capacity,
      specifications: specifications || {},
      image
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      data: { vehicle }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du véhicule', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Mettre à jour un véhicule
 * @access  Private (permission vehicle.update)
 */
router.put('/:id', [
  authenticate,
  authorize('vehicle.update'),
  validate
], async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ['name', 'code', 'type', 'model', 'capacity', 'specifications', 'status', 'image'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Véhicule non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      data: { vehicle }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du véhicule', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Supprimer un véhicule
 * @access  Private (permission vehicle.delete)
 */
router.delete('/:id', 
  authenticate, 
  authorize('vehicle.delete'),
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

      if (!vehicle) {
        return res.status(404).json({ 
          success: false, 
          message: 'Véhicule non trouvé' 
        });
      }

      res.json({
        success: true,
        message: 'Véhicule supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du véhicule', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
