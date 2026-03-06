"use client";

import { useRef, useState } from "react";
import { updateUserRole, adminSetUserPassword, adminUpdateUserProfile } from "@/lib/client-actions";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Eye, EyeOff, Pencil, X, Check, Loader2, Camera } from "lucide-react";

const roleOptions = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "rm", label: "RM" },
  { value: "admin", label: "Admin" },
];

interface Props {
  userId: string;
  currentRole: string;
  fullName?: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
}

export function UserRoleActions({ userId, currentRole, fullName, phone, city, avatarUrl }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Password state ────────────────────────────────────────
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  // ── Edit Profile state ────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(fullName || "");
  const [editPhone, setEditPhone] = useState(phone || "");
  const [editCity, setEditCity] = useState(city || "");
  const [editAvatar, setEditAvatar] = useState(avatarUrl || "");
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Role change ───────────────────────────────────────────
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

  // ── Password change ───────────────────────────────────────
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

  // ── Avatar upload to Supabase Storage ────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setEditMsg("❌ Upload failed: " + upErr.message);
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setEditAvatar(data.publicUrl);
    }
    setAvatarUploading(false);
  };

  // ── Profile save ──────────────────────────────────────────
  const handleProfileSave = async () => {
    setEditSaving(true);
    setEditMsg("");
    const result = await adminUpdateUserProfile(userId, {
      full_name: editName,
      phone: editPhone,
      city: editCity,
      avatar_url: editAvatar,
    });
    if (result.success) {
      setEditMsg("✅ Profile updated!");
      setTimeout(() => { setShowEdit(false); setEditMsg(""); }, 2000);
    } else {
      setEditMsg("❌ " + (result.error || "Failed"));
    }
    setEditSaving(false);
  };

  return (
    <div className="space-y-2">
      {/* Action buttons row */}
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

        {/* Edit Profile button */}
        <button
          onClick={() => { setShowEdit(!showEdit); setShowPwForm(false); setEditMsg(""); }}
          title="Edit Profile"
          className={`p-1.5 rounded-lg border transition-colors ${showEdit ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-pink-50" : "border-gray-200 text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* Change Password button */}
        <button
          onClick={() => { setShowPwForm(!showPwForm); setShowEdit(false); setPwMsg(""); }}
          title="Change Password"
          className={`p-1.5 rounded-lg border transition-colors ${showPwForm ? "border-amber-400 text-amber-600 bg-amber-50" : "border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600"}`}
        >
          <KeyRound className="h-3.5 w-3.5" />
        </button>
      </div>

      {error && <p className="text-[10px] text-red-500">{error}</p>}

      {/* ── Password Form ── */}
      {showPwForm && (
        <div className="mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
          <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wide">Change Password</p>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 pr-7 w-40 focus:border-amber-400 focus:outline-none"
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
              className="text-xs px-2 py-1.5 rounded-lg bg-amber-500 text-white disabled:opacity-50 hover:bg-amber-600 flex items-center gap-1"
            >
              {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Set
            </button>
            <button onClick={() => setShowPwForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {pwMsg && <p className="text-[10px] text-amber-700">{pwMsg}</p>}
        </div>
      )}

      {/* ── Edit Profile Form ── */}
      {showEdit && (
        <div className="mt-1 p-3 bg-pink-50 border border-pink-200 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-pink-700 uppercase tracking-wide">Edit Profile</p>
            <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 shrink-0">
              {editAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editAvatar} alt="avatar" className="h-9 w-9 rounded-full object-cover border border-pink-200" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center text-white text-sm font-bold uppercase">
                  {(editName || "U")[0]}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90"
                title="Upload photo"
              >
                {avatarUploading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Camera className="h-2.5 w-2.5" />}
              </button>
            </div>
            <input
              type="text"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              placeholder="Paste photo URL or upload"
              className="flex-1 text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none"
            />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              className="mt-0.5 w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          {/* Phone + City */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 XXXXX"
                className="mt-0.5 w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">City</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="City"
                className="mt-0.5 w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleProfileSave}
            disabled={editSaving}
            className="w-full text-xs py-1.5 rounded-lg bg-[var(--color-primary)] text-white font-medium disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-1.5"
          >
            {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            {editSaving ? "Saving..." : "Save Changes"}
          </button>

          {editMsg && (
            <p className={`text-[10px] ${editMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {editMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
