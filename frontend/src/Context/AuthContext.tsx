import React, {createContext, useContext, useState, useEffect, } from 'react'
import { apiFetch } from '../utils/apiClient'
import { toast } from 'react-toastify'
//import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

declare global {
  interface Window {
    authRefreshToken: () => Promise<boolean>;
    authLogout: () => void;
  }
}


// interface DecodedToken {
//     userId: string;
//     email: string;
//     userName: string;
//     organizationName: string;
//     role:'user' | 'organizer'
// }


interface User {
    id: string;
    email: string;
    userName: string;
    organizationName: string;
    role: 'user' | 'organizer'
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void
    refreshToken: ()=> Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider:
React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
    const storedUser = localStorage.getItem('user')
    const storedAccessToken = localStorage.getItem('accessToken')

    if (storedUser && storedAccessToken){
        setUser(JSON.parse(storedUser))
    }

    setLoading(false)
}, [])

    const login = async (identifier: string, password: string) => {
        setLoading(true);
        try {
            const response = await apiFetch<{
                accessToken: string;
                user: {id: string; email: string; 
                userName: string; organizationName: string; role: 'user' | 'organizer'}
            }>('/api/auth/login', {
                method: 'Post',
                credentials: 'include',
                body: JSON.stringify({email: identifier.includes('@') ? identifier : undefined,
                  userName:  !identifier.includes('@') ? identifier : undefined, password
                })
            }) 

            

            //save tokens and user
            localStorage.setItem('accessToken', response.accessToken)

            localStorage.setItem('user',JSON.stringify(response.user))

            setUser(response.user)

         if (response.user.role === 'user') {
                toast.success(`Welcome ${response.user.userName}`)
            } else {
                toast.success(`Welcome ${response.user.organizationName || response.user.userName}`)
            }


        } catch (error: any) {
            toast.error(error.message || 'Login failed')
            throw error;
        } finally{
            setLoading(false)
        }
        
    }


    const navigate = useNavigate()
    const logout = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            await fetch(`${baseUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            })

            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')

            setUser(null)
            navigate('/login')
        } catch (error) {
            console.error('Logout failed', error)
        }
        

        
    };

    const refreshToken = async () => {
        try {
           

             const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
            const response = await fetch(`${baseUrl}/api/auth/refresh-token`,{
                method: 'Post',
                headers: {'Content-Type':
                    'application/json'
                },
                credentials: 'include',
               
            })

            if(!response.ok) throw new Error('Failed to refresh token')
            
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken)

        } catch (error) {
            logout()
        }
    }

    useEffect(() => {
        window.authRefreshToken = async () => {
            try {
            await refreshToken();
            return true;
            } catch {
            return false;
            }
        };

        window.authLogout = () => logout();
        }, [refreshToken, logout]);

    return (
        <AuthContext.Provider value={{user, login, logout, loading, refreshToken}}>
            {children}
        </AuthContext.Provider>
    )
}

    export const useAuth = () => {
        const context = useContext(AuthContext)
        if(!context){
            throw new Error('useAuth must be used within an AuthProvider')
        }
        return context 
    };

    


