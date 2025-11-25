import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function OrganizerRoute() {
    const {user, loading} = useAuth()

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600">

                </div>
            </div>
        )
    }
    if(!user){
        return <Navigate to='/login' replace/>
    }

    if(user.role !== 'organizer'){
        return <Navigate to='/' replace/>
    }

    return <Outlet/>
}