import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FaSearch, FaPlus, FaTrash, FaPrint, 
  FaShoppingCart, FaUser, FaMoneyBillWave,
  FaTimes, FaSave, FaReceipt, FaMoneyBill,
  FaCreditCard, FaMobile, FaUserPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import posService from '../../services/posService';
import patientService from '../../services/patientService';
import api from '../../services/api';
import Receipt from './Receipt';

const PointDeVente = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentVente, setCurrentVente] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    montant_recu: '',
    mode_paiement: 'ESPECES'
  });
  const [newPatientData, setNewPatientData] = useState({
    nom: '',
    prenom: '',
    telephone: ''
  });
  const searchInputRef = useRef();

  // Récupérer les patients
  const { data: patientsData, refetch: refetchPatients } = useQuery({
    queryKey: ['patients-pos'],
    queryFn: () => patientService.getAllPatients()
  });

  // Recherche instantanée de produits
  const searchMutation = useMutation({
    mutationFn: (query) => posService.searchProduits(query),
    onSuccess: (data) => {
      setSearchResults(data.data || []);
      setShowResults(data.data && data.data.length > 0);
    },
    onError: () => {
      setSearchResults([]);
      setShowResults(false);
    }
  });

  // Mutation pour créer la vente
  const venteMutation = useMutation({
    mutationFn: (data) => posService.createVente(data),
    onSuccess: (data) => {
      setCurrentVente(data.data);
      setShowReceipt(true);
      setShowPaymentModal(false);
      setCart([]);
      setSelectedPatient(null);
      setPaymentData({ montant_recu: '', mode_paiement: 'ESPECES' });
      toast.success('Vente enregistrée avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la vente');
    }
  });

  const patients = patientsData?.data || [];

  // Recherche instantanée
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounce = setTimeout(() => {
        searchMutation.mutate(searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const addToCart = (produit) => {
    if (produit.quantite_disponible <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    const existing = cart.find(item => item.id === produit.id);
    if (existing) {
      if (existing.quantite >= produit.quantite_disponible) {
        toast.error('Stock insuffisant');
        return;
      }
      setCart(cart.map(item => 
        item.id === produit.id 
          ? { ...item, quantite: item.quantite + 1, total: (item.quantite + 1) * item.prix_vente }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...produit, 
        quantite: 1, 
        total: produit.prix_vente 
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart[index];
    if (newQuantity > item.quantite_disponible) {
      toast.error('Stock insuffisant');
      return;
    }
    const newCart = [...cart];
    newCart[index].quantite = newQuantity;
    newCart[index].total = newCart[index].quantite * newCart[index].prix_vente;
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    const montantRecu = parseFloat(paymentData.montant_recu);
    const total = calculateTotal();

    if (!montantRecu || montantRecu < total) {
      toast.error(`Le montant reçu (${montantRecu || 0} FCFA) est inférieur au total (${total} FCFA)`);
      return;
    }

    const venteData = {
      patient_id: selectedPatient || null,
      lignes: cart.map(item => ({
        produit_id: item.id,
        quantite: item.quantite,
        prix_unitaire: item.prix_vente
      })),
      montant_recu: montantRecu,
      mode_paiement: paymentData.mode_paiement,
      montant_rendu: montantRecu - total
    };

    venteMutation.mutate(venteData);
  };

  const handleAddPatient = () => {
    if (!newPatientData.nom || !newPatientData.prenom) {
      toast.error('Le nom et le prénom sont requis');
      return;
    }

    patientService.createPatient(newPatientData)
      .then(() => {
        toast.success('Patient ajouté avec succès');
        setShowNewPatientModal(false);
        setNewPatientData({ nom: '', prenom: '', telephone: '' });
        refetchPatients();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
      });
  };

  const getStockStatus = (produit) => {
    if (produit.quantite_disponible <= 0) {
      return { label: 'Rupture de stock', color: 'bg-red-100 text-red-800' };
    }
    if (produit.quantite_disponible <= produit.stock_min) {
      return { label: 'Stock faible', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: `${produit.quantite_disponible} disponible(s)`, color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-3 text-blue-600" />
            Point de Vente
          </h1>
          <p className="text-gray-500 mt-1">Enregistrez les ventes et gérez les paiements</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-gray-500">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {!showReceipt ? (
        <>
          {/* Recherche patient et produit */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" />
                  Patient (optionnel)
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Client anonyme</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom} - {patient.telephone || 'pas de téléphone'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewPatientModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                    title="Ajouter un patient"
                  >
                    <FaUserPlus />
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaSearch className="inline mr-2" />
                  Rechercher un produit
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tapez le nom du produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full"
                  autoFocus
                />
                {/* Résultats de recherche */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((produit) => {
                      const stockStatus = getStockStatus(produit);
                      return (
                        <div
                          key={produit.id}
                          onClick={() => addToCart(produit)}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{produit.nom}</p>
                            <p className="text-sm text-gray-500">{produit.prix_vente.toLocaleString()} FCFA</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(produit);
                              }}
                              disabled={produit.quantite_disponible <= 0}
                              className={`px-3 py-1 rounded-lg text-white text-sm ${
                                produit.quantite_disponible > 0 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showResults && searchResults.length === 0 && searchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center">
                    <p className="text-gray-500">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panier */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                <FaShoppingCart className="inline mr-2 text-blue-600" />
                Panier
              </h2>
              <span className="text-sm text-gray-500">{cart.length} article(s)</span>
            </div>

            <div className="overflow-x-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Le panier est vide</p>
                  <p className="text-sm text-gray-400">Recherchez un produit ci-dessus pour l'ajouter</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cart.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{item.nom}</p>
                          <p className="text-xs text-gray-500">Stock: {item.quantite_disponible || 0}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => updateQuantity(index, item.quantite - 1)}
                              className="w-8 h-8 rounded-full border hover:bg-gray-100 flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantite}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border rounded py-1"
                              min="1"
                              max={item.quantite_disponible}
                            />
                            <button
                              onClick={() => updateQuantity(index, item.quantite + 1)}
                              className="w-8 h-8 rounded-full border hover:bg-gray-100 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">{item.prix_vente.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 text-right font-medium">{item.total.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-right font-bold text-lg">
                        Total :
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-xl text-blue-600">
                        {calculateTotal().toLocaleString()} FCFA
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-6 py-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setCart([])}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Vider le panier
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={venteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaMoneyBillWave className="w-4 h-4" />
                  <span>{venteMutation.isPending ? 'Traitement...' : 'Encaisser'}</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Receipt
          vente={currentVente}
          onPrint={() => window.print()}
          onNewSale={() => {
            setShowReceipt(false);
            setCurrentVente(null);
            setCart([]);
            setSelectedPatient(null);
          }}
        />
      )}

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" />
                Paiement
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Total à payer</p>
                <p className="text-3xl font-bold text-blue-600">{calculateTotal().toLocaleString()} FCFA</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <select
                  value={paymentData.mode_paiement}
                  onChange={(e) => setPaymentData({ ...paymentData, mode_paiement: e.target.value })}
                  className="input-field"
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CARTE">Carte bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant reçu
                </label>
                <input
                  type="number"
                  value={paymentData.montant_recu}
                  onChange={(e) => setPaymentData({ ...paymentData, montant_recu: e.target.value })}
                  className="input-field"
                  placeholder="0"
                  min={calculateTotal()}
                  step="100"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: {calculateTotal().toLocaleString()} FCFA
                </p>
              </div>

              {paymentData.montant_recu && parseFloat(paymentData.montant_recu) >= calculateTotal() && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant rendu :</span>
                    <span className="font-bold text-green-600">
                      {(parseFloat(paymentData.montant_recu) - calculateTotal()).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={venteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaSave className="w-4 h-4" />
                  <span>{venteMutation.isPending ? 'Traitement...' : 'Confirmer le paiement'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Patient */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUserPlus className="mr-2 text-green-600" />
                Ajouter un patient
              </h2>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newPatientData.nom}
                  onChange={(e) => setNewPatientData({ ...newPatientData, nom: e.target.value })}
                  className="input-field"
                  placeholder="Nom du patient"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={newPatientData.prenom}
                  onChange={(e) => setNewPatientData({ ...newPatientData, prenom: e.target.value })}
                  className="input-field"
                  placeholder="Prénom du patient"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newPatientData.telephone}
                  onChange={(e) => setNewPatientData({ ...newPatientData, telephone: e.target.value })}
                  className="input-field"
                  placeholder="+225 XX XX XX XX"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPatient}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointDeVente;