require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
// cors: allow frontend (port 5173) to talk to this API (port 3000)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
// Every route is prefixed with /api/v1 — professional convention
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
// Hit this endpoint to verify the server is running: GET /api/health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HireMind API is running' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Any error passed to next(err) lands here
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HireMind API running on http://localhost:${PORT}`);
});