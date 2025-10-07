import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);

    return (
        <AuthContext.Provider value={{authenticated, setAuthenticated}}>
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = () => { return useContext(AuthContext); }