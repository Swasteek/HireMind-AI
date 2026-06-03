const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ── Recruiter routes ──────────────────────────────────────────────────────────
// Generate interview questions for a candidate
router.post(
    '/generate/:applicationId',
    authenticate,
    authorize('recruiter'),
    interviewController.generateInterview
);

// View AI evaluation result for a candidate
router.get(
    '/result/:applicationId',
    authenticate,
    authorize('recruiter'),
    interviewController.getInterviewResult
);

// ── Candidate routes ──────────────────────────────────────────────────────────
// Get all interviews assigned to the logged-in candidate
router.get(
    '/my-interviews',
    authenticate,
    authorize('candidate'),
    interviewController.getMyInterviews
);

// Submit answers — triggers AI evaluation
router.post(
    '/:sessionId/submit',
    authenticate,
    authorize('candidate'),
    interviewController.submitAnswers
);

module.exports = router;