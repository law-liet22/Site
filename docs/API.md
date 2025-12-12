# Documentation API U2I

## Base URL

```
http://localhost:3000/api
```

## Authentification

Toutes les routes (sauf login et register) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

---

## 🔐 Authentification

### POST /auth/register
Créer un nouveau compte utilisateur

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "roleId": "role_id_optionnel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": { ... },
    "token": "jwt_token"
  }
}
```

### POST /auth/login
Se connecter

**Body:**
```json
{
  "login": "admin",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@u2i.local",
      "firstName": "Admin",
      "lastName": "U2I",
      "role": {
        "name": "administrateur",
        "displayName": "Administrateur",
        "level": 100,
        "permissions": ["admin.access", ...]
      }
    },
    "token": "jwt_token"
  }
}
```

### GET /auth/me
Obtenir les informations de l'utilisateur connecté

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### PUT /auth/change-password
Changer le mot de passe

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### POST /auth/logout
Se déconnecter

**Headers:** `Authorization: Bearer <token>`

---

## 👥 Utilisateurs

### GET /users
Liste des utilisateurs (Permission: `user.read`)

**Query Parameters:**
- `page` (number): Page (défaut: 1)
- `limit` (number): Limite par page (défaut: 10)
- `search` (string): Recherche
- `role` (string): Filtrer par rôle ID
- `isActive` (boolean): Filtrer par statut

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "totalPages": 5,
    "currentPage": 1,
    "total": 50
  }
}
```

### GET /users/:id
Détails d'un utilisateur (Permission: `user.read`)

### POST /users
Créer un utilisateur (Permission: `user.create`)

**Body:**
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "roleId": "role_id",
  "phone": "+33612345678"
}
```

### PUT /users/:id
Mettre à jour un utilisateur (Permission: `user.update`)

### DELETE /users/:id
Supprimer un utilisateur (Permission: `user.delete`)

### PUT /users/:id/toggle-active
Activer/désactiver un compte (Admin)

---

## 🎯 Missions

### GET /missions
Liste des missions (Permission: `mission.read`)

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Recherche
- `status`: Filtrer par statut (brouillon, planifiee, en_cours, terminee, annulee)
- `priority`: Filtrer par priorité (basse, normale, haute, critique)

### GET /missions/:id
Détails d'une mission (Permission: `mission.read`)

### POST /missions
Créer une mission (Permission: `mission.create`)

**Body:**
```json
{
  "title": "Opération Phoenix",
  "code": "OPX-001",
  "description": "Description de la mission",
  "locationId": "location_id",
  "entryPoint": {
    "name": "Base Alpha",
    "type": "aerien",
    "coordinates": { "latitude": 40.7128, "longitude": -74.0060 }
  },
  "exitPoint": {
    "name": "Zone d'extraction",
    "type": "aerien",
    "coordinates": { "latitude": 40.7580, "longitude": -73.9855 }
  },
  "requiredEquipment": [
    { "equipment": "equipment_id", "quantity": 2 }
  ],
  "requiredVehicles": [
    { "vehicle": "vehicle_id", "quantity": 1 }
  ],
  "assignedSquad": ["user_id_1", "user_id_2"],
  "startDate": "2024-01-01T10:00:00Z",
  "endDate": "2024-01-02T18:00:00Z",
  "priority": "haute",
  "briefing": "Briefing détaillé",
  "objectives": ["Objectif 1", "Objectif 2"],
  "risks": ["Risque 1", "Risque 2"]
}
```

### PUT /missions/:id
Mettre à jour une mission (Permission: `mission.update`)

### DELETE /missions/:id
Supprimer une mission (Permission: `mission.delete`)

### GET /missions/map/locations
Obtenir les localisations pour la carte (Permission: `mission.read`)

**Response:**
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "...",
        "title": "Opération Phoenix",
        "code": "OPX-001",
        "status": "planifiee",
        "priority": "haute",
        "coordinates": { "lat": 40.7128, "lng": -74.0060 },
        "locationName": "New York",
        "country": "États-Unis"
      }
    ]
  }
}
```

---

## 🛠️ Équipements

### GET /equipment
Liste des équipements (Permission: `equipment.read`)

**Query Parameters:**
- `category`: arme, protection, communication, medical, surveillance, autre
- `isAvailable`: true/false
- `search`: Recherche

### GET /equipment/:id
Détails d'un équipement

### POST /equipment
Créer un équipement (Permission: `equipment.create`)

