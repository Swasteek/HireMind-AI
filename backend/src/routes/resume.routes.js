const express = require('express');
const router = express.Router();

// Stub — will be implemented on Day 2
router.get('/', (req, res) => res.json({ success: true, message: 'Resume route — coming Day 2' }));

module.exports = router;