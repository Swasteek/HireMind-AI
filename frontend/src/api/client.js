import axios from 'axios';

// WHY a central API file?
// Instead of writing axios.get('http://localhost:3000/api/v1/...') everywhere,
// we create ONE instance with the base URL pre-configured.
// If the API URL changes, we update it in ONE place.

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: automatically attach JWT to every request
// The token is stored in localStorage after login
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hiremind_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (token expired) globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired — clear storage and redirect to login
            localStorage.removeItem('hiremind_token');
            localStorage.removeItem('hiremind_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;