const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Mission = require('../models/Mission');
const Location = require('../models/Location');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/missions
 * @desc    Obtenir toutes les missions
 * @access  Private (permission mission.read)
 */
router.get('/', 
  authenticate, 
  authorize('mission.read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, priority, search } = req.query;

      const query = {};
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const missions = await Mission.find(query)
        .populate('location')
        .populate('requiredEquipment.equipment')
        .populate('requiredVehicles.vehicle')
        .populate('assignedSquad', 'username firstName lastName email')
        .populate('createdBy', 'username firstName lastName')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Mission.countDocuments(query);

      res.json({
        success: true,
        data: {
          missions,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          total: count
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des missions', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/missions/:id
 * @desc    Obtenir une mission par ID
 * @access  Private (permission mission.read)
 */
router.get('/:id', 
  authenticate, 
  authorize('mission.read'),
  async (req, res) => {
    try {
      const mission = await Mission.findById(req.params.id)
        .populate('location')
        .populate('requiredEquipment.equipment')
        .populate('requiredVehicles.vehicle')
        .populate('assignedSquad')
        .populate('createdBy', 'username firstName lastName email');

      if (!mission) {
        return res.status(404).json({ 
          success: false, 
          message: 'Mission non trouvée' 
        });
      }

      res.json({
        success: true,
        data: { mission }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de la mission', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/missions
 * @desc    Créer une nouvelle mission
 * @access  Private (permission mission.create)
 */
router.post('/', [
  authenticate,
  authorize('mission.create'),
  body('title').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('locationId').notEmpty(),
  body('entryPoint.name').notEmpty(),
  body('entryPoint.type').isIn(['aerien', 'terrestre', 'maritime', 'souterrain', 'autre']),
  body('exitPoint.name').notEmpty(),
  body('exitPoint.type').isIn(['aerien', 'terrestre', 'maritime', 'souterrain', 'autre']),
  validate
], async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      locationId,
      entryPoint,
      exitPoint,
      requiredEquipment,
      requiredVehicles,
      assignedSquad,
      startDate,
      endDate,
      estimatedDuration,
      priority,
      briefing,
      objectives,
      risks,
      notes
    } = req.body;

    // Vérifier si le code existe déjà
    const existingMission = await Mission.findOne({ code });
    if (existingMission) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code de mission existe déjà' 
      });
    }

    // Vérifier la localisation
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Localisation non trouvée' 
      });
    }

    const mission = new Mission({
      title,
      code,
      description,
      location: locationId,
      entryPoint,
      exitPoint,
      requiredEquipment: requiredEquipment || [],
      requiredVehicles: requiredVehicles || [],
      assignedSquad: assignedSquad || [],
      startDate,
      endDate,
      estimatedDuration,
      priority: priority || 'normale',
      briefing,
      objectives: objectives || [],
      risks: risks || [],
      notes,
      createdBy: req.userId
    });

    await mission.save();

    // Mettre à jour les utilisateurs assignés
    if (assignedSquad && assignedSquad.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedSquad } },
        { $addToSet: { assignedMissions: mission._id } }
      );
    }

    const populatedMission = await Mission.findById(mission._id)
      .populate('location')
      .populate('requiredEquipment.equipment')
      .populate('requiredVehicles.vehicle')
      .populate('assignedSquad')
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Mission créée avec succès',
      data: { mission: populatedMission }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la mission', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/missions/:id
 * @desc    Mettre à jour une mission
 * @access  Private (permission mission.update)
 */
router.put('/:id', [
  authenticate,
  authorize('mission.update'),
  validate
], async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mission non trouvée' 
      });
    }

    // Mettre à jour les champs
    const updates = req.body;
    const allowedFields = [
      'title', 'code', 'description', 'status', 'locationId', 'entryPoint', 
      'exitPoint', 'requiredEquipment', 'requiredVehicles', 'assignedSquad',
      'startDate', 'endDate', 'estimatedDuration', 'priority', 'briefing',
      'objectives', 'risks', 'notes'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'locationId') {
          mission.location = updates[field];
        } else {
          mission[field] = updates[field];
        }
      }
    });

    await mission.save();

    const populatedMission = await Mission.findById(mission._id)
      .populate('location')
      .populate('requiredEquipment.equipment')
      .populate('requiredVehicles.vehicle')
      .populate('assignedSquad')
      .populate('createdBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Mission mise à jour avec succès',
      data: { mission: populatedMission }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de la mission', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/missions/:id
 * @desc    Supprimer une mission
 * @access  Private (permission mission.delete)
 */
router.delete('/:id', 
  authenticate, 
  authorize('mission.delete'),
  async (req, res) => {
    try {
      const mission = await Mission.findByIdAndDelete(req.params.id);

      if (!mission) {
        return res.status(404).json({ 
          success: false, 
          message: 'Mission non trouvée' 
        });
      }

      // Retirer la mission des utilisateurs assignés
      await User.updateMany(
        { assignedMissions: mission._id },
        { $pull: { assignedMissions: mission._id } }
      );

      res.json({
        success: true,
        message: 'Mission supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de la mission', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/missions/map/locations
 * @desc    Obtenir toutes les missions avec leurs coordonnées pour la carte
 * @access  Private (permission mission.read)
 */
router.get('/map/locations', 
  authenticate, 
  authorize('mission.read'),
  async (req, res) => {
    try {
      const missions = await Mission.find({ 
        status: { $ne: 'annulee' } 
      })
        .populate('location')
        .select('title code status priority location');

      const mapData = missions.map(mission => ({
        id: mission._id,
        title: mission.title,
        code: mission.code,
        status: mission.status,
        priority: mission.priority,
        coordinates: {
          lat: mission.location.coordinates.latitude,
          lng: mission.location.coordinates.longitude
        },
        locationName: mission.location.name,
        country: mission.location.country
      }));

      res.json({
        success: true,
        data: { missions: mapData }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des localisations', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
