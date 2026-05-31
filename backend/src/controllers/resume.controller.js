const resumeService = require('../services/resume.service');


// Upload resume + trigger AI parsing
const uploadResume = async (req, res, next) => {
    try {
        // req.file is set by Multer middleware (upload.single('resume'))
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded',
            });
        }

        const { jobId } = req.body;
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'jobId is required',
            });
        }

        // req.user.id comes from the JWT via authenticate middleware
        const result = await resumeService.uploadAndParseResume({
            fileBuffer: req.file.buffer,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            candidateId: req.user.id,
            jobId,
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded and parsed successfully',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// Get all applications for the logged-in candidate
const getMyApplications = async (req, res, next) => {
    try {
        const applications = await resumeService.getCandidateApplications(req.user.id);
        res.json({
            success: true,
            data: { applications },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadResume, getMyApplications };