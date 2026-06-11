import React, { useState } from 'react';
import { FaTimes, FaSave, FaMoneyBillWave } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import factureService from '../../services/factureService';

const PaiementModal = ({ facture, onClose, onSuccess }) => {
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const soldeRestant = facture.montant_total - (facture.montant_paye || 0);

  const mutation = useMutation({
    mutationFn: (data) => factureService.addPaiement(facture.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const montantValue = parseFloat(montant);
    if (!montant || montantValue <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    if (montantValue > soldeRestant) {
      toast.error(`Le montant ne peut pas dépasser le solde restant (${soldeRestant.toLocaleString()} FCFA)`);
      return;
    }

    mutation.mutate({
      montant: montantValue,
      mode_paiement: modePaiement
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-2 text-green-600" />
            Enregistrer un paiement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">Facture #FAC-{facture.id}</p>
            <p className="text-sm text-gray-600">Patient: {facture.patient_nom} {facture.patient_prenom}</p>
            <p className="text-sm font-medium mt-1">
              Solde restant: <span className="text-red-600">{soldeRestant.toLocaleString()} FCFA</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant à payer *
            </label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="input-field"
              placeholder="0"
              min="1"
              max={soldeRestant}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de paiement *
            </label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="input-field"
              required
            >
              <option value="ESPECES">Espèces</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARTE">Carte bancaire</option>
              <option value="VIREMENT">Virement</option>
            </select>
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
              <span>{mutation.isPending ? 'Traitement...' : 'Valider le paiement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaiementModal;