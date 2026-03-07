-- Migration 005: Add subscription_plan to venues
-- Allows per-venue subscription tracking for email lead routing

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT
    NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free','silver','gold','diamond'));

-- Add notify_email: override email for lead notifications (if blank, use profile email)
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS notify_email TEXT;

COMMENT ON COLUMN venues.subscription_plan IS 'Venue subscription tier. gold+ gets email notifications for leads.';
COMMENT ON COLUMN venues.notify_email IS 'Optional override email for lead notifications. Falls back to vendor profile email.';
