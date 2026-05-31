const { createClient } = require('@supabase/supabase-js');

// We use the Supabase JS client specifically for STORAGE (file uploads).
// For database queries, we use the pg Pool directly — gives us more control.
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // service role = admin access, backend only!
);

module.exports = supabase;