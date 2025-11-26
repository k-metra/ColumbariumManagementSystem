import axios from 'axios';

const localClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})


const productionClient = axios.create({
    baseURL: 'https://mcj-parish.hopto.org/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const apiClient = process.env.REACT_APP_ENVIRONMENT === 'local' ? localClient : productionClient;

export default apiClient;