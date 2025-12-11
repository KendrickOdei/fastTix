// DashboardReportPage.tsx

import React, { useEffect, useState } from "react";
import { DollarSign, Ticket, Calendar, TrendingUp } from "lucide-react";
import { apiFetch } from "../../utils/apiClient";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

// Interface for the data received from the backend
interface OverviewData {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: {
        _id: string;
        name: string;
        date: string;
        image: string;
        ticketsSold: number;
        ticketsRemaining: number;
    }[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className={`p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 ${color}`}>
        <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <h2 className="text-3xl font-black text-white mt-1">{value}</h2>
        </div>
        {icon}
    </div>
);

const Overview: React.FC = () => {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await apiFetch<OverviewData>('/api/organizer/dashboard-overview'); 
                setData(res);
            } catch (err: any) {
                setError(err.message || "Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-8 text-red-400 bg-gray-900">
                Error: {error}
            </div>
        );
    }
    
    if (!data) return null; // Should be covered by loading/error states

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <h1 className="text-4xl font-black mb-10 border-b border-gray-700 pb-4">
                 Sales & Dashboard Overview
            </h1>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
                    title="Total Revenue" 
                    value={`Gh₵ ${data.totalRevenue.toFixed(2)}`} 
                    icon={<DollarSign className="w-8 h-8 opacity-50" />} 
                    color="bg-green-600 hover:bg-green-700" 
                />
                <StatCard 
                    title="Tickets Sold" 
                    value={data.totalTicketsSold} 
                    icon={<Ticket className="w-8 h-8 opacity-50" />} 
                    color="bg-blue-600 hover:bg-blue-700" 
                />
                <StatCard 
                    title="Total Events" 
                    value={data.totalEvents} 
                    icon={<Calendar className="w-8 h-8 opacity-50" />} 
                    color="bg-yellow-600 hover:bg-yellow-700" 
                />
               
                <StatCard 
                    title="Upcoming Events" 
                    value= {data.upcomingEvents.length}
                    icon={<TrendingUp className="w-8 h-8 opacity-50" />} 
                    color="bg-purple-600 hover:bg-purple-700" 
                />
            </div>

            {/* UPCOMING EVENTS LIST */}
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-800 pb-3">
                Upcoming Events ({data.upcomingEvents.length})
            </h2>
            
            <div className="space-y-4">
                {data.upcomingEvents.length === 0 ? (
                    <p className="text-gray-500 text-lg">No upcoming events scheduled.</p>
                ) : (
                    data.upcomingEvents.map(event => (
                        <div key={event._id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-700 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${event.image || '/placeholder.jpg'})` }} />
                                <div>
                                    <h3 className="text-xl font-bold">{event.name}</h3>
                                    <p className="text-green-400 text-sm">{format(new Date(event.date), "MMM d, yyyy")}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-lg text-blue-300">{event.ticketsSold} Sold</span>
                                <span className="text-sm text-gray-400">{event.ticketsRemaining} Remaining</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* You would add more complex charts and detailed sales tables here */}
        </div>
    );
};

export default Overview;