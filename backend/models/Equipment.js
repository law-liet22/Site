const mongoose = require('mongoose');

/**
 * Schéma des équipements
 * Liste modulable d'équipements pour les missions
 */
const equipmentSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['arme', 'protection', 'communication', 'medical', 'surveillance', 'autre']
  },
  specifications: {
    type: Map,
    of: String
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
equipmentSchema.index({ code: 1 });
equipmentSchema.index({ category: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
