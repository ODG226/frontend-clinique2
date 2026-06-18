import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import userService from '../../services/userService';

const UserForm = ({ user, mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    role: 'RECEPTIONNISTE',
    statut: 'ACTIF',
    specialite: '',
    telephone: ''
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        nom: user.nom || '',
        email: user.email || '',
        mot_de_passe: '',
        confirm_password: '',
        role: user.role || 'RECEPTIONNISTE',
        statut: user.statut || 'ACTIF',
        specialite: user.specialite || '',
        telephone: user.telephone || ''
      });
    }
  }, [user, mode]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (mode === 'create') {
        return userService.createUser(data);
      } else {
        return userService.updateUser(user.id, data);
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email) {
      toast.error('Le nom et l\'email sont requis');
      return;
    }

    if (mode === 'create') {
      if (!formData.mot_de_passe) {
        toast.error('Le mot de passe est requis');
        return;
      }
      if (formData.mot_de_passe.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      if (formData.mot_de_passe !== formData.confirm_password) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
    }

    const submitData = { ...formData };
    delete submitData.confirm_password;
    if (mode === 'edit' && !submitData.mot_de_passe) {
      delete submitData.mot_de_passe;
    }

    mutation.mutate(submitData);
  };

  const getRoleLabel = (role) => {
    const labels = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CAISSIER': 'Caissier',
      'RECEPTIONNISTE': 'Réceptionniste'
    };
    return labels[role];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="input-field"
              placeholder="Jean Dupont"
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
              onChange={handleChange}
              className="input-field"
              placeholder="jean@clinique.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="SUPER_ADMIN">Super Administrateur</option>
              <option value="ADMIN">Administrateur</option>
              <option value="MEDECIN">Médecin</option>
              <option value="CAISSIER">Caissier</option>
              <option value="RECEPTIONNISTE">Réceptionniste</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {getRoleLabel(formData.role)} - {formData.role === 'SUPER_ADMIN' ? 'Accès total' : 
                formData.role === 'ADMIN' ? 'Gestion complète' :
                formData.role === 'MEDECIN' ? 'Consultations et dossiers patients' :
                formData.role === 'CAISSIER' ? 'Factures et paiements' :
                'Accueil et rendez-vous'}
            </p>
          </div>

          {/* Champs spécifiques aux médecins */}
          {formData.role === 'MEDECIN' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité *
                </label>
                <select
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="Généraliste">Généraliste</option>
                  <option value="Cardiologie">Cardiologie</option>
                  <option value="Pédiatrie">Pédiatrie</option>
                  <option value="Gynécologie">Gynécologie</option>
                  <option value="Neurologie">Neurologie</option>
                  <option value="Dermatologie">Dermatologie</option>
                  <option value="Ophtalmologie">Ophtalmologie</option>
                  <option value="ORL">ORL</option>
                  <option value="Orthopédie">Orthopédie</option>
                  <option value="Psychiatrie">Psychiatrie</option>
                  <option value="Urologie">Urologie</option>
                  <option value="Radiologie">Radiologie</option>
                  <option value="Anesthésie">Anesthésie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </>
          )}

          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Minimum 6 caractères"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Répéter le mot de passe"
                  required
                />
              </div>
            </>
          )}

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Laisser vide pour ne pas changer"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              <span>{mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;