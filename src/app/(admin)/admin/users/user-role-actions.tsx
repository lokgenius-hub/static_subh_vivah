"use client";

import { useState } from "react";
import { updateUserRole, adminSetUserPassword } from "@/lib/actions";
import { KeyRound, Eye, EyeOff } from "lucide-react";

const roleOptions = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "rm", label: "RM" },
  { value: "admin", label: "Admin" },
];

export function UserRoleActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Password change state
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;

    setSaving(true);
    setError("");
    const result = await updateUserRole(userId, newRole);
    if (!result.success) {
      setError(result.error || "Failed to update");
      e.target.value = currentRole;
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return;
    setPwSaving(true);
    setPwMsg("");
    const result = await adminSetUserPassword(userId, newPassword);
    if (result.success) {
      setPwMsg("✅ Password changed!");
      setNewPassword("");
      setTimeout(() => { setShowPwForm(false); setPwMsg(""); }, 2000);
    } else {
      setPwMsg("❌ " + (result.error || "Failed"));
    }
    setPwSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          defaultValue={currentRole}
          onChange={handleChange}
          disabled={saving}
          className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => { setShowPwForm(!showPwForm); setPwMsg(""); }}
          title="Change Password"
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <KeyRound className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}

      {showPwForm && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 pr-7 w-36 focus:border-[var(--color-primary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={pwSaving || !newPassword}
            className="text-xs px-2 py-1.5 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"
          >
            {pwSaving ? "..." : "Set"}
          </button>
        </div>
      )}
      {pwMsg && <p className="text-[10px] text-green-600">{pwMsg}</p>}
    </div>
  );
}
