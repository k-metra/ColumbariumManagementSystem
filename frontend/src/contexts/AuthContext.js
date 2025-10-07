import { createContext, useContext, useState,useEffect } from 'react'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const savedToken = sessionStorage.getItem("token");
        const savedUsername = sessionStorage.getItem("username");

        if (savedToken && savedUsername) {
            // TODO: Verify token with backend, then set authenticated to true if valid
        }
    })


    return (
        <AuthContext.Provider value={{authenticated, setAuthenticated, username, setUsername, token, setToken }}>
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = () => { return useContext(AuthContext); }