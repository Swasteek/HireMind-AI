const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes — no JWT needed
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route — authenticate middleware runs first
router.get('/me', authenticate, authController.getMe);

module.exports = router;