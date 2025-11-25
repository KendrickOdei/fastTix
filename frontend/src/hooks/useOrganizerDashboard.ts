import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiClient";

interface DashboardResponse {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: Array<{
        _id: string;
        name: string;
        date: string;
        image?: string;
        ticketSold: number;
        ticketsRemaining: number;
    }>
}

export  function useOrganizerDashboard(){
    const [data, setData] = useState<DashboardResponse| null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect( ()=>{
        const getDashboardData = async () => {
            try {
            
            const res = await apiFetch<DashboardResponse>('/api/organizer/dashboard-overview')

            setData(res)
        } catch (err) {
                console.error('fetch failed', err)
                setError(true)
            }finally{
                setLoading(false)
            }
        }

        getDashboardData()
      

         
    },[])

    return {data,loading,error}
}