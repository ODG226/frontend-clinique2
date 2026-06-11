import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEye, FaSearch, FaStethoscope, 
  FaCalendarAlt, FaUserMd, FaNotesMedical 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import consultationService from '../../services/consultationService';
import patientService from '../../services/patientService';
import medecinService from '../../services/medecinService';
import ConsultationForm from './ConsultationForm';
import ConsultationDetails from './ConsultationDetails';

const ConsultationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  
  const queryClient = useQueryClient();

  // Récupérer la liste des consultations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['consultations', searchTerm, dateDebut, dateFin],
    queryFn: () => consultationService.getAllConsultations({
      search: searchTerm,
      date_debut: dateDebut,
      date_fin: dateFin
    })
  });

  // Récupérer les patients pour le formulaire
  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientService.getAllPatients()
  });

  // Récupérer les médecins pour le formulaire
  const { data: medecins } = useQuery({
    queryKey: ['medecins-list'],
    queryFn: () => medecinService.getAllMedecins()
  });

  const handleView = (consultation) => {
    setSelectedConsultation(consultation);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedConsultation(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['consultations']);
    toast.success('Consultation enregistrée avec succès');
  };

  const getTypeConsultation = (consultation) => {
    if (consultation.diagnostic || consultation.traitement) {
      return 'Consultation médicale';
    }
    return 'Consultation simple';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  const consultations = data?.data || [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Consultations</h1>
          <p className="text-gray-500 mt-1">Historique et suivi des consultations médicales</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouvelle Consultation</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher patient ou médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        
        {(dateDebut || dateFin) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setDateDebut('');
                setDateFin('');
                refetch();
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total consultations</p>
              <p className="text-3xl font-bold">{consultations.length}</p>
            </div>
            <FaStethoscope className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Ce mois</p>
              <p className="text-3xl font-bold">
                {consultations.filter(c => {
                  const date = new Date(c.date_consultation);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <FaCalendarAlt className="w-10 h-10 text-green-200" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avec diagnostic</p>
              <p className="text-3xl font-bold">
                {consultations.filter(c => c.diagnostic).length}
              </p>
            </div>
            <FaNotesMedical className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="card">
        {consultations.length === 0 ? (
          <div className="text-center py-12">
            <FaStethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune consultation trouvée</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Créer une consultation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleView(consultation)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUserMd className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {consultation.patient_nom} {consultation.patient_prenom}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Dr. {consultation.medecin_nom} - {consultation.specialite}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {consultation.diagnostic && (
                        <div>
                          <p className="text-xs text-gray-500">Diagnostic</p>
                          <p className="text-sm text-gray-700 line-clamp-1">
                            {consultation.diagnostic}
                          </p>
                        </div>
                      )}
                      
                      {consultation.motif && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">Motif</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {consultation.motif}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(consultation);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Voir détails"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <ConsultationForm
          patients={patients?.data || []}
          medecins={medecins?.data || []}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Détails */}
      {isDetailsOpen && selectedConsultation && (
        <ConsultationDetails
          consultation={selectedConsultation}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default ConsultationsList;