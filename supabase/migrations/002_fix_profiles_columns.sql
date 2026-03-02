-- ============================================================
-- Fix profiles table: add columns that may be missing
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the old CHECK constraint that blocks valid role values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add missing columns (IF NOT EXISTS prevents errors if they already exist)

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN email TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN phone TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'rm');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- If role column exists as TEXT, convert it to use the enum
-- If it doesn't exist, add it
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'customer';
EXCEPTION WHEN duplicate_column THEN
  -- Column exists — make sure it accepts our values by dropping any CHECK
  -- (already dropped above) and keeping it as-is
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN city TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN assigned_rm_id UUID REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Create slot_type enum
DO $$ BEGIN CREATE TYPE slot_type AS ENUM ('morning', 'evening', 'full_day'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE venue_type AS ENUM ('banquet_hall', 'farmhouse', 'resort', 'hotel', 'lawn', 'temple', 'palace', 'heritage', 'convention_center', 'community_hall'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Create other tables if they don't exist
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  venue_type venue_type NOT NULL DEFAULT 'banquet_hall',
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Bihar',
  address TEXT NOT NULL,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  capacity_min INT DEFAULT 50,
  capacity_max INT DEFAULT 500,
  price_per_slot NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_per_plate NUMERIC(10, 2),
  amenities TEXT[] DEFAULT '{}',
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_type slot_type NOT NULL DEFAULT 'full_day',
  is_available BOOLEAN DEFAULT TRUE,
  is_auspicious BOOLEAN DEFAULT FALSE,
  price_override NUMERIC(12, 2),
  booking_status booking_status DEFAULT 'pending',
  booked_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, slot_date, slot_type)
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  event_date DATE,
  slot_preference slot_type,
  guest_count INT,
  budget_range TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status lead_status DEFAULT 'new',
  assigned_rm_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop policies first so re-running this script is safe
DROP POLICY IF EXISTS "Public profiles readable" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Active venues readable" ON venues;
DROP POLICY IF EXISTS "Vendors read own venues" ON venues;
DROP POLICY IF EXISTS "Vendors insert venues" ON venues;
DROP POLICY IF EXISTS "Vendors update own venues" ON venues;
DROP POLICY IF EXISTS "Slots readable" ON venue_slots;
DROP POLICY IF EXISTS "Vendor manage slots" ON venue_slots;
DROP POLICY IF EXISTS "Vendor read leads" ON leads;
DROP POLICY IF EXISTS "Anyone can create lead" ON leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Users can view own leads" ON leads;

CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Active venues readable" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors read own venues" ON venues FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors insert venues" ON venues FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors update own venues" ON venues FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Slots readable" ON venue_slots FOR SELECT USING (true);
CREATE POLICY "Vendor manage slots" ON venue_slots FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE vendor_id = auth.uid())
);

CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (
  customer_id = auth.uid() OR
  assigned_rm_id = auth.uid() OR
  venue_id IN (SELECT id FROM venues WHERE vendor_id = auth.uid())
);
CREATE POLICY "Anyone can create leads" ON leads FOR INSERT WITH CHECK (true);

-- ============================================================
-- Create Storage bucket for venue images
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first for idempotency)
DROP POLICY IF EXISTS "Authenticated users upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read venue images" ON storage.objects;

CREATE POLICY "Authenticated users upload" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'venue-images');

CREATE POLICY "Public read venue images" ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-images');
