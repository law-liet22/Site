require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/database');
const { DEFAULT_ROLES, DEFAULT_PERMISSIONS } = require('./config/constants');

const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');
const Settings = require('./models/Settings');

/**
 * Script d'initialisation de la base de données
 * Crée les permissions, rôles et utilisateur administrateur par défaut
 */

const initDatabase = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...\n');

    // Connexion à la base de données
    await connectDB();

    // 1. Créer les permissions par défaut
    console.log('📋 Création des permissions...');
    const permissionData = [
      // Utilisateurs
      { name: 'user.create', description: 'Créer des utilisateurs', category: 'user' },
      { name: 'user.read', description: 'Voir les utilisateurs', category: 'user' },
      { name: 'user.update', description: 'Modifier les utilisateurs', category: 'user' },
      { name: 'user.delete', description: 'Supprimer les utilisateurs', category: 'user' },
      
      // Missions
      { name: 'mission.create', description: 'Créer des missions', category: 'mission' },
      { name: 'mission.read', description: 'Voir les missions', category: 'mission' },
      { name: 'mission.update', description: 'Modifier les missions', category: 'mission' },
      { name: 'mission.delete', description: 'Supprimer les missions', category: 'mission' },
      
      // Équipements
      { name: 'equipment.create', description: 'Créer des équipements', category: 'equipment' },
      { name: 'equipment.read', description: 'Voir les équipements', category: 'equipment' },
      { name: 'equipment.update', description: 'Modifier les équipements', category: 'equipment' },
      { name: 'equipment.delete', description: 'Supprimer les équipements', category: 'equipment' },
      
      // Véhicules
      { name: 'vehicle.create', description: 'Créer des véhicules', category: 'vehicle' },
      { name: 'vehicle.read', description: 'Voir les véhicules', category: 'vehicle' },
      { name: 'vehicle.update', description: 'Modifier les véhicules', category: 'vehicle' },
      { name: 'vehicle.delete', description: 'Supprimer les véhicules', category: 'vehicle' },
      
      // Rôles
      { name: 'role.create', description: 'Créer des rôles', category: 'role' },
      { name: 'role.read', description: 'Voir les rôles', category: 'role' },
      { name: 'role.update', description: 'Modifier les rôles', category: 'role' },
      { name: 'role.delete', description: 'Supprimer les rôles', category: 'role' },
      
      // Permissions et paramètres
      { name: 'permission.manage', description: 'Gérer les permissions', category: 'permission' },
      { name: 'settings.manage', description: 'Gérer les paramètres système', category: 'settings' },
      
      // Administrateur
      { name: 'admin.access', description: 'Accès administrateur complet', category: 'admin' }
    ];

    const createdPermissions = {};
    for (const permData of permissionData) {
      const existing = await Permission.findOne({ name: permData.name });
      if (!existing) {
        const perm = await Permission.create(permData);
        createdPermissions[permData.name] = perm._id;
        console.log(`  ✓ Permission créée: ${permData.name}`);
      } else {
        createdPermissions[permData.name] = existing._id;
        console.log(`  → Permission existante: ${permData.name}`);
      }
    }

    // 2. Créer les rôles par défaut
    console.log('\n👥 Création des rôles...');

    // Administrateur (toutes les permissions)
    const allPermissions = Object.values(createdPermissions);
    const adminRole = await createRoleIfNotExists({
      name: 'administrateur',
      displayName: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      level: 100,
      permissions: allPermissions,
      isSystemRole: true
    });

    // Direction (gestion complète sauf admin système)
    const directionPermissions = Object.keys(createdPermissions)
      .filter(key => !key.startsWith('admin.'))
      .map(key => createdPermissions[key]);
    const directionRole = await createRoleIfNotExists({
      name: 'direction',
      displayName: 'Direction',
      description: 'Gestion complète des opérations',
      level: 80,
      permissions: directionPermissions,
      isSystemRole: true
    });

    // Commandant (création et gestion des missions)
    const commanderPermissions = [
      'mission.create', 'mission.read', 'mission.update', 'mission.delete',
      'equipment.read', 'vehicle.read', 'user.read'
    ].map(key => createdPermissions[key]);
    const commanderRole = await createRoleIfNotExists({
      name: 'commandant',
      displayName: 'Commandant',
      description: 'Gestion des missions et opérations',
      level: 60,
      permissions: commanderPermissions,
      isSystemRole: true
    });

    // Maître du jeu (création de missions, vue complète)
    const gmPermissions = [
      'mission.create', 'mission.read', 'mission.update',
      'equipment.read', 'equipment.create', 'equipment.update',
      'vehicle.read', 'vehicle.create', 'vehicle.update',
      'user.read'
    ].map(key => createdPermissions[key]);
    const gmRole = await createRoleIfNotExists({
      name: 'maitre_du_jeu',
      displayName: 'Maître du Jeu',
      description: 'Création et gestion des scénarios',
      level: 50,
      permissions: gmPermissions,
      isSystemRole: true
    });

    // Utilisateur (accès limité)
    const userPermissions = [
      'mission.read', 'equipment.read', 'vehicle.read'
    ].map(key => createdPermissions[key]);
    const userRole = await createRoleIfNotExists({
      name: 'utilisateur',
      displayName: 'Utilisateur',
      description: 'Accès aux missions assignées',
      level: 10,
      permissions: userPermissions,
      isSystemRole: true
    });

    // 3. Créer l'administrateur par défaut
    console.log('\n👤 Création de l\'utilisateur administrateur...');
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@u2i.local',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'U2I',
        role: adminRole._id,
        isActive: true
      });
      console.log('  ✓ Administrateur créé');
      console.log('    Username: admin');
      console.log('    Password: Admin123!');
      console.log('    ⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!');
    } else {
      console.log('  → Administrateur existant');
    }

    // 4. Créer les paramètres par défaut
    console.log('\n⚙️  Création des paramètres système...');
    const defaultSettings = [
      { key: 'site.name', value: 'U2I - Unité des Incidents Inhabituels', category: 'general', description: 'Nom du site' },
      { key: 'site.description', value: 'Système de gestion des missions', category: 'general', description: 'Description du site' },
      { key: 'security.session_timeout', value: 24, category: 'security', description: 'Durée de session en heures' },
      { key: 'security.password_min_length', value: 6, category: 'security', description: 'Longueur minimale du mot de passe' },
      { key: 'map.default_center_lat', value: 39.8283, category: 'general', description: 'Latitude du centre de la carte (USA)' },
      { key: 'map.default_center_lng', value: -98.5795, category: 'general', description: 'Longitude du centre de la carte (USA)' },
      { key: 'map.default_zoom', value: 4, category: 'general', description: 'Zoom par défaut de la carte' }
    ];

    for (const setting of defaultSettings) {
      const existing = await Settings.findOne({ key: setting.key });
      if (!existing) {
        await Settings.create(setting);
        console.log(`  ✓ Paramètre créé: ${setting.key}`);
      } else {
        console.log(`  → Paramètre existant: ${setting.key}`);
      }
    }

    console.log('\n✅ Initialisation terminée avec succès!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

async function createRoleIfNotExists(roleData) {
  const existing = await Role.findOne({ name: roleData.name });
  if (!existing) {
    const role = await Role.create(roleData);
    console.log(`  ✓ Rôle créé: ${roleData.displayName}`);
    return role;
  } else {
    console.log(`  → Rôle existant: ${roleData.displayName}`);
    return existing;
  }
}

// Exécuter l'initialisation
initDatabase();
