import React, { useState } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import factureService from '../../services/factureService';

const FactureForm = ({ patients, onClose, onSuccess }) => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [lignes, setLignes] = useState([
    { description: '', quantite: 1, prix_unitaire: 0 }
  ]);

  const mutation = useMutation({
    mutationFn: (data) => factureService.createFacture(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });

  const handleAddLigne = () => {
    setLignes([...lignes, { description: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const handleRemoveLigne = (index) => {
    if (lignes.length > 1) {
      const newLignes = lignes.filter((_, i) => i !== index);
      setLignes(newLignes);
    }
  };

  const handleLigneChange = (index, field, value) => {
    const newLignes = [...lignes];
    newLignes[index][field] = field === 'quantite' ? parseInt(value) || 0 : value;
    setLignes(newLignes);
  };

  const calculateTotal = () => {
    return lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }

    if (lignes.some(ligne => !ligne.description || ligne.quantite <= 0 || ligne.prix_unitaire <= 0)) {
      toast.error('Veuillez remplir toutes les lignes de facture');
      return;
    }

    mutation.mutate({
      patient_id: selectedPatient,
      lignes: lignes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Nouvelle Facture
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Sélection patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nom} {patient.prenom}
                </option>
              ))}
            </select>
          </div>

          {/* Lignes de facture */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Détails de la facture *
              </label>
              <button
                type="button"
                onClick={handleAddLigne}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                <FaPlus className="w-3 h-3 mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2">
              {lignes.map((ligne, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Description"
                      value={ligne.description}
                      onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qté"
                      value={ligne.quantite}
                      onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                      className="input-field text-sm text-center"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Prix unitaire"
                      value={ligne.prix_unitaire}
                      onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                      className="input-field text-sm"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    {lignes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLigne(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total :</span>
              <span className="text-2xl font-bold text-blue-600">
                {calculateTotal().toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Boutons */}
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
              <span>{mutation.isPending ? 'Création...' : 'Créer la facture'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactureForm;