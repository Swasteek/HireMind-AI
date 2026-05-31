const { Pool } = require('pg');

// Pool = a group of reusable database connections.
// Why? Creating a new DB connection per request is slow.
// Pool keeps connections alive and reuses them.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        // Required for Supabase — they enforce SSL
        rejectUnauthorized: false,
    },
});

// Test the connection when the server starts
pool.connect((err) => {
    if (err) {
        console.error('[DB] Connection failed:', err.message);
    } else {
        console.log('[DB] PostgreSQL connected via Supabase');
    }
});

module.exports = pool;