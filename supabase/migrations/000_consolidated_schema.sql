-- ============================================================
-- VivahSthal - Full Consolidated Schema (run once on fresh DB)
-- Combines 001 + 002 + 003. Safe to re-run (idempotent).
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'rm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE slot_type AS ENUM ('morning', 'evening', 'full_day'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE venue_type AS ENUM ('banquet_hall', 'farmhouse', 'resort', 'hotel', 'lawn', 'temple', 'palace', 'heritage', 'convention_center', 'community_hall'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role DEFAULT 'customer',
  city          TEXT,
  assigned_rm_id UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: drop old check constraint if it exists (from 002)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ── Venues ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  venue_type       venue_type NOT NULL DEFAULT 'banquet_hall',
  city             TEXT NOT NULL,
  state            TEXT NOT NULL DEFAULT 'Bihar',
  address          TEXT NOT NULL,
  pincode          TEXT,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  capacity_min     INT DEFAULT 50,
  capacity_max     INT DEFAULT 500,
  price_per_slot   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_per_plate  NUMERIC(10, 2),
  amenities        TEXT[] DEFAULT '{}',
  cover_image      TEXT,
  images           TEXT[] DEFAULT '{}',
  youtube_videos   TEXT[] DEFAULT '{}',
  social_links     JSONB DEFAULT '{}',
  is_featured      BOOLEAN DEFAULT FALSE,
  is_active        BOOLEAN DEFAULT TRUE,
  rating           NUMERIC(2,1) DEFAULT 0,
  total_reviews    INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing venues table (safe if already present)
DO $$ BEGIN ALTER TABLE venues ADD COLUMN youtube_videos TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE venues ADD COLUMN social_links JSONB DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_venues_city     ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type     ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity_max);
CREATE INDEX IF NOT EXISTS idx_venues_price    ON venues(price_per_slot);
CREATE INDEX IF NOT EXISTS idx_venues_slug     ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_vendor   ON venues(vendor_id);

-- ── Venue Slots ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venue_slots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slot_date       DATE NOT NULL,
  slot_type       slot_type NOT NULL DEFAULT 'full_day',
  is_available    BOOLEAN DEFAULT TRUE,
  is_auspicious   BOOLEAN DEFAULT FALSE,
  price_override  NUMERIC(12, 2),
  booking_status  booking_status DEFAULT 'pending',
  booked_by       UUID REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, slot_date, slot_type)
);

CREATE INDEX IF NOT EXISTS idx_slots_venue_date ON venue_slots(venue_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_available  ON venue_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_slots_auspicious ON venue_slots(is_auspicious);

-- ── Leads ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id         UUID REFERENCES venues(id) ON DELETE SET NULL,
  customer_id      UUID REFERENCES profiles(id),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT NOT NULL,
  event_date       DATE,
  slot_preference  slot_type,
  guest_count      INT,
  budget_range     TEXT,
  message          TEXT,
  source           TEXT DEFAULT 'website',
  status           lead_status DEFAULT 'new',
  assigned_rm_id   UUID REFERENCES profiles(id),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_venue  ON leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_rm     ON leads(assigned_rm_id);

-- ── Auspicious Dates ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auspicious_dates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date        DATE NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  year        INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auspicious_year ON auspicious_dates(year);

-- ── Venue Reviews ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venue_reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id),
  rating     INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Venue Embeddings (RAG / AI) ──────────────────────────────
CREATE TABLE IF NOT EXISTS venue_embeddings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE UNIQUE,
  content    TEXT NOT NULL,
  embedding  vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_embeddings_venue ON venue_embeddings(venue_id);

-- ── Blog Posts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  youtube_url  TEXT,
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug      ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_author    ON blog_posts(author_id);

-- ── Vector Similarity Search Function ───────────────────────
CREATE OR REPLACE FUNCTION match_venues(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT DEFAULT 10
)
RETURNS TABLE (id UUID, venue_id UUID, content TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT ve.id, ve.venue_id, ve.content,
         1 - (ve.embedding <=> query_embedding) AS similarity
  FROM venue_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues          ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_slots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;

-- Profiles
DO $$ BEGIN CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Venues
DO $$ BEGIN CREATE POLICY "Active venues are viewable by everyone" ON venues FOR SELECT USING (is_active = true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can insert own venues" ON venues FOR INSERT WITH CHECK (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can update own venues" ON venues FOR UPDATE USING (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can delete own venues" ON venues FOR DELETE USING (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Slots
DO $$ BEGIN CREATE POLICY "Slots are viewable by everyone" ON venue_slots FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Vendors can manage own venue slots" ON venue_slots FOR ALL USING (
    venue_id IN (SELECT v.id FROM venues v WHERE v.vendor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Leads
DO $$ BEGIN CREATE POLICY "Anyone can create leads" ON leads FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (
    customer_id = auth.uid() OR
    assigned_rm_id = auth.uid() OR
    venue_id IN (SELECT v.id FROM venues v WHERE v.vendor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reviews
DO $$ BEGIN CREATE POLICY "Reviews are viewable by everyone" ON venue_reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create reviews" ON venue_reviews FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Blog Posts
DO $$ BEGIN
  CREATE POLICY "Published posts viewable by all" ON blog_posts FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage all blog posts" ON blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── updated_at Trigger Function ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at    ON profiles;
CREATE TRIGGER update_profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_venues_updated_at      ON venues;
CREATE TRIGGER update_venues_updated_at      BEFORE UPDATE ON venues      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_venue_slots_updated_at ON venue_slots;
CREATE TRIGGER update_venue_slots_updated_at BEFORE UPDATE ON venue_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_leads_updated_at       ON leads;
CREATE TRIGGER update_leads_updated_at       BEFORE UPDATE ON leads       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_blog_posts_updated_at  ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at  BEFORE UPDATE ON blog_posts  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Auto-create Profile on Signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Seed: Auspicious Dates 2026 ──────────────────────────────
INSERT INTO auspicious_dates (date, name, year) VALUES
('2026-01-15', 'Makar Sankranti',      2026),
('2026-01-29', 'Vasant Panchami',       2026),
('2026-02-17', 'Maha Shivaratri',       2026),
('2026-03-14', 'Holi',                  2026),
('2026-04-14', 'Baisakhi',              2026),
('2026-04-22', 'Akshaya Tritiya',       2026),
('2026-05-10', 'Budh Purnima',          2026),
('2026-11-08', 'Dev Diwali',            2026),
('2026-11-19', 'Tulsi Vivah',           2026),
('2026-11-22', 'Dev Uthani Ekadashi',   2026),
('2026-12-05', 'Arudra Darshanam',      2026)
ON CONFLICT (date) DO NOTHING;
