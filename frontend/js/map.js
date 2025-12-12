/**
 * Gestion de la carte interactive avec Leaflet
 */

let map = null;
let markersLayer = null;

/**
 * Initialiser la carte
 */
async function initMap() {
    // Ne créer la carte qu'une seule fois
    if (!map) {
        map = L.map('map').setView([39.8283, -98.5795], 4); // Centre sur les USA

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
    }

    // Charger les missions
    await loadMapMissions();
}

/**
 * Charger les missions sur la carte
 */
async function loadMapMissions() {
    try {
        const response = await api.getMissionLocations();
        const missions = response.data.missions;

        // Nettoyer les marqueurs existants
        if (markersLayer) {
            markersLayer.clearLayers();
        }

        // Définir les icônes selon le statut
        const getIcon = (status) => {
            const colors = {
                'brouillon': 'grey',
                'planifiee': 'blue',
                'en_cours': 'orange',
                'terminee': 'green',
                'annulee': 'red'
            };

            return L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${colors[status] || 'blue'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        };

        // Ajouter les marqueurs
        missions.forEach(mission => {
            const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], {
                icon: getIcon(mission.status)
            });

            marker.bindPopup(`
                <div style="text-align: center;">
                    <h3 style="margin: 0 0 10px 0;">${mission.title}</h3>
                    <p style="margin: 5px 0;"><strong>Code:</strong> ${mission.code}</p>
                    <p style="margin: 5px 0;"><strong>Localisation:</strong> ${mission.locationName}</p>
                    <p style="margin: 5px 0;">${UI.getMissionStatusBadge(mission.status)}</p>
                    <button class="btn btn-primary btn-sm" onclick="showMissionDetails('${mission.id}')" style="margin-top: 10px;">Détails</button>
                </div>
            `);

            marker.on('click', function() {
                marker.openPopup();
            });

            markersLayer.addLayer(marker);
        });

        // Ajuster la vue pour afficher tous les marqueurs
        if (missions.length > 0) {
            const bounds = L.latLngBounds(missions.map(m => [m.coordinates.lat, m.coordinates.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }

    } catch (error) {
        console.error('Error loading map missions:', error);
        UI.showError('Erreur lors du chargement de la carte');
    }
}
