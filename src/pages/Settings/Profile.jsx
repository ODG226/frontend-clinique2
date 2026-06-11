import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaUserTag, FaCalendarAlt, FaLock, FaSave, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email) {
      toast.error('Le nom et l\'email sont requis');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        nom: formData.nom,
        email: formData.email
      });
      
      if (response.data.success) {
        // Mettre à jour l'utilisateur dans le localStorage
        const updatedUser = { ...user, nom: formData.nom, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.current_password) {
      toast.error('Veuillez entrer votre mot de passe actuel');
      return;
    }
    
    if (!formData.new_password) {
      toast.error('Veuillez entrer un nouveau mot de passe');
      return;
    }
    
    if (formData.new_password.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      
      if (response.data.success) {
        toast.success('Mot de passe changé avec succès');
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CAISSIER': 'Caissier',
      'RECEPTIONNISTE': 'Réceptionniste'
    };
    return roles[role] || role;
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et votre mot de passe</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte d'identité */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <FaUserCircle className="w-20 h-20 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.nom}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire d'informations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaUserTag className="mr-2 text-blue-600" />
                Informations personnelles
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Nom complet</label>
                    <p className="text-lg font-medium text-gray-800">{user?.nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Email</label>
                    <p className="text-lg font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        nom: user?.nom,
                        email: user?.email
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Changement de mot de passe */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaLock className="mr-2 text-blue-600" />
              Changer le mot de passe
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaSave className="w-4 h-4" />
                  <span>{isPasswordLoading ? 'Changement...' : 'Changer le mot de passe'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;