/**
 * Gestion complète des équipements
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
            <div class="data-card" style="cursor: pointer;">
                <h3>${item.name}</h3>
                <p><strong>Code:</strong> ${item.code}</p>
                <p><strong>Catégorie:</strong> ${item.category}</p>
                <p>${item.description}</p>
                <p><strong>Quantité:</strong> ${item.quantity}</p>
                <p>${item.isAvailable ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">Indisponible</span>'}</p>
            </div>
        `);
        card.addEventListener('click', () => showEquipmentDetails(item._id));
        container.appendChild(card);
    });
}

async function showEquipmentDetails(equipmentId) {
    try {
        const response = await api.getEquipment({ _id: equipmentId });
        const item = response.data.equipment[0];

        const specsHtml = item.specifications ? `<p><strong>Spécifications:</strong> ${JSON.stringify(item.specifications)}</p>` : '';
        const buttonsHtml = auth.canManageEquipment() ? `
                    <button class="btn btn-primary" onclick="editEquipment('${item._id}')">Modifier</button>
                    <button class="btn btn-danger" onclick="deleteEquipment('${item._id}')">Supprimer</button>
                ` : '';
        
        const content = `
            <h2>${item.name}</h2>
            <p><strong>Code:</strong> ${item.code}</p>
            <p><strong>Catégorie:</strong> ${item.category}</p>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Quantité:</strong> ${item.quantity}</p>
            <p>${item.isAvailable ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">Indisponible</span>'}</p>
            ${specsHtml}
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                ${buttonsHtml}
                <button class="btn btn-secondary" onclick="UI.hideModal()">Fermer</button>
            </div>
        `;

        UI.showModal(content);
    } catch (error) {
        UI.showError(error.message);
    }
}

async function showCreateEquipmentForm() {
    const content = `
        <h2>Créer un équipement</h2>
        <form id="createEquipmentForm" style="max-width: 600px;">
            <div class="form-group">
                <label for="equipmentName">Nom *</label>
                <input type="text" id="equipmentName" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="equipmentCode">Code *</label>
                <input type="text" id="equipmentCode" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="equipmentCategory">Catégorie *</label>
                <select id="equipmentCategory" class="form-control" required>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="arme">Arme</option>
                    <option value="protection">Protection</option>
                    <option value="communication">Communication</option>
                    <option value="medical">Médical</option>
                    <option value="surveillance">Surveillance</option>
                    <option value="autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label for="equipmentDescription">Description</label>
                <textarea id="equipmentDescription" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="equipmentQuantity">Quantité *</label>
                <input type="number" id="equipmentQuantity" class="form-control" min="0" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="equipmentAvailable" checked>
                    Disponible
                </label>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Créer</button>
                <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
            </div>
        </form>
    `;

    UI.showModal(content);

    document.getElementById('createEquipmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createEquipment();
    });
}

async function createEquipment() {
    try {
        const data = {
            name: document.getElementById('equipmentName').value,
            code: document.getElementById('equipmentCode').value,
            category: document.getElementById('equipmentCategory').value,
            description: document.getElementById('equipmentDescription').value,
            quantity: parseInt(document.getElementById('equipmentQuantity').value),
            isAvailable: document.getElementById('equipmentAvailable').checked
        };

        await api.createEquipment(data);
        UI.showSuccess('Équipement créé avec succès');
        UI.hideModal();
        await loadEquipment();
    } catch (error) {
        UI.showError(error.message);
    }
}

async function editEquipment(equipmentId) {
    try {
        const response = await api.getEquipment({ _id: equipmentId });
        const item = response.data.equipment[0];

        const content = `
            <h2>Modifier l'équipement</h2>
            <form id="editEquipmentForm" style="max-width: 600px;">
                <div class="form-group">
                    <label for="equipmentName">Nom *</label>
                    <input type="text" id="equipmentName" class="form-control" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label for="equipmentCode">Code *</label>
                    <input type="text" id="equipmentCode" class="form-control" value="${item.code}" required>
                </div>
                <div class="form-group">
                    <label for="equipmentCategory">Catégorie *</label>
                    <select id="equipmentCategory" class="form-control" required>
                        <option value="arme" ${item.category === 'arme' ? 'selected' : ''}>Arme</option>
                        <option value="protection" ${item.category === 'protection' ? 'selected' : ''}>Protection</option>
                        <option value="communication" ${item.category === 'communication' ? 'selected' : ''}>Communication</option>
                        <option value="medical" ${item.category === 'medical' ? 'selected' : ''}>Médical</option>
                        <option value="surveillance" ${item.category === 'surveillance' ? 'selected' : ''}>Surveillance</option>
                        <option value="autre" ${item.category === 'autre' ? 'selected' : ''}>Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="equipmentDescription">Description</label>
                    <textarea id="equipmentDescription" class="form-control" rows="3">${item.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="equipmentQuantity">Quantité *</label>
                    <input type="number" id="equipmentQuantity" class="form-control" value="${item.quantity}" min="0" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="equipmentAvailable" ${item.isAvailable ? 'checked' : ''}>
                        Disponible
                    </label>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Annuler</button>
                </div>
            </form>
        `;

        UI.showModal(content);

        document.getElementById('editEquipmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateEquipment(equipmentId);
        });
    } catch (error) {
        UI.showError(error.message);
    }
}

async function updateEquipment(equipmentId) {
    try {
        const data = {
            name: document.getElementById('equipmentName').value,
            code: document.getElementById('equipmentCode').value,
            category: document.getElementById('equipmentCategory').value,
            description: document.getElementById('equipmentDescription').value,
            quantity: parseInt(document.getElementById('equipmentQuantity').value),
            isAvailable: document.getElementById('equipmentAvailable').checked
        };

        await api.updateEquipment(equipmentId, data);
        UI.showSuccess('Équipement mis à jour avec succès');
        UI.hideModal();
        await loadEquipment();
    } catch (error) {
        UI.showError(error.message);
    }
}

async function deleteEquipment(equipmentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
        return;
    }

    try {
        await api.deleteEquipment(equipmentId);
        UI.showSuccess('Équipement supprimé avec succès');
        UI.hideModal();
        await loadEquipment();
    } catch (error) {
        UI.showError(error.message);
    }
}

function initEquipmentPage() {
    document.getElementById('equipmentSearch')?.addEventListener('input', loadEquipment);
    document.getElementById('equipmentCategoryFilter')?.addEventListener('change', loadEquipment);
    document.getElementById('addEquipmentBtn')?.addEventListener('click', showCreateEquipmentForm);
}
