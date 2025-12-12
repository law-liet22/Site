/**
 * Gestion de l'authentification
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    /**
     * Connexion
     */
    async login(login, password) {
        try {
            const response = await api.login(login, password);
            
            if (response.success) {
                this.currentUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                return { success: true };
            }
            
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Déconnexion
     */
    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            localStorage.removeItem('user');
            api.clearToken();
            window.location.reload();
        }
    }

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated() {
        return !!api.token;
    }

    /**
     * Récupérer l'utilisateur courant
     */
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        // Essayer de récupérer depuis le localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            return this.currentUser;
        }

        // Récupérer depuis l'API
        try {
            const response = await api.getMe();
            if (response.success) {
                this.currentUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Vérifier si l'utilisateur a une permission
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }

        const permissions = this.currentUser.role.permissions || [];
        
        // Admin a toutes les permissions
        if (permissions.includes('admin.access')) {
            return true;
        }

        return permissions.includes(permission);
    }

    /**
     * Vérifier si l'utilisateur a un rôle
     */
    hasRole(roleName) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }

        return this.currentUser.role.name === roleName;
    }

    /**
     * Vérifier si l'utilisateur est admin
     */
    isAdmin() {
        return this.hasPermission('admin.access');
    }

    /**
     * Vérifier si l'utilisateur peut créer des missions
     */
    canCreateMissions() {
        return this.hasPermission('mission.create');
    }

    /**
     * Vérifier si l'utilisateur peut gérer les équipements
     */
    canManageEquipment() {
        return this.hasPermission('equipment.create') || 
               this.hasPermission('equipment.update') || 
               this.hasPermission('equipment.delete');
    }

    /**
     * Vérifier si l'utilisateur peut gérer les véhicules
     */
    canManageVehicles() {
        return this.hasPermission('vehicle.create') || 
               this.hasPermission('vehicle.update') || 
               this.hasPermission('vehicle.delete');
    }
}

// Instance globale du gestionnaire d'authentification
const auth = new AuthManager();

/**
 * Initialiser le formulaire de connexion
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        // Cacher les erreurs précédentes
        loginError.classList.add('hidden');

        // Désactiver le bouton pendant la connexion
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            const result = await auth.login(login, password);

            if (result.success) {
                // Connexion réussie, rediriger vers l'application
                showApp();
            } else {
                // Afficher l'erreur
                loginError.textContent = result.message || 'Identifiants invalides';
                loginError.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        } catch (error) {
            loginError.textContent = 'Une erreur est survenue. Veuillez réessayer.';
            loginError.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
}

/**
 * Initialiser le bouton de déconnexion
 */
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            auth.logout();
        }
    });
}

/**
 * Afficher les informations de l'utilisateur
 */
async function displayUserInfo() {
    const user = await auth.getCurrentUser();
    
    if (user) {
        document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('userRole').textContent = user.role.displayName;
    }
}

/**
 * Masquer/afficher les éléments selon les permissions
 */
function applyPermissions() {
    // Éléments réservés aux admins
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = auth.isAdmin() ? '' : 'none';
    });

    // Éléments pour les créateurs de missions
    document.querySelectorAll('.mission-creator-only').forEach(el => {
        el.style.display = auth.canCreateMissions() ? '' : 'none';
    });

    // Éléments pour les gestionnaires d'équipements
    document.querySelectorAll('.equipment-manager-only').forEach(el => {
        el.style.display = auth.canManageEquipment() ? '' : 'none';
    });

    // Éléments pour les gestionnaires de véhicules
    document.querySelectorAll('.vehicle-manager-only').forEach(el => {
        el.style.display = auth.canManageVehicles() ? '' : 'none';
    });
}
