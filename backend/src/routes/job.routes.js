const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ── Candidate routes ──────────────────────────────────────────────────────────
// GET all active jobs — candidates pick from this list
router.get('/', authenticate, jobController.getAllJobs);

// ── Recruiter routes ──────────────────────────────────────────────────────────
// POST create a job
router.post('/', authenticate, authorize('recruiter'), jobController.createJob);

// GET recruiter's own jobs with stats
router.get('/my-jobs', authenticate, authorize('recruiter'), jobController.getMyJobs);

// GET all candidates for a specific job (ranked by score)
router.get('/:jobId/candidates', authenticate, authorize('recruiter'), jobController.getCandidates);

// PATCH toggle job active/inactive
router.patch('/:jobId/toggle', authenticate, authorize('recruiter'), jobController.toggleJob);

// ── Application routes ────────────────────────────────────────────────────────
// GET single application detail
router.get('/applications/:applicationId', authenticate, authorize('recruiter'), jobController.getApplicationDetail);

// PATCH update candidate status
router.patch('/applications/:applicationId/status', authenticate, authorize('recruiter'), jobController.updateStatus);

module.exports = router;