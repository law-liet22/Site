/**
 * Gestion de l'interface utilisateur
 */

/**
 * Utilitaires pour l'interface
 */
const UI = {
    /**
     * Afficher un message de succès
     */
    showSuccess(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'success-message';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    },

    /**
     * Afficher un message d'erreur
     */
    showError(message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = 'error-message';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    },

    /**
     * Afficher/masquer le modal
     */
    showModal(content, title = '') {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (title) {
            modalBody.innerHTML = `<h2>${title}</h2>${content}`;
        } else {
            modalBody.innerHTML = content;
        }
        
        modal.classList.remove('hidden');
    },

    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
    },

    /**
     * Formater une date
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Obtenir le badge de statut de mission
     */
    getMissionStatusBadge(status) {
        const badges = {
            'brouillon': 'badge-secondary',
            'planifiee': 'badge-info',
            'en_cours': 'badge-warning',
            'terminee': 'badge-success',
            'annulee': 'badge-danger'
        };
        
        const labels = {
            'brouillon': 'Brouillon',
            'planifiee': 'Planifiée',
            'en_cours': 'En cours',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        };
        
        return `<span class="badge ${badges[status]}">${labels[status]}</span>`;
    },

    /**
     * Obtenir le badge de priorité
     */
    getPriorityBadge(priority) {
        const badges = {
            'basse': 'badge-secondary',
            'normale': 'badge-info',
            'haute': 'badge-warning',
            'critique': 'badge-danger'
        };
        
        const labels = {
            'basse': 'Basse',
            'normale': 'Normale',
            'haute': 'Haute',
            'critique': 'Critique'
        };
        
        return `<span class="badge ${badges[priority]}">${labels[priority]}</span>`;
    },

    /**
     * Obtenir le badge de statut de véhicule
     */
    getVehicleStatusBadge(status) {
        const badges = {
            'disponible': 'badge-success',
            'en_mission': 'badge-warning',
            'maintenance': 'badge-info',
            'hors_service': 'badge-danger'
        };
        
        const labels = {
            'disponible': 'Disponible',
            'en_mission': 'En mission',
            'maintenance': 'Maintenance',
            'hors_service': 'Hors service'
        };
        
        return `<span class="badge ${badges[status]}">${labels[status]}</span>`;
    },

    /**
     * Créer un élément HTML à partir d'une chaîne
     */
    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
};

/**
 * Gestion de la navigation
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPages = document.querySelectorAll('.content-page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');

            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Masquer toutes les pages
            contentPages.forEach(page => page.classList.remove('active'));

            // Afficher la page sélectionnée
            const targetPage = document.getElementById(`${pageId}Page`);
            if (targetPage) {
                targetPage.classList.add('active');

                // Charger les données de la page
                loadPageData(pageId);
            }
        });
    });
}

/**
 * Charger les données d'une page
 */
async function loadPageData(pageId) {
    switch (pageId) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'missions':
            await loadMissions();
            break;
        case 'map':
            await initMap();
            break;
        case 'equipment':
            await loadEquipment();
            break;
        case 'vehicles':
            await loadVehicles();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'roles':
            await loadRoles();
            break;
        case 'settings':
            await loadSettings();
            break;
    }
}

/**
 * Charger le tableau de bord
 */
async function loadDashboard() {
    try {
        // Charger les statistiques
        const [missionsResp, equipmentResp, vehiclesResp, usersResp] = await Promise.all([
            api.getMissions({ status: 'en_cours' }),
            api.getEquipment({ isAvailable: true }),
            api.getVehicles({ status: 'disponible' }),
            auth.isAdmin() ? api.getUsers({ isActive: true }) : Promise.resolve({ data: { total: 0 } })
        ]);

        document.getElementById('activeMissions').textContent = missionsResp.data.total || 0;
        document.getElementById('availableEquipment').textContent = equipmentResp.data.total || 0;
        document.getElementById('operationalVehicles').textContent = vehiclesResp.data.total || 0;
        document.getElementById('activeAgents').textContent = usersResp.data?.total || 0;

        // Charger les missions récentes
        const recentMissionsResp = await api.getMissions({ limit: 5 });
        const recentMissionsContainer = document.getElementById('recentMissions');
        recentMissionsContainer.innerHTML = '';

        if (recentMissionsResp.data.missions.length === 0) {
            recentMissionsContainer.innerHTML = '<p>Aucune mission récente</p>';
        } else {
            recentMissionsResp.data.missions.forEach(mission => {
                const item = UI.createElement(`
                    <div class="data-list-item" data-mission-id="${mission._id}">
                        <strong>${mission.title}</strong> ${UI.getMissionStatusBadge(mission.status)}
                        <p>${mission.description.substring(0, 100)}...</p>
                    </div>
                `);
                item.addEventListener('click', () => showMissionDetails(mission._id));
                recentMissionsContainer.appendChild(item);
            });
        }

        // Charger mes missions
        const user = await auth.getCurrentUser();
        const myMissionsContainer = document.getElementById('myMissions');
        myMissionsContainer.innerHTML = '';

        if (user.assignedMissions && user.assignedMissions.length > 0) {
            user.assignedMissions.forEach(mission => {
                const item = UI.createElement(`
                    <div class="data-list-item" data-mission-id="${mission._id}">
                        <strong>${mission.title}</strong> ${UI.getMissionStatusBadge(mission.status)}
                    </div>
                `);
                item.addEventListener('click', () => showMissionDetails(mission._id));
                myMissionsContainer.appendChild(item);
            });
        } else {
            myMissionsContainer.innerHTML = '<p>Aucune mission assignée</p>';
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        UI.showError('Erreur lors du chargement du tableau de bord');
    }
}

/**
 * Initialiser le modal
 */
function initModal() {
    const modal = document.getElementById('modal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => {
        UI.hideModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            UI.hideModal();
        }
    });
}

/**
 * Initialiser le bouton de déconnexion
 */
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            window.location.reload();
        });
    }
}

/**
 * Initialiser le toggle de thème
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}

/**
 * Initialiser le formulaire de connexion
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const result = await auth.login(login, password);
                if (result.success) {
                    window.location.reload();
                } else {
                    errorDiv.textContent = result.message || 'Erreur de connexion';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = error.message || 'Erreur de connexion';
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
