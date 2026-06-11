import api from './api';

const produitService = {
  // Obtenir tous les produits
  getAllProduits: async (params = {}) => {
    const response = await api.get('/produits', { params });
    return response.data;
  },

  // Obtenir un produit par ID
  getProduitById: async (id) => {
    const response = await api.get(`/produits/${id}`);
    return response.data;
  },

  // Créer un produit
  createProduit: async (produitData) => {
    const response = await api.post('/produits', produitData);
    return response.data;
  },

  // Mettre à jour un produit
  updateProduit: async (id, produitData) => {
    const response = await api.put(`/produits/${id}`, produitData);
    return response.data;
  },

  // Ajuster le stock
  ajusterStock: async (id, stockData) => {
    const response = await api.patch(`/produits/${id}/stock`, stockData);
    return response.data;
  },

  // Supprimer un produit
  deleteProduit: async (id) => {
    const response = await api.delete(`/produits/${id}`);
    return response.data;
  },

  // Obtenir les produits en stock critique
  getStockCritique: async () => {
    const response = await api.get('/produits/stock-critique');
    return response.data;
  },
};

export default produitService;