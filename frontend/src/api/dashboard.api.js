import api from './client';

export const dashboardApi = {
    getRecruiterDashboard: () => api.get('/dashboard/recruiter'),
    getCandidateDashboard: () => api.get('/dashboard/candidate'),
};