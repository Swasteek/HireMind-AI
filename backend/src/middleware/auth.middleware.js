const jwt = require('jsonwebtoken');

// This middleware runs BEFORE any protected route handler.
// It checks: is there a valid JWT in the Authorization header?
const authenticate = (req, res, next) => {
    // Expected header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

    try {
        // jwt.verify() will throw if the token is expired or tampered with
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to req so controllers can access it
        // e.g. req.user.id, req.user.role
        req.user = decoded;
        next(); // All good — proceed to the route handler
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

// Role-based access control — use after authenticate
// Example: router.post('/jobs', authenticate, authorize('recruiter'), ...)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };