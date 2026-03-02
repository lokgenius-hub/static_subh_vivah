"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { clearSupabaseSession } from "@/lib/auth-helpers";

export function SignOutButton({ className }: { className?: string }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await clearSupabaseSession();
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={
        className ??
        "flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      }
    >
      {signingOut ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <LogOut className="h-3 w-3" />
      )}
      {signingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
