import React, { useState } from 'react';
import { FaTimes, FaSave, FaArrowUp, FaArrowDown, FaAdjust } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import produitService from '../../services/produitService';

const AjusterStockModal = ({ produit, onClose, onSuccess }) => {
  const [typeMouvement, setTypeMouvement] = useState('ENTREE');
  const [quantite, setQuantite] = useState('');
  const [motif, setMotif] = useState('');

  const mutation = useMutation({
    mutationFn: () => produitService.ajusterStock(produit.id, {
      type_mouvement: typeMouvement,
      quantite: parseInt(quantite),
      motif
    }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajustement du stock');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!quantite || parseInt(quantite) <= 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    if (typeMouvement === 'SORTIE' && parseInt(quantite) > produit.quantite) {
      toast.error(`Stock insuffisant. Stock actuel: ${produit.quantite} unités`);
      return;
    }

    mutation.mutate();
  };

  const getMouvementLabel = () => {
    const labels = {
      'ENTREE': 'Entrée en stock',
      'SORTIE': 'Sortie de stock',
      'AJUSTEMENT': 'Ajustement'
    };
    return labels[typeMouvement];
  };

  const getMouvementIcon = () => {
    const icons = {
      'ENTREE': <FaArrowUp className="text-green-600" />,
      'SORTIE': <FaArrowDown className="text-red-600" />,
      'AJUSTEMENT': <FaAdjust className="text-blue-600" />
    };
    return icons[typeMouvement];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Ajuster le stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Produit</p>
            <p className="font-medium">{produit.nom}</p>
            <p className="text-sm text-gray-500 mt-2">
              Stock actuel: <span className="font-bold">{produit.quantite} unités</span>
            </p>
            <p className="text-sm text-gray-500">
              Stock minimum: {produit.stock_min} unités
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de mouvement *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTypeMouvement('ENTREE')}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    typeMouvement === 'ENTREE'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaArrowUp className="w-4 h-4" />
                  <span>Entrée</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeMouvement('SORTIE')}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    typeMouvement === 'SORTIE'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaArrowDown className="w-4 h-4" />
                  <span>Sortie</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeMouvement('AJUSTEMENT')}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    typeMouvement === 'AJUSTEMENT'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaAdjust className="w-4 h-4" />
                  <span>Ajustement</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="input-field"
                placeholder="0"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif (optionnel)
              </label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="input-field"
                rows="2"
                placeholder="Raison de l'ajustement..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                {getMouvementIcon()}
                <span className="text-sm font-medium">
                  {getMouvementLabel()}
                </span>
              </div>
              <div className="flex space-x-3">
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
                  <span>{mutation.isPending ? 'Traitement...' : 'Valider'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjusterStockModal;