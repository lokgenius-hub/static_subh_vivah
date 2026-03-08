import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Using @supabase/supabase-js directly (not @supabase/ssr) because this is a
// static export — there is no server. Session is persisted to localStorage so
// the same session is shared across tabs on the same origin.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvuxmnysvmebwpiupink.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dXhtbnlzdm1lYndwaXVwaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjkxNzQsImV4cCI6MjA4ODAwNTE3NH0.hT0XA9KvGk-tEwOM2L1rNCddgDP55gOeNHFBQ6qMWRc";

// Singleton client — avoids creating a new client on every function call
let _client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!_client) {
    _client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,     // save session to localStorage so new tabs stay logged in
        autoRefreshToken: true,   // auto-refresh token before expiry
        detectSessionInUrl: true, // pick up session from URL hash (email confirm / OAuth)
        storageKey: "sb-vivahsthal-auth", // stable key so tabs share the same session
      },
    });
  }
  return _client;
}
