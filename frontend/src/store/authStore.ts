import {create} from 'zustand'
import {persist} from 'zustand/middleware'

interface User {
    id: string;
    email: string;
    userName: string;

}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    loading: boolean;

    //Actions
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (value: boolean) => void
    refreshAccessToken: (newAccessToken: string) => void
}

export const useAuthStore =  create<AuthState>()(
    persist(
        (set)=>({
            user: null,
            accessToken: null,
            refreshToken: null,
            loading: false,

            login: (user, accessToken, refreshToken) => 
                set({user, accessToken, refreshToken}),

            logout: () => set({user: null, accessToken: null, refreshToken: null}),

            setLoading: (value) => set({loading: value}),

            refreshAccessToken: (newAccessToken) => set({accessToken: newAccessToken}),


        }),
        {
            name: 'fastTix-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken
            }),
        }
    )
)