"use client";

import { useState, useEffect } from "react";
import { User, Phone, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getMyProfile, updateMyProfile } from "@/lib/actions";
import { CITIES } from "@/lib/constants";

export default function PartnerSettings() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getMyProfile();
      setProfile(data);
      if (!data) setFetchError(true);
    } catch {
      setFetchError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const fd = new FormData(e.currentTarget);
      const result = await updateMyProfile(fd);

      if (result.success) {
        setSuccess(true);
        const data = await getMyProfile();
        if (data) setProfile(data);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Cannot load profile</h2>
          <p className="text-sm text-gray-500 mb-4">
            The database may be temporarily unavailable. Your Supabase project might be paused.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Go to{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] underline"
            >
              supabase.com/dashboard
            </a>{" "}
            and check if your project needs to be restored.
          </p>
          <Button onClick={loadProfile}>
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center text-white text-2xl font-bold uppercase">
            {((profile?.full_name as string) || "P")[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{(profile?.full_name as string) || "Partner"}</h2>
            <p className="text-sm text-gray-500">{(profile?.email as string) || ""}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
              {(profile?.role as string) || "vendor"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="full_name"
            label="Full Name"
            placeholder="Your full name"
            defaultValue={(profile?.full_name as string) || ""}
            icon={<User className="h-4 w-4" />}
            required
          />
          <Input
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            defaultValue={(profile?.phone as string) || ""}
            icon={<Phone className="h-4 w-4" />}
          />
          <Select
            name="city"
            label="City"
            options={CITIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select your city"
            defaultValue={(profile?.city as string) || ""}
          />

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {(profile?.email as string) || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Profile updated successfully!
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
