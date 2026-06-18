import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layouts/MainLayout';
import PatientsList from './pages/Patients/PatientsList';
import RendezVousList from './pages/RendezVous/RendezVousList';
import ConsultationsList from './pages/Consultations/ConsultationsList';
import ProduitsList from './pages/Produits/ProduitsList';
import FacturesList from './pages/Factures/FacturesList';
import ChambresList from './pages/Chambres/ChambresList';
import Profile from './pages/Settings/Profile';  
import UsersList from './pages/Users/UsersList';
import PointDeVente from './pages/Pos/PointDeVente';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="rendez-vous" element={<RendezVousList />} />
        <Route path="consultations" element={<ConsultationsList />} />
        <Route path="produits" element={<ProduitsList />} />
        <Route path="factures" element={<FacturesList />} />
        <Route path="chambres" element={<ChambresList />} />
        <Route path="profile" element={<Profile />} /> 
        <Route path="users" element={<UsersList />} />
        <Route path="pos" element={<PointDeVente />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;