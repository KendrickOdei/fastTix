import { useEffect, useState } from 'react';
import { adminService, AdminStats } from './services/adminService';


export const StatsCard: React.FC<{ title: string; value: string | number;  trend: string; color: string }> = ({ title, value,trend, color }) => (
    <div className={`p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 ${color}`}>
        <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <h2 className="text-3xl font-black text-white mt-1">{value}</h2>
        </div>
        
         <h2 className="text-3xl font-black text-white mt-1">{trend}</h2>

    </div>
);


const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading platform data...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard 
          title="Revenue" 
          value={`GHS ${stats?.totalRevenue.toLocaleString() || 0}`} 
          trend="+12%" 
          color="bg-green-600 hover:bg-green-700"
        />
        <StatsCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          trend="+5%" 
          color="bg-blue-600 hover:bg-blue-700"
        />
        <StatsCard 
          title="Events" 
          value={stats?.totalEvents || 0} 
          trend="0%" 
          color="bg-yellow-600 hover:bg-yellow-700"
        />
        <StatsCard 
          title="Tickets" 
          value={stats?.actualTicketsQty || 0} 
          trend="+8%" 
          color="bg-orange-600 hover:bg-orange-700"
        />
      </div>
      
      {/* Rest of your dashboard UI */}
    </div>
  );
};

export default Dashboard;