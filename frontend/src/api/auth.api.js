import api from './client';

// All auth-related API calls grouped together.
// Components import these functions — they never call axios directly.

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};