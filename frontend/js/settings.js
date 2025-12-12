/**
 * Gestion des paramètres système
 */

async function loadSettings() {
    if (!auth.isAdmin()) {
        return;
    }

    try {
        const response = await api.getSettings();
        displaySettings(response.data.grouped);
    } catch (error) {
        console.error('Error loading settings:', error);
        UI.showError('Erreur lors du chargement des paramètres');
    }
}

function displaySettings(groupedSettings) {
    const container = document.getElementById('settingsList');
    container.innerHTML = '';

    Object.keys(groupedSettings).forEach(category => {
        const section = UI.createElement(`
            <div style="margin-bottom: 2rem;">
                <h3 style="text-transform: capitalize; margin-bottom: 1rem;">${getCategoryLabel(category)}</h3>
                <div id="settings-${category}"></div>
            </div>
        `);
        
        const settingsContainer = section.querySelector(`#settings-${category}`);
        groupedSettings[category].forEach(setting => {
            const settingEl = UI.createElement(`
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-color); margin: 0.5rem 0; border-radius: 5px;">
                    <div>
                        <strong>${setting.key}</strong>
                        <p style="margin: 0.5rem 0; color: var(--text-light);">${setting.description || 'Aucune description'}</p>
                        <p style="margin: 0;"><strong>Valeur:</strong> ${JSON.stringify(setting.value)}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${setting.isModifiable ? `
                            <button class="btn btn-sm btn-primary" onclick="editSetting('${setting.key}')">Modifier</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSetting('${setting.key}')">Supprimer</button>
                        ` : '<span class="badge badge-secondary">Non modifiable</span>'}
                    </div>
                </div>
            `);
            settingsContainer.appendChild(settingEl);
        });
        
        container.appendChild(section);
    });
}

function getCategoryLabel(category) {
    const labels = {
        'general': 'Général',
        'security': 'Sécurité',
        'appearance': 'Apparence',
        'notifications': 'Notifications',
        'system': 'Système'
    };
    return labels[category] || category;
}

function initSettingsPage() {
    document.getElementById('addSettingBtn')?.addEventListener('click', showCreateSettingForm);
}

async function showCreateSettingForm() {
    const content = `
        <h2>Créer un paramètre</h2>
        <form id="createSettingForm" style="max-width: 600px;">
            <div class="form-group">
                <label for="settingKey">Clé *</label>
                <input type="text" id="settingKey" class="form-control" required placeholder="ex: app.maintenance_mode">
            </div>
            <div class="form-group">
                <label for="settingValue">Valeur *</label>
                <input type="text" id="settingValue" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="settingDescription">Description</label>
                <textarea id="settingDescription" class="form-control" rows="2"></textarea>
            </div>
            <div class="form-group">
                <label for="settingCategory">Catégorie *</label>
                <select id="settingCategory" class="form-control" required>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="general">Général</option>
                    <option value="security">Sécurité</option>
                    <option value="appearance">Apparence</option>
                    <option value="notifications">Notifications</option>
                    <option value="system">Système</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="settingModifiable" checked>
                    Modifiable
                </label>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Créer</button>
                <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
            </div>
        </form>
    `;

    UI.showModal(content);

    document.getElementById('createSettingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            let value = document.getElementById('settingValue').value;
            
            // Essayer de parser comme JSON
            try {
                value = JSON.parse(value);
            } catch {
                // Garder comme string si ce n'est pas du JSON valide
            }

            const data = {
                key: document.getElementById('settingKey').value,
                value: value,
                description: document.getElementById('settingDescription').value,
                category: document.getElementById('settingCategory').value,
                isModifiable: document.getElementById('settingModifiable').checked
            };

            await api.createSetting(data);
            UI.showSuccess('Paramètre créé avec succès');
            UI.hideModal();
            await loadSettings();
        } catch (error) {
            UI.showError(error.message);
        }
    });
}

async function editSetting(key) {
    try {
        const response = await api.getSettings();
        const setting = response.data.settings.find(s => s.key === key);

        if (!setting) {
            UI.showError('Paramètre introuvable');
            return;
        }

        const content = `
            <h2>Modifier le paramètre</h2>
            <form id="editSettingForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="settingKey">Clé *</label>
                    <input type="text" id="settingKey" class="form-control" value="${setting.key}" disabled>
                </div>
                <div class="form-group">
                    <label for="settingValue">Valeur *</label>
                    <input type="text" id="settingValue" class="form-control" value="${JSON.stringify(setting.value)}" required>
                </div>
                <div class="form-group">
                    <label for="settingDescription">Description</label>
                    <textarea id="settingDescription" class="form-control" rows="2">${setting.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="settingCategory">Catégorie *</label>
                    <select id="settingCategory" class="form-control" required>
                        <option value="general" ${setting.category === 'general' ? 'selected' : ''}>Général</option>
                        <option value="security" ${setting.category === 'security' ? 'selected' : ''}>Sécurité</option>
                        <option value="appearance" ${setting.category === 'appearance' ? 'selected' : ''}>Apparence</option>
                        <option value="notifications" ${setting.category === 'notifications' ? 'selected' : ''}>Notifications</option>
                        <option value="system" ${setting.category === 'system' ? 'selected' : ''}>Système</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="settingModifiable" ${setting.isModifiable ? 'checked' : ''}>
                        Modifiable
                    </label>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('editSettingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                let value = document.getElementById('settingValue').value;
                
                // Essayer de parser comme JSON
                try {
                    value = JSON.parse(value);
                } catch {
                    // Garder comme string si ce n'est pas du JSON valide
                }

                const data = {
                    value: value,
                    description: document.getElementById('settingDescription').value,
                    category: document.getElementById('settingCategory').value,
                    isModifiable: document.getElementById('settingModifiable').checked
                };

                await api.updateSetting(key, data);
                UI.showSuccess('Paramètre mis à jour avec succès');
                UI.hideModal();
                await loadSettings();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function deleteSetting(key) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
        return;
    }

    try {
        await api.deleteSetting(key);
        UI.showSuccess('Paramètre supprimé avec succès');
        await loadSettings();
    } catch (error) {
        UI.showError(error.message);
    }
}
