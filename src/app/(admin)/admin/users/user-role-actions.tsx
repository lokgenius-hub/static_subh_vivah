"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/actions";

const roleOptions = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "rm", label: "RM" },
  { value: "admin", label: "Admin" },
];

export function UserRoleActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div>
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
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
