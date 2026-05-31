const express = require('express');
const router = express.Router();

// Stub — will be implemented on Day 3
router.get('/', (req, res) => res.json({ success: true, message: 'Jobs route — coming Day 3' }));

module.exports = router;