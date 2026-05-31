const pdfModule = require('pdf-parse');
const pdf = pdfModule.default || pdfModule;
const supabase = require('../config/supabase');
const pool = require('../config/db');
const { parseResume, scoreResumeMatch } = require('./ai.service');

// ─── Upload PDF to Supabase Storage ──────────────────────────────────────────
// Takes the file buffer from Multer, uploads to Supabase Storage bucket.
// Returns the public URL of the uploaded file.
const uploadToStorage = async (fileBuffer, fileName, mimeType) => {
    // Create a unique file name to avoid collisions
    const uniqueName = `${Date.now()}-${fileName}`;
    const filePath = `resumes/${uniqueName}`;

    const { error } = await supabase.storage
        .from('hiremind-resumes') // This is your Supabase Storage bucket name
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false,
        });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    // Get the public URL — this is what we store in the DB
    const { data } = supabase.storage
        .from('hiremind-resumes')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// ─── Extract Text From PDF Buffer ────────────────────────────────────────────
// pdf-parse reads the binary PDF buffer and gives us raw text
const extractTextFromPDF = async (fileBuffer) => {
    console.log('pdf value:', pdf);
    console.log('pdf type:', typeof pdf);

    const data = await pdf(fileBuffer);

    if (!data.text || data.text.trim().length < 50) {
        throw new Error('PDF appears to be empty or scanned image — cannot extract text');
    }

    // Limit text length sent to Groq — saves tokens, keeps cost low
    return data.text.slice(0, 8000);
};

// ─── Main: Upload + Parse + Score + Save ─────────────────────────────────────
const uploadAndParseResume = async ({ fileBuffer, fileName, mimeType, candidateId, jobId }) => {

    // 1. Get the job details (we need description + required skills for scoring)
    const jobResult = await pool.query(
        'SELECT id, title, description, required_skills FROM jobs WHERE id = $1',
        [jobId]
    );

    if (jobResult.rows.length === 0) {
        const err = new Error('Job not found');
        err.statusCode = 404;
        throw err;
    }

    const job = jobResult.rows[0];

    // 2. Check if candidate already applied to this job
    const existing = await pool.query(
        'SELECT id FROM applications WHERE candidate_id = $1 AND job_id = $2',
        [candidateId, jobId]
    );

    if (existing.rows.length > 0) {
        const err = new Error('You have already applied to this job');
        err.statusCode = 409;
        throw err;
    }

    // 3. Upload PDF to Supabase Storage
    const resumeUrl = await uploadToStorage(fileBuffer, fileName, mimeType);

    // 4. Extract raw text from PDF
    const resumeText = await extractTextFromPDF(fileBuffer);

    // 5. Send text to Groq → get structured resume data
    const parsedResume = await parseResume(resumeText);

    // 6. Score the resume against the job description
    const matchResult = await scoreResumeMatch(
        parsedResume,
        `${job.title}: ${job.description}`,
        job.required_skills
    );

    // 7. Save everything to the applications table
    const result = await pool.query(
        `INSERT INTO applications
      (candidate_id, job_id, resume_url, parsed_resume, match_score, status)
     VALUES ($1, $2, $3, $4, $5, 'applied')
     RETURNING *`,
        [
            candidateId,
            jobId,
            resumeUrl,
            JSON.stringify({ ...parsedResume, match_details: matchResult }), // store all AI output
            matchResult.score,
        ]
    );

    const application = result.rows[0];

    return {
        application,
        parsedResume,
        matchResult,
        resumeUrl,
    };
};

// ─── Get candidate's applications ────────────────────────────────────────────
const getCandidateApplications = async (candidateId) => {
    const result = await pool.query(
        `SELECT
       a.id, a.status, a.match_score, a.applied_at, a.resume_url,
       a.parsed_resume,
       j.title AS job_title, j.description AS job_description
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.candidate_id = $1
     ORDER BY a.applied_at DESC`,
        [candidateId]
    );
    return result.rows;
};

module.exports = { uploadAndParseResume, getCandidateApplications };