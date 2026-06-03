const interviewService = require('../services/interview.service');

// POST /api/v1/interviews/generate/:applicationId
// Recruiter triggers question generation for a specific candidate
const generateInterview = async (req, res, next) => {
    try {
        const result = await interviewService.generateInterview(
            req.params.applicationId,
            req.user.id
        );
        res.status(201).json({
            success: true,
            message: `Interview generated for ${result.candidateName}`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/interviews/my-interviews
// Candidate fetches all their pending/completed interviews
const getMyInterviews = async (req, res, next) => {
    try {
        const interviews = await interviewService.getCandidateInterview(req.user.id);
        res.json({ success: true, data: { interviews } });
    } catch (err) {
        next(err);
    }
};

// POST /api/v1/interviews/:sessionId/submit
// Candidate submits answers — triggers AI evaluation
const submitAnswers = async (req, res, next) => {
    try {
        const { answers } = req.body;

        // answers must be an array: [{questionId: 1, answer: "..."}, ...]
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'answers must be a non-empty array',
            });
        }

        const result = await interviewService.submitAnswers(
            req.params.sessionId,
            req.user.id,
            answers
        );

        res.json({
            success: true,
            message: 'Interview submitted and evaluated by AI',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/interviews/result/:applicationId
// Recruiter views the full AI evaluation of a candidate's interview
const getInterviewResult = async (req, res, next) => {
    try {
        const result = await interviewService.getInterviewResult(
            req.params.applicationId,
            req.user.id
        );
        res.json({ success: true, data: { result } });
    } catch (err) {
        next(err);
    }
};

module.exports = { generateInterview, getMyInterviews, submitAnswers, getInterviewResult };