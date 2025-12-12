const mongoose = require('mongoose');

/**
 * Schéma des missions
 * Gestion complète des opérations avec localisation et assignations
 */
const missionSchema = new mongoose.Schema({
  title: {
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
  status: {
    type: String,
    enum: ['brouillon', 'planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'brouillon'
  },
  // Localisation
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  // Points d'entrée et sortie
  entryPoint: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['aerien', 'terrestre', 'maritime', 'souterrain', 'autre'],
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  exitPoint: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['aerien', 'terrestre', 'maritime', 'souterrain', 'autre'],
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Ressources requises
  requiredEquipment: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  requiredVehicles: [{
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  // Escouade assignée
  assignedSquad: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Dates et timing
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number // en heures
  },
  // Créateur et gestion
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'critique'],
    default: 'normale'
  },
  // Informations complémentaires
  briefing: {
    type: String
  },
  objectives: [{
    type: String
  }],
  risks: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
missionSchema.index({ code: 1 });
missionSchema.index({ status: 1 });
missionSchema.index({ priority: 1 });
missionSchema.index({ createdBy: 1 });
missionSchema.index({ location: 1 });

module.exports = mongoose.model('Mission', missionSchema);
