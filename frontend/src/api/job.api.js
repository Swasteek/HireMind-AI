import api from './client';

export const jobApi = {
    // Recruiter
    create: (data) => api.post('/jobs', data),
    getMyJobs: () => api.get('/jobs/my-jobs'),
    getCandidates: (jobId) => api.get(`/jobs/${jobId}/candidates`),
    getApplicationDetail: (applicationId) => api.get(`/jobs/applications/${applicationId}`),
    updateStatus: (applicationId, status) =>
        api.patch(`/jobs/applications/${applicationId}/status`, { status }),
    toggleJob: (jobId) => api.patch(`/jobs/${jobId}/toggle`),

    // Candidate
    getAll: () => api.get('/jobs'),
};