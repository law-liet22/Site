# Guide de Démarrage Rapide U2I

## 🚀 Installation en 5 minutes

### 1. Vérifier les prérequis

```bash
# Vérifier Node.js (version 16+)
node --version

# Vérifier MongoDB (version 5+)
mongod --version

# Ou utiliser MongoDB avec Docker
docker --version
```

### 2. Installer MongoDB (si nécessaire)

**Option A : MongoDB local**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# macOS
brew install mongodb-community

# Démarrer MongoDB
sudo systemctl start mongodb
```

**Option B : MongoDB avec Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Installer les dépendances

```bash
cd /home/mat/Bureau/Perso/U2I/Site
npm install
```

### 4. Initialiser la base de données

```bash
node backend/init-db.js
```

**Sortie attendue :**
```
🔄 Initialisation de la base de données...

📋 Création des permissions...
  ✓ Permission créée: user.create
  ✓ Permission créée: user.read
  ...

👥 Création des rôles...
  ✓ Rôle créé: Administrateur
  ✓ Rôle créé: Direction
  ...

👤 Création de l'utilisateur administrateur...
  ✓ Administrateur créé
    Username: admin
    Password: Admin123!
    ⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!

⚙️  Création des paramètres système...
  ✓ Paramètre créé: site.name
  ...

✅ Initialisation terminée avec succès!
```

### 5. Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

**Sortie attendue :**
```
╔═══════════════════════════════════════════════╗
║   Serveur U2I démarré avec succès             ║
║   Port: 3000                                  ║
║   Environnement: development                  ║
║   URL: http://localhost:3000                  ║
╚═══════════════════════════════════════════════╝
```

### 6. Accéder à l'application

Ouvrir votre navigateur : **http://localhost:3000**

**Identifiants par défaut :**
- **Username:** `admin`
- **Password:** `Admin123!`

---

## 📝 Première Connexion

### 1. Se connecter

- Entrez `admin` comme identifiant
- Entrez `Admin123!` comme mot de passe
- Cliquez sur "Se connecter"

### 2. Changer le mot de passe (IMPORTANT)

Une fois connecté, changez immédiatement le mot de passe administrateur par défaut.

### 3. Explorer l'interface

- **Tableau de bord** : Vue d'ensemble des statistiques
- **Missions** : Gestion des opérations
- **Carte** : Visualisation géographique des missions
- **Équipements** : Catalogue d'équipements
- **Véhicules** : Flotte de véhicules
- **Utilisateurs** : Gestion des comptes (Admin seulement)
- **Rôles & Permissions** : Système de permissions (Admin seulement)
- **Paramètres** : Configuration système (Admin seulement)

---

## 🎯 Premiers Pas

### Créer un nouvel utilisateur

1. Aller dans **Utilisateurs**
2. Cliquer sur **+ Nouvel utilisateur**
3. Remplir le formulaire :
   - Nom d'utilisateur
   - Email
   - Mot de passe
   - Prénom et Nom
   - Sélectionner un rôle
4. Cliquer sur **Sauvegarder**

### Créer une localisation

1. Les localisations sont nécessaires pour créer des missions
2. Exemple via l'API (ou ajouter dans l'interface) :

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Base Alpha",
    "country": "États-Unis",
    "city": "New York",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "category": "base"
  }'
```

### Créer une mission

1. Aller dans **Missions**
2. Cliquer sur **+ Nouvelle mission**
3. Remplir les informations :
   - Titre et code
   - Description
   - Localisation
   - Points d'entrée/sortie
   - Priorité
   - Équipements et véhicules requis
   - Escouade assignée
4. Cliquer sur **Sauvegarder**

### Voir les missions sur la carte

1. Aller dans **Carte**
2. Toutes les missions avec localisation s'affichent
3. Cliquer sur un marqueur pour voir les détails
4. Les couleurs indiquent le statut :
   - 🔵 Bleu : Planifiée
   - 🟠 Orange : En cours
   - 🟢 Vert : Terminée
   - 🔴 Rouge : Annulée
   - ⚫ Gris : Brouillon

---

## 🔧 Configuration Avancée

### Personnaliser le port

Modifier dans `.env` :
```env
PORT=8080
```

### Changer l'URL MongoDB

Modifier dans `.env` :
```env
MONGODB_URI=mongodb://utilisateur:motdepasse@serveur:27017/u2i_db
```

### Configurer JWT

Modifier dans `.env` :
```env
JWT_SECRET=votre_secret_tres_securise_minimum_32_caracteres
JWT_EXPIRE=24h  # Durée de validité du token
```

---

## 🛠️ Commandes Utiles

### Réinitialiser la base de données

```bash
# Attention : Cela supprime toutes les données !
mongo u2i_db --eval "db.dropDatabase()"
node backend/init-db.js
```

### Vérifier l'état du serveur

```bash
curl http://localhost:3000/api/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Serveur U2I opérationnel",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### Voir les logs en temps réel

```bash
npm run dev
```

### Arrêter le serveur

- En mode dev : `Ctrl + C`
- Avec PM2 : `pm2 stop u2i`

---

## 🐛 Dépannage

### MongoDB ne démarre pas

**Problème :** `MongoServerError: connect ECONNREFUSED`

**Solution :**
```bash
# Vérifier si MongoDB est en cours d'exécution
sudo systemctl status mongodb

# Démarrer MongoDB
sudo systemctl start mongodb

# Avec Docker
docker start mongodb
```

### Port déjà utilisé

**Problème :** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution :**
```bash
# Changer le port dans .env
PORT=3001

# Ou arrêter le processus sur le port 3000
lsof -ti:3000 | xargs kill -9
```

### Token invalide après reconnexion

**Problème :** `Token invalide ou expiré`

**Solution :**
- Se déconnecter et se reconnecter
- Vider le localStorage du navigateur
- Vérifier que `JWT_SECRET` n'a pas changé dans `.env`

### Permissions insuffisantes

**Problème :** `Permissions insuffisantes pour cette action`

**Solution :**
- Vérifier le rôle de l'utilisateur
- Vérifier les permissions du rôle
- Se connecter avec le compte admin pour modifier les permissions

---

## 📚 Ressources

- **Documentation complète** : [README.md](../README.md)
- **Documentation API** : [docs/API.md](./API.md)
- **Schéma de base de données** : [docs/DATABASE.md](./DATABASE.md)

---

## ✅ Checklist de Démarrage

- [ ] Node.js installé (v16+)
- [ ] MongoDB installé et démarré
- [ ] Dépendances installées (`npm install`)
- [ ] Base de données initialisée (`node backend/init-db.js`)
- [ ] Serveur démarré (`npm run dev`)
- [ ] Accès à http://localhost:3000
- [ ] Connexion avec admin / Admin123!
- [ ] Mot de passe administrateur changé
- [ ] Premier utilisateur créé
- [ ] Première mission créée

---

## 🎉 C'est Parti !

Votre système U2I est maintenant opérationnel !

**Prochaines étapes recommandées :**
1. Créer des rôles personnalisés
2. Ajouter des utilisateurs
3. Créer des localisations
4. Ajouter des équipements et véhicules
5. Créer vos premières missions
6. Explorer la carte interactive

**Besoin d'aide ?** Consultez la documentation complète ou contactez l'équipe de support.
