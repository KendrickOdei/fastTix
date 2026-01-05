import { FaUserCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { Menu } from 'lucide-react';

const AdminNavbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Convert "/admin/dashboard" to "Dashboard"
  const pageTitle = location.pathname.split('/').pop()?.replace('-', ' ') || 'Admin';

  return (
    <header className="bg-white w-full border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button className="md:hidden" onClick={onMenuClick}>
        <Menu size={28} />
      </button>
      
      {/* Page Title */}
      <h2 className="text-xl font-bold text-gray-800 capitalize">
        {pageTitle}
      </h2>
      

      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-green-600 transition-colors">
          {/* <FaBell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span> */}
        </button>

        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">{user?.organizationName || 'Admin User'}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{user?.role}</p>
          </div>
          <FaUserCircle size={35} className="text-gray-300" />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;