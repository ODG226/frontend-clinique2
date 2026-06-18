import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import rdvService from '../../services/rdvService';
import medecinService from '../../services/medecinService';

const RendezVousForm = ({ patients, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    medecin_id: '',
    date_rdv: '',
    heure_rdv: '09:00',
    motif: ''
  });

  // Récupérer les médecins depuis l'API
  const { data: medecinsData, isLoading: medecinsLoading, error: medecinsError } = useQuery({
    queryKey: ['medecins-list'],
    queryFn: () => medecinService.getAllMedecins()
  });

  // Log pour déboguer
  useEffect(() => {
    console.log('🔍 Données médecins brutes:', medecinsData);
    console.log('🔍 Médecins extraits:', medecinsData?.data);
    if (medecinsError) {
      console.error('❌ Erreur chargement médecins:', medecinsError);
    }
  }, [medecinsData, medecinsError]);

  const medecins = medecinsData?.data || [];
  console.log('📋 Nombre de médecins:', medecins.length);

  const mutation = useMutation({
    mutationFn: (data) => {
      const dateTime = `${data.date_rdv}T${data.heure_rdv}:00`;
      return rdvService.createRendezVous({
        patient_id: data.patient_id,
        medecin_id: data.medecin_id,
        date_rdv: dateTime,
        motif: data.motif
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
    
    if (!formData.patient_id || !formData.medecin_id || !formData.date_rdv) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Nouveau Rendez-vous
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
                {patients && patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom} {patient.telephone ? `(${patient.telephone})` : ''}
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
                {medecinsLoading ? (
                  <option value="" disabled>⏳ Chargement des médecins...</option>
                ) : medecins.length === 0 ? (
                  <option value="" disabled>⚠️ Aucun médecin disponible</option>
                ) : (
                  medecins.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr. {medecin.utilisateur_nom || medecin.nom || 'Inconnu'} - {medecin.specialite || 'Généraliste'}
                    </option>
                  ))
                )}
              </select>
              {medecins.length === 0 && !medecinsLoading && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Aucun médecin trouvé. Veuillez contacter l'administrateur.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date_rdv"
                value={formData.date_rdv}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
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
                name="heure_rdv"
                value={formData.heure_rdv}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif
              </label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Motif de la consultation..."
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
              disabled={mutation.isPending || medecinsLoading}
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

export default RendezVousForm;