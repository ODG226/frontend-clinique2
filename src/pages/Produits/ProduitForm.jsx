import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import produitService from '../../services/produitService';

const ProduitForm = ({ produit, mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    type_produit: 'MEDICAMENT',
    prix_achat: '',
    prix_vente: '',
    stock_initial: '',
    stock_min: '10',
    date_peremption: ''
  });

  useEffect(() => {
    if (produit && mode === 'edit') {
      setFormData({
        nom: produit.nom || '',
        type_produit: produit.type_produit || 'MEDICAMENT',
        prix_achat: produit.prix_achat || '',
        prix_vente: produit.prix_vente || '',
        stock_initial: '',
        stock_min: produit.stock_min || '10',
        date_peremption: produit.date_peremption ? produit.date_peremption.split('T')[0] : ''
      });
    }
  }, [produit, mode]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (mode === 'create') {
        return produitService.createProduit(data);
      } else {
        return produitService.updateProduit(produit.id, data);
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
    
    if (!formData.nom || !formData.prix_vente) {
      toast.error('Le nom et le prix de vente sont requis');
      return;
    }

    const submitData = { ...formData };
    if (mode === 'create') {
      submitData.stock_initial = parseInt(submitData.stock_initial) || 0;
    }
    submitData.prix_achat = parseFloat(submitData.prix_achat) || 0;
    submitData.prix_vente = parseFloat(submitData.prix_vente);
    submitData.stock_min = parseInt(submitData.stock_min) || 10;

    mutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Ajouter un produit' : 'Modifier le produit'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: Paracétamol 500mg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de produit *
              </label>
              <select
                name="type_produit"
                value={formData.type_produit}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="MEDICAMENT">Médicament</option>
                <option value="MATERIEL">Matériel médical</option>
                <option value="CONSOMMABLE">Consommable</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'achat (FCFA)
              </label>
              <input
                type="number"
                name="prix_achat"
                value={formData.prix_achat}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente (FCFA) *
              </label>
              <input
                type="number"
                name="prix_vente"
                value={formData.prix_vente}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                required
              />
            </div>

            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock initial
                  </label>
                  <input
                    type="number"
                    name="stock_initial"
                    value={formData.stock_initial}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de péremption
                  </label>
                  <input
                    type="date"
                    name="date_peremption"
                    value={formData.date_peremption}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock minimum d'alerte
              </label>
              <input
                type="number"
                name="stock_min"
                value={formData.stock_min}
                onChange={handleChange}
                className="input-field"
                placeholder="10"
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

export default ProduitForm;