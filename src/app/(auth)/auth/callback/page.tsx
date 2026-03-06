"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();

      // Exchange the OAuth code for a session
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?error=auth_failed");
        return;
      }

      const user = session.user;

      // Ensure profile exists (OAuth users may bypass the DB trigger)
      try {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email!,
            phone: user.user_metadata?.phone || null,
            role: "customer",
            approved_status: "pending",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      } catch {
        // Non-fatal — profile may already exist
      }

      // Role-based redirect
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, approved_status")
          .eq("id", user.id)
          .single();

        if (
          profile &&
          profile.approved_status !== "approved" &&
          profile.role !== "admin" &&
          profile.role !== "rm"
        ) {
          router.push("/pending-approval");
          return;
        }

        if (profile?.role === "vendor") {
          router.push("/partner/venues");
        } else if (profile?.role === "admin" || profile?.role === "rm") {
          router.push("/admin/leads");
        } else {
          router.push("/venues");
        }
      } catch {
        router.push("/venues");
      }
    };

    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
