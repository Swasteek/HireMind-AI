const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const pool = require('../config/db');

// GET /api/v1/jobs — list all active jobs (candidates use this to pick a job)
router.get('/', authenticate, async (req, res, next) => {
    try {
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
});

// POST /api/v1/jobs — recruiter creates a job (Day 3 will move this to its own controller)
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { title, description, required_skills } = req.body;

        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ success: false, message: 'Only recruiters can create jobs' });
        }

        if (!title || !description || !required_skills) {
            return res.status(400).json({ success: false, message: 'title, description, and required_skills are required' });
        }

        const result = await pool.query(
            `INSERT INTO jobs (recruiter_id, title, description, required_skills)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, title, description, required_skills]
        );

        res.status(201).json({ success: true, data: { job: result.rows[0] } });
    } catch (err) {
        next(err);
    }
});

module.exports = router;