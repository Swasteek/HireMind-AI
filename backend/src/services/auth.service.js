const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// WHY a service? Controllers should NOT contain business logic.
// This service handles: password hashing, DB queries, JWT generation.
// The controller just calls this and sends the response.

const register = async ({ name, email, password, role }) => {
    // 1. Check if email already exists
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );
    if (existing.rows.length > 0) {
        const err = new Error('Email already registered');
        err.statusCode = 409; // 409 Conflict — standard HTTP for duplicate resource
        throw err;
    }

    // 2. Hash the password — NEVER store plain text passwords
    // bcrypt cost factor 10 = ~100ms on modern hardware, makes brute force hard
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert new user into DB
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, role || 'candidate']
    );

    const user = result.rows[0];

    // 4. Generate JWT — payload contains user id and role (not password!)
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { user, token };
};

const login = async ({ email, password }) => {
    // 1. Find user by email
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    const user = result.rows[0];

    // 2. Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // 3. Generate JWT
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password_hash before returning user object
    const { password_hash, ...safeUser } = user;

    return { user: safeUser, token };
};

module.exports = { register, login };