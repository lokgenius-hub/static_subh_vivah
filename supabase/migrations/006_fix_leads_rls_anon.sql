-- Migration 006: Fix leads RLS so anonymous visitors can submit enquiries
-- The anon role must be able to INSERT into leads (no login required to enquire)

-- Grant INSERT permission to anon and authenticated roles on leads table
GRANT INSERT ON leads TO anon, authenticated;

-- Drop old policy (may have wrong role binding) and recreate explicitly
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;

CREATE POLICY "Anyone can create leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure SELECT policies still work for admins/vendors
DROP POLICY IF EXISTS "Users can view own leads" ON leads;

CREATE POLICY "Users can view own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR assigned_rm_id = auth.uid()
    OR venue_id IN (SELECT v.id FROM venues v WHERE v.vendor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','rm'))
  );
