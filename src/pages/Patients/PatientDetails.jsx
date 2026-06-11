import React from 'react';
import { FaTimes, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaTint, FaStethoscope, FaHistory } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import patientService from '../../services/patientService';

const PatientDetails = ({ patient, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['patientDetails', patient.id],
    queryFn: () => patientService.getPatientById(patient.id),
    enabled: !!patient.id
  });

  const patientData = data?.data || patient;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Détails du patient
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {patient.nom?.[0]}{patient.prenom?.[0]}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {patient.nom} {patient.prenom}
              </h3>
              <p className="text-gray-500">
                Patient ID: #{patient.id}
              </p>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-blue-600" />
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem 
                icon={FaCalendarAlt} 
                label="Date de naissance" 
                value={patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
              />
              <InfoItem 
                icon={FaTint} 
                label="Groupe sanguin" 
                value={patient.groupe_sanguin || 'Non renseigné'}
              />
              <InfoItem 
                icon={FaPhone} 
                label="Téléphone" 
                value={patient.telephone || 'Non renseigné'}
              />
              <InfoItem 
                icon={FaMapMarkerAlt} 
                label="Adresse" 
                value={patient.adresse || 'Non renseignée'}
              />
            </div>
          </div>

          {/* Antécédents médicaux */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaHistory className="mr-2 text-blue-600" />
              Antécédents médicaux
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {patient.antecedents || 'Aucun antécédent médical renseigné'}
              </p>
            </div>
          </div>

          {/* Consultations récentes */}
          {patientData.consultations_recentes && patientData.consultations_recentes.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaStethoscope className="mr-2 text-blue-600" />
                Consultations récentes
              </h4>
              <div className="space-y-3">
                {patientData.consultations_recentes.map((consultation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          Dr. {consultation.medecin_nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        {consultation.specialite}
                      </span>
                    </div>
                    {consultation.diagnostic && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Diagnostic:</strong> {consultation.diagnostic}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;