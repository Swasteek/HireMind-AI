const Groq = require('groq-sdk');

// Single Groq client instance — imported wherever we need AI
// Same pattern as db.js and supabase.js
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

module.exports = groq;