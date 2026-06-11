import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserMd } from 'react-icons/fa';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import PatientForm from './PatientForm';
import PatientDetails from './PatientDetails';

const PatientsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' ou 'edit'
  
  const queryClient = useQueryClient();

  // Récupérer la liste des patients
  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', currentPage, searchTerm],
    queryFn: () => patientService.getAllPatients({
      page: currentPage,
      limit: 10,
      search: searchTerm
    })
  });

  // Mutation pour supprimer un patient
  const deleteMutation = useMutation({
    mutationFn: (id) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleDelete = (patient) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${patient.nom} ${patient.prenom} ?`)) {
      deleteMutation.mutate(patient.id);
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['patients']);
    toast.success(formMode === 'create' ? 'Patient ajouté avec succès' : 'Patient modifié avec succès');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Erreur de chargement des données</p>
      </div>
    );
  }

  const patients = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Patients</h1>
          <p className="text-gray-500 mt-1">Gérez tous les patients de la clinique</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouveau Patient</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="card">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Liste des patients */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date naissance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groupe sanguin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  Aucun patient trouvé
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUserMd className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.nom} {patient.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          Sexe: {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{patient.telephone || '-'}</div>
                    <div className="text-sm text-gray-500">{patient.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {patient.groupe_sanguin || 'Non renseigné'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(patient)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Voir détails"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Modifier"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.totalPages} - Total: {pagination.total} patients
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <PatientForm
          patient={selectedPatient}
          mode={formMode}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Détails */}
      {isDetailsOpen && selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientsList;