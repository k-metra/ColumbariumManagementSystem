import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState("");

    return (
        <AuthContext.Provider value={{authenticated, setAuthenticated, username, setUsername}}>
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = () => { return useContext(AuthContext); }