/**
 * Application principale U2I
 * Point d'entrée et orchestration
 */

/**
 * Afficher la page de connexion
 */
function showLogin() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

/**
 * Afficher l'application
 */
async function showApp() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Charger les informations de l'utilisateur
    await displayUserInfo();
    
    // Appliquer les permissions
    applyPermissions();
    
    // Charger le tableau de bord par défaut
    await loadDashboard();
}

/**
 * Initialisation de l'application
 */
async function initApp() {
    console.log('Initialisation de l\'application U2I...');

    // Vérifier si l'utilisateur est connecté
    if (auth.isAuthenticated()) {
        try {
            // Vérifier que le token est valide
            await auth.getCurrentUser();
            
            // Initialiser l'interface
            initNavigation();
            initModal();
            initLogoutButton();
            initMissionsPage();
            initEquipmentPage();
            initVehiclesPage();
            initUsersPage();
            initRolesPage();
            initSettingsPage();

            // Afficher l'application
            showApp();
        } catch (error) {
            console.error('Token invalide:', error);
            // Token invalide, afficher la page de connexion
            auth.logout();
            showLogin();
        }
    } else {
        // Pas de token, afficher la page de connexion
        initLoginForm();
        showLogin();
    }
}

/**
 * Démarrer l'application au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
