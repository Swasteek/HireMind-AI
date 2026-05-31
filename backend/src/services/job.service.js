const pool = require('../config/db');

// ─── Create a new job ─────────────────────────────────────────────────────────
const createJob = async ({ recruiterId, title, description, requiredSkills }) => {
    const result = await pool.query(
        `INSERT INTO jobs (recruiter_id, title, description, required_skills)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [recruiterId, title, description, requiredSkills]
    );
    return result.rows[0];
};

// ─── Get all jobs by a recruiter ──────────────────────────────────────────────
const getRecruiterJobs = async (recruiterId) => {
    const result = await pool.query(
        `SELECT
       j.*,
       COUNT(a.id) AS application_count,
       ROUND(AVG(a.match_score)) AS avg_match_score
     FROM jobs j
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.recruiter_id = $1
     GROUP BY j.id
     ORDER BY j.created_at DESC`,
        [recruiterId]
    );
    return result.rows;
};

// ─── Get all candidates for a job, ranked by match score ─────────────────────
// This is the core recruiter feature — ranked candidate list
const getCandidatesForJob = async (jobId, recruiterId) => {
    // First verify this job belongs to the recruiter (security check)
    const jobCheck = await pool.query(
        'SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2',
        [jobId, recruiterId]
    );

    if (jobCheck.rows.length === 0) {
        const err = new Error('Job not found or access denied');
        err.statusCode = 403;
        throw err;
    }

    // Join applications with users to get candidate name + email
    // ORDER BY match_score DESC = highest scoring candidate first
    const result = await pool.query(
        `SELECT
       a.id AS application_id,
       a.match_score,
       a.status,
       a.applied_at,
       a.resume_url,
       a.parsed_resume,
       u.id AS candidate_id,
       u.name AS candidate_name,
       u.email AS candidate_email
     FROM applications a
     JOIN users u ON u.id = a.candidate_id
     WHERE a.job_id = $1
     ORDER BY a.match_score DESC NULLS LAST`,
        [jobId]
    );

    return result.rows;
};

// ─── Get single application detail ───────────────────────────────────────────
const getApplicationDetail = async (applicationId, recruiterId) => {
    const result = await pool.query(
        `SELECT
       a.*,
       u.name AS candidate_name,
       u.email AS candidate_email,
       j.title AS job_title,
       j.description AS job_description,
       j.required_skills
     FROM applications a
     JOIN users u ON u.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = $1 AND j.recruiter_id = $2`,
        [applicationId, recruiterId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Application not found or access denied');
        err.statusCode = 404;
        throw err;
    }

    return result.rows[0];
};

// ─── Update application status ────────────────────────────────────────────────
// PATCH — only update the status field
const updateApplicationStatus = async (applicationId, status, recruiterId) => {
    // Verify recruiter owns the job this application belongs to
    const result = await pool.query(
        `UPDATE applications a
     SET status = $1
     FROM jobs j
     WHERE a.id = $2
       AND a.job_id = j.id
       AND j.recruiter_id = $3
     RETURNING a.*`,
        [status, applicationId, recruiterId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Application not found or access denied');
        err.statusCode = 404;
        throw err;
    }

    return result.rows[0];
};

// ─── Toggle job active/inactive ───────────────────────────────────────────────
const toggleJobStatus = async (jobId, recruiterId) => {
    const result = await pool.query(
        `UPDATE jobs
     SET is_active = NOT is_active
     WHERE id = $1 AND recruiter_id = $2
     RETURNING *`,
        [jobId, recruiterId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Job not found or access denied');
        err.statusCode = 404;
        throw err;
    }

    return result.rows[0];
};

module.exports = {
    createJob,
    getRecruiterJobs,
    getCandidatesForJob,
    getApplicationDetail,
    updateApplicationStatus,
    toggleJobStatus,
};