import api from './api';

const rdvService = {
  // Obtenir tous les rendez-vous
  getAllRendezVous: async (params = {}) => {
    const response = await api.get('/rendez-vous', { params });
    return response.data;
  },

  // Obtenir un rendez-vous par ID
  getRendezVousById: async (id) => {
    const response = await api.get(`/rendez-vous/${id}`);
    return response.data;
  },

  // Créer un rendez-vous
  createRendezVous: async (rdvData) => {
    const response = await api.post('/rendez-vous', rdvData);
    return response.data;
  },

  // Mettre à jour le statut d'un rendez-vous
  updateRendezVousStatus: async (id, statut) => {
    const response = await api.patch(`/rendez-vous/${id}/statut`, { statut });
    return response.data;
  },

  // Supprimer un rendez-vous
  deleteRendezVous: async (id) => {
    const response = await api.delete(`/rendez-vous/${id}`);
    return response.data;
  },
};

export default rdvService;