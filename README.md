# U2I - Unité des Incidents Inhabituels

Système complet de gestion des missions, équipements, véhicules et agents pour l'U2I.

## 🎯 Fonctionnalités

### Authentification et Sécurité
- ✅ Système d'authentification sécurisé avec JWT
- ✅ Mots de passe hachés avec bcrypt
- ✅ Gestion de sessions
- ✅ Protection des routes par rôle et permission

### Gestion des Utilisateurs
- ✅ Création, modification, suppression de comptes
- ✅ Activation/désactivation de comptes
- ✅ Système de rôles modulable
- ✅ Permissions granulaires et dynamiques

### Rôles par Défaut
- **Administrateur** (niveau 100) : Accès complet à toutes les fonctionnalités
- **Direction** (niveau 80) : Gestion complète des opérations
- **Commandant** (niveau 60) : Gestion des missions et opérations
- **Maître du Jeu** (niveau 50) : Création et gestion des scénarios
- **Utilisateur** (niveau 10) : Accès aux missions assignées

### Gestion des Missions
- ✅ Création, modification, suppression de missions
- ✅ Localisation sur carte interactive (Leaflet)
- ✅ Points d'entrée et de sortie (aérien, terrestre, maritime, souterrain)
- ✅ Assignation d'escouades
- ✅ Sélection d'équipements et véhicules
- ✅ Statuts de mission (brouillon, planifiée, en cours, terminée, annulée)
- ✅ Niveaux de priorité (basse, normale, haute, critique)

### Carte Interactive
- ✅ Affichage de toutes les missions sur une carte mondiale
- ✅ Centrée sur les États-Unis
- ✅ Points cliquables avec détails de mission
- ✅ Marqueurs colorés selon le statut

### Gestion des Équipements
- ✅ CRUD complet des équipements
- ✅ Catégories (arme, protection, communication, médical, surveillance)
- ✅ Suivi des quantités disponibles
- ✅ Filtres et recherche

### Gestion des Véhicules
- ✅ CRUD complet des véhicules
- ✅ Types (terrestre, aérien, maritime, amphibie)
- ✅ Statuts (disponible, en mission, maintenance, hors service)
- ✅ Capacité d'occupation

### Système de Permissions Dynamique
- ✅ Création/suppression de permissions par l'administrateur
- ✅ Attribution flexible aux rôles
- ✅ Changements en temps réel
- ✅ Permissions catégorisées

### Paramètres Système
- ✅ Gestion des paramètres globaux du site
- ✅ Catégories (général, sécurité, apparence, notifications, système)
- ✅ Paramètres modifiables par l'administrateur

## 📋 Prérequis

- Node.js v16 ou supérieur
- MongoDB v5 ou supérieur
- npm ou yarn

## 🚀 Installation

### 1. Cloner le projet

```bash
cd /home/mat/Bureau/Perso/U2I/Site
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifier les valeurs dans `.env` :

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/u2i_db
JWT_SECRET=votre_secret_jwt_tres_securise_a_changer
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

### 4. Démarrer MongoDB

Assurez-vous que MongoDB est en cours d'exécution :

```bash
# Sur Linux
sudo systemctl start mongodb

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Initialiser la base de données

```bash
node backend/init-db.js
```

Cette commande va créer :
- Les permissions par défaut
- Les rôles système (administrateur, direction, commandant, maître du jeu, utilisateur)
- Un compte administrateur par défaut
- Les paramètres système

**Compte administrateur par défaut :**
- Username: `admin`
- Password: `Admin123!`

⚠️ **IMPORTANT : Changez ce mot de passe après la première connexion !**

