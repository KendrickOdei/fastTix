
import StatsCard from "../../components/dashboard/StatsCard";


import { useOrganizerDashboard } from "../../hooks/useOrganizerDashboard";
import { useAuth } from "../../Context/AuthContext";


export default function Overview() {
    const {data, loading} = useOrganizerDashboard()
    const {user}= useAuth()

    const orgaName = user?.organizationName

if(loading){
    return(
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 border-b-4 border-green-600"></div>
        </div>
    )
}

if(!data){
    return <div className="tetx-red-500 text-center">Failed to load data</div>
}


 return (
    
        <div className="space-y-8">
            <h1 className="text-3xl font bold"> Welcome back, {orgaName}</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatsCard title="Total Events" value={data.totalEvents} />
            <StatsCard title="Tickets Sold" value={data.totalTicketsSold} />
            <StatsCard title="Total Revenue" value={`GHS${data.totalRevenue.toLocaleString()}`} />
            <StatsCard title="Upcoming Events" value={data.upcomingEvents.length} />

            </div>
        </div>
        


    
 )
}