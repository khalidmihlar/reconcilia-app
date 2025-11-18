const API_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTH API ====================

export const authAPI = {
    login: async (email, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: async (email, password, firstName, lastName) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, firstName, lastName }),
        });
    },
};

// ==================== PATIENT API ====================

export const patientAPI = {
    getAll: async (doctorId) => {
        return apiCall(`/patients?doctorId=${doctorId}`);
    },

    getById: async (patientId) => {
        return apiCall(`/patients/${patientId}`);
    },

    create: async (doctorId, patientData) => {
        return apiCall('/patients', {
            method: 'POST',
            body: JSON.stringify({ doctorId, ...patientData }),
        });
    },

    update: async (patientId, patientData) => {
        return apiCall(`/patients/${patientId}`, {
            method: 'PUT',
            body: JSON.stringify(patientData),
        });
    },

    delete: async (patientId) => {
        return apiCall(`/patients/${patientId}`, {
            method: 'DELETE',
        });
    },
};

// ==================== MEDICATION API ====================

export const medicationAPI = {
    getAllByPatient: async (patientId) => {
        return apiCall(`/patients/${patientId}/medications`);
    },

    getById: async (medicationId) => {
        return apiCall(`/medications/${medicationId}`);
    },

    create: async (patientId, medicationData) => {
        return apiCall(`/patients/${patientId}/medications`, {
            method: 'POST',
            body: JSON.stringify(medicationData),
        });
    },

    update: async (medicationId, medicationData) => {
        return apiCall(`/medications/${medicationId}`, {
            method: 'PUT',
            body: JSON.stringify(medicationData),
        });
    },

    delete: async (medicationId) => {
        return apiCall(`/medications/${medicationId}`, {
            method: 'DELETE',
        });
    },
};

export default { authAPI, patientAPI, medicationAPI };