import api from './api';

const factureService = {
  // Obtenir toutes les factures
  getAllFactures: async (params = {}) => {
    const response = await api.get('/factures', { params });
    return response.data;
  },

  // Obtenir une facture par ID
  getFactureById: async (id) => {
    const response = await api.get(`/factures/${id}`);
    return response.data;
  },

  // Créer une facture
  createFacture: async (factureData) => {
    const response = await api.post('/factures', factureData);
    return response.data;
  },

  // Ajouter un paiement
  addPaiement: async (id, paiementData) => {
    const response = await api.post(`/factures/${id}/paiements`, paiementData);
    return response.data;
  },

  // Annuler une facture
  annulerFacture: async (id) => {
    const response = await api.patch(`/factures/${id}/annuler`);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await api.get('/factures/stats');
    return response.data;
  },

  // Rechercher une facture
  searchFacture: async (query) => {
    const response = await api.get('/factures/search', { params: { q: query } });
    return response.data;
  },
};

export default factureService;