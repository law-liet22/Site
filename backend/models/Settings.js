const mongoose = require('mongoose');

/**
 * Schéma des paramètres système
 * Permet à l'administrateur de modifier les paramètres globaux du site
 */
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'security', 'appearance', 'notifications', 'system'],
    default: 'general'
  },
  description: {
    type: String
  },
  isModifiable: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
