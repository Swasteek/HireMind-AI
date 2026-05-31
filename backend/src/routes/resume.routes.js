const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All resume routes require authentication
// upload.single('resume') tells Multer to expect one file with field name 'resume'
router.post(
    '/upload',
    authenticate,
    authorize('candidate'),       // only candidates can upload resumes
    upload.single('resume'),      // Multer processes the file
    resumeController.uploadResume
);

router.get(
    '/my-applications',
    authenticate,
    authorize('candidate'),
    resumeController.getMyApplications
);

module.exports = router;