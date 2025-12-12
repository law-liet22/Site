/**
 * Gestion des missions
 */

let currentMissions = [];

/**
 * Charger et afficher les missions
 */
async function loadMissions() {
    try {
        const search = document.getElementById('missionSearch')?.value || '';
        const status = document.getElementById('missionStatusFilter')?.value || '';
        const priority = document.getElementById('missionPriorityFilter')?.value || '';

        const params = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (priority) params.priority = priority;

        const response = await api.getMissions(params);
        currentMissions = response.data.missions;

        displayMissions(currentMissions);
    } catch (error) {
        console.error('Error loading missions:', error);
        UI.showError('Erreur lors du chargement des missions');
    }
}

/**
 * Afficher les missions
 */
function displayMissions(missions) {
    const container = document.getElementById('missionsList');
    container.innerHTML = '';

    if (missions.length === 0) {
        container.innerHTML = '<p>Aucune mission trouvée</p>';
        return;
    }

    missions.forEach(mission => {
        const card = UI.createElement(`
            <div class="data-card" data-mission-id="${mission._id}">
                <h3>${mission.title}</h3>
                <p><strong>Code:</strong> ${mission.code}</p>
                <p>${mission.description.substring(0, 150)}...</p>
                <p>${UI.getMissionStatusBadge(mission.status)} ${UI.getPriorityBadge(mission.priority)}</p>
                <p><strong>Localisation:</strong> ${mission.location?.name || 'Non définie'}</p>
                <p><strong>Escouade:</strong> ${mission.assignedSquad?.length || 0} agents</p>
            </div>
        `);
        card.addEventListener('click', () => showMissionDetails(mission._id));
        container.appendChild(card);
    });
}

/**
 * Afficher les détails d'une mission
 */
async function showMissionDetails(missionId) {
    try {
        const response = await api.getMission(missionId);
        const mission = response.data.mission;

        const content = `
            <h2>${mission.title}</h2>
            <p><strong>Code:</strong> ${mission.code}</p>
            <p>${UI.getMissionStatusBadge(mission.status)} ${UI.getPriorityBadge(mission.priority)}</p>
            <p><strong>Description:</strong> ${mission.description}</p>
            <p><strong>Localisation:</strong> ${mission.location.name}, ${mission.location.country}</p>
            <p><strong>Point d'entrée:</strong> ${mission.entryPoint.name} (${mission.entryPoint.type})</p>
            <p><strong>Point de sortie:</strong> ${mission.exitPoint.name} (${mission.exitPoint.type})</p>
            <p><strong>Équipements requis:</strong> ${mission.requiredEquipment.length}</p>
            <p><strong>Véhicules requis:</strong> ${mission.requiredVehicles.length}</p>
            <p><strong>Escouade:</strong> ${mission.assignedSquad.length} agents</p>
            ${mission.briefing ? `<p><strong>Briefing:</strong> ${mission.briefing}</p>` : ''}
            <div style="margin-top: 1rem;">
                ${auth.hasPermission('mission.update') ? '<button class="btn btn-primary" onclick="editMission(\'' + mission._id + '\')">Modifier</button>' : ''}
                ${auth.hasPermission('mission.delete') ? '<button class="btn btn-danger" onclick="deleteMission(\'' + mission._id + '\')">Supprimer</button>' : ''}
            </div>
        `;

        UI.showModal(content);
    } catch (error) {
        console.error('Error loading mission details:', error);
        UI.showError('Erreur lors du chargement des détails de la mission');
    }
}

/**
 * Initialiser les filtres et boutons des missions
 */
function initMissionsPage() {
    // Filtres
    document.getElementById('missionSearch')?.addEventListener('input', loadMissions);
    document.getElementById('missionStatusFilter')?.addEventListener('change', loadMissions);
    document.getElementById('missionPriorityFilter')?.addEventListener('change', loadMissions);

    // Bouton nouvelle mission
    document.getElementById('addMissionBtn')?.addEventListener('click', showMissionForm);
}

/**
 * Afficher le formulaire de création de mission
 */
