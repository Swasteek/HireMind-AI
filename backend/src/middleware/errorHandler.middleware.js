// WHY a dedicated error handler?
// Currently our global error handler in index.js is a 3-liner.
// As the app grows, we need structured error handling:
// - Different formats for different error types
// - Never leak stack traces in production
// - Consistent error response shape across all routes

const errorHandler = (err, req, res, next) => {
    // Log the full error server-side (never expose this to client)
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        message: err.message,
        statusCode: err.statusCode,
        // Only show stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });

    // Determine status code
    // err.statusCode is set by us in services (e.g. 404, 409, 403)
    // err.status is sometimes set by third-party libraries
    const statusCode = err.statusCode || err.status || 500;

    // Handle specific error types
    // PostgreSQL unique constraint violation
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists',
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referenced record does not exist',
        });
    }

    // JWT errors (from jsonwebtoken library)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token has expired. Please login again.',
        });
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
        });
    }

    // Multer wrong file type (thrown by our fileFilter)
    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    // Default: generic error
    // In production, don't leak internal error messages for 500s
    const message = statusCode < 500
        ? err.message
        : process.env.NODE_ENV === 'development'
            ? err.message
            : 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;