-- ============================================================
-- VivahSthal – Add user approval system
-- New signups must be approved by super-admin before accessing
-- the platform. Existing users are auto-approved (default).
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS approved_status TEXT NOT NULL DEFAULT 'approved';

-- All existing users stay 'approved' — only NEW signups default to 'pending'
-- (handled at the application level in signUpUser / auth callback)
