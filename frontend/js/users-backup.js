/**
 * Gestion des utilisateurs
 */

async function loadUsers() {
    if (!auth.hasPermission('user.read')) {
        return;
    }

    try {
        const response = await api.getUsers();
        displayUsers(response.data.users);
        
        // Charger les rôles pour le filtre
        const rolesResp = await api.getRoles();
        const roleFilter = document.getElementById('userRoleFilter');
        roleFilter.innerHTML = '<option value="">Tous les rôles</option>';
        rolesResp.data.roles.forEach(role => {
            roleFilter.innerHTML += `<option value="${role._id}">${role.displayName}</option>`;
        });
    } catch (error) {
        console.error('Error loading users:', error);
        UI.showError('Erreur lors du chargement des utilisateurs');
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nom d'utilisateur</th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.firstName} ${user.lastName}</td>
                        <td>${user.email}</td>
                        <td>${user.role.displayName}</td>
                        <td>${user.isActive ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Inactif</span>'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editUser('${user._id}')">Modifier</button>
                            <button class="btn btn-sm btn-warning" onclick="toggleUserStatus('${user._id}')">
                                ${user.isActive ? 'Désactiver' : 'Activer'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function initUsersPage() {
    document.getElementById('userSearch')?.addEventListener('input', loadUsers);
    document.getElementById('userRoleFilter')?.addEventListener('change', loadUsers);
    document.getElementById('addUserBtn')?.addEventListener('click', () => {
        UI.showError('Fonctionnalité en développement');
    });
}

async function toggleUserStatus(userId) {
    try {
        await api.toggleUserActive(userId);
        UI.showSuccess('Statut de l\'utilisateur modifié');
        loadUsers();
    } catch (error) {
        UI.showError(error.message);
    }
}

function editUser(userId) {
    UI.showError('Fonctionnalité en développement');
}
