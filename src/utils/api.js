const API_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        console.log(`API Call: ${options.method || 'GET'} ${API_URL}${endpoint}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();
        console.log(`API Response:`, data);

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
        console.log('Fetching all patients for doctor:', doctorId);
        return apiCall(`/patients?doctorId=${doctorId}`);
    },

    getById: async (patientId) => {
        console.log('Fetching patient:', patientId);
        return apiCall(`/patients/${patientId}`);
    },

    create: async (doctorId, patientData) => {
        console.log('Creating patient:', { doctorId, ...patientData });
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

    saveDraft: async (patientId, medicationStatuses, checklist) => {
        console.log('Saving draft for patient:', patientId, medicationStatuses, checklist);
        return apiCall(`/patients/${patientId}/save-draft`, {
            method: 'POST',
            body: JSON.stringify({ medicationStatuses, checklist }),
        });
    },

    // NEW: Mark patient as reconciled
    markReconciled: async (patientId) => {
        console.log('Marking patient as reconciled:', patientId);
        return apiCall(`/patients/${patientId}/reconcile`, {
            method: 'POST',
        });
    },
};

// ==================== MEDICATION API ====================

export const medicationAPI = {
    getAllByPatient: async (patientId) => {
        console.log('Fetching medications for patient:', patientId);
        return apiCall(`/patients/${patientId}/medications`);
    },

    getById: async (medicationId) => {
        return apiCall(`/medications/${medicationId}`);
    },

    create: async (patientId, medicationData) => {
        console.log('Creating medication:', { patientId, ...medicationData });
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

    checkIfDeleted: async (patientId, medicationName) => {
        return apiCall(`/patients/${patientId}/medications/check-deleted/${encodeURIComponent(medicationName)}`);
    },

    delete: async (medicationId) => {
        return apiCall(`/medications/${medicationId}`, {
            method: 'DELETE',
        });
    },

    updateStatus: async (medicationId, status, archiveReason, archiveComments) => {
        return apiCall(`/medications/${medicationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, archiveReason, archiveComments }),
        });
    },

    updateIsTaking: async (medicationId, isTaking) => {
        console.log('Updating medication taking status:', medicationId, isTaking);
        return apiCall(`/medications/${medicationId}/taking`, {
            method: 'PATCH',
            body: JSON.stringify({ isTaking }),
        });
    },

    updateArchiveInfo: async (medicationId, { archiveReason, archiveComments }) => {
        return apiCall(`/medications/${medicationId}/archive-info`, {
            method: 'PATCH',
            body: JSON.stringify({ archiveReason, archiveComments }),
        });
    },

    getActive: async (patientId) => {
        return apiCall(`/patients/${patientId}/medications/active`);
    },

    getArchived: async (patientId) => {
        return apiCall(`/patients/${patientId}/medications/archived`);
    },
};

// ==================== MEDICATION CATALOG API ====================

export const medicationCatalogAPI = {
    getAll: async () => {
        console.log('Fetching medication catalog');
        return apiCall('/medication-catalog');
    },

    search: async (query) => {
        console.log('Searching medications:', query);
        return apiCall(`/medication-catalog/search?query=${encodeURIComponent(query)}`);
    },
};

export default { authAPI, patientAPI, medicationAPI, medicationCatalogAPI };