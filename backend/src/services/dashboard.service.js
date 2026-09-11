const pool = require('../config/db');

// ─── Recruiter: full ranked candidate list across all jobs ────────────────────
// Returns every application with resume score + interview score + combined score
// Combined = (match_score * 0.4) + (interview_score * 0.6)
const getRecruiterDashboard = async (recruiterId) => {
    const result = await pool.query(
        `SELECT
       a.id                  AS application_id,
       a.match_score,
       a.status,
       a.applied_at,
       a.parsed_resume,
       u.id                  AS candidate_id,
       u.name                AS candidate_name,
       u.email               AS candidate_email,
       j.id                  AS job_id,
       j.title               AS job_title,
       s.id                  AS session_id,
       s.score               AS interview_score,
       s.recommendation,
       s.ai_feedback,
       -- Combined score: weighted average
       -- NULLIF prevents division/null errors if interview not done yet
       CASE
         WHEN s.score IS NOT NULL AND a.match_score IS NOT NULL
           THEN ROUND((a.match_score * 0.4) + (s.score * 0.6))
         WHEN a.match_score IS NOT NULL
           THEN a.match_score
         ELSE NULL
       END                   AS combined_score
     FROM applications a
     JOIN users u ON u.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     LEFT JOIN interview_sessions s ON s.application_id = a.id
     WHERE j.recruiter_id = $1
     ORDER BY combined_score DESC NULLS LAST, a.match_score DESC NULLS LAST`,
        [recruiterId]
    );

    // Group by job for easier frontend rendering
    const byJob = {};
    for (const row of result.rows) {
        if (!byJob[row.job_id]) {
            byJob[row.job_id] = {
                jobId: row.job_id,
                jobTitle: row.job_title,
                candidates: [],
            };
        }
        byJob[row.job_id].candidates.push(row);
    }

    return {
        all: result.rows,           // flat list sorted by combined score
        byJob: Object.values(byJob), // grouped by job
        stats: buildStats(result.rows),
    };
};

// ─── Build summary stats for the dashboard header ────────────────────────────
const buildStats = (rows) => {
    const total = rows.length;
    const interviewed = rows.filter(r => r.interview_score !== null).length;
    const hired = rows.filter(r => r.recommendation === 'hire').length;
    const avgCombined = total > 0
        ? Math.round(rows.reduce((sum, r) => sum + (Number(r.combined_score) || 0), 0) / total)
        : 0;

    return { total, interviewed, hired, avgCombined };
};

// ─── Candidate: their own scores across all applications ─────────────────────
const getCandidateScores = async (candidateId) => {
    const result = await pool.query(
        `SELECT
       a.id          AS application_id,
       a.match_score,
       a.status,
       a.applied_at,
       j.title       AS job_title,
       j.description AS job_description,
       s.id          AS session_id,
       s.score       AS interview_score,
       s.recommendation,
       s.ai_feedback,
       s.questions,
       s.answers,
       CASE
         WHEN s.score IS NOT NULL AND a.match_score IS NOT NULL
           THEN ROUND((a.match_score * 0.4) + (s.score * 0.6))
         WHEN a.match_score IS NOT NULL
           THEN a.match_score
         ELSE NULL
       END           AS combined_score
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     LEFT JOIN interview_sessions s ON s.application_id = a.id
     WHERE a.candidate_id = $1
     ORDER BY combined_score DESC NULLS LAST, a.applied_at DESC`,
        [candidateId]
    );

    return result.rows;
};

module.exports = { getRecruiterDashboard, getCandidateScores };