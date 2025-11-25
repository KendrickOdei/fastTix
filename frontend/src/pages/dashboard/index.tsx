import { useEffect, useState } from "react";
import StatsCard from "../../components/dashboard/StatsCard";
import QuickActions from "../../components/dashboard/QuickActions";
import OverviewEventList from "../../components/dashboard/OverviewEventList";

import { BarChart, Ticket, Calendar } from "lucide-react";
import { apiFetch } from "../../utils/apiClient";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    revenue: 0,
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await apiFetch("/api/dashboard/overview");

        setStats({
          totalEvents: res.totalEvents,
          ticketsSold: res.totalTicketsSold,
          revenue: res.totalRevenue,
        });

        setUpcomingEvents(res.upcomingEvents);
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      {/* Welcome */}
      <h1 className="text-2xl font-semibold">Welcome Back 👋</h1>
      <p className="text-gray-500 mb-6">Here’s what’s happening with your events.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatsCard title="Total Events" value={stats.totalEvents} icon={<Calendar />} />
        <StatsCard title="Tickets Sold" value={stats.ticketsSold} icon={<Ticket />} />
        <StatsCard title="Total Revenue" value={`GHS ${stats.revenue}`} icon={<BarChart />} />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <QuickActions />

      {/* Upcoming Events */}
      <div className="mt-10">
        <OverviewEventList events={upcomingEvents} />
      </div>
    </div>
  );
};

export default DashboardPage;
