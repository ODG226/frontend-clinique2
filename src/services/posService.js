import api from './api';

const posService = {
  // Créer une vente
  createVente: async (venteData) => {
    const response = await api.post('/pos/ventes', venteData);
    return response.data;
  },

  // Récupérer toutes les ventes
  getVentes: async (params = {}) => {
    const response = await api.get('/pos/ventes', { params });
    return response.data;
  },

  // Récupérer une vente par ID
  getVenteById: async (id) => {
    const response = await api.get(`/pos/ventes/${id}`);
    return response.data;
  },

  // Annuler une vente
  annulerVente: async (id) => {
    const response = await api.patch(`/pos/ventes/${id}/annuler`);
    return response.data;
  },

  // Rechercher des produits
  searchProduits: async (query) => {
    const response = await api.get('/pos/produits/search', { params: { q: query } });
    return response.data;
  },
};

export default posService;