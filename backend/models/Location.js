const mongoose = require('mongoose');

/**
 * Schéma des localisations
 * Points géographiques pour les missions sur la carte
 */
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  address: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['base', 'objectif', 'point_extraction', 'zone_operation', 'autre'],
    default: 'autre'
  }
}, {
  timestamps: true
});

// Index géospatial pour les recherches de proximité
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Location', locationSchema);
