import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, 
  FaUserShield, FaUserMd, FaMoneyBillWave, FaUserClock,
  FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import UserForm from './UserForm';

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('create');
  
  const queryClient = useQueryClient();

  // Récupérer la liste des utilisateurs
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter],
    queryFn: () => userService.getAllUsers({
      search: searchTerm,
      role: roleFilter,
      statut: statusFilter
    })
  });

  // Mutation pour supprimer un utilisateur
  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  // Mutation pour changer le statut
  const statusMutation = useMutation({
    mutationFn: ({ id, statut }) => userService.changeUserStatus(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  });

  const handleDelete = (user) => {
    if (window.confirm(`Supprimer l'utilisateur ${user.nom} ?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    if (window.confirm(`${newStatus === 'ACTIF' ? 'Activer' : 'Désactiver'} l'utilisateur ${user.nom} ?`)) {
      statusMutation.mutate({ id: user.id, statut: newStatus });
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['users']);
    toast.success(formMode === 'create' ? 'Utilisateur créé avec succès' : 'Utilisateur modifié avec succès');
  };

  const getRoleIcon = (role) => {
    const icons = {
      'SUPER_ADMIN': <FaUserShield className="text-purple-600" />,
      'ADMIN': <FaUserShield className="text-red-600" />,
      'MEDECIN': <FaUserMd className="text-blue-600" />,
      'CAISSIER': <FaMoneyBillWave className="text-green-600" />,
      'RECEPTIONNISTE': <FaUserClock className="text-yellow-600" />
    };
    return icons[role] || <FaUsers className="text-gray-600" />;
  };

  const getRoleLabel = (role) => {
    const labels = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CAISSIER': 'Caissier',
      'RECEPTIONNISTE': 'Réceptionniste'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-red-100 text-red-800',
      'MEDECIN': 'bg-blue-100 text-blue-800',
      'CAISSIER': 'bg-green-100 text-green-800',
      'RECEPTIONNISTE': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les comptes utilisateurs de la clinique</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm">Super Admins</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'SUPER_ADMIN').length}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <p className="text-sm">Admins</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm">Médecins</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'MEDECIN').length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm">Caissiers</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'CAISSIER').length}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <p className="text-sm">Réceptionnistes</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'RECEPTIONNISTE').length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Administrateur</option>
            <option value="MEDECIN">Médecin</option>
            <option value="CAISSIER">Caissier</option>
            <option value="RECEPTIONNISTE">Réceptionniste</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nom}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{getRoleLabel(user.role)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${user.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.statut === 'ACTIF' ? <FaCheckCircle className="w-3 h-3 mr-1" /> : <FaTimesCircle className="w-3 h-3 mr-1" />}
                        {user.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title={user.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                        >
                          {user.statut === 'ACTIF' ? <FaToggleOn className="w-5 h-5 text-green-600" /> : <FaToggleOff className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Modifier"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        {user.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <UserForm
          user={selectedUser}
          mode={formMode}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default UsersList;