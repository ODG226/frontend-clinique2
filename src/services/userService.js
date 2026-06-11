import api from './api';

const userService = {
  // Obtenir tous les utilisateurs
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Obtenir un utilisateur par ID
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Créer un utilisateur
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Changer le statut d'un utilisateur
  changeUserStatus: async (id, statut) => {
    const response = await api.patch(`/admin/users/${id}/status`, { statut });
    return response.data;
  },
};

export default userService;