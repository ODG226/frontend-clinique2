import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaTimes, FaSave, FaPlus, FaTrash, FaPills } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import patientService from '../../services/patientService';

const OrdonnanceForm = ({ onClose, onSuccess }) => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [medicaments, setMedicaments] = useState([
    { nom: '', dosage: '', duree: '' }
  ]);

  // Récupérer les patients
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAllPatients()
  });

  // Récupérer les consultations du patient
  const { data: consultationsData } = useQuery({
    queryKey: ['consultations-patient', selectedPatient],
    queryFn: () => api.get(`/consultations?patient_id=${selectedPatient}`),
    enabled: !!selectedPatient
  });

  const patients = patientsData?.data || [];
  const consultations = consultationsData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Créer l'ordonnance
      const ordonnanceResponse = await api.post('/ordonnances', {
        consultation_id: data.consultation_id,
        date_ordonnance: new Date().toISOString().split('T')[0]
      });
      
      const ordonnanceId = ordonnanceResponse.data.data.id;
      
      // Ajouter les médicaments
      for (const med of data.medicaments) {
        if (med.nom) {
          await api.post('/ordonnance-medicaments', {
            ordonnance_id: ordonnanceId,
            medicament: med.nom,
            dosage: med.dosage,
            duree: med.duree
          });
        }
      }
      
      return ordonnanceResponse.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });

  const handleAddMedicament = () => {
    setMedicaments([...medicaments, { nom: '', dosage: '', duree: '' }]);
  };

  const handleRemoveMedicament = (index) => {
    if (medicaments.length > 1) {
      const newMedicaments = medicaments.filter((_, i) => i !== index);
      setMedicaments(newMedicaments);
    }
  };

  const handleMedicamentChange = (index, field, value) => {
    const newMedicaments = [...medicaments];
    newMedicaments[index][field] = value;
    setMedicaments(newMedicaments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }
    
    if (!consultationId) {
      toast.error('Veuillez sélectionner une consultation');
      return;
    }
    
    const hasMedicament = medicaments.some(med => med.nom);
    if (!hasMedicament) {
      toast.error('Veuillez ajouter au moins un médicament');
      return;
    }

    mutation.mutate({
      consultation_id: consultationId,
      medicaments: medicaments.filter(med => med.nom)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaPills className="mr-2 text-green-600" />
            Rédiger une ordonnance
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
              Patient *
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nom} {patient.prenom}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation *
              </label>
              <select
                value={consultationId}
                onChange={(e) => setConsultationId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Sélectionner une consultation</option>
                {consultations.map((consultation) => (
                  <option key={consultation.id} value={consultation.id}>
                    {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')} - 
                    {consultation.motif || 'Consultation'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Médicaments prescrits *
              </label>
              <button
                type="button"
                onClick={handleAddMedicament}
                className="text-green-600 hover:text-green-700 text-sm flex items-center"
              >
                <FaPlus className="w-3 h-3 mr-1" />
                Ajouter un médicament
              </button>
            </div>

            <div className="space-y-3">
              {medicaments.map((medicament, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Nom du médicament *"
                      value={medicament.nom}
                      onChange={(e) => handleMedicamentChange(index, 'nom', e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medicament.dosage}
                      onChange={(e) => handleMedicamentChange(index, 'dosage', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Durée"
                      value={medicament.duree}
                      onChange={(e) => handleMedicamentChange(index, 'duree', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    {medicaments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicament(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              <span>{mutation.isPending ? 'Enregistrement...' : 'Enregistrer l\'ordonnance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdonnanceForm;