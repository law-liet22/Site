/**
 * Gestion des véhicules
 */

async function loadVehicles() {
    try {
        const search = document.getElementById('vehicleSearch')?.value || '';
        const type = document.getElementById('vehicleTypeFilter')?.value || '';

        const params = {};
        if (search) params.search = search;
        if (type) params.type = type;

        const response = await api.getVehicles(params);
        displayVehicles(response.data.vehicles);
    } catch (error) {
        console.error('Error loading vehicles:', error);
        UI.showError('Erreur lors du chargement des véhicules');
    }
}

function displayVehicles(vehicles) {
    const container = document.getElementById('vehiclesList');
    container.innerHTML = '';

    if (vehicles.length === 0) {
        container.innerHTML = '<p>Aucun véhicule trouvé</p>';
        return;
    }

    vehicles.forEach(vehicle => {
        const card = UI.createElement(`
            <div class="data-card" style="cursor: pointer;">
                <h3>${vehicle.name}</h3>
                <p><strong>Code:</strong> ${vehicle.code}</p>
                <p><strong>Type:</strong> ${vehicle.type}</p>
                ${vehicle.model ? `<p><strong>Modèle:</strong> ${vehicle.model}</p>` : ''}
                <p><strong>Capacité:</strong> ${vehicle.capacity} personnes</p>
                <p>${UI.getVehicleStatusBadge(vehicle.status)}</p>
            </div>
        `);
        card.addEventListener('click', () => showVehicleDetails(vehicle._id));
        container.appendChild(card);
    });
}

function initVehiclesPage() {
    document.getElementById('vehicleSearch')?.addEventListener('input', loadVehicles);
    document.getElementById('vehicleTypeFilter')?.addEventListener('change', loadVehicles);
    document.getElementById('addVehicleBtn')?.addEventListener('click', showCreateVehicleForm);
}

async function showCreateVehicleForm() {
    const content = `
        <h2>Créer un véhicule</h2>
        <form id="createVehicleForm" style="max-width: 600px;">
            <div class="form-group">
                <label for="vehicleName">Nom *</label>
                <input type="text" id="vehicleName" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="vehicleCode">Code *</label>
                <input type="text" id="vehicleCode" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="vehicleType">Type *</label>
                <select id="vehicleType" class="form-control" required>
                    <option value="">Sélectionner un type</option>
                    <option value="terrestre">Terrestre</option>
                    <option value="aerien">Aérien</option>
                    <option value="maritime">Maritime</option>
                    <option value="special">Spécial</option>
                </select>
            </div>
            <div class="form-group">
                <label for="vehicleModel">Modèle</label>
                <input type="text" id="vehicleModel" class="form-control">
            </div>
            <div class="form-group">
                <label for="vehicleCapacity">Capacité (personnes) *</label>
                <input type="number" id="vehicleCapacity" class="form-control" min="1" required>
            </div>
            <div class="form-group">
                <label for="vehicleStatus">Statut *</label>
                <select id="vehicleStatus" class="form-control" required>
                    <option value="disponible">Disponible</option>
                    <option value="en_mission">En mission</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hors_service">Hors service</option>
                </select>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Créer</button>
                <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
            </div>
        </form>
    `;

    UI.showModal(content);

    document.getElementById('createVehicleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: document.getElementById('vehicleName').value,
                code: document.getElementById('vehicleCode').value,
                type: document.getElementById('vehicleType').value,
                model: document.getElementById('vehicleModel').value,
                capacity: parseInt(document.getElementById('vehicleCapacity').value),
                status: document.getElementById('vehicleStatus').value
            };

            await api.createVehicle(data);
            UI.showSuccess('Véhicule créé avec succès');
            UI.hideModal();
            await loadVehicles();
        } catch (error) {
            UI.showError(error.message);
        }
    });
}

