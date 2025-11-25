import { useEffect,useState } from "react";
import { apiFetch } from "../utils/apiClient";

interface Events {
    _id: string;
    title: string;
    date: string;
    image?: string;
}

export function useEvent(){
    const [events, setEvents] = useState<Events[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false)

    useEffect(()=>{
        apiFetch<Events[]>("/api/events/mine")
         .then(setEvents)
         .catch(()=> setError(true))
         .finally(()=> setLoading(false))
    },[])

return {events, loading , error}
}