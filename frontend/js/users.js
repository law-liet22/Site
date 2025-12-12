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
    document.getElementById('addUserBtn')?.addEventListener('click', showCreateUserForm);
}

async function showCreateUserForm() {
    try {
        const rolesResp = await api.getRoles();
        
        const content = `
            <h2>Créer un utilisateur</h2>
            <form id="createUserForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="userUsername">Nom d'utilisateur *</label>
                    <input type="text" id="userUsername" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="userEmail">Email *</label>
                    <input type="email" id="userEmail" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="userPassword">Mot de passe *</label>
                    <input type="password" id="userPassword" class="form-control" required minlength="8">
                </div>
                <div class="form-group">
                    <label for="userFirstName">Prénom *</label>
                    <input type="text" id="userFirstName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="userLastName">Nom *</label>
                    <input type="text" id="userLastName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="userRole">Rôle *</label>
                    <select id="userRole" class="form-control" required>
                        <option value="">Sélectionner un rôle</option>
                        ${rolesResp.data.roles.map(role => `<option value="${role._id}">${role.displayName}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="userActive" checked>
                        Compte actif
                    </label>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Créer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const data = {
                    username: document.getElementById('userUsername').value,
                    email: document.getElementById('userEmail').value,
                    password: document.getElementById('userPassword').value,
                    firstName: document.getElementById('userFirstName').value,
                    lastName: document.getElementById('userLastName').value,
                    roleId: document.getElementById('userRole').value,
                    isActive: document.getElementById('userActive').checked
                };

                await api.createUser(data);
                UI.showSuccess('Utilisateur créé avec succès');
                UI.hideModal();
                await loadUsers();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function editUser(userId) {
    try {
        const [userResp, rolesResp] = await Promise.all([
            api.getUser(userId),
            api.getRoles()
        ]);
        const user = userResp.data.user;

        const content = `
            <h2>Modifier l'utilisateur</h2>
            <form id="editUserForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="userUsername">Nom d'utilisateur *</label>
                    <input type="text" id="userUsername" class="form-control" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="userEmail">Email *</label>
                    <input type="email" id="userEmail" class="form-control" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label for="userFirstName">Prénom *</label>
                    <input type="text" id="userFirstName" class="form-control" value="${user.firstName}" required>
                </div>
                <div class="form-group">
                    <label for="userLastName">Nom *</label>
                    <input type="text" id="userLastName" class="form-control" value="${user.lastName}" required>
                </div>
                <div class="form-group">
                    <label for="userRole">Rôle *</label>
                    <select id="userRole" class="form-control" required>
                        ${rolesResp.data.roles.map(role => 
                            `<option value="${role._id}" ${user.role._id === role._id ? 'selected' : ''}>${role.displayName}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="userActive" ${user.isActive ? 'checked' : ''}>
                        Compte actif
                    </label>
                </div>
                <div class="form-group">
                    <label for="userNewPassword">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                    <input type="password" id="userNewPassword" class="form-control" minlength="8">
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const data = {
                    username: document.getElementById('userUsername').value,
                    email: document.getElementById('userEmail').value,
                    firstName: document.getElementById('userFirstName').value,
                    lastName: document.getElementById('userLastName').value,
                    roleId: document.getElementById('userRole').value,
                    isActive: document.getElementById('userActive').checked
                };

                const newPassword = document.getElementById('userNewPassword').value;
                if (newPassword) {
                    data.password = newPassword;
                }

                await api.updateUser(userId, data);
                UI.showSuccess('Utilisateur mis à jour avec succès');
                UI.hideModal();
                await loadUsers();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function toggleUserStatus(userId) {
    try {
        await api.toggleUserActive(userId);
        UI.showSuccess('Statut de l\'utilisateur modifié');
        await loadUsers();
    } catch (error) {
        UI.showError(error.message);
    }
}

async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    try {
        await api.deleteUser(userId);
        UI.showSuccess('Utilisateur supprimé avec succès');
        await loadUsers();
    } catch (error) {
        UI.showError(error.message);
    }
}
