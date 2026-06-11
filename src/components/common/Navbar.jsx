import React from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roles = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CAISSIER': 'Caissier',
      'RECEPTIONNISTE': 'Réceptionniste'
    };
    return roles[role] || role;
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaBars className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <FaUserCircle className="w-8 h-8 text-gray-600" />
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">
              {user?.nom}
            </p>
            <p className="text-xs text-gray-500">
              {getRoleLabel(user?.role)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;