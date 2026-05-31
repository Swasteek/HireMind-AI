const multer = require('multer');

// WHY memoryStorage?
// We don't want to save the file to the server's disk.
// We receive it, immediately push it to Supabase Storage, then discard it.
// memoryStorage keeps the file as a Buffer in req.file.buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed'), false); // Reject
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max — resumes don't need to be larger
    },
});

module.exports = upload;