import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';

const PatientForm = ({ patient, mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    telephone: '',
    adresse: '',
    groupe_sanguin: '',
    antecedents: ''
  });

  useEffect(() => {
    if (patient && mode === 'edit') {
      setFormData({
        nom: patient.nom || '',
        prenom: patient.prenom || '',
        sexe: patient.sexe || 'M',
        date_naissance: patient.date_naissance ? patient.date_naissance.split('T')[0] : '',
        telephone: patient.telephone || '',
        adresse: patient.adresse || '',
        groupe_sanguin: patient.groupe_sanguin || '',
        antecedents: patient.antecedents || ''
      });
    }
  }, [patient, mode]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (mode === 'create') {
        return patientService.createPatient(data);
      } else {
        return patientService.updatePatient(patient.id, data);
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
    
    // Validation
    if (!formData.nom || !formData.prenom) {
      toast.error('Le nom et le prénom sont requis');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Ajouter un patient' : 'Modifier le patient'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexe
              </label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="input-field"
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                className="input-field"
              />
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
                placeholder="+226 XX XX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Groupe sanguin
              </label>
              <select
                name="groupe_sanguin"
                value={formData.groupe_sanguin}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Non renseigné</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="input-field"
                rows="2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antécédents médicaux
              </label>
              <textarea
                name="antecedents"
                value={formData.antecedents}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Antécédents médicaux, allergies, traitements en cours..."
              />
            </div>
          </div>

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

export default PatientForm;