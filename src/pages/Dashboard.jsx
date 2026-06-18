import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBed, 
  FaStethoscope, FaPills, FaFileInvoice, FaChartLine,
  FaUserMd, FaClock, FaHospitalUser, FaHandHoldingUsd,
  FaCheckCircle, FaSearch, FaShoppingCart
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import OrdonnanceForm from '../pages/Consultations/OrdonnanceForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [isOrdonnanceOpen, setIsOrdonnanceOpen] = useState(false);

  // Requêtes API - TOUJOURS appelées dans le même ordre
  const { data: patientsData } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: () => api.get('/patients'),
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'RECEPTIONNISTE'
  });

  const { data: rdvsData } = useQuery({
    queryKey: ['dashboard-rdvs'],
    queryFn: () => api.get('/rendez-vous'),
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'MEDECIN' || user?.role === 'RECEPTIONNISTE'
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/factures/stats'),
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CAISSIER'
  });

  const { data: chambresData } = useQuery({
    queryKey: ['dashboard-chambres'],
    queryFn: () => api.get('/chambres/stats'),
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  });

  const { data: produitsData } = useQuery({
    queryKey: ['dashboard-produits'],
    queryFn: () => api.get('/produits/stock-critique'),
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  });

  // Requête pour les statistiques du caissier
  const { data: caissierStats } = useQuery({
    queryKey: ['caissier-stats'],
    queryFn: async () => {
      const response = await api.get('/pos/caissier-stats');
      return response.data;
    },
    enabled: user?.role === 'CAISSIER'
  });

  // Extraction sécurisée des données
  const patients = patientsData?.data?.data || patientsData?.data || [];
  const rdvs = rdvsData?.data?.data || rdvsData?.data || [];
  const stats = statsData?.data?.statistiques || {};
  const chambres = chambresData?.data?.global || {};
  const produitsCritiques = produitsData?.data?.data || produitsData?.data || [];
  const caissierStatsData = caissierStats?.data || {};

  const getRoleTitle = () => {
    const titles = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CAISSIER': 'Caissier',
      'RECEPTIONNISTE': 'Réceptionniste'
    };
    return titles[user?.role] || 'Utilisateur';
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // ============================================
  // DASHBOARD SUPER ADMIN & ADMIN
  // ============================================
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
    const statsCards = [
      { title: 'Total Patients', value: patients.length, icon: FaUsers, color: 'bg-blue-500', change: '+12%' },
      { title: 'Rendez-vous', value: rdvs.length, icon: FaCalendarCheck, color: 'bg-green-500', change: '+8%' },
      { title: 'Chiffre d\'affaires', value: `${(stats.montant_total || 0).toLocaleString()} FCFA`, icon: FaMoneyBillWave, color: 'bg-yellow-500', change: '+15%' },
      { title: 'Taux occupation', value: `${Math.round(chambres.taux_occupation || 0)}%`, icon: FaBed, color: 'bg-purple-500', change: '+5%' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {getWelcomeMessage()}, {user?.nom}
            </h1>
            <p className="text-gray-500 mt-1">Tableau de bord - {getRoleTitle()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                  <p className="text-green-500 text-sm mt-2">{card.change}</p>
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaClock className="mr-2 text-blue-600" />
              Rendez-vous récents
            </h2>
            <div className="space-y-3">
              {rdvs.length > 0 ? (
                rdvs.slice(0, 5).map((rdv, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{rdv.patient_nom} {rdv.patient_prenom}</p>
                      <p className="text-sm text-gray-500">Dr. {rdv.medecin_nom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">{rdv.statut === 'CONFIRME' ? '✅ Confirmé' : '⏳ En attente'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucun rendez-vous</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaPills className="mr-2 text-red-600" />
              Stock critique
            </h2>
            <div className="space-y-3">
              {produitsCritiques.length > 0 ? (
                produitsCritiques.slice(0, 5).map((produit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{produit.nom}</p>
                      <p className="text-sm text-red-600">Stock: {produit.quantite} unités</p>
                    </div>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      Commander
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-green-600 text-center">✅ Tous les stocks sont suffisants</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // DASHBOARD MÉDECIN
  // ============================================
  if (user?.role === 'MEDECIN') {
    const rdvsToday = rdvs.filter(rdv => {
      const today = new Date().toDateString();
      return new Date(rdv.date_rdv).toDateString() === today;
    });
    const rdvsWaiting = rdvs.filter(rdv => rdv.statut === 'EN_ATTENTE');
    const rdvsConfirmed = rdvs.filter(rdv => rdv.statut === 'CONFIRME');
    const rdvsTermined = rdvs.filter(rdv => rdv.statut === 'TERMINE');

    const statsCards = [
      { title: 'Rendez-vous aujourd\'hui', value: rdvsToday.length, icon: FaCalendarCheck, color: 'bg-blue-500' },
      { title: 'En attente', value: rdvsWaiting.length, icon: FaClock, color: 'bg-yellow-500' },
      { title: 'Confirmés', value: rdvsConfirmed.length, icon: FaCheckCircle, color: 'bg-green-500' },
      { title: 'Consultations', value: rdvsTermined.length, icon: FaStethoscope, color: 'bg-purple-500' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {getWelcomeMessage()}, Dr. {user?.nom}
          </h1>
          <p className="text-gray-500 mt-1">Tableau de bord - Médecin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarCheck className="mr-2 text-blue-600" />
            Rendez-vous du jour
          </h2>
          {rdvsToday.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun rendez-vous programmé pour aujourd'hui</p>
          ) : (
            <div className="space-y-3">
              {rdvsToday.map((rdv, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{rdv.patient_nom} {rdv.patient_prenom}</p>
                    <p className="text-sm text-gray-500">Motif: {rdv.motif || 'Non spécifié'}</p>
                    <p className="text-xs text-gray-400">Statut: {rdv.statut}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    {rdv.statut === 'EN_ATTENTE' && (
                      <button className="mt-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        Confirmer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Statistiques personnelles</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>Consultations cette semaine</span>
                <span className="font-bold text-xl">{rdvsTermined.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>Patients satisfaits</span>
                <span className="font-bold text-xl">--%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span>Temps moyen par consultation</span>
                <span className="font-bold text-xl">-- min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Actions rapides</h2>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/rendez-vous'}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaCalendarCheck className="w-5 h-5" />
                <span>Prendre un rendez-vous</span>
              </button>
              <button 
                onClick={() => setIsOrdonnanceOpen(true)}
                className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaStethoscope className="w-5 h-5" />
                <span>Rédiger une ordonnance</span>
              </button>
              <button 
                onClick={() => window.location.href = '/patients'}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaUsers className="w-5 h-5" />
                <span>Consulter les dossiers</span>
              </button>
            </div>
          </div>
        </div>

        {isOrdonnanceOpen && (
          <OrdonnanceForm
            onClose={() => setIsOrdonnanceOpen(false)}
            onSuccess={() => {
              setIsOrdonnanceOpen(false);
              toast.success('Ordonnance créée avec succès');
            }}
          />
        )}
      </div>
    );
  }

  // ============================================
  // DASHBOARD CAISSIER
  // ============================================
  if (user?.role === 'CAISSIER') {
    const caissierStats = caissierStatsData?.statistiques || {};
    const paiementsMois = caissierStatsData?.paiements_par_mois || [];
    const facturesImpayees = caissierStatsData?.factures_impayees || [];
    const dernieresVentes = caissierStatsData?.dernieres_ventes || [];

    const statsCards = [
      { 
        title: 'Total factures', 
        value: caissierStats.total_factures || 0, 
        icon: FaFileInvoice, 
        color: 'bg-blue-500' 
      },
      { 
        title: 'Montant total', 
        value: `${(caissierStats.montant_total || 0).toLocaleString()} FCFA`, 
        icon: FaMoneyBillWave, 
        color: 'bg-green-500' 
      },
      { 
        title: 'Montant perçu', 
        value: `${(caissierStats.montant_percu || 0).toLocaleString()} FCFA`, 
        icon: FaHandHoldingUsd, 
        color: 'bg-yellow-500' 
      },
      { 
        title: 'Impayés', 
        value: `${(caissierStats.montant_impaye || 0).toLocaleString()} FCFA`, 
        icon: FaChartLine, 
        color: 'bg-red-500' 
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {getWelcomeMessage()}, {user?.nom}
          </h1>
          <p className="text-gray-500 mt-1">Tableau de bord - Caissier</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📈 Évolution des paiements</h2>
            <div className="space-y-3">
              {paiementsMois.length > 0 ? (
                paiementsMois.slice(0, 6).map((mois, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{mois.mois}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 rounded-full h-2"
                          style={{ width: `${Math.min(100, (mois.total / (caissierStats.montant_total || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="font-medium">{mois.total?.toLocaleString()} FCFA</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Actions rapides</h2>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/pos'}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaShoppingCart className="w-5 h-5" />
                <span>Point de Vente</span>
              </button>
              <button 
                onClick={() => window.location.href = '/factures'}
                className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaFileInvoice className="w-5 h-5" />
                <span>Gérer les factures</span>
              </button>
              <button 
                onClick={() => window.location.href = '/factures'}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaSearch className="w-5 h-5" />
                <span>Rechercher une facture</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFileInvoice className="mr-2 text-red-600" />
            Factures impayées récentes
          </h2>
          {facturesImpayees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">✅ Aucune facture impayée en attente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Reste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facturesImpayees.map((facture) => (
                    <tr key={facture.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">#FAC-{facture.id}</td>
                      <td className="px-4 py-2 text-sm">{facture.patient_nom} {facture.patient_prenom}</td>
                      <td className="px-4 py-2 text-sm">{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-2 text-sm text-right">{facture.montant_total.toLocaleString()} FCFA</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">{facture.montant_paye?.toLocaleString() || 0} FCFA</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">{facture.solde_restant.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaShoppingCart className="mr-2 text-blue-600" />
            Dernières ventes
          </h2>
          {dernieresVentes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune vente enregistrée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dernieresVentes.map((vente) => (
                    <tr key={vente.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">#FAC-{vente.id}</td>
                      <td className="px-4 py-2 text-sm">{vente.patient_nom} {vente.patient_prenom}</td>
                      <td className="px-4 py-2 text-sm">{new Date(vente.date_facture).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-2 text-sm text-right">{vente.montant_total.toLocaleString()} FCFA</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">{vente.montant_paye?.toLocaleString() || 0} FCFA</td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vente.montant_paye >= vente.montant_total ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vente.montant_paye >= vente.montant_total ? 'Payée' : 'Partielle'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // DASHBOARD RÉCEPTIONNISTE
  // ============================================
  if (user?.role === 'RECEPTIONNISTE') {
    const rdvsToday = rdvs.filter(rdv => {
      const today = new Date().toDateString();
      return new Date(rdv.date_rdv).toDateString() === today;
    });
    const rdvsWaiting = rdvs.filter(rdv => rdv.statut === 'EN_ATTENTE');

    const statsCards = [
      { title: 'Rendez-vous aujourd\'hui', value: rdvsToday.length, icon: FaCalendarCheck, color: 'bg-blue-500' },
      { title: 'En attente', value: rdvsWaiting.length, icon: FaClock, color: 'bg-yellow-500' },
      { title: 'Patients enregistrés', value: patients.length, icon: FaUsers, color: 'bg-green-500' },
      { title: 'Chambres libres', value: '--', icon: FaBed, color: 'bg-purple-500' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {getWelcomeMessage()}, {user?.nom}
          </h1>
          <p className="text-gray-500 mt-1">Tableau de bord - Réceptionniste</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendarCheck className="mr-2 text-blue-600" />
            Agenda du jour
          </h2>
          {rdvsToday.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun rendez-vous programmé pour aujourd'hui</p>
          ) : (
            <div className="space-y-3">
              {rdvsToday.map((rdv, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{rdv.patient_nom} {rdv.patient_prenom}</p>
                    <p className="text-sm text-gray-500">Dr. {rdv.medecin_nom} - {rdv.specialite}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className={`text-xs px-2 py-1 rounded ${rdv.statut === 'CONFIRME' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {rdv.statut === 'CONFIRME' ? 'Confirmé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => window.location.href = '/patients'}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            <FaUserMd className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold">Nouveau patient</h3>
            <p className="text-sm text-gray-500">Enregistrer un patient</p>
          </div>
          <div 
            onClick={() => window.location.href = '/rendez-vous'}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            <FaCalendarCheck className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold">Prendre RDV</h3>
            <p className="text-sm text-gray-500">Planifier consultation</p>
          </div>
          <div 
            onClick={() => window.location.href = '/chambres'}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            <FaBed className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold">Hospitalisation</h3>
            <p className="text-sm text-gray-500">Attribuer une chambre</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - Chargement
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
      </div>
    </div>
  );
};

export default Dashboard;