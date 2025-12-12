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
            <div class="data-card">
                <h3>${vehicle.name}</h3>
                <p><strong>Code:</strong> ${vehicle.code}</p>
                <p><strong>Type:</strong> ${vehicle.type}</p>
                ${vehicle.model ? `<p><strong>Modèle:</strong> ${vehicle.model}</p>` : ''}
                <p><strong>Capacité:</strong> ${vehicle.capacity} personnes</p>
                <p>${UI.getVehicleStatusBadge(vehicle.status)}</p>
            </div>
        `);
        container.appendChild(card);
    });
}

function initVehiclesPage() {
    document.getElementById('vehicleSearch')?.addEventListener('input', loadVehicles);
    document.getElementById('vehicleTypeFilter')?.addEventListener('change', loadVehicles);
    document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
        UI.showError('Fonctionnalité en développement');
    });
}
