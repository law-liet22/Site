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
                <div class="setting-item">
                    <div>
                        <strong>${setting.key}</strong>
                        <p style="margin: 0.5rem 0; color: var(--text-light);">${setting.description || 'Aucune description'}</p>
                        <p style="margin: 0;"><strong>Valeur:</strong> ${JSON.stringify(setting.value)}</p>
                    </div>
                    <div>
                        ${setting.isModifiable ? '<button class="btn btn-sm btn-primary" onclick="editSetting(\'' + setting.key + '\')">Modifier</button>' : '<span class="badge badge-secondary">Non modifiable</span>'}
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
    document.getElementById('addSettingBtn')?.addEventListener('click', () => {
        UI.showError('Fonctionnalité en développement');
    });
}

function editSetting(key) {
    UI.showError('Fonctionnalité en développement');
}
