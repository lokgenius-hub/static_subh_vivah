"use client";

import { createClient } from "@/lib/supabase/client";

function clearAllSupabaseCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name.startsWith("sb-")) {
      // Clear with multiple path/flag combinations to cover all environments
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure`;
    }
  });
}

function clearSupabaseLocalStorage() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    });
  } catch {
    // localStorage may be unavailable in some contexts
  }
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sb-")) sessionStorage.removeItem(key);
    });
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

/**
 * Clear the Supabase session: call signOut (with timeout), wipe cookies + storage.
 * Safe to call even when Supabase is unreachable (SSL errors, paused project, etc).
 */
export async function clearSupabaseSession() {
  // Clear cookies and storage first so the user is effectively logged out immediately
  clearAllSupabaseCookies();
  clearSupabaseLocalStorage();

  // Attempt the API signout (with a short timeout so we don't hang)
  try {
    const supabase = createClient();
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000)
      ),
    ]);
  } catch {
    // Ignore errors — session data is already wiped client-side
  }

  // Also call server-side signout to clear server-side cookies
  try {
    const { serverSignOut } = await import("@/lib/actions");
    await Promise.race([
      serverSignOut(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2000)
      ),
    ]);
  } catch {
    // Non-critical — client-side cookies are already wiped
  }

  // Clear again in case signOut re-set any cookies
  clearAllSupabaseCookies();
  clearSupabaseLocalStorage();
}