async function showMissionForm(missionId = null) {
    try {
        // Charger les données nécessaires
        const [locationsResp, equipmentResp, vehiclesResp, usersResp] = await Promise.all([
            api.getLocations(),
            api.getEquipment(),
            api.getVehicles(),
            api.getUsers()
        ]);

        const mission = missionId ? (await api.getMission(missionId)).data.mission : null;

        const content = `
            <h2>${mission ? 'Modifier' : 'Créer'} une mission</h2>
            <form id="missionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre*</label>
                        <input type="text" name="title" required value="${mission?.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Code*</label>
                        <input type="text" name="code" required value="${mission?.code || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description*</label>
                    <textarea name="description" required>${mission?.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Localisation*</label>
                        <select name="locationId" required>
                            <option value="">Sélectionner...</option>
                            ${locationsResp.data.locations.map(loc => 
                                `<option value="${loc._id}" ${mission?.location?._id === loc._id ? 'selected' : ''}>${loc.name}, ${loc.country}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priorité*</label>
                        <select name="priority" required>
                            <option value="basse" ${mission?.priority === 'basse' ? 'selected' : ''}>Basse</option>
                            <option value="normale" ${mission?.priority === 'normale' ? 'selected' : ''}>Normale</option>
                            <option value="haute" ${mission?.priority === 'haute' ? 'selected' : ''}>Haute</option>
                            <option value="critique" ${mission?.priority === 'critique' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Point d'entrée*</label>
                        <input type="text" name="entryPointName" required value="${mission?.entryPoint?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Type d'entrée*</label>
                        <select name="entryPointType" required>
                            <option value="aerien" ${mission?.entryPoint?.type === 'aerien' ? 'selected' : ''}>Aérien</option>
                            <option value="terrestre" ${mission?.entryPoint?.type === 'terrestre' ? 'selected' : ''}>Terrestre</option>
                            <option value="maritime" ${mission?.entryPoint?.type === 'maritime' ? 'selected' : ''}>Maritime</option>
                            <option value="souterrain" ${mission?.entryPoint?.type === 'souterrain' ? 'selected' : ''}>Souterrain</option>
                            <option value="autre" ${mission?.entryPoint?.type === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Point de sortie*</label>
                        <input type="text" name="exitPointName" required value="${mission?.exitPoint?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Type de sortie*</label>
                        <select name="exitPointType" required>
                            <option value="aerien" ${mission?.exitPoint?.type === 'aerien' ? 'selected' : ''}>Aérien</option>
                            <option value="terrestre" ${mission?.exitPoint?.type === 'terrestre' ? 'selected' : ''}>Terrestre</option>
                            <option value="maritime" ${mission?.exitPoint?.type === 'maritime' ? 'selected' : ''}>Maritime</option>
                            <option value="souterrain" ${mission?.exitPoint?.type === 'souterrain' ? 'selected' : ''}>Souterrain</option>
                            <option value="autre" ${mission?.exitPoint?.type === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Briefing</label>
                    <textarea name="briefing">${mission?.briefing || ''}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Sauvegarder</button>
                <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
            </form>
        `;

        UI.showModal(content);

        // Gérer la soumission du formulaire
        document.getElementById('missionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                title: formData.get('title'),
                code: formData.get('code'),
                description: formData.get('description'),
                locationId: formData.get('locationId'),
                priority: formData.get('priority'),
                entryPoint: {
                    name: formData.get('entryPointName'),
                    type: formData.get('entryPointType')
                },
                exitPoint: {
                    name: formData.get('exitPointName'),
                    type: formData.get('exitPointType')
                },
                briefing: formData.get('briefing')
            };

            try {
                if (mission) {
                    await api.updateMission(mission._id, data);
                    UI.showSuccess('Mission mise à jour avec succès');
                } else {
                    await api.createMission(data);
                    UI.showSuccess('Mission créée avec succès');
                }
                UI.hideModal();
                loadMissions();
            } catch (error) {
                UI.showError(error.message);
            }
        });

    } catch (error) {
        console.error('Error showing mission form:', error);
        UI.showError('Erreur lors de l\'affichage du formulaire');
    }
}

/**
 * Modifier une mission
 */
function editMission(missionId) {
    UI.hideModal();
    showMissionForm(missionId);
}

/**
 * Supprimer une mission
 */
async function deleteMission(missionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
        return;
    }

    try {
        await api.deleteMission(missionId);
        UI.showSuccess('Mission supprimée avec succès');
        UI.hideModal();
        loadMissions();
    } catch (error) {
        UI.showError(error.message);
    }
}
