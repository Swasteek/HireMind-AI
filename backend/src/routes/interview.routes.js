const express = require('express');
const router = express.Router();

// Stub — will be implemented on Day 4
router.get('/', (req, res) => res.json({ success: true, message: 'Interview route — coming Day 4' }));

module.exports = router;