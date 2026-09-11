const dashboardService = require('../services/dashboard.service');

// GET /api/v1/dashboard/recruiter
// Full combined scoring view for the recruiter
const getRecruiterDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getRecruiterDashboard(req.user.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/dashboard/candidate
// Candidate's own scores and feedback across all applications
const getCandidateDashboard = async (req, res, next) => {
    try {
        const scores = await dashboardService.getCandidateScores(req.user.id);
        res.json({ success: true, data: { scores } });
    } catch (err) {
        next(err);
    }
};

module.exports = { getRecruiterDashboard, getCandidateDashboard };