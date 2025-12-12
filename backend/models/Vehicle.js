const mongoose = require('mongoose');

/**
 * Schéma des véhicules
 * Liste modulable de véhicules pour les missions
 */
const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['terrestre', 'aerien', 'maritime', 'amphibie', 'autre']
  },
  model: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  specifications: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['disponible', 'en_mission', 'maintenance', 'hors_service'],
    default: 'disponible'
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
vehicleSchema.index({ code: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ status: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