async function editVehicle(vehicleId) {
    try {
        const response = await api.getVehicles({ _id: vehicleId });
        const vehicle = response.data.vehicles[0];

        const content = `
            <h2>Modifier le véhicule</h2>
            <form id="editVehicleForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="vehicleName">Nom *</label>
                    <input type="text" id="vehicleName" class="form-control" value="${vehicle.name}" required>
                </div>
                <div class="form-group">
                    <label for="vehicleCode">Code *</label>
                    <input type="text" id="vehicleCode" class="form-control" value="${vehicle.code}" required>
                </div>
                <div class="form-group">
                    <label for="vehicleType">Type *</label>
                    <select id="vehicleType" class="form-control" required>
                        <option value="terrestre" ${vehicle.type === 'terrestre' ? 'selected' : ''}>Terrestre</option>
                        <option value="aerien" ${vehicle.type === 'aerien' ? 'selected' : ''}>Aérien</option>
                        <option value="maritime" ${vehicle.type === 'maritime' ? 'selected' : ''}>Maritime</option>
                        <option value="special" ${vehicle.type === 'special' ? 'selected' : ''}>Spécial</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="vehicleModel">Modèle</label>
                    <input type="text" id="vehicleModel" class="form-control" value="${vehicle.model || ''}">
                </div>
                <div class="form-group">
                    <label for="vehicleCapacity">Capacité (personnes) *</label>
                    <input type="number" id="vehicleCapacity" class="form-control" value="${vehicle.capacity}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="vehicleStatus">Statut *</label>
                    <select id="vehicleStatus" class="form-control" required>
                        <option value="disponible" ${vehicle.status === 'disponible' ? 'selected' : ''}>Disponible</option>
                        <option value="en_mission" ${vehicle.status === 'en_mission' ? 'selected' : ''}>En mission</option>
                        <option value="maintenance" ${vehicle.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="hors_service" ${vehicle.status === 'hors_service' ? 'selected' : ''}>Hors service</option>
                    </select>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const data = {
                    name: document.getElementById('vehicleName').value,
                    code: document.getElementById('vehicleCode').value,
                    type: document.getElementById('vehicleType').value,
                    model: document.getElementById('vehicleModel').value,
                    capacity: parseInt(document.getElementById('vehicleCapacity').value),
                    status: document.getElementById('vehicleStatus').value
                };

                await api.updateVehicle(vehicleId, data);
                UI.showSuccess('Véhicule mis à jour avec succès');
                UI.hideModal();
                await loadVehicles();
            } catch (error) {
                UI.showError(error.message);
            }
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
        return;
    }

    try {
        await api.deleteVehicle(vehicleId);
        UI.showSuccess('Véhicule supprimé avec succès');
        UI.hideModal();
        await loadVehicles();
    } catch (error) {
        UI.showError(error.message);
    }
}

async function showVehicleDetails(vehicleId) {
    try {
        const response = await api.getVehicles({ _id: vehicleId });
        const vehicle = response.data.vehicles[0];

        const content = `
            <h2>${vehicle.name}</h2>
            <p><strong>Code:</strong> ${vehicle.code}</p>
            <p><strong>Type:</strong> ${vehicle.type}</p>
            ${vehicle.model ? `<p><strong>Modèle:</strong> ${vehicle.model}</p>` : ''}
            <p><strong>Capacité:</strong> ${vehicle.capacity} personnes</p>
            <p>${UI.getVehicleStatusBadge(vehicle.status)}</p>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                ${auth.canManageVehicles() ? `
                    <button class="btn btn-primary" onclick="editVehicle('${vehicle._id}')">Modifier</button>
                    <button class="btn btn-danger" onclick="deleteVehicle('${vehicle._id}')">Supprimer</button>
                ` : ''}
                <button class="btn btn-secondary" onclick="UI.hideModal()">Fermer</button>
            </div>
        `;

        UI.showModal(content);
    } catch (error) {
        UI.showError(error.message);
    }
}
