import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import chambreService from '../../services/chambreService';

const ChambreForm = ({ chambre, mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    numero: '',
    type_chambre: 'SIMPLE',
    tarif: '',
    nombre_lits: '1',
    statut: 'LIBRE'
  });

  useEffect(() => {
    if (chambre && mode === 'edit') {
      setFormData({
        numero: chambre.numero || '',
        type_chambre: chambre.type_chambre || 'SIMPLE',
        tarif: chambre.tarif || '',
        nombre_lits: chambre.total_lits || '1',
        statut: chambre.statut || 'LIBRE'
      });
    }
  }, [chambre, mode]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (mode === 'create') {
        return chambreService.createChambre(data);
      } else {
        return chambreService.updateChambre(chambre.id, data);
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
    
    if (!formData.numero) {
      toast.error('Le numéro de chambre est requis');
      return;
    }

    if (!formData.tarif || parseFloat(formData.tarif) <= 0) {
      toast.error('Le tarif doit être supérieur à 0');
      return;
    }

    const submitData = {
      ...formData,
      tarif: parseFloat(formData.tarif),
      nombre_lits: parseInt(formData.nombre_lits) || 1
    };

    mutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Ajouter une chambre' : 'Modifier la chambre'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de chambre *
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: 101, A101, VIP-01"
              required
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de chambre *
            </label>
            <select
              name="type_chambre"
              value={formData.type_chambre}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="SIMPLE">Simple</option>
              <option value="DOUBLE">Double</option>
              <option value="SUITE">Suite</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarif par nuit (FCFA) *
            </label>
            <input
              type="number"
              name="tarif"
              value={formData.tarif}
              onChange={handleChange}
              className="input-field"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de lits
              </label>
              <input
                type="number"
                name="nombre_lits"
                value={formData.nombre_lits}
                onChange={handleChange}
                className="input-field"
                placeholder="1"
                min="1"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">Nombre de lits dans cette chambre</p>
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="input-field"
              >
                <option value="LIBRE">Libre</option>
                <option value="OCCUPEE">Occupée</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          )}

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

export default ChambreForm;