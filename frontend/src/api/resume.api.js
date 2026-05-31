import api from './client';

export const resumeApi = {
    // Upload resume PDF — must use FormData, not JSON, for file uploads
    upload: (formData) =>
        api.post('/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getMyApplications: () => api.get('/resumes/my-applications'),
};

export const jobsApi = {
    getAll: () => api.get('/jobs'),
    create: (data) => api.post('/jobs', data),
};