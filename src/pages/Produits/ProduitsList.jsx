import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaPills, 
  FaExclamationTriangle, FaChartLine, FaBoxes, 
  FaArrowUp, FaArrowDown, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import produitService from '../../services/produitService';
import ProduitForm from './ProduitForm';
import AjusterStockModal from './AjusterStockModal';

const ProduitsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCritiqueOnly, setShowCritiqueOnly] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [formMode, setFormMode] = useState('create');
  
  const queryClient = useQueryClient();

  // Récupérer la liste des produits
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['produits', searchTerm, typeFilter, showCritiqueOnly],
    queryFn: () => produitService.getAllProduits({
      search: searchTerm,
      type: typeFilter,
      stock_min: showCritiqueOnly ? 'true' : ''
    })
  });

  // Récupérer les produits en stock critique
  const { data: stockCritique } = useQuery({
    queryKey: ['stock-critique'],
    queryFn: () => produitService.getStockCritique()
  });

  // Mutation pour supprimer un produit
  const deleteMutation = useMutation({
    mutationFn: (id) => produitService.deleteProduit(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['produits']);
      queryClient.invalidateQueries(['stock-critique']);
      toast.success('Produit supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  const handleDelete = (produit) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${produit.nom} ?`)) {
      deleteMutation.mutate(produit.id);
    }
  };

  const handleEdit = (produit) => {
    setSelectedProduit(produit);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleStock = (produit) => {
    setSelectedProduit(produit);
    setIsStockModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduit(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries(['produits']);
    queryClient.invalidateQueries(['stock-critique']);
    toast.success(formMode === 'create' ? 'Produit ajouté avec succès' : 'Produit modifié avec succès');
  };

  const handleStockSuccess = () => {
    setIsStockModalOpen(false);
    queryClient.invalidateQueries(['produits']);
    queryClient.invalidateQueries(['stock-critique']);
    toast.success('Stock mis à jour avec succès');
  };

  const getStatutStock = (produit) => {
    if (produit.quantite <= produit.stock_min) {
      return { label: 'Critique', color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle };
    }
    if (produit.quantite <= produit.stock_min * 2) {
      return { label: 'Bas', color: 'bg-yellow-100 text-yellow-800', icon: FaChartLine };
    }
    return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: FaBoxes };
  };

  const getTypeLabel = (type) => {
    const types = {
      'MEDICAMENT': 'Médicament',
      'MATERIEL': 'Matériel médical',
      'CONSOMMABLE': 'Consommable',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  const produits = data?.data || [];
  const critiqueCount = stockCritique?.count || 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Produits</h1>
          <p className="text-gray-500 mt-1">Gérez les médicaments et produits de la clinique</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Alertes stock critique */}
      {critiqueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-red-800 font-medium">
                Attention : {critiqueCount} produit(s) en stock critique !
              </p>
              <p className="text-red-600 text-sm">
                Ces produits ont atteint ou dépassé leur seuil minimum de stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total produits</p>
              <p className="text-3xl font-bold">{produits.length}</p>
            </div>
            <FaPills className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Valeur du stock</p>
              <p className="text-3xl font-bold">
                {produits.reduce((sum, p) => sum + (p.prix_vente * p.quantite), 0).toLocaleString()} FCFA
              </p>
            </div>
            <FaChartLine className="w-10 h-10 text-green-200" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Stock normal</p>
              <p className="text-3xl font-bold">
                {produits.filter(p => p.quantite > p.stock_min * 2).length}
              </p>
            </div>
            <FaBoxes className="w-10 h-10 text-yellow-200" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Stock critique</p>
              <p className="text-3xl font-bold">{critiqueCount}</p>
            </div>
            <FaExclamationTriangle className="w-10 h-10 text-red-200" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les types</option>
            <option value="MEDICAMENT">Médicaments</option>
            <option value="MATERIEL">Matériel médical</option>
            <option value="CONSOMMABLE">Consommables</option>
            <option value="AUTRE">Autres</option>
          </select>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCritiqueOnly}
              onChange={(e) => setShowCritiqueOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Afficher uniquement les stocks critiques</span>
          </label>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="card overflow-x-auto">
        {produits.length === 0 ? (
          <div className="text-center py-12">
            <FaPills className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit trouvé</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Ajouter un produit
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix vente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {produits.map((produit) => {
                const statut = getStatutStock(produit);
                const StatutIcon = statut.icon;
                
                return (
                  <tr key={produit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{produit.nom}</p>
                        {produit.date_peremption && (
                          <p className="text-xs text-gray-500">
                            Exp: {new Date(produit.date_peremption).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {getTypeLabel(produit.type_produit)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{produit.prix_vente?.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">Achat: {produit.prix_achat?.toLocaleString()} FCFA</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{produit.quantite} unités</p>
                      <p className="text-xs text-gray-500">Min: {produit.stock_min}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statut.color}`}>
                        <StatutIcon className="w-3 h-3 mr-1" />
                        {statut.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStock(produit)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Ajuster stock"
                        >
                          <FaSync className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(produit)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Modifier"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(produit)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <ProduitForm
          produit={selectedProduit}
          mode={formMode}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Ajuster Stock */}
      {isStockModalOpen && selectedProduit && (
        <AjusterStockModal
          produit={selectedProduit}
          onClose={() => setIsStockModalOpen(false)}
          onSuccess={handleStockSuccess}
        />
      )}
    </div>
  );
};

export default ProduitsList;