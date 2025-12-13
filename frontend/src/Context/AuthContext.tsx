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
         role: 'attendee' | 'organizer';
         acceptedOrganizerTerms: boolean; 
    }

interface AuthContextType {
         user: User | null;
         loading: boolean;
         login: (identifier: string, password: string) => Promise<void>;
         logout: () => void
         refreshToken: ()=> Promise<void>
            //  function To update the user state after term acceptance
         setAcceptedOrganizerTerms: (accepted: boolean) => void;
 }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider:
        React.FC<{children: React.ReactNode}> = ({children}) => {
        const [user, setUser] = useState<User | null>(null)
         const [loading, setLoading] = useState(true)
         const navigate = useNavigate() 

const checkAuth = async () => {
    // 1. Check for stored user/token
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    
    if (storedUser && storedAccessToken) {
        // Optimistically set user data
        setUser(JSON.parse(storedUser));
        
        // 2. Attempt token refresh to verify session validity
        try {
            await refreshToken(); // This refreshes the token and saves it
            // If successful, the user is authenticated and the token is fresh
        } catch (error) {
            // If refresh fails (token expired, server error), force client-side logout
            console.warn("Stored session invalid, logging out.");
            logout(false); // Use a new logout helper without navigating immediately
        }
    }
    
    // 3. FINALLY, set loading to false. All other components must wait for this.
    setLoading(false);
};

const login = async (identifier: string, password: string) => {
         setLoading(true);
         try {
         const response = await apiFetch<{
         accessToken: string;
         user: User 
         }>('/api/auth/login', {
         method: 'Post',
         credentials: 'include',
         body: JSON.stringify({email: identifier.includes('@') ? identifier : undefined,
         userName: !identifier.includes('@') ? identifier : undefined, password
         })
         }) 

         
         // Save tokens and user
         localStorage.setItem('accessToken', response.accessToken)
         localStorage.setItem('user',JSON.stringify(response.user))

         setUser(response.user)

        if (response.user.role === 'attendee') {
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


            // Function to update the user's acceptance status
 const setAcceptedOrganizerTerms = (accepted: boolean) => {
                setUser(prevUser => {
                    if (prevUser) {
                        const updatedUser = { ...prevUser, acceptedOrganizerTerms: accepted };
                        //  update localStorage so the acceptance persists across tab refreshes
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        return updatedUser;
                    }
                    return null;
                });
     };
            
        
   const logout = (shouldNavigate = true) => {
    // Clear storage/state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    
    if (shouldNavigate) {
        navigate('/login');
    }
    // Note: The apiClient calls window.authLogout(), which will now use this helper.
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
        // run initial check
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
            if(!context){
     throw new Error('useAuth must be used within an AuthProvider')
            }
            return context 
        };