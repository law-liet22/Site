const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * Middleware d'authentification par JWT
 * Vérifie le token et charge l'utilisateur avec son rôle et ses permissions
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise. Aucun token fourni.' 
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non trouvé.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Compte désactivé.' 
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur d\'authentification.', 
      error: error.message 
    });
  }
};

/**
 * Middleware de vérification des permissions
 * Vérifie si l'utilisateur possède les permissions requises
 */
const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentification requise.' 
        });
      }

      const user = req.user;
      const role = user.role;

      if (!role || !role.isActive) {
        return res.status(403).json({ 
          success: false, 
          message: 'Rôle invalide ou inactif.' 
        });
      }

      // L'administrateur a tous les droits
      const hasAdminPermission = role.permissions.some(
        perm => perm.name === 'admin.access' && perm.isActive
      );

      if (hasAdminPermission) {
        return next();
      }

      // Vérifier les permissions spécifiques
      const userPermissions = role.permissions
        .filter(perm => perm.isActive)
        .map(perm => perm.name);

      const hasPermission = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permissions insuffisantes.',
          required: requiredPermissions,
          current: userPermissions
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification des permissions.', 
        error: error.message 
      });
    }
  };
};

/**
 * Middleware de vérification du rôle
 * Vérifie si l'utilisateur a un rôle spécifique
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentification requise.' 
        });
      }

      const userRole = req.user.role.name;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Rôle insuffisant pour cette action.',
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification du rôle.', 
        error: error.message 
      });
    }
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise.' 
      });
    }

    const hasAdminPermission = req.user.role.permissions.some(
      perm => perm.name === 'admin.access' && perm.isActive
    );

    if (!hasAdminPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès administrateur requis.' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur de vérification administrateur.', 
      error: error.message 
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
  isAdmin
};
