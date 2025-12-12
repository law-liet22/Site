/**
 * Gestion des équipements
 */

async function loadEquipment() {
    try {
        const search = document.getElementById('equipmentSearch')?.value || '';
        const category = document.getElementById('equipmentCategoryFilter')?.value || '';

        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;

        const response = await api.getEquipment(params);
        displayEquipment(response.data.equipment);
    } catch (error) {
        console.error('Error loading equipment:', error);
        UI.showError('Erreur lors du chargement des équipements');
    }
}

function displayEquipment(equipment) {
    const container = document.getElementById('equipmentList');
    container.innerHTML = '';

    if (equipment.length === 0) {
        container.innerHTML = '<p>Aucun équipement trouvé</p>';
        return;
    }

    equipment.forEach(item => {
        const card = UI.createElement(`
            <div class="data-card">
                <h3>${item.name}</h3>
                <p><strong>Code:</strong> ${item.code}</p>
                <p><strong>Catégorie:</strong> ${item.category}</p>
                <p>${item.description}</p>
                <p><strong>Quantité:</strong> ${item.quantity}</p>
                <p>${item.isAvailable ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">Indisponible</span>'}</p>
            </div>
        `);
        container.appendChild(card);
    });
}

function initEquipmentPage() {
    document.getElementById('equipmentSearch')?.addEventListener('input', loadEquipment);
    document.getElementById('equipmentCategoryFilter')?.addEventListener('change', loadEquipment);
    document.getElementById('addEquipmentBtn')?.addEventListener('click', () => {
        // Fonction de création d'équipement (à implémenter)
        UI.showError('Fonctionnalité en développement');
    });
}
