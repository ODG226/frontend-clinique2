import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaStethoscope, FaNotesMedical, FaPills, FaFileAlt } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import consultationService from '../../services/consultationService';

const ConsultationDetails = ({ consultation, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['consultationDetails', consultation.id],
    queryFn: () => consultationService.getConsultationById(consultation.id),
    enabled: !!consultation.id
  });

  const consultationData = data?.data || consultation;

  const InfoSection = ({ icon: Icon, title, children }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <Icon className="mr-2 text-blue-600" />
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Détails de la Consultation
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
          <div className="flex items-center space-x-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <FaStethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Consultation #{consultation.id}
              </h3>
              <p className="text-gray-500">
                {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Patient et Médecin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoSection icon={FaUserMd} title="Patient">
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Nom complet:</span>{' '}
                  <span className="font-medium">{consultation.patient_nom} {consultation.patient_prenom}</span>
                </p>
              </div>
            </InfoSection>

            <InfoSection icon={FaStethoscope} title="Médecin">
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Nom:</span>{' '}
                  <span className="font-medium">Dr. {consultation.medecin_nom}</span>
                </p>
                <p>
                  <span className="text-gray-500">Spécialité:</span>{' '}
                  <span className="font-medium">{consultation.specialite || 'Généraliste'}</span>
                </p>
              </div>
            </InfoSection>
          </div>

          {/* Date et Heure */}
          <InfoSection icon={FaCalendarAlt} title="Date et Heure">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-500">Heure</p>
                <p className="font-medium">{new Date(consultation.date_consultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </InfoSection>

          {/* Motif */}
          {consultation.motif && (
            <InfoSection icon={FaFileAlt} title="Motif de la consultation">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.motif}</p>
            </InfoSection>
          )}

          {/* Diagnostic */}
          {consultation.diagnostic && (
            <InfoSection icon={FaNotesMedical} title="Diagnostic">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.diagnostic}</p>
            </InfoSection>
          )}

          {/* Traitement */}
          {consultation.traitement && (
            <InfoSection icon={FaPills} title="Traitement prescrit">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.traitement}</p>
            </InfoSection>
          )}

          {/* Observations */}
          {consultation.observations && (
            <InfoSection icon={FaFileAlt} title="Observations">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.observations}</p>
            </InfoSection>
          )}

          {/* Examens associés */}
          {consultationData.examens && consultationData.examens.length > 0 && (
            <InfoSection icon={FaStethoscope} title="Examens prescrits">
              <div className="space-y-2">
                {consultationData.examens.map((examen, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <p className="font-medium">{examen.nom}</p>
                    <p className="text-sm text-gray-500">Type: {examen.type_examen}</p>
                    <p className="text-sm text-gray-500">Tarif: {examen.tarif} FCFA</p>
                  </div>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Ordonnance */}
          {consultationData.ordonnances && consultationData.ordonnances.length > 0 && (
            <InfoSection icon={FaPills} title="Ordonnance">
              <div className="space-y-3">
                {consultationData.ordonnances.map((ordonnance, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border">
                    <p className="text-sm text-gray-500 mb-2">
                      Date: {new Date(ordonnance.date_ordonnance).toLocaleDateString('fr-FR')}
                    </p>
                    {ordonnance.medicament && (
                      <div>
                        <p className="font-medium">{ordonnance.medicament}</p>
                        <p className="text-sm text-gray-600">{ordonnance.dosage}</p>
                        <p className="text-sm text-gray-500">Durée: {ordonnance.duree}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </InfoSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;