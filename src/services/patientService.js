import api from './api';

const patientService = {
  // Obtenir tous les patients
  getAllPatients: async (params = {}) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  // Obtenir un patient par ID
  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Créer un patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Mettre à jour un patient
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Supprimer un patient
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

export default patientService;