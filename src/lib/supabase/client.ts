import { createBrowserClient } from "@supabase/ssr";

// Fallback to hardcoded public values so the site works even if GitHub Secrets
// are not yet configured. NEXT_PUBLIC_ values are safe to be in source code —
// they are the anon (public) key, NOT the service role key.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvuxmnysvmebwpiupink.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dXhtbnlzdm1lYndwaXVwaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjkxNzQsImV4cCI6MjA4ODAwNTE3NH0.hT0XA9KvGk-tEwOM2L1rNCddgDP55gOeNHFBQ6qMWRc";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
