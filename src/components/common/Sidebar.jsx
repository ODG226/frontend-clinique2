import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarAlt, 
  FaStethoscope, 
  FaPills, 
  FaFileInvoice, 
  FaBed, 
  FaCog,
  FaUsersCog,
  FaSignOutAlt 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  // Liste unique des menus - PAS DE DOUBLONS !
  const menuItems = [
    { path: '/dashboard', name: 'Tableau de bord', icon: FaTachometerAlt, roles: ['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'CAISSIER', 'RECEPTIONNISTE'] },
    { path: '/patients', name: 'Patients', icon: FaUsers, roles: ['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'RECEPTIONNISTE'] },
    { path: '/rendez-vous', name: 'Rendez-vous', icon: FaCalendarAlt, roles: ['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'RECEPTIONNISTE'] },
    { path: '/consultations', name: 'Consultations', icon: FaStethoscope, roles: ['SUPER_ADMIN', 'ADMIN', 'MEDECIN'] },
    { path: '/produits', name: 'Médicaments', icon: FaPills, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { path: '/factures', name: 'Factures', icon: FaFileInvoice, roles: ['SUPER_ADMIN', 'ADMIN', 'CAISSIER'] },
    { path: '/chambres', name: 'Chambres', icon: FaBed, roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONNISTE'] },
    { path: '/profile', name: 'Profil', icon: FaCog, roles: ['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'CAISSIER', 'RECEPTIONNISTE'] },
    { path: '/users', name: 'Utilisateurs', icon: FaUsersCog, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  // Filtrer les menus selon le rôle de l'utilisateur
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center justify-between">
          <h1 className={`font-bold text-xl ${!isOpen && 'hidden'} transition-all`}>
            Clinique+
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 mb-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className={`ml-3 ${!isOpen && 'hidden'} transition-all`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-blue-100 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span className={`ml-3 ${!isOpen && 'hidden'} transition-all`}>
            Déconnexion
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;