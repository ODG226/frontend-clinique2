import React from 'react';
import { FaTimes, FaBed, FaHospitalUser, FaWrench, FaMoneyBillWave, FaDoorOpen, FaCheckCircle } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import chambreService from '../../services/chambreService';

const ChambreDetails = ({ chambre, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['chambreDetails', chambre.id],
    queryFn: () => chambreService.getChambreById(chambre.id),
    enabled: !!chambre.id
  });

  const chambreData = data?.data || chambre;

  const getStatusInfo = (statut) => {
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

  const statusInfo = getStatusInfo(chambre.statut);
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaDoorOpen className="mr-2 text-blue-600" />
            Détails de la chambre
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
              <h3 className="text-2xl font-bold text-gray-800">
                Chambre {chambre.numero}
              </h3>
              <p className="text-gray-500">{getTypeLabel(chambre.type_chambre)}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </span>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaMoneyBillWave className="text-green-600 mr-2" />
                <span className="text-gray-600">Tarif par nuit</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {chambre.tarif?.toLocaleString()} FCFA
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaBed className="text-blue-600 mr-2" />
                <span className="text-gray-600">Occupation</span>
              </div>
              <p className="text-2xl font-bold">
                {chambre.lits_occupes || 0} / {chambre.total_lits || 0} lits
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`rounded-full h-2 ${chambre.taux_occupation > 80 ? 'bg-red-600' : chambre.taux_occupation > 50 ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${chambre.taux_occupation || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Taux d'occupation: {Math.round(chambre.taux_occupation || 0)}%
              </p>
            </div>
          </div>

          {/* Liste des lits */}
          {chambreData.lits && chambreData.lits.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaBed className="mr-2 text-blue-600" />
                Lits
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {chambreData.lits.map((lit) => (
                  <div 
                    key={lit.id} 
                    className={`p-3 rounded-lg border ${
                      lit.statut === 'OCCUPE' 
                        ? 'bg-yellow-50 border-yellow-300' 
                        : 'bg-green-50 border-green-300'
                    }`}
                  >
                    <p className="font-medium">Lit {lit.numero_lit}</p>
                    <p className={`text-sm ${lit.statut === 'OCCUPE' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {lit.statut === 'OCCUPE' ? 'Occupé' : 'Libre'}
                    </p>
                    {lit.patient_nom && (
                      <p className="text-xs text-gray-500 mt-1">
                        Patient: {lit.patient_nom} {lit.patient_prenom}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {chambre.statut !== 'OCCUPEE' && chambre.statut !== 'MAINTENANCE' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Cette chambre est disponible pour l'hospitalisation.
              </p>
            </div>
          )}

          {chambre.statut === 'MAINTENANCE' && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                Cette chambre est en maintenance. Elle n'est pas disponible pour l'hospitalisation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChambreDetails;