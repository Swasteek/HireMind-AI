const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
    '/recruiter',
    authenticate,
    authorize('recruiter'),
    dashboardController.getRecruiterDashboard
);

router.get(
    '/candidate',
    authenticate,
    authorize('candidate'),
    dashboardController.getCandidateDashboard
);

module.exports = router;