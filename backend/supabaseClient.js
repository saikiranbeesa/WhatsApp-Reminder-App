const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_KEY in .env');
  process.exit(1);
}

const ws = require('ws');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    transport: ws,
  },
});

module.exports = supabase;
