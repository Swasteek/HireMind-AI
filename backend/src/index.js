require('dotenv').config();

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler.middleware');

const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'HireMind API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
// Any route not matched above hits this
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Must be last — Express identifies error handlers by 4 parameters (err, req, res, next)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HireMind API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});