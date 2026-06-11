import api from './api';

const chambreService = {
  // Obtenir toutes les chambres
  getAllChambres: async (params = {}) => {
    const response = await api.get('/chambres', { params });
    return response.data;
  },

  // Obtenir une chambre par ID
  getChambreById: async (id) => {
    const response = await api.get(`/chambres/${id}`);
    return response.data;
  },

  // Créer une chambre
  createChambre: async (chambreData) => {
    const response = await api.post('/chambres', chambreData);
    return response.data;
  },

  // Mettre à jour une chambre
  updateChambre: async (id, chambreData) => {
    const response = await api.put(`/chambres/${id}`, chambreData);
    return response.data;
  },

  // Supprimer une chambre
  deleteChambre: async (id) => {
    const response = await api.delete(`/chambres/${id}`);
    return response.data;
  },

  // Obtenir les statistiques d'occupation
  getStats: async () => {
    const response = await api.get('/chambres/stats');
    return response.data;
  },
};

export default chambreService;