const jobService = require('../services/job.service');

// POST /api/v1/jobs — recruiter creates a job
const createJob = async (req, res, next) => {
    try {
        const { title, description, required_skills } = req.body;

        if (!title || !description || !required_skills) {
            return res.status(400).json({
                success: false,
                message: 'title, description, and required_skills are required',
            });
        }

        const job = await jobService.createJob({
            recruiterId: req.user.id,
            title,
            description,
            requiredSkills: required_skills,
        });

        res.status(201).json({ success: true, data: { job } });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/jobs/my-jobs — recruiter sees their own jobs with application counts
const getMyJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.getRecruiterJobs(req.user.id);
        res.json({ success: true, data: { jobs } });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/jobs — all active jobs (candidates use this)
const getAllJobs = async (req, res, next) => {
    try {
        const pool = require('../config/db');
        const result = await pool.query(
            `SELECT j.id, j.title, j.description, j.required_skills, j.created_at,
              u.name AS recruiter_name
       FROM jobs j
       JOIN users u ON j.recruiter_id = u.id
       WHERE j.is_active = true
       ORDER BY j.created_at DESC`
        );
        res.json({ success: true, data: { jobs: result.rows } });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/jobs/:jobId/candidates — ranked candidate list for a job
const getCandidates = async (req, res, next) => {
    try {
        const candidates = await jobService.getCandidatesForJob(
            req.params.jobId,
            req.user.id
        );
        res.json({ success: true, data: { candidates } });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/jobs/applications/:applicationId — single candidate detail
const getApplicationDetail = async (req, res, next) => {
    try {
        const application = await jobService.getApplicationDetail(
            req.params.applicationId,
            req.user.id
        );
        res.json({ success: true, data: { application } });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/v1/jobs/applications/:applicationId/status — update candidate status
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['applied', 'reviewed', 'interviewed', 'hired', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const application = await jobService.updateApplicationStatus(
            req.params.applicationId,
            status,
            req.user.id
        );

        res.json({ success: true, data: { application } });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/v1/jobs/:jobId/toggle — activate or deactivate a job posting
const toggleJob = async (req, res, next) => {
    try {
        const job = await jobService.toggleJobStatus(req.params.jobId, req.user.id);
        res.json({ success: true, data: { job } });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createJob,
    getMyJobs,
    getAllJobs,
    getCandidates,
    getApplicationDetail,
    updateStatus,
    toggleJob,
};