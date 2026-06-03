const pool = require('../config/db');
const { generateInterviewQuestions, evaluateAnswers } = require('./ai.service');

// ─── Generate interview questions for a candidate ─────────────────────────────
// Called by recruiter. Fetches job + resume context, calls Groq, saves to DB.
const generateInterview = async (applicationId, recruiterId) => {

    // 1. Fetch application, job, and candidate data in one query
    const result = await pool.query(
        `SELECT
       a.id AS application_id,
       a.parsed_resume,
       a.candidate_id,
       j.id AS job_id,
       j.title AS job_title,
       j.description AS job_description,
       j.required_skills,
       j.recruiter_id,
       u.name AS candidate_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.candidate_id
     WHERE a.id = $1`,
        [applicationId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Application not found');
        err.statusCode = 404;
        throw err;
    }

    const data = result.rows[0];

    // Security: only the recruiter who owns this job can trigger an interview
    if (data.recruiter_id !== recruiterId) {
        const err = new Error('Access denied');
        err.statusCode = 403;
        throw err;
    }

    // 2. Check if interview already exists for this application
    const existing = await pool.query(
        'SELECT id FROM interview_sessions WHERE application_id = $1',
        [applicationId]
    );

    if (existing.rows.length > 0) {
        const err = new Error('Interview already generated for this candidate');
        err.statusCode = 409;
        throw err;
    }

    // 3. Call Groq to generate 5 questions
    const questions = await generateInterviewQuestions(
        data.job_title,
        data.job_description,
        data.required_skills,
        data.parsed_resume
    );

    // 4. Save the interview session (no answers yet — candidate fills those in)
    const session = await pool.query(
        `INSERT INTO interview_sessions (application_id, questions)
     VALUES ($1, $2)
     RETURNING *`,
        [applicationId, JSON.stringify(questions)]
    );

    // 5. Update application status to 'interviewed'
    await pool.query(
        `UPDATE applications SET status = 'interviewed' WHERE id = $1`,
        [applicationId]
    );

    return {
        session: session.rows[0],
        questions,
        candidateName: data.candidate_name,
    };
};

// ─── Get interview for a candidate ───────────────────────────────────────────
// Called by candidate to see their questions.
const getCandidateInterview = async (candidateId) => {
    // A candidate might have multiple applications/interviews — get all pending ones
    const result = await pool.query(
        `SELECT
       s.id AS session_id,
       s.questions,
       s.answers,
       s.score,
       s.ai_feedback,
       s.recommendation,
       s.created_at,
       a.id AS application_id,
       a.status,
       j.title AS job_title,
       j.description AS job_description
     FROM interview_sessions s
     JOIN applications a ON a.id = s.application_id
     JOIN jobs j ON j.id = a.job_id
     WHERE a.candidate_id = $1
     ORDER BY s.created_at DESC`,
        [candidateId]
    );

    return result.rows;
};

// ─── Submit interview answers ─────────────────────────────────────────────────
// Called by candidate. Saves answers, triggers AI evaluation.
const submitAnswers = async (sessionId, candidateId, answers) => {

    // 1. Verify this session belongs to this candidate
    const result = await pool.query(
        `SELECT s.*, j.title AS job_title, j.required_skills
     FROM interview_sessions s
     JOIN applications a ON a.id = s.application_id
     JOIN jobs j ON j.id = a.job_id
     WHERE s.id = $1 AND a.candidate_id = $2`,
        [sessionId, candidateId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Interview session not found or access denied');
        err.statusCode = 404;
        throw err;
    }

    const session = result.rows[0];

    // 2. Prevent re-submission
    if (session.answers) {
        const err = new Error('Interview already submitted');
        err.statusCode = 409;
        throw err;
    }

    // 3. Call Groq to evaluate the answers
    const evaluation = await evaluateAnswers(
        session.questions,   // The generated questions
        answers,             // Candidate's answers [{questionId, answer}]
        session.job_title,
        session.required_skills
    );

    // 4. Save answers + AI evaluation back to the session
    const updated = await pool.query(
        `UPDATE interview_sessions
     SET
       answers = $1,
       score = $2,
       ai_feedback = $3,
       recommendation = $4
     WHERE id = $5
     RETURNING *`,
        [
            JSON.stringify(answers),
            evaluation.overall_score,
            JSON.stringify(evaluation),  // Store full evaluation object
            evaluation.recommendation,
            sessionId,
        ]
    );

    return {
        session: updated.rows[0],
        evaluation,
    };
};

// ─── Get interview result (recruiter view) ────────────────────────────────────
const getInterviewResult = async (applicationId, recruiterId) => {
    const result = await pool.query(
        `SELECT
       s.*,
       a.candidate_id,
       a.match_score,
       u.name AS candidate_name,
       u.email AS candidate_email,
       j.title AS job_title,
       j.recruiter_id
     FROM interview_sessions s
     JOIN applications a ON a.id = s.application_id
     JOIN users u ON u.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     WHERE s.application_id = $1 AND j.recruiter_id = $2`,
        [applicationId, recruiterId]
    );

    if (result.rows.length === 0) {
        const err = new Error('Interview result not found or access denied');
        err.statusCode = 404;
        throw err;
    }

    return result.rows[0];
};

module.exports = {
    generateInterview,
    getCandidateInterview,
    submitAnswers,
    getInterviewResult,
};