**Body:**
```json
{
  "name": "Fusil d'assaut M4",
  "code": "M4-001",
  "description": "Fusil d'assaut standard",
  "category": "arme",
  "specifications": {
    "calibre": "5.56mm",
    "poids": "3.4kg"
  },
  "quantity": 10,
  "image": "url_image"
}
```

### PUT /equipment/:id
Mettre à jour un équipement (Permission: `equipment.update`)

### DELETE /equipment/:id
Supprimer un équipement (Permission: `equipment.delete`)

---

## 🚁 Véhicules

### GET /vehicles
Liste des véhicules (Permission: `vehicle.read`)

**Query Parameters:**
- `type`: terrestre, aerien, maritime, amphibie, autre
- `status`: disponible, en_mission, maintenance, hors_service
- `search`: Recherche

### GET /vehicles/:id
Détails d'un véhicule

### POST /vehicles
Créer un véhicule (Permission: `vehicle.create`)

**Body:**
```json
{
  "name": "Hélicoptère Black Hawk",
  "code": "BH-001",
  "type": "aerien",
  "model": "UH-60",
  "capacity": 11,
  "specifications": {
    "vitesse_max": "295 km/h",
    "autonomie": "600 km"
  },
  "image": "url_image"
}
```

### PUT /vehicles/:id
Mettre à jour un véhicule (Permission: `vehicle.update`)

### DELETE /vehicles/:id
Supprimer un véhicule (Permission: `vehicle.delete`)

---

## 📍 Localisations

### GET /locations
Liste des localisations

**Query Parameters:**
- `category`: base, objectif, point_extraction, zone_operation, autre
- `country`: Pays
- `search`: Recherche

### POST /locations
Créer une localisation (Permission: `mission.create`)

**Body:**
```json
{
  "name": "Base Alpha",
  "country": "États-Unis",
  "city": "New York",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "address": "Adresse complète",
  "description": "Description de la localisation",
  "category": "base"
}
```

### PUT /locations/:id
Mettre à jour une localisation

### DELETE /locations/:id
Supprimer une localisation (Admin)

---

## 🔐 Rôles

### GET /roles
Liste des rôles (Permission: `role.read`)

### GET /roles/:id
Détails d'un rôle

### POST /roles
Créer un rôle (Permission: `role.create`)

**Body:**
```json
{
  "name": "agent_terrain",
  "displayName": "Agent de Terrain",
  "description": "Agents opérationnels sur le terrain",
  "level": 30,
  "permissions": ["permission_id_1", "permission_id_2"]
}
```

### PUT /roles/:id
Mettre à jour un rôle (Permission: `role.update`)

### DELETE /roles/:id
Supprimer un rôle (Permission: `role.delete`)

### PUT /roles/:id/permissions
Modifier les permissions d'un rôle (Admin)

**Body:**
```json
{
  "permissions": ["perm_id_1", "perm_id_2", "perm_id_3"]
}
```

---

## 🎫 Permissions

### GET /permissions
Liste des permissions (Admin)

**Query Parameters:**
- `category`: user, mission, equipment, vehicle, role, permission, settings, admin
- `isActive`: true/false

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": [...],
    "grouped": {
      "user": [...],
      "mission": [...],
      ...
    }
  }
}
```

### POST /permissions
Créer une permission (Admin)

**Body:**
```json
{
  "name": "custom.permission",
  "description": "Description de la permission",
  "category": "user"
}
```

### PUT /permissions/:id
Mettre à jour une permission (Admin)

### DELETE /permissions/:id
Supprimer une permission (Admin)

### PUT /permissions/:id/toggle
Activer/désactiver une permission (Admin)

---

## ⚙️ Paramètres

### GET /settings
Liste des paramètres (Admin)

**Query Parameters:**
- `category`: general, security, appearance, notifications, system

### GET /settings/:key
Obtenir un paramètre par clé (Admin)

### POST /settings
Créer un paramètre (Admin)

**Body:**
```json
{
  "key": "custom.setting",
  "value": "valeur",
  "category": "general",
  "description": "Description du paramètre",
  "isModifiable": true
}
```

### PUT /settings/:key
Mettre à jour un paramètre (Admin)

### DELETE /settings/:key
Supprimer un paramètre (Admin)

---

## ❌ Codes d'Erreur

- `200` - Succès
- `201` - Créé avec succès
- `400` - Erreur de validation
- `401` - Non authentifié
- `403` - Permissions insuffisantes
- `404` - Ressource non trouvée
- `500` - Erreur serveur

**Format de réponse d'erreur:**
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [...]  // Optionnel
}
```
