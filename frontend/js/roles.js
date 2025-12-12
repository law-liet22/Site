/**
 * Gestion des rôles et permissions
 */

async function loadRoles() {
    if (!auth.isAdmin()) {
        return;
    }

    try {
        const [rolesResp, permsResp] = await Promise.all([
            api.getRoles(),
            api.getPermissions()
        ]);

        displayRoles(rolesResp.data.roles);
        displayPermissions(permsResp.data.grouped);
    } catch (error) {
        console.error('Error loading roles:', error);
        UI.showError('Erreur lors du chargement des rôles');
    }
}

function displayRoles(roles) {
    const container = document.getElementById('rolesList');
    container.innerHTML = '';

    roles.forEach(role => {
        const card = UI.createElement(`
            <div class="data-card">
                <h3>${role.displayName}</h3>
                <p><strong>Nom système:</strong> ${role.name}</p>
                <p><strong>Niveau:</strong> ${role.level}</p>
                <p><strong>Permissions:</strong> ${role.permissions.length}</p>
                <p>${role.isActive ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Inactif</span>'}</p>
                ${role.isSystemRole ? '<p><span class="badge badge-info">Rôle système</span></p>' : ''}
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="showRoleDetails('${role._id}')">Détails</button>
                    ${!role.isSystemRole || role.name !== 'administrateur' ? `
                        <button class="btn btn-sm btn-warning" onclick="editRole('${role._id}')">Modifier</button>
                        ${!role.isSystemRole ? `<button class="btn btn-sm btn-danger" onclick="deleteRole('${role._id}')">Supprimer</button>` : ''}
                    ` : ''}
                </div>
            </div>
        `);
        container.appendChild(card);
    });
}

function displayPermissions(groupedPermissions) {
    const container = document.getElementById('permissionsList');
    container.innerHTML = '';

    Object.keys(groupedPermissions).forEach(category => {
        const section = UI.createElement(`
            <div style="margin-top: 1rem;">
                <h4 style="text-transform: capitalize;">${category}</h4>
                <div id="perms-${category}"></div>
            </div>
        `);
        
        const permsContainer = section.querySelector(`#perms-${category}`);
        groupedPermissions[category].forEach(perm => {
            const permEl = UI.createElement(`
                <div style="padding: 0.5rem; border: 1px solid var(--border-color); margin: 0.5rem 0; border-radius: 5px;">
                    <strong>${perm.name}</strong>
                    <p style="margin: 0.25rem 0; font-size: 0.9rem;">${perm.description}</p>
                    <p style="margin: 0;">${perm.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</p>
                </div>
            `);
            permsContainer.appendChild(permEl);
        });
        
        container.appendChild(section);
    });
}

async function showRoleDetails(roleId) {
    try {
        const response = await api.getRole(roleId);
        const role = response.data.role;

        const content = `
            <h2>${role.displayName}</h2>
            <p><strong>Nom système:</strong> ${role.name}</p>
            <p><strong>Niveau:</strong> ${role.level}</p>
            <p><strong>Description:</strong> ${role.description}</p>
            <p>${role.isActive ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Inactif</span>'}</p>
            ${role.isSystemRole ? '<p><span class="badge badge-info">Rôle système</span></p>' : ''}
            <h3>Permissions (${role.permissions.length})</h3>
            <ul>
                ${role.permissions.map(perm => `<li>${perm.name} - ${perm.description}</li>`).join('')}
            </ul>
            <div style="margin-top: 1rem;">
                ${!role.isSystemRole || role.name !== 'administrateur' ? '<button class="btn btn-primary" onclick="editRole(\'' + role._id + '\')">Modifier</button>' : ''}
            </div>
        `;

        UI.showModal(content);
    } catch (error) {
        UI.showError(error.message);
    }
}

function initRolesPage() {
    document.getElementById('addRoleBtn')?.addEventListener('click', showCreateRoleForm);
    
    document.getElementById('addPermissionBtn')?.addEventListener('click', showCreatePermissionForm);
}

