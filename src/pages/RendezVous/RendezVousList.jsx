import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, 
  FaCalendarAlt, FaCheck, FaTimes, FaClock, FaUserMd 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import rdvService from '../../services/rdvService';
import patientService from '../../services/patientService';
import medecinService from '../../services/medecinService';
import RendezVousForm from './RendezVousForm';
import RendezVousDetails from './RendezVousDetails';

const RendezVousList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  
  const queryClient = useQueryClient();

  // Récupérer la liste des rendez-vous
  const { data, isLoading, error } = useQuery({
    queryKey: ['rendez-vous', searchTerm, statusFilter, dateFilter],
    queryFn: () => rdvService.getAllRendezVous({
      search: searchTerm,
      statut: statusFilter,
      date: dateFilter
    })
  });

  // Récupérer les patients pour le formulaire
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAllPatients()
  });

  // Récupérer les médecins pour le formulaire
  const { data: medecins } = useQuery({
    queryKey: ['medecins'],
    queryFn: () => medecinService.getAllMedecins()
  });

  // Mutation pour supprimer un rendez-vous
  const deleteMutation = useMutation({
    mutationFn: (id) => rdvService.deleteRendezVous(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rendez-vous']);
      toast.success('Rendez-vous supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  // Mutation pour changer le statut
  const statusMutation = useMutation({
    mutationFn: ({ id, statut }) => rdvService.updateRendezVousStatus(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries(['rendez-vous']);
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  const handleDelete = (rdv) => {
    if (window.confirm(`Supprimer le rendez-vous du ${new Date(rdv.date_rdv).toLocaleDateString('fr-FR')} ?`)) {
      deleteMutation.mutate(rdv.id);
    }
  };

  const handleStatusChange = (rdv, newStatus) => {
    if (window.confirm(`Changer le statut en "${getStatusLabel(newStatus)}" ?`)) {
      statusMutation.mutate({ id: rdv.id, statut: newStatus });
    }
  };

  const handleView = (rdv) => {
    setSelectedRdv(rdv);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedRdv(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['rendez-vous']);
    toast.success('Rendez-vous enregistré avec succès');
  };

  const getStatusColor = (statut) => {
    const colors = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRME': 'bg-blue-100 text-blue-800',
      'TERMINE': 'bg-green-100 text-green-800',
      'ANNULE': 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmé',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  const rendezVous = data?.data || [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Rendez-vous</h1>
          <p className="text-gray-500 mt-1">Planifiez et gérez les consultations</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouveau Rendez-vous</span>
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
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="TERMINE">Terminé</option>
            <option value="ANNULE">Annulé</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
            placeholder="Filtrer par date"
          />
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="card overflow-x-auto">
        {rendezVous.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Créer un rendez-vous
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient / Médecin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rendezVous.map((rdv) => (
                <tr key={rdv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {rdv.patient_nom} {rdv.patient_prenom}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaUserMd className="w-3 h-3 mr-1" />
                        Dr. {rdv.medecin_nom}
                      </p>
                      <p className="text-xs text-gray-400">{rdv.specialite}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-900">
                      <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <FaClock className="w-3 h-3 text-gray-400 mr-2" />
                      {new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {rdv.motif || 'Non spécifié'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={rdv.statut}
                        onChange={(e) => handleStatusChange(rdv, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(rdv.statut)}`}
                      >
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="CONFIRME">Confirmé</option>
                        <option value="TERMINE">Terminé</option>
                        <option value="ANNULE">Annulé</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(rdv)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Voir détails"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rdv)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <RendezVousForm
          patients={patients?.data || []}
          medecins={medecins?.data || []}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Détails */}
      {isDetailsOpen && selectedRdv && (
        <RendezVousDetails
          rdv={selectedRdv}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default RendezVousList;