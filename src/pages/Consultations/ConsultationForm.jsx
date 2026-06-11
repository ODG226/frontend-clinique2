import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaStethoscope } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import consultationService from '../../services/consultationService';

const ConsultationForm = ({ patients, medecins, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    medecin_id: '',
    date_consultation: new Date().toISOString().split('T')[0],
    heure_consultation: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    motif: '',
    diagnostic: '',
    traitement: '',
    observations: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const dateTime = `${data.date_consultation}T${data.heure_consultation}:00`;
      return consultationService.createConsultation({
        patient_id: data.patient_id,
        medecin_id: data.medecin_id,
        date_consultation: dateTime,
        motif: data.motif,
        diagnostic: data.diagnostic,
        traitement: data.traitement,
        observations: data.observations
      });
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
    
    if (!formData.patient_id || !formData.medecin_id || !formData.date_consultation) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaStethoscope className="mr-2 text-blue-600" />
            Nouvelle Consultation
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
                Patient *
              </label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom} ({patient.telephone || 'pas de téléphone'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médecin *
              </label>
              <select
                name="medecin_id"
                value={formData.medecin_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un médecin</option>
                {medecins.map((medecin) => (
                  <option key={medecin.id} value={medecin.id}>
                    Dr. {medecin.utilisateur_nom} - {medecin.specialite}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date_consultation"
                value={formData.date_consultation}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure *
              </label>
              <input
                type="time"
                name="heure_consultation"
                value={formData.heure_consultation}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif de la consultation
              </label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="Raison de la consultation..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnostic
              </label>
              <textarea
                name="diagnostic"
                value={formData.diagnostic}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Diagnostic établi..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Traitement prescrit
              </label>
              <textarea
                name="traitement"
                value={formData.traitement}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Médicaments, posologie, durée..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations supplémentaires
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="Notes complémentaires..."
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

export default ConsultationForm;