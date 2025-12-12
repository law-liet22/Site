/**
 * API Client pour U2I
 * Gère toutes les communications avec le backend
 */

const API_BASE_URL = window.location.origin + '/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    /**
     * Méthode générique pour les requêtes HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        // Ajouter le token d'authentification si disponible
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Méthodes GET
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Méthodes POST
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Méthodes PUT
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Méthodes DELETE
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Définir le token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * Supprimer le token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // ============ AUTHENTIFICATION ============

    async login(login, password) {
        const data = await this.post('/auth/login', { login, password });
        if (data.success && data.data.token) {
            this.setToken(data.data.token);
        }
        return data;
    }

    async logout() {
        await this.post('/auth/logout', {});
        this.clearToken();
    }

    async getMe() {
        return this.get('/auth/me');
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', { currentPassword, newPassword });
    }

    // ============ UTILISATEURS ============

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/users${query ? '?' + query : ''}`);
    }

    async getUser(id) {
        return this.get(`/users/${id}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async toggleUserActive(id) {
        return this.put(`/users/${id}/toggle-active`, {});
    }

    // ============ MISSIONS ============

    async getMissions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/missions${query ? '?' + query : ''}`);
    }

    async getMission(id) {
        return this.get(`/missions/${id}`);
    }

    async createMission(missionData) {
        return this.post('/missions', missionData);
    }

    async updateMission(id, missionData) {
        return this.put(`/missions/${id}`, missionData);
    }

    async deleteMission(id) {
        return this.delete(`/missions/${id}`);
    }

    async getMissionLocations() {
        return this.get('/missions/map/locations');
    }

    // ============ ÉQUIPEMENTS ============

    async getEquipment(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/equipment${query ? '?' + query : ''}`);
    }

    async getEquipmentItem(id) {
        return this.get(`/equipment/${id}`);
    }

    async createEquipment(equipmentData) {
        return this.post('/equipment', equipmentData);
    }

    async updateEquipment(id, equipmentData) {
        return this.put(`/equipment/${id}`, equipmentData);
    }

    async deleteEquipment(id) {
        return this.delete(`/equipment/${id}`);
    }

    // ============ VÉHICULES ============

    async getVehicles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/vehicles${query ? '?' + query : ''}`);
    }

    async getVehicle(id) {
        return this.get(`/vehicles/${id}`);
    }

    async createVehicle(vehicleData) {
        return this.post('/vehicles', vehicleData);
    }

    async updateVehicle(id, vehicleData) {
        return this.put(`/vehicles/${id}`, vehicleData);
    }

    async deleteVehicle(id) {
        return this.delete(`/vehicles/${id}`);
    }

    // ============ LOCALISATIONS ============

    async getLocations(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/locations${query ? '?' + query : ''}`);
    }

    async createLocation(locationData) {
        return this.post('/locations', locationData);
    }

    async updateLocation(id, locationData) {
        return this.put(`/locations/${id}`, locationData);
    }

    async deleteLocation(id) {
        return this.delete(`/locations/${id}`);
    }

    // ============ RÔLES ============

    async getRoles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/roles${query ? '?' + query : ''}`);
    }

    async getRole(id) {
        return this.get(`/roles/${id}`);
    }

    async createRole(roleData) {
        return this.post('/roles', roleData);
    }

    async updateRole(id, roleData) {
        return this.put(`/roles/${id}`, roleData);
    }

    async deleteRole(id) {
        return this.delete(`/roles/${id}`);
    }

    async updateRolePermissions(id, permissions) {
        return this.put(`/roles/${id}/permissions`, { permissions });
    }

    // ============ PERMISSIONS ============

    async getPermissions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/permissions${query ? '?' + query : ''}`);
    }

    async createPermission(permissionData) {
        return this.post('/permissions', permissionData);
    }

    async updatePermission(id, permissionData) {
        return this.put(`/permissions/${id}`, permissionData);
    }

    async deletePermission(id) {
        return this.delete(`/permissions/${id}`);
    }

    async togglePermission(id) {
        return this.put(`/permissions/${id}/toggle`, {});
    }

    // ============ PARAMÈTRES ============

    async getSettings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/settings${query ? '?' + query : ''}`);
    }

    async getSetting(key) {
        return this.get(`/settings/${key}`);
    }

    async createSetting(settingData) {
        return this.post('/settings', settingData);
    }

    async updateSetting(key, settingData) {
        return this.put(`/settings/${key}`, settingData);
    }

    async deleteSetting(key) {
        return this.delete(`/settings/${key}`);
    }
}

// Instance globale de l'API
const api = new APIClient();
