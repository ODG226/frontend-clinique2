import api from './api';

const consultationService = {
  // Obtenir toutes les consultations
  getAllConsultations: async (params = {}) => {
    const response = await api.get('/consultations', { params });
    return response.data;
  },

  // Obtenir une consultation par ID
  getConsultationById: async (id) => {
    const response = await api.get(`/consultations/${id}`);
    return response.data;
  },

  // Créer une consultation
  createConsultation: async (consultationData) => {
    const response = await api.post('/consultations', consultationData);
    return response.data;
  },

  // Mettre à jour une consultation
  updateConsultation: async (id, consultationData) => {
    const response = await api.put(`/consultations/${id}`, consultationData);
    return response.data;
  },
};

export default consultationService;