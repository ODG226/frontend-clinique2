import React from 'react';
import { FaTimes, FaFileInvoice, FaUserMd, FaCalendarAlt, FaMoneyBillWave, FaPrint, FaWallet } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import factureService from '../../services/factureService';

const FactureDetails = ({ facture, onClose, onPaiement }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['factureDetails', facture.id],
    queryFn: () => factureService.getFactureById(facture.id),
    enabled: !!facture.id
  });

  const factureData = data?.data || facture;
  const soldeRestant = factureData.montant_total - (factureData.montant_paye || 0);

  const getStatusBadge = (statut) => {
    const config = {
      'PAYEE': 'bg-green-100 text-green-800',
      'PARTIELLEMENT_PAYEE': 'bg-yellow-100 text-yellow-800',
      'NON_PAYEE': 'bg-red-100 text-red-800',
      'ANNULEE': 'bg-gray-100 text-gray-800'
    };
    return config[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'PAYEE': 'Payée',
      'PARTIELLEMENT_PAYEE': 'Partiellement payée',
      'NON_PAYEE': 'Non payée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFileInvoice className="mr-2 text-blue-600" />
            Facture #FAC-{facture.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* En-tête */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Date d'émission</p>
              <p className="font-medium">{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(facture.statut)}`}>
                {getStatusLabel(facture.statut)}
              </span>
            </div>
          </div>

          {/* Patient */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <FaUserMd className="mr-2 text-blue-600" />
              Patient
            </h4>
            <p className="font-medium">{facture.patient_nom} {facture.patient_prenom}</p>
          </div>

          {/* Détails de la facture */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Détails</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qté</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Prix unitaire</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {factureData.lignes?.map((ligne, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{ligne.description}</td>
                    <td className="px-4 py-2 text-sm text-center">{ligne.quantite}</td>
                    <td className="px-4 py-2 text-sm text-right">{ligne.prix_unitaire.toLocaleString()} FCFA</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      {(ligne.quantite * ligne.prix_unitaire).toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-right font-semibold">Total :</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">
                    {facture.montant_total.toLocaleString()} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paiements */}
          {factureData.paiements && factureData.paiements.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <FaWallet className="mr-2 text-green-600" />
                Historique des paiements
              </h4>
              <div className="space-y-2">
                {factureData.paiements.map((paiement, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{paiement.montant.toLocaleString()} FCFA</p>
                      <p className="text-xs text-green-600">{paiement.mode_paiement}</p>
                    </div>
                    <p className="text-sm text-green-600">
                      {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Récapitulatif financier */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total :</span>
                <span className="font-medium">{facture.montant_total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant payé :</span>
                <span className="font-medium text-green-600">{(factureData.montant_paye || 0).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Solde restant :</span>
                <span className={`font-bold text-lg ${soldeRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {soldeRestant.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          {facture.statut !== 'PAYEE' && facture.statut !== 'ANNULEE' && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  onClose();
                  onPaiement();
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <FaMoneyBillWave className="w-4 h-4" />
                <span>Enregistrer un paiement</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <FaPrint className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactureDetails;