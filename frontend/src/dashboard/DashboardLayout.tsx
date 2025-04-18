// src/dashboard/DashboardLayout.tsx
import React from 'react';
import DashboardSidebar from './DashboardSidebar'; // Import the sidebar
import { Outlet } from 'react-router-dom'; // Used to render child routes

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar /> {/* Sidebar on the left */}
      <div className="flex-1 p-8"> {/* Main content area */}
        <Outlet /> {/* This will render the content of the current route */}
      </div>
    </div>
  );
};

export default DashboardLayout;
