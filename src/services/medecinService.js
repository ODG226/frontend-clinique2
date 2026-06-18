import api from './api';

const medecinService = {
  getAllMedecins: async () => {
    try {
      const response = await api.get('/medecins');
      console.log('✅ Réponse API médecins:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération médecins:', error);
      throw error;
    }
  },

  getMedecinById: async (id) => {
    try {
      const response = await api.get(`/medecins/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération médecin:', error);
      throw error;
    }
  },

  createMedecin: async (data) => {
    try {
      const response = await api.post('/medecins', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création médecin:', error);
      throw error;
    }
  },

  updateMedecin: async (id, data) => {
    try {
      const response = await api.put(`/medecins/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour médecin:', error);
      throw error;
    }
  },

  deleteMedecin: async (id) => {
    try {
      const response = await api.delete(`/medecins/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression médecin:', error);
      throw error;
    }
  },
};

export default medecinService;