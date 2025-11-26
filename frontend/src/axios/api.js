import axios from 'axios';

const localClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Session ${sessionStorage.getItem("session_token")}`
    }
})


const productionClient = axios.create({
    baseURL: 'https://mcj-parish.hopto.org/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Session ${sessionStorage.getItem("session_token")}`
    }
})