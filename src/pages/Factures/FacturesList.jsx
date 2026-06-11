import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEye, FaSearch, FaFileInvoice, 
  FaMoneyBillWave, FaPrint, FaTimesCircle,
  FaCalendarAlt, FaUserMd, FaCheckCircle, FaUserPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import factureService from '../../services/factureService';
import patientService from '../../services/patientService';
import FactureForm from './FactureForm';
import FactureDetails from './FactureDetails';
import PaiementModal from './PaiementModal';
import AddPatientModal from './AddPatientModal';

const FacturesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaiementOpen, setIsPaiementOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  
  const queryClient = useQueryClient();

  // Récupérer la liste des factures
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['factures', statusFilter, dateDebut, dateFin],
    queryFn: () => factureService.getAllFactures({
      statut: statusFilter,
      date_debut: dateDebut,
      date_fin: dateFin
    }),
    enabled: !searchTerm // Désactivé quand on fait une recherche
  });

  // Récupérer les patients pour le formulaire
  const { data: patients, refetch: refetchPatients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientService.getAllPatients()
  });

  // Recherche de facture
  const searchMutation = useMutation({
    mutationFn: (query) => factureService.searchFacture(query),
    onSuccess: (data) => {
      setSearchResults(data.data || []);
      setIsSearching(true);
    }
  });

  // Récupérer les statistiques
  const { data: stats } = useQuery({
    queryKey: ['factures-stats'],
    queryFn: () => factureService.getStats()
  });

  // Mutation pour annuler une facture
  const annulerMutation = useMutation({
    mutationFn: (id) => factureService.annulerFacture(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['factures']);
      queryClient.invalidateQueries(['factures-stats']);
      toast.success('Facture annulée avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchMutation.mutate(searchTerm);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleView = (facture) => {
    setSelectedFacture(facture);
    setIsDetailsOpen(true);
  };

  const handlePaiement = (facture) => {
    setSelectedFacture(facture);
    setIsPaiementOpen(true);
  };

  const handleCreate = () => {
    setSelectedFacture(null);
    setIsFormOpen(true);
  };

  const handleAddPatient = () => {
    setIsAddPatientOpen(true);
  };

  const handleAnnuler = (facture) => {
    if (window.confirm(`Annuler la facture #${facture.id} ?`)) {
      annulerMutation.mutate(facture.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['factures']);
    queryClient.invalidateQueries(['factures-stats']);
    toast.success('Facture créée avec succès');
  };

  const handlePaiementSuccess = () => {
    setIsPaiementOpen(false);
    queryClient.invalidateQueries(['factures']);
    queryClient.invalidateQueries(['factures-stats']);
    toast.success('Paiement enregistré avec succès');
  };

  const handleAddPatientSuccess = () => {
    setIsAddPatientOpen(false);
    refetchPatients();
    toast.success('Patient ajouté avec succès');
  };

  const getStatusBadge = (statut) => {
    const config = {
      'PAYEE': { label: 'Payée', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      'PARTIELLEMENT_PAYEE': { label: 'Partiellement payée', color: 'bg-yellow-100 text-yellow-800', icon: FaMoneyBillWave },
      'NON_PAYEE': { label: 'Non payée', color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
      'ANNULEE': { label: 'Annulée', color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle }
    };
    return config[statut] || { label: statut, color: 'bg-gray-100 text-gray-800', icon: FaFileInvoice };
  };

  // Affichage des factures (résultats de recherche ou liste normale)
  const displayFactures = isSearching ? searchResults : (data?.data || []);
  const statistiques = stats?.data?.statistiques;

  if (isLoading && !searchTerm) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Factures</h1>
          <p className="text-gray-500 mt-1">Gérez les factures et les paiements</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddPatient}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            <FaUserPlus className="w-4 h-4" />
            <span>Nouveau Patient</span>
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      {statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total factures</p>
                <p className="text-2xl font-bold">{statistiques.total_factures || 0}</p>
              </div>
              <FaFileInvoice className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Montant total</p>
                <p className="text-2xl font-bold">{(statistiques.montant_total || 0).toLocaleString()} FCFA</p>
              </div>
              <FaMoneyBillWave className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Montant perçu</p>
                <p className="text-2xl font-bold">{(statistiques.montant_percu || 0).toLocaleString()} FCFA</p>
              </div>
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Montant impayé</p>
                <p className="text-2xl font-bold">{(statistiques.montant_impaye || 0).toLocaleString()} FCFA</p>
              </div>
              <FaTimesCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher facture par #ID, nom patient ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="PAYEE">Payée</option>
            <option value="PARTIELLEMENT_PAYEE">Partiellement payée</option>
            <option value="NON_PAYEE">Non payée</option>
            <option value="ANNULEE">Annulée</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Rechercher
          </button>
        </div>
        
        {isSearching && (
          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-gray-500">{searchResults.length} résultat(s) trouvé(s)</p>
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Effacer la recherche
            </button>
          </div>
        )}
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {displayFactures.length === 0 ? (
          <div className="text-center py-12">
            <FaFileInvoice className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune facture trouvée</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Créer une facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restant
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
                {displayFactures.map((facture) => {
                  const status = getStatusBadge(facture.statut);
                  const StatusIcon = status.icon;
                  const solde = facture.montant_total - (facture.montant_paye || 0);
                  
                  return (
                    <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">#FAC-{facture.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {facture.patient_nom} {facture.patient_prenom}
                        </p>
                        <p className="text-xs text-gray-500">{facture.telephone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{facture.montant_total.toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-green-600 font-medium">{(facture.montant_paye || 0).toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {solde.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(facture)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Voir détails"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                          {facture.statut !== 'PAYEE' && facture.statut !== 'ANNULEE' && (
                            <button
                              onClick={() => handlePaiement(facture)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Enregistrer paiement"
                            >
                              <FaMoneyBillWave className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Imprimer"
                          >
                            <FaPrint className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modaux */}
      {isFormOpen && (
        <FactureForm
          patients={patients?.data || []}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isDetailsOpen && selectedFacture && (
        <FactureDetails
          facture={selectedFacture}
          onClose={() => setIsDetailsOpen(false)}
          onPaiement={() => {
            setIsDetailsOpen(false);
            setSelectedFacture(selectedFacture);
            setIsPaiementOpen(true);
          }}
        />
      )}

      {isPaiementOpen && selectedFacture && (
        <PaiementModal
          facture={selectedFacture}
          onClose={() => setIsPaiementOpen(false)}
          onSuccess={handlePaiementSuccess}
        />
      )}

      {isAddPatientOpen && (
        <AddPatientModal
          onClose={() => setIsAddPatientOpen(false)}
          onSuccess={handleAddPatientSuccess}
        />
      )}
    </div>
  );
};

export default FacturesList;