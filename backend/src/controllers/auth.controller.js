const authService = require('../services/auth.service');

// Controller rule: ONLY handle req/res. All logic is in the service.
// Think of this as a thin wrapper that calls the service and formats the response.

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Basic input validation — in production, use a library like Joi or Zod
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required',
            });
        }

        const data = await authService.register({ name, email, password, role });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data,
        });
    } catch (err) {
        next(err); // Pass to global error handler in index.js
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const data = await authService.login({ email, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/auth/me — returns logged-in user's info from JWT
const getMe = async (req, res) => {
    // req.user is set by the authenticate middleware
    res.json({
        success: true,
        data: { user: req.user },
    });
};

module.exports = { register, login, getMe };