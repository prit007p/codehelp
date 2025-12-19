import axios from 'axios';

console.log("Current Backend URL:",
    import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
    withCredentials: true
});

export default axiosInstance;