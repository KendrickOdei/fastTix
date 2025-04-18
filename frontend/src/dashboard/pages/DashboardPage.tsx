// src/dashboard/pages/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to Your Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Upcoming Events</h2>
        <p>No upcoming events at the moment.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Your Recent Activities</h2>
        <p>You haven’t created any events yet. Start by adding your first event!</p>
      </div>

      {/* Call to action button to create a new event */}
      <div className="bg-blue-500 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4 text-white">Create Your First Event</h2>
        <Link to="/dashboard/create-event">
          <button className="bg-white text-blue-500 py-2 px-4 rounded-md">Create Event</button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
