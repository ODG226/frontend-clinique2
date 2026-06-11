import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, 
  FaBed, FaHospitalUser, FaChartLine, FaDoorOpen,
  FaWrench, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import chambreService from '../../services/chambreService';
import ChambreForm from './ChambreForm';
import ChambreDetails from './ChambreDetails';

const ChambresList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedChambre, setSelectedChambre] = useState(null);
  const [formMode, setFormMode] = useState('create');
  
  const queryClient = useQueryClient();

  // Récupérer la liste des chambres
  const { data, isLoading, error } = useQuery({
    queryKey: ['chambres', searchTerm, statusFilter, typeFilter],
    queryFn: () => chambreService.getAllChambres({
      search: searchTerm,
      statut: statusFilter,
      type_chambre: typeFilter
    })
  });

  // Récupérer les statistiques
  const { data: stats } = useQuery({
    queryKey: ['chambres-stats'],
    queryFn: () => chambreService.getStats()
  });

  // Mutation pour supprimer une chambre
  const deleteMutation = useMutation({
    mutationFn: (id) => chambreService.deleteChambre(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chambres']);
      queryClient.invalidateQueries(['chambres-stats']);
      toast.success('Chambre supprimée avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  const handleDelete = (chambre) => {
    if (window.confirm(`Supprimer la chambre ${chambre.numero} ?`)) {
      deleteMutation.mutate(chambre.id);
    }
  };

  const handleEdit = (chambre) => {
    setSelectedChambre(chambre);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleView = (chambre) => {
    setSelectedChambre(chambre);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedChambre(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['chambres']);
    queryClient.invalidateQueries(['chambres-stats']);
    toast.success(formMode === 'create' ? 'Chambre ajoutée avec succès' : 'Chambre modifiée avec succès');
  };

  const getStatusBadge = (statut) => {
    const config = {
      'LIBRE': { label: 'Libre', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      'OCCUPEE': { label: 'Occupée', color: 'bg-yellow-100 text-yellow-800', icon: FaHospitalUser },
      'MAINTENANCE': { label: 'Maintenance', color: 'bg-red-100 text-red-800', icon: FaWrench }
    };
    return config[statut] || { label: statut, color: 'bg-gray-100 text-gray-800', icon: FaBed };
  };

  const getTypeLabel = (type) => {
    const types = {
      'SIMPLE': 'Simple',
      'DOUBLE': 'Double',
      'SUITE': 'Suite',
      'VIP': 'VIP'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des chambres...</p>
        </div>
      </div>
    );
  }

  const chambres = data?.data || [];
  const statistiques = stats?.data?.global;
  const occupationParType = stats?.data?.par_type || [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Chambres</h1>
          <p className="text-gray-500 mt-1">Gérez les chambres et lits de la clinique</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouvelle Chambre</span>
        </button>
      </div>

      {/* Cartes statistiques */}
      {statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total chambres</p>
                <p className="text-3xl font-bold">{statistiques.total_chambres || 0}</p>
              </div>
              <FaDoorOpen className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total lits</p>
                <p className="text-3xl font-bold">{statistiques.total_lits || 0}</p>
              </div>
              <FaBed className="w-10 h-10 text-green-200" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Lits occupés</p>
                <p className="text-3xl font-bold">{statistiques.lits_occupes || 0}</p>
              </div>
              <FaHospitalUser className="w-10 h-10 text-yellow-200" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Taux occupation</p>
                <p className="text-3xl font-bold">{statistiques.taux_occupation || 0}%</p>
              </div>
              <FaChartLine className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Occupation par type */}
      {occupationParType.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Occupation par type de chambre</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {occupationParType.map((type) => (
              <div key={type.type_chambre} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">{getTypeLabel(type.type_chambre)}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-gray-800">{type.lits_occupes}</span>
                  <span className="text-sm text-gray-500">/ {type.total_lits} lits</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2"
                    style={{ width: `${(type.lits_occupes / type.total_lits) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une chambre..."
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
            <option value="LIBRE">Libre</option>
            <option value="OCCUPEE">Occupée</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les types</option>
            <option value="SIMPLE">Simple</option>
            <option value="DOUBLE">Double</option>
            <option value="SUITE">Suite</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {/* Liste des chambres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chambres.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FaBed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune chambre trouvée</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Ajouter une chambre
            </button>
          </div>
        ) : (
          chambres.map((chambre) => {
            const status = getStatusBadge(chambre.statut);
            const StatusIcon = status.icon;
            
            return (
              <div key={chambre.id} className="card hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Chambre {chambre.numero}</h3>
                    <p className="text-sm text-gray-500">{getTypeLabel(chambre.type_chambre)}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tarif / nuit:</span>
                    <span className="font-semibold text-blue-600">{chambre.tarif?.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Occupation:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{Math.round(chambre.taux_occupation || 0)}%</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({chambre.lits_occupes || 0}/{chambre.total_lits || 0} lits)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`rounded-full h-2 ${chambre.taux_occupation > 80 ? 'bg-red-600' : chambre.taux_occupation > 50 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${chambre.taux_occupation || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button
                    onClick={() => handleView(chambre)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir détails"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(chambre)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chambre)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <ChambreForm
          chambre={selectedChambre}
          mode={formMode}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Détails */}
      {isDetailsOpen && selectedChambre && (
        <ChambreDetails
          chambre={selectedChambre}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default ChambresList;