async function showCreateRoleForm() {
    try {
        const permsResp = await api.getPermissions();
        
        const content = `
            <h2>Créer un rôle</h2>
            <form id="createRoleForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="roleName">Nom système *</label>
                    <input type="text" id="roleName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="roleDisplayName">Nom d'affichage *</label>
                    <input type="text" id="roleDisplayName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="roleLevel">Niveau *</label>
                    <input type="number" id="roleLevel" class="form-control" min="1" max="100" required>
                </div>
                <div class="form-group">
                    <label for="roleDescription">Description</label>
                    <textarea id="roleDescription" class="form-control" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Permissions:</label>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 1rem;">
                        ${permsResp.data.permissions.map(perm => `
                            <label style="display: block; margin: 0.5rem 0;">
                                <input type="checkbox" name="permissions" value="${perm._id}">
                                ${perm.name} - ${perm.description}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="roleActive" checked>
                        Rôle actif
                    </label>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Créer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('createRoleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked')).map(cb => cb.value);
                
                const data = {
                    name: document.getElementById('roleName').value,
                    displayName: document.getElementById('roleDisplayName').value,
                    level: parseInt(document.getElementById('roleLevel').value),
                    description: document.getElementById('roleDescription').value,
                    permissions: permissions,
                    isActive: document.getElementById('roleActive').checked
                };

                await api.createRole(data);
                UI.showSuccess('Rôle créé avec succès');
                UI.hideModal();
                await loadRoles();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function editRole(roleId) {
    try {
        const [roleResp, permsResp] = await Promise.all([
            api.getRole(roleId),
            api.getPermissions()
        ]);
        const role = roleResp.data.role;
        const rolePermIds = role.permissions.map(p => p._id);

        const content = `
            <h2>Modifier le rôle</h2>
            <form id="editRoleForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="roleName">Nom système *</label>
                    <input type="text" id="roleName" class="form-control" value="${role.name}" required ${role.isSystemRole ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                    <label for="roleDisplayName">Nom d'affichage *</label>
                    <input type="text" id="roleDisplayName" class="form-control" value="${role.displayName}" required>
                </div>
                <div class="form-group">
                    <label for="roleLevel">Niveau *</label>
                    <input type="number" id="roleLevel" class="form-control" value="${role.level}" min="1" max="100" required>
                </div>
                <div class="form-group">
                    <label for="roleDescription">Description</label>
                    <textarea id="roleDescription" class="form-control" rows="3">${role.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Permissions:</label>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 1rem;">
                        ${permsResp.data.permissions.map(perm => `
                            <label style="display: block; margin: 0.5rem 0;">
                                <input type="checkbox" name="permissions" value="${perm._id}" ${rolePermIds.includes(perm._id) ? 'checked' : ''}>
                                ${perm.name} - ${perm.description}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="roleActive" ${role.isActive ? 'checked' : ''}>
                        Rôle actif
                    </label>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('editRoleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked')).map(cb => cb.value);
                
                const data = {
                    displayName: document.getElementById('roleDisplayName').value,
                    level: parseInt(document.getElementById('roleLevel').value),
                    description: document.getElementById('roleDescription').value,
                    permissions: permissions,
                    isActive: document.getElementById('roleActive').checked
                };

                if (!role.isSystemRole) {
                    data.name = document.getElementById('roleName').value;
                }

                await api.updateRole(roleId, data);
                UI.showSuccess('Rôle mis à jour avec succès');
                UI.hideModal();
                await loadRoles();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function deleteRole(roleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
        return;
    }

    try {
        await api.deleteRole(roleId);
        UI.showSuccess('Rôle supprimé avec succès');
        await loadRoles();
    } catch (error) {
        UI.showError(error.message);
    }
}

async function showCreatePermissionForm() {
    const content = `
        <h2>Créer une permission</h2>
        <form id="createPermissionForm" style="max-width: 600px;">
            <div class="form-group">
                <label for="permName">Nom *</label>
                <input type="text" id="permName" class="form-control" required placeholder="ex: mission.create">
            </div>
            <div class="form-group">
                <label for="permDescription">Description *</label>
                <textarea id="permDescription" class="form-control" rows="2" required></textarea>
            </div>
            <div class="form-group">
                <label for="permCategory">Catégorie *</label>
                <select id="permCategory" class="form-control" required>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="mission">Mission</option>
                    <option value="user">Utilisateur</option>
                    <option value="equipment">Équipement</option>
                    <option value="vehicle">Véhicule</option>
                    <option value="location">Localisation</option>
                    <option value="role">Rôle</option>
                    <option value="permission">Permission</option>
                    <option value="settings">Paramètres</option>
                    <option value="other">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="permActive" checked>
                    Permission active
                </label>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Créer</button>
                <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
            </div>
        </form>
    `;

    UI.showModal(content);

    document.getElementById('createPermissionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: document.getElementById('permName').value,
                description: document.getElementById('permDescription').value,
                category: document.getElementById('permCategory').value,
                isActive: document.getElementById('permActive').checked
            };

            await api.createPermission(data);
            UI.showSuccess('Permission créée avec succès');
            UI.hideModal();
            await loadRoles();
        } catch (error) {
            UI.showError(error.message);
        }
    });
}
