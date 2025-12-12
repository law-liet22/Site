/**
 * Constantes et configuration de l'application U2I
 */

// Rôles système par défaut
const DEFAULT_ROLES = {
  ADMIN: 'administrateur',
  DIRECTION: 'direction',
  COMMANDER: 'commandant',
  GAME_MASTER: 'maitre_du_jeu',
  USER: 'utilisateur'
};

// Permissions par défaut
const DEFAULT_PERMISSIONS = {
  // Gestion des utilisateurs
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Gestion des missions
  MISSION_CREATE: 'mission.create',
  MISSION_READ: 'mission.read',
  MISSION_UPDATE: 'mission.update',
  MISSION_DELETE: 'mission.delete',
  
  // Gestion des équipements
  EQUIPMENT_CREATE: 'equipment.create',
  EQUIPMENT_READ: 'equipment.read',
  EQUIPMENT_UPDATE: 'equipment.update',
  EQUIPMENT_DELETE: 'equipment.delete',
  
  // Gestion des véhicules
  VEHICLE_CREATE: 'vehicle.create',
  VEHICLE_READ: 'vehicle.read',
  VEHICLE_UPDATE: 'vehicle.update',
  VEHICLE_DELETE: 'vehicle.delete',
  
  // Gestion des rôles et permissions
  ROLE_CREATE: 'role.create',
  ROLE_READ: 'role.read',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  
  PERMISSION_MANAGE: 'permission.manage',
  
  // Paramètres système
  SETTINGS_MANAGE: 'settings.manage',
  
  // Accès administrateur
  ADMIN_ACCESS: 'admin.access'
};

// Types d'entrée/sortie
const ENTRY_EXIT_TYPES = {
  AERIAL: 'aerien',
  GROUND: 'terrestre',
  MARITIME: 'maritime',
  UNDERGROUND: 'souterrain',
  OTHER: 'autre'
};

// Statuts de mission
const MISSION_STATUS = {
  DRAFT: 'brouillon',
  PLANNED: 'planifiee',
  IN_PROGRESS: 'en_cours',
  COMPLETED: 'terminee',
  CANCELLED: 'annulee'
};

module.exports = {
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  ENTRY_EXIT_TYPES,
  MISSION_STATUS
};
