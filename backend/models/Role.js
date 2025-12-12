const mongoose = require('mongoose');

/**
 * Schéma des rôles
 * Système modulable de rôles avec permissions dynamiques
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  level: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemRole: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
roleSchema.index({ name: 1 });
roleSchema.index({ level: -1 });

module.exports = mongoose.model('Role', roleSchema);
