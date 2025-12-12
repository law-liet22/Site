# Schéma de Base de Données U2I

## Vue d'Ensemble

La base de données MongoDB contient 8 collections principales :

1. **permissions** - Permissions du système
2. **roles** - Rôles utilisateurs
3. **users** - Comptes utilisateurs
4. **missions** - Missions opérationnelles
5. **equipment** - Équipements disponibles
6. **vehicles** - Véhicules disponibles
7. **locations** - Localisations géographiques
8. **settings** - Paramètres système

---

## 📋 Collections

### Permission

Gère les permissions granulaires du système.

```javascript
{
  _id: ObjectId,
  name: String,              // Nom unique (ex: "user.create")
  description: String,       // Description de la permission
  category: String,          // Catégorie (user, mission, equipment, vehicle, role, permission, settings, admin)
  isActive: Boolean,         // Si la permission est active
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `name` (unique)
- `category`

**Exemple:**
```json
{
  "name": "mission.create",
  "description": "Créer des missions",
  "category": "mission",
  "isActive": true
}
```

---

### Role

Définit les rôles avec leurs permissions associées.

```javascript
{
  _id: ObjectId,
  name: String,              // Nom système unique (ex: "administrateur")
  displayName: String,       // Nom affiché (ex: "Administrateur")
  description: String,       // Description du rôle
  permissions: [ObjectId],   // Références aux permissions
  level: Number,             // Niveau hiérarchique (0-100)
  isActive: Boolean,         // Si le rôle est actif
  isSystemRole: Boolean,     // Si c'est un rôle système (non supprimable)
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `name` (unique)
- `level` (descendant)

**Exemple:**
```json
{
  "name": "commandant",
  "displayName": "Commandant",
  "description": "Gestion des missions et opérations",
  "permissions": ["perm_id_1", "perm_id_2"],
  "level": 60,
  "isActive": true,
  "isSystemRole": true
}
```

---

### User

Stocke les comptes utilisateurs.

```javascript
{
  _id: ObjectId,
  username: String,          // Nom d'utilisateur unique
  email: String,             // Email unique
  password: String,          // Mot de passe haché (bcrypt)
  firstName: String,
  lastName: String,
  role: ObjectId,            // Référence au rôle
  isActive: Boolean,         // Si le compte est actif
  lastLogin: Date,           // Dernière connexion
  phone: String,             // Téléphone (optionnel)
  avatar: String,            // URL de l'avatar (optionnel)
  assignedMissions: [ObjectId], // Références aux missions
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `username` (unique)
- `email` (unique)
- `role`

**Exemple:**
```json
{
  "username": "john_doe",
  "email": "john@u2i.local",
  "password": "$2a$10$...",
  "firstName": "John",
  "lastName": "Doe",
  "role": "role_id",
  "isActive": true,
  "phone": "+33612345678",
  "assignedMissions": ["mission_id_1", "mission_id_2"]
}
```

---

### Mission

Gère les missions opérationnelles.

```javascript
{
  _id: ObjectId,
  title: String,             // Titre de la mission
  code: String,              // Code unique (ex: "OPX-001")
  description: String,       // Description détaillée
  status: String,            // brouillon, planifiee, en_cours, terminee, annulee
  
  // Localisation
  location: ObjectId,        // Référence à Location
  
  // Points d'entrée et sortie
  entryPoint: {
    name: String,
    type: String,            // aerien, terrestre, maritime, souterrain, autre
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  exitPoint: {
    name: String,
    type: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Ressources
  requiredEquipment: [{
    equipment: ObjectId,     // Référence à Equipment
    quantity: Number
  }],
  requiredVehicles: [{
    vehicle: ObjectId,       // Référence à Vehicle
    quantity: Number
  }],
  
  // Escouade
  assignedSquad: [ObjectId], // Références aux Users
  
  // Dates
  startDate: Date,
  endDate: Date,
  estimatedDuration: Number, // En heures
  
  // Métadonnées
  createdBy: ObjectId,       // Référence au User créateur
  priority: String,          // basse, normale, haute, critique
  
  // Informations complémentaires
  briefing: String,
  objectives: [String],
  risks: [String],
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `code` (unique)
- `status`
- `priority`
- `createdBy`
- `location`

**Exemple:**
```json
{
  "title": "Opération Phoenix",
  "code": "OPX-001",
  "description": "Récupération d'un artefact",
  "status": "planifiee",
  "location": "location_id",
  "entryPoint": {
    "name": "Base Alpha",
    "type": "aerien",
    "coordinates": { "latitude": 40.7128, "longitude": -74.0060 }
  },
  "exitPoint": {
    "name": "Zone Extraction Delta",
    "type": "aerien",
    "coordinates": { "latitude": 40.7580, "longitude": -73.9855 }
  },
  "requiredEquipment": [
    { "equipment": "equip_id", "quantity": 2 }
  ],
  "requiredVehicles": [
    { "vehicle": "vehicle_id", "quantity": 1 }
  ],
  "assignedSquad": ["user_id_1", "user_id_2"],
  "priority": "haute",
  "createdBy": "admin_id"
}
```

---

### Equipment

Catalogue des équipements disponibles.

```javascript
{
  _id: ObjectId,
  name: String,              // Nom de l'équipement
  code: String,              // Code unique (ex: "M4-001")
  description: String,       // Description
  category: String,          // arme, protection, communication, medical, surveillance, autre
  specifications: Map,       // Caractéristiques techniques (clé-valeur)
  quantity: Number,          // Quantité disponible
  isAvailable: Boolean,      // Si disponible
  image: String,             // URL de l'image (optionnel)
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `code` (unique)
- `category`

**Exemple:**
```json
{
  "name": "Fusil d'assaut M4",
  "code": "M4-001",
  "description": "Fusil d'assaut standard",
  "category": "arme",
  "specifications": {
    "calibre": "5.56mm",
    "poids": "3.4kg",
    "portee": "500m"
  },
  "quantity": 10,
  "isAvailable": true
}
```

---

### Vehicle

Catalogue des véhicules disponibles.

```javascript
{
  _id: ObjectId,
  name: String,              // Nom du véhicule
  code: String,              // Code unique (ex: "BH-001")
  type: String,              // terrestre, aerien, maritime, amphibie, autre
  model: String,             // Modèle (optionnel)
  capacity: Number,          // Capacité en personnes
  specifications: Map,       // Caractéristiques techniques
  status: String,            // disponible, en_mission, maintenance, hors_service
  image: String,             // URL de l'image (optionnel)
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `code` (unique)
- `type`
- `status`

**Exemple:**
```json
{
  "name": "Hélicoptère Black Hawk",
  "code": "BH-001",
  "type": "aerien",
  "model": "UH-60",
  "capacity": 11,
  "specifications": {
    "vitesse_max": "295 km/h",
    "autonomie": "600 km",
    "armement": "Mitrailleuses"
  },
  "status": "disponible"
}
```

---

### Location

Localisations géographiques pour les missions.

```javascript
{
  _id: ObjectId,
  name: String,              // Nom de la localisation
  country: String,           // Pays
  city: String,              // Ville (optionnel)
  coordinates: {
    latitude: Number,        // -90 à 90
    longitude: Number        // -180 à 180
  },
  address: String,           // Adresse complète (optionnel)
  description: String,       // Description (optionnel)
  category: String,          // base, objectif, point_extraction, zone_operation, autre
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `coordinates.latitude`, `coordinates.longitude` (géospatial)

**Exemple:**
```json
{
  "name": "Base Alpha",
  "country": "États-Unis",
  "city": "New York",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "address": "123 Main Street, New York, NY",
  "description": "Base opérationnelle principale",
  "category": "base"
}
```

---

### Settings

Paramètres globaux du système.

```javascript
{
  _id: ObjectId,
  key: String,               // Clé unique du paramètre
  value: Mixed,              // Valeur (peut être string, number, boolean, object)
  category: String,          // general, security, appearance, notifications, system
  description: String,       // Description du paramètre
  isModifiable: Boolean,     // Si le paramètre peut être modifié
  lastModifiedBy: ObjectId,  // Référence au User
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
- `key` (unique)
- `category`

**Exemple:**
```json
{
  "key": "site.name",
  "value": "U2I - Unité des Incidents Inhabituels",
  "category": "general",
  "description": "Nom du site",
  "isModifiable": true,
  "lastModifiedBy": "admin_id"
}
```

---

## 🔗 Relations

```
User
├── role → Role
├── assignedMissions → [Mission]
└── createdMissions → [Mission] (via Mission.createdBy)

Role
└── permissions → [Permission]

Mission
├── location → Location
├── requiredEquipment.equipment → Equipment
├── requiredVehicles.vehicle → Vehicle
├── assignedSquad → [User]
└── createdBy → User

Settings
└── lastModifiedBy → User
```

---

## 🔍 Requêtes Fréquentes

### Trouver toutes les missions d'un utilisateur
```javascript
db.missions.find({ assignedSquad: userId })
```

### Trouver tous les utilisateurs avec un rôle spécifique
```javascript
db.users.find({ role: roleId })
```

### Trouver toutes les missions dans une zone géographique
```javascript
db.locations.find({
  'coordinates.latitude': { $gte: 35, $lte: 45 },
  'coordinates.longitude': { $gte: -80, $lte: -70 }
})
```

### Compter les équipements disponibles par catégorie
```javascript
db.equipment.aggregate([
  { $match: { isAvailable: true } },
  { $group: { _id: '$category', total: { $sum: '$quantity' } } }
])
```

### Trouver les missions en cours avec leur équipe
```javascript
db.missions.find({ status: 'en_cours' })
  .populate('assignedSquad')
  .populate('location')
```
