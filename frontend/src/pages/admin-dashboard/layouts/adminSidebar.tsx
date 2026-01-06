import { NavLink } from 'react-router-dom';
import { 
  FaChartLine, FaUsers, FaCalendarCheck, 
  FaMoneyBillWave, FaCog,  
} from 'react-icons/fa';
import { X } from 'lucide-react';

const AdminSidebar = ({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaChartLine /> },
    { name: 'User Management', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Event Moderation', path: '/admin/events', icon: <FaCalendarCheck /> },
    { name: 'Payouts', path: '/admin/payouts', icon: <FaMoneyBillWave /> },
    { name: 'Settings', path: '/admin/settings', icon: <FaCog /> },
  ];

  return (
    <aside className={`bg-white border-r  border-gray-200 flex flex-col h-full ${isMobile ? 'w-full ' : 'w-64'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tighter">
          fastTix Admin
        </h1>
        {isMobile && onClose && (
          <button onClick={onClose} className="text-gray-900 font-bold hover:text-gray-700">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;