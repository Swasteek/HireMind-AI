import api from './client';

export const interviewApi = {
    // Recruiter: generate questions for a candidate
    generate: (applicationId) =>
        api.post(`/interviews/generate/${applicationId}`),

    // Recruiter: view AI evaluation result
    getResult: (applicationId) =>
        api.get(`/interviews/result/${applicationId}`),

    // Candidate: get all assigned interviews
    getMyInterviews: () =>
        api.get('/interviews/my-interviews'),

    // Candidate: submit answers
    submitAnswers: (sessionId, answers) =>
        api.post(`/interviews/${sessionId}/submit`, { answers }),
};