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
            <div class="data-card" style="cursor: pointer;">
                <h3>${role.displayName}</h3>
                <p><strong>Nom système:</strong> ${role.name}</p>
                <p><strong>Niveau:</strong> ${role.level}</p>
                <p><strong>Permissions:</strong> ${role.permissions.length}</p>
                <p>${role.isActive ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Inactif</span>'}</p>
                ${role.isSystemRole ? '<p><span class="badge badge-info">Rôle système</span></p>' : ''}
            </div>
        `);
        card.addEventListener('click', () => showRoleDetails(role._id));
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
    document.getElementById('addRoleBtn')?.addEventListener('click', () => {
        UI.showError('Fonctionnalité en développement');
    });
    
    document.getElementById('addPermissionBtn')?.addEventListener('click', () => {
        UI.showError('Fonctionnalité en développement');
    });
}

function editRole(roleId) {
    UI.showError('Fonctionnalité en développement');
}
