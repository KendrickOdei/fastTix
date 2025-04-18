// src/dashboard/DashboardSidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';

const DashboardSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white p-5 absolute right-0 mt-2   rounded-lg shadow-md z-10">
      <div className="text-xl mb-8">Dashboard</div>
      <ul>
        <li className="mb-4">
          <Link to="/dashboard" className="flex items-center text-lg">
            <FaHome className="mr-2" /> Home
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/dashboard/events" className="flex items-center text-lg">
            <FaTicketAlt className="mr-2" /> Events
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/dashboard/create-event" className="flex items-center text-lg">
            <FaPlusCircle className="mr-2" /> Create Event
          </Link>
        </li>
        <li>
          <button className="flex items-center text-lg">
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DashboardSidebar;
