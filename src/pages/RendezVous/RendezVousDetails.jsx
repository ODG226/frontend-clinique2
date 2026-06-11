import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaStethoscope, FaNotesMedical } from 'react-icons/fa';

const RendezVousDetails = ({ rdv, onClose }) => {
  const getStatusBadge = (statut) => {
    const config = {
      'EN_ATTENTE': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'CONFIRME': { label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
      'TERMINE': { label: 'Terminé', color: 'bg-green-100 text-green-800' },
      'ANNULE': { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };
    return config[statut] || { label: statut, color: 'bg-gray-100 text-gray-800' };
  };

  const status = getStatusBadge(rdv.statut);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Détails du Rendez-vous
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statut */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rendez-vous #{rdv.id}
              </h3>
              <p className="text-sm text-gray-500">
                Créé le {new Date(rdv.created_at || new Date()).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Patient */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <FaUserMd className="mr-2 text-blue-600" />
              Patient
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">{rdv.patient_nom} {rdv.patient_prenom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{rdv.patient_telephone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Médecin */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <FaStethoscope className="mr-2 text-green-600" />
              Médecin
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">Dr. {rdv.medecin_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Spécialité</p>
                <p className="font-medium">{rdv.specialite || 'Généraliste'}</p>
              </div>
            </div>
          </div>

          {/* Date et Heure */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-600" />
              Date et Heure
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Heure</p>
                <p className="font-medium">{new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          {/* Motif */}
          {rdv.motif && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <FaNotesMedical className="mr-2 text-red-600" />
                Motif
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{rdv.motif}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RendezVousDetails;