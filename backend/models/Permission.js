const mongoose = require('mongoose');

/**
 * Schéma des permissions
 * Permet de définir des permissions granulaires et modulables
 */
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['user', 'mission', 'equipment', 'vehicle', 'role', 'permission', 'settings', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Permission', permissionSchema);
