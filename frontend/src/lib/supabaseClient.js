import { createClient } from "@supabase/supabase-js";

// These come from .env (never hardcoded here). Vite only exposes env
// variables prefixed with VITE_ to the browser — that's a Vite rule,
// not a Supabase one, and it's why the prefix matters.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
