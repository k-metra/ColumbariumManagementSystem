import Icon from "../icon";

import { useState, useEffect } from "react"; 
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [credentials, setCredentials] = useState({username: "", password: ""});
    const { setUsername, setAuthenticated, setToken } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setError("");
    }, [credentials])

    async function onSubmit(e) {
        e.preventDefault();

        await fetch('http://localhost:8000/users/login-api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
                return;
            }

            if (data.session_token) {
                setToken(data.session_token);
                setUsername(credentials.username);
                setAuthenticated(true);

                sessionStorage.setItem('token', data.session_token);
                sessionStorage.setItem('username', credentials.username);
                navigate('/dashboard');
            } else {
                setError(data.error || "Login failed");
            }
        })
        .catch(err => {
            console.error(err);
            setError("An error occurred");
        });
    }

    return (
        <div className="p-6 m-2 border rounded-md min-w-12 min-h-12 shadow-md bg-white">
            <div className="text-2xl font-bold mb-4 text-[rgb(60,60,60)] text-center">Admin Login</div>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                { error !== "" && <span className="text-md text-red-400 text-center">{error}</span>}
                <div id="field">
                    <label className="block mb-1 text-sm text-zinc-600 " htmlFor="username">Username</label>
                    <input onChange={(e) => {setCredentials({...credentials, username: e.target.value})}} className="w-full outline-none p-2 border rounded-md transition-all duration-300 ease-out shadow-inner hover:shadow-transparent focus:shadow-transparent focus:outline-blue-500" type="text" id="username" name="username" placeholder="Enter your username" required />
                </div>
                <div id="field">
                    <label className="block mb-1 text-sm text-zinc-600 " htmlFor="password">Password</label>
                    <input onChange={(e) => {setCredentials({...credentials, password: e.target.value})}} className="w-full outline-none p-2 border rounded-md transition-all duration-300 ease-out shadow-inner hover:shadow-transparent focus:shadow-transparent focus:outline-blue-500" type="password" id="password" name="password" placeholder="Enter your password" required />
                </div>
                <button className="w-full drop-shadow-md p-2 bg-blue-500 text-white rounded-md transition-all duration-200 ease-out  hover:bg-blue-600 hover:-translate-y-1" type="submit">
                    Login <Icon icon="fa-solid fa-arrow-right" className="inline ml-1" /> </button>
            </form>
        </div>
    )
}