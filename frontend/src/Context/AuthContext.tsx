import React, {createContext, useContext, useState, useEffect, } from 'react'
import { apiFetch } from '../utils/apiClient'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

declare global {
    interface Window {
        authRefreshToken: () => Promise<boolean>;
        authLogout: () => void;
    }
}

interface User {
    id: string;
    email: string;
    userName: string;
    fullName: string;
    organizationName: string;
    role: 'attendee' | 'organizer' | 'admin';
    acceptedOrganizerTerms: boolean; 
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void
    refreshToken: ()=> Promise<void>
    setAcceptedOrganizerTerms: (accepted: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate() 

   const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');
            
            if (storedUser && storedAccessToken) {
                const parsedUser = JSON.parse(storedUser);
                
                // Trust localStorage on initial load
                // Token refresh will happen automatically when API calls fail
                setUser(parsedUser);
            } else {
                console.log(' No stored credentials found');
            }
        } catch (error) {
            // Clear on any error
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier: string, password: string) => {
        setLoading(true);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        try {
            const response = await apiFetch<{
                accessToken: string;
                user: User 
            }>('/api/auth/login', {
                method: 'Post',
                credentials: 'include',
                body: JSON.stringify({
                    email: identifier.includes('@') ? identifier : undefined,
                    userName: !identifier.includes('@') ? identifier : undefined, 
                    password
                })
            }) 

            // Save tokens and user
            localStorage.setItem('accessToken', response.accessToken)
            localStorage.setItem('user', JSON.stringify(response.user))

            setUser(response.user)

             toast.success('Logged In Successful')
           

        } catch (error: any) {
            toast.error(error.message || 'Login failed')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const setAcceptedOrganizerTerms = (accepted: boolean) => {
        setUser(prevUser => {
            if (prevUser) {
                const updatedUser = { ...prevUser, acceptedOrganizerTerms: accepted };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return updatedUser;
            }
            return null;
        });
    };
            
    const logout = async (shouldNavigate = true) => {

        try {
            await apiFetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            });
        } catch {}
        // Clear storage/state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        
        if (shouldNavigate) {
            navigate('/login');
        }
    };

    const refreshToken = async () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Failed to refresh token')
        }
        
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken)
    }

    useEffect(() => {
        // Run initial check
        checkAuth();
        
        // Set global helper functions
        window.authRefreshToken = async () => {
            try {
                await refreshToken();
                return true;
            } catch {
                return false;
            }
        };

        window.authLogout = () => logout();
    }, []); 

    return (
        <AuthContext.Provider value={{
            user, 
            login, 
            logout, 
            loading, 
            refreshToken, 
            setAcceptedOrganizerTerms 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context 
};