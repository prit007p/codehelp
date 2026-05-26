import axios from 'axios';
import { getClerkToken } from './src/lib/clerkToken';

console.log("Current Backend URL:",
    import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    withCredentials: false
});

axiosInstance.interceptors.request.use(async(config) => {
    const token = await getClerkToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers.Authorization) {
        delete config.headers.Authorization;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
