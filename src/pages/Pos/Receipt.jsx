import React, { useRef } from 'react';
import { FaPrint, FaReceipt, FaHome } from 'react-icons/fa';

const Receipt = ({ vente, onPrint, onNewSale }) => {
  const receiptRef = useRef();

  if (!vente) return null;

const formatDate = (date) => {
    if (!date) return '--/--/---- --:--';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

  const getModePaiementLabel = (mode) => {
    const modes = {
      'ESPECES': 'Espèces',
      'MOBILE_MONEY': 'Mobile Money',
      'CARTE': 'Carte bancaire'
    };
    return modes[mode] || mode;
  };

  const getModePaiementIcon = (mode) => {
    const icons = {
      'ESPECES': '',
      'MOBILE_MONEY': '',
      'CARTE': ''
    };
    return icons[mode] || '';
  };

  // Vérifier si le patient est anonyme
  const isAnonyme = vente.patient_anonyme || 
    (vente.patient_nom === 'Client' && vente.patient_prenom === 'Anonyme');

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center no-print">
        <div className="flex space-x-3">
          <button
            onClick={onPrint}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPrint className="w-4 h-4" />
            <span>Imprimer le reçu</span>
          </button>
          <button
            onClick={onNewSale}
            className="btn-secondary flex items-center space-x-2"
          >
            <FaHome className="w-4 h-4" />
            <span>Nouvelle vente</span>
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Reçu #REC-{String(vente.id).padStart(6, '0')}</p>
          <p className="text-sm text-gray-500">{formatDate(vente.created_at || vente.date_facture)}</p>
        </div>
      </div>

      {/* Reçu à imprimer */}
      <div 
        ref={receiptRef}
        className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto"
        id="receipt"
      >
        <div className="text-center border-b pb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏥 Clinique+</h2>
          <p className="text-gray-600">Système de gestion de clinique</p>
          <p className="text-sm text-gray-500 mt-1">Reçu de vente</p>
          <p className="text-sm text-gray-500">N° REC-{String(vente.id).padStart(6, '0')}</p>
        </div>

        <div className="py-4 space-y-2 border-b">
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{formatDate(vente.created_at || vente.date_facture)}</span>
          </div>
          {/* Afficher le patient seulement s'il n'est pas anonyme */}
          {!isAnonyme && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Patient</span>
                <span className="font-medium">{vente.patient_nom} {vente.patient_prenom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone</span>
                <span className="font-medium">{vente.patient_telephone || 'Non renseigné'}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Mode de paiement</span>
            <span className="font-medium">
              {getModePaiementIcon(vente.mode_paiement)} {getModePaiementLabel(vente.mode_paiement)}
            </span>
          </div>
        </div>

        <div className="py-4">
          <h3 className="font-semibold text-gray-800 mb-3">Détails</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-sm font-medium text-gray-600 py-2">Description</th>
                <th className="text-center text-sm font-medium text-gray-600 py-2">Qté</th>
                <th className="text-right text-sm font-medium text-gray-600 py-2">Prix</th>
                <th className="text-right text-sm font-medium text-gray-600 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {vente.lignes && vente.lignes.map((ligne, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 text-sm">{ligne.nom_produit || ligne.description}</td>
                  <td className="py-2 text-sm text-center">{ligne.quantite}</td>
                  <td className="py-2 text-sm text-right">{ligne.prix_unitaire.toLocaleString()} FCFA</td>
                  <td className="py-2 text-sm text-right font-medium">{(ligne.quantite * ligne.prix_unitaire).toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan="3" className="py-3 text-right font-bold text-lg">Total</td>
                <td className="py-3 text-right font-bold text-lg text-blue-600">
                  {vente.montant_total.toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="py-2 text-right font-medium">Montant reçu</td>
                <td className="py-2 text-right font-medium text-green-600">
                  {(vente.montant_recu || vente.montant_paye || 0).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="py-2 text-right font-medium">Monnaie rendue</td>
                <td className="py-2 text-right font-medium text-orange-600">
                  {(vente.montant_rendu || 0).toLocaleString()} FCFA
                </td>
              </tr>
              {/* <tr className="border-t border-dashed">
                <td colSpan="3" className="py-3 text-right font-bold">Reste à payer</td>
                <td className="py-3 text-right font-bold text-red-600">
                  {(vente.montant_total - (vente.montant_recu || vente.montant_paye || 0)).toLocaleString()} FCFA
                </td>
              </tr> */}
            </tfoot>
          </table>
        </div>

        <div className="border-t pt-6 text-center">
          <p className="text-sm text-gray-500">Merci de votre visite !</p>
          <p className="text-xs text-gray-400 mt-2">Ce document fait foi de reçu</p>
          <p className="text-xs text-gray-400">Tous droits réservés © Clinique+</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt, #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: none;
            border-radius: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;