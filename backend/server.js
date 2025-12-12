require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/validation');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const missionRoutes = require('./routes/missions');
const equipmentRoutes = require('./routes/equipment');
const vehicleRoutes = require('./routes/vehicles');
const locationRoutes = require('./routes/locations');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const settingsRoutes = require('./routes/settings');

// Initialisation de l'application
const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité et utilitaires
app.use(helmet({
  contentSecurityPolicy: false, // Pour permettre les ressources externes (Leaflet)
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/settings', settingsRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Serveur U2I opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Servir le frontend pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   Serveur U2I démarré avec succès             ║
║   Port: ${PORT}                                   ║
║   Environnement: ${process.env.NODE_ENV || 'development'}              ║
║   URL: http://localhost:${PORT}                  ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
