import api from './api';

const medecinService = {
  getAllMedecins: async () => {
    const response = await api.get('/medecins');
    return response.data;
  },
};

export default medecinService;