### 6. Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
U2I/Site/
├── backend/
│   ├── config/
│   │   ├── constants.js      # Constantes de l'application
│   │   └── database.js        # Configuration MongoDB
│   ├── middleware/
│   │   ├── auth.js            # Authentification et permissions
│   │   └── validation.js      # Validation des données
│   ├── models/
│   │   ├── Permission.js      # Schéma des permissions
│   │   ├── Role.js            # Schéma des rôles
│   │   ├── User.js            # Schéma des utilisateurs
│   │   ├── Mission.js         # Schéma des missions
│   │   ├── Equipment.js       # Schéma des équipements
│   │   ├── Vehicle.js         # Schéma des véhicules
│   │   ├── Location.js        # Schéma des localisations
│   │   └── Settings.js        # Schéma des paramètres
│   ├── routes/
│   │   ├── auth.js            # Routes d'authentification
│   │   ├── users.js           # Routes utilisateurs
│   │   ├── missions.js        # Routes missions
│   │   ├── equipment.js       # Routes équipements
│   │   ├── vehicles.js        # Routes véhicules
│   │   ├── locations.js       # Routes localisations
│   │   ├── roles.js           # Routes rôles
│   │   ├── permissions.js     # Routes permissions
│   │   └── settings.js        # Routes paramètres
│   ├── init-db.js             # Script d'initialisation
│   └── server.js              # Serveur Express
├── frontend/
│   ├── css/
│   │   └── styles.css         # Styles CSS
│   ├── js/
│   │   ├── api.js             # Client API
│   │   ├── auth.js            # Gestion auth frontend
│   │   ├── ui.js              # Utilitaires UI
│   │   ├── missions.js        # Gestion missions
│   │   ├── map.js             # Carte interactive
│   │   ├── equipment.js       # Gestion équipements
│   │   ├── vehicles.js        # Gestion véhicules
│   │   ├── users.js           # Gestion utilisateurs
│   │   ├── roles.js           # Gestion rôles
│   │   ├── settings.js        # Gestion paramètres
│   │   └── app.js             # Application principale
│   └── index.html             # Page principale
├── .env.example               # Exemple de configuration
├── .gitignore                 # Fichiers ignorés par Git
├── package.json               # Dépendances Node.js
└── README.md                  # Ce fichier
```

## 🔌 API Endpoints

Voir [API.md](./docs/API.md) pour la documentation complète des endpoints.

## 🗄️ Schéma de Base de Données

Voir [DATABASE.md](./docs/DATABASE.md) pour le schéma complet de la base de données.

## 🔐 Système de Permissions

### Permissions par Catégorie

**Utilisateurs**
- `user.create` - Créer des utilisateurs
- `user.read` - Voir les utilisateurs
- `user.update` - Modifier les utilisateurs
- `user.delete` - Supprimer les utilisateurs

**Missions**
- `mission.create` - Créer des missions
- `mission.read` - Voir les missions
- `mission.update` - Modifier les missions
- `mission.delete` - Supprimer les missions

**Équipements**
- `equipment.create` - Créer des équipements
- `equipment.read` - Voir les équipements
- `equipment.update` - Modifier les équipements
- `equipment.delete` - Supprimer les équipements

**Véhicules**
- `vehicle.create` - Créer des véhicules
- `vehicle.read` - Voir les véhicules
- `vehicle.update` - Modifier les véhicules
- `vehicle.delete` - Supprimer les véhicules

**Rôles**
- `role.create` - Créer des rôles
- `role.read` - Voir les rôles
- `role.update` - Modifier les rôles
- `role.delete` - Supprimer les rôles

**Administration**
- `permission.manage` - Gérer les permissions
- `settings.manage` - Gérer les paramètres système
- `admin.access` - Accès administrateur complet

## 🛠️ Développement

### Ajouter une nouvelle permission

```javascript
// Dans l'interface admin ou via l'API
POST /api/permissions
{
  "name": "nouvelle.permission",
  "description": "Description de la permission",
  "category": "user"
}
```

### Créer un nouveau rôle

```javascript
POST /api/roles
{
  "name": "nouveau_role",
  "displayName": "Nouveau Rôle",
  "description": "Description du rôle",
  "level": 40,
  "permissions": ["permission_id_1", "permission_id_2"]
}
```

### Structure d'une route protégée

```javascript
const { authenticate, authorize } = require('../middleware/auth');

router.get('/protected', 
  authenticate,                          // Vérifier l'authentification
  authorize('permission.name'),          // Vérifier la permission
  async (req, res) => {
    // Route protégée
  }
);
```

## 🧪 Tests

```bash
npm test
```

## 📦 Déploiement

### Production avec PM2

```bash
npm install -g pm2
pm2 start backend/server.js --name u2i
pm2 save
pm2 startup
```

### Variables d'environnement en production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://votre_serveur:27017/u2i_db
JWT_SECRET=votre_secret_production_tres_securise
JWT_EXPIRE=24h
```

## 🔒 Sécurité

- Mots de passe hachés avec bcrypt (salt rounds: 10)
- JWT avec expiration configurable
- Protection CORS
- Helmet.js pour les headers de sécurité
- Validation des entrées avec express-validator
- Protection contre les injections NoSQL

## 📝 Licence

Ce projet est privé et confidentiel.

## 👥 Support

Pour toute question ou problème, contactez l'équipe de développement.

## 🗺️ Roadmap

- [ ] Upload d'images pour missions, équipements et véhicules
- [ ] Système de notifications en temps réel
- [ ] Rapports de mission
- [ ] Historique des modifications
- [ ] Export de données (PDF, Excel)
- [ ] Application mobile
- [ ] API REST complète avec documentation Swagger
- [ ] Tests automatisés complets

## 📊 Statistiques

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Carte**: Leaflet.js
- **Authentification**: JWT + bcrypt
- **Architecture**: MVC modulaire
