import axios from 'axios';

const api = axios.create({
    baseURL: 'https://logistics-management-1-lhlm.onrender.com/api',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
