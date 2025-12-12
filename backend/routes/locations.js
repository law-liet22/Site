const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Location = require('../models/Location');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/locations
 * @desc    Obtenir toutes les localisations
 * @access  Private
 */
router.get('/', 
  authenticate,
  async (req, res) => {
    try {
      const { category, country, search } = req.query;

      const query = {};
      
      if (category) query.category = category;
      if (country) query.country = country;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } }
        ];
      }

      const locations = await Location.find(query).sort({ name: 1 });

      res.json({
        success: true,
        data: { locations }
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

/**
 * @route   POST /api/locations
 * @desc    Créer une nouvelle localisation
 * @access  Private (Admin or Direction)
 */
router.post('/', [
  authenticate,
  authorize('mission.create'),
  body('name').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('coordinates.latitude').isFloat({ min: -90, max: 90 }),
  body('coordinates.longitude').isFloat({ min: -180, max: 180 }),
  validate
], async (req, res) => {
  try {
    const { name, country, city, coordinates, address, description, category } = req.body;

    const location = new Location({
      name,
      country,
      city,
      coordinates,
      address,
      description,
      category: category || 'autre'
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: 'Localisation créée avec succès',
      data: { location }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la localisation', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/locations/:id
 * @desc    Mettre à jour une localisation
 * @access  Private (Admin or Direction)
 */
router.put('/:id', [
  authenticate,
  authorize('mission.update'),
  validate
], async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Localisation non trouvée' 
      });
    }

    res.json({
      success: true,
      message: 'Localisation mise à jour avec succès',
      data: { location }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de la localisation', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/locations/:id
 * @desc    Supprimer une localisation
 * @access  Private (Admin)
 */
router.delete('/:id', 
  authenticate, 
  authorize('admin.access'),
  async (req, res) => {
    try {
      const location = await Location.findByIdAndDelete(req.params.id);

      if (!location) {
        return res.status(404).json({ 
          success: false, 
          message: 'Localisation non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Localisation supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de la localisation', 
        error: error.message 
      });
    }
  }
);

module.exports = router;
