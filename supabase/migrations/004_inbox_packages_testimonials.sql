-- ============================================================
-- VivahSthal - Migration 004
-- Adds: enquiry_inbox, marriage_packages, testimonials, success_stories
-- Run this in Supabase Dashboard → SQL Editor
-- (Your DB already has 001 + 002 + 003 applied)
-- ============================================================

-- ── 1. Enquiry Inbox ──────────────────────────────────────
-- Every enquiry (lead) also gets saved here with vendor context.
-- Vendors see only their own messages; super-admin sees all.
CREATE TABLE IF NOT EXISTS enquiry_inbox (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  venue_id      UUID REFERENCES venues(id) ON DELETE CASCADE,
  vendor_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  event_date    DATE,
  guest_count   INTEGER,
  slot_preference TEXT,
  budget_range  TEXT,
  message       TEXT,
  source        TEXT DEFAULT 'website',
  is_read       BOOLEAN DEFAULT FALSE,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbox_vendor   ON enquiry_inbox(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_venue    ON enquiry_inbox(venue_id);
CREATE INDEX IF NOT EXISTS idx_inbox_read     ON enquiry_inbox(is_read);

ALTER TABLE enquiry_inbox ENABLE ROW LEVEL SECURITY;

-- Vendors can ONLY see their own inbox
DO $$ BEGIN
  CREATE POLICY "Vendors see own inbox"
    ON enquiry_inbox FOR SELECT
    USING (vendor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins can see everything
DO $$ BEGIN
  CREATE POLICY "Admins manage all inbox"
    ON enquiry_inbox FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS update_enquiry_inbox_updated_at ON enquiry_inbox;
CREATE TRIGGER update_enquiry_inbox_updated_at
  BEFORE UPDATE ON enquiry_inbox
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 2. Marriage Packages ──────────────────────────────────
-- Admin-managed wedding packages (lawn+photography+catering combos)
CREATE TABLE IF NOT EXISTS marriage_packages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('silver','golden','diamond','custom')),
  tagline       TEXT,
  description   TEXT,
  price         NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  features      JSONB DEFAULT '[]',
  inclusions    TEXT[] DEFAULT '{}',
  cover_image   TEXT,
  images        TEXT[] DEFAULT '{}',
  is_popular    BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_tier    ON marriage_packages(tier);
CREATE INDEX IF NOT EXISTS idx_packages_active  ON marriage_packages(is_active, display_order);

ALTER TABLE marriage_packages ENABLE ROW LEVEL SECURITY;

-- Public read
DO $$ BEGIN
  CREATE POLICY "Anyone can view active packages"
    ON marriage_packages FOR SELECT
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin full access
DO $$ BEGIN
  CREATE POLICY "Admins manage packages"
    ON marriage_packages FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_marriage_packages_updated_at ON marriage_packages;
CREATE TRIGGER update_marriage_packages_updated_at
  BEFORE UPDATE ON marriage_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 3. Testimonials ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_name   TEXT NOT NULL,
  location      TEXT NOT NULL,
  venue_name    TEXT,
  event_date    DATE,
  rating        INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL,
  avatar_url    TEXT,
  photo_url     TEXT,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active testimonials"
    ON testimonials FOR SELECT
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage testimonials"
    ON testimonials FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 4. Success Stories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS success_stories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_name   TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  location      TEXT NOT NULL,
  venue_name    TEXT,
  event_date    DATE,
  story         TEXT NOT NULL,
  excerpt       TEXT,
  cover_image   TEXT,
  images        TEXT[] DEFAULT '{}',
  youtube_url   TEXT,
  is_published  BOOLEAN DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_published ON success_stories(is_published, published_at DESC);

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view published stories"
    ON success_stories FOR SELECT
    USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage stories"
    ON success_stories FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_success_stories_updated_at ON success_stories;
CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON success_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 5. Seed Demo Data ─────────────────────────────────────

-- Seed testimonials (Bhabua/Sasaram/local focus)
INSERT INTO testimonials (couple_name, location, venue_name, rating, text, is_featured, display_order) VALUES
  ('Priya & Rahul', 'Bhabua', 'Kaimur Valley Lawns', 5, 'VivahSthal made our dream wedding in Bhabua come true! The venue was decorated beautifully and the mandap setup was beyond our expectations. Our families are still talking about it!', true, 1),
  ('Sneha & Amit', 'Sasaram', 'Shershah Heritage Hall', 5, 'Finding a perfect banquet hall in Sasaram was so easy with VivahSthal. The AI chatbot helped us compare prices and the availability calendar saved us weeks of phone calls.', true, 2),
  ('Anita & Vikash', 'Mohania', 'Mohania Garden Resort', 5, 'We had a beautiful outdoor wedding at a gorgeous garden resort. VivahSthal''s team coordinated everything with the vendor perfectly. Highly recommend for couples in Kaimur!', true, 3),
  ('Ritu & Manish', 'Bhabua', 'Royal Bhabua Banquet', 5, 'The whole marriage package from VivahSthal was excellent value. Catering, decoration, photography — everything was top-notch. Best wedding service in Bhabua area!', true, 4),
  ('Neha & Sanjay', 'Chainpur', 'Chainpur Green Lawns', 5, 'VivahSthal helped us find an affordable lawn venue near Chainpur with all amenities. The enquiry process was smooth and we got instant responses from the vendor.', true, 5),
  ('Kavita & Deepak', 'Sasaram', 'Grand Sasaram Palace', 4, 'Great experience booking through VivahSthal! The venue was exactly as shown in the photos. Our guests loved the heritage ambiance of the palace venue.', true, 6)
ON CONFLICT DO NOTHING;

-- Seed success stories
INSERT INTO success_stories (couple_name, slug, location, venue_name, event_date, story, excerpt, is_published, published_at) VALUES
  ('Priya & Rahul Sharma', 'priya-rahul-bhabua-wedding', 'Bhabua', 'Kaimur Valley Lawns', '2025-11-15',
   '<h2>A Dream Wedding in the Heart of Kaimur</h2><p>When Priya and Rahul decided to get married, they knew they wanted a celebration that honored their roots in Bhabua. Through VivahSthal, they discovered Kaimur Valley Lawns — a stunning outdoor venue surrounded by the natural beauty of the Kaimur hills.</p><p>The ceremony was held during the auspicious morning slot, with a traditional hawan ceremony that touched every guest''s heart. The evening reception featured a grand mandap, live music, and catering for 500 guests.</p><p>"VivahSthal made everything so easy," says Priya. "From finding the venue to coordinating with the caterer and decorator, their team was with us every step of the way."</p><h3>Wedding Highlights</h3><ul><li>Venue: Kaimur Valley Lawns, Bhabua</li><li>Guests: 500+</li><li>Package: Golden Package with full catering & decoration</li><li>Special: Traditional hawan + modern DJ reception</li></ul>',
   'A beautiful traditional wedding in Bhabua that blended Kaimur heritage with modern celebration.', true, NOW()),
  ('Sneha & Amit Kumar', 'sneha-amit-sasaram-celebration', 'Sasaram', 'Shershah Heritage Hall', '2025-12-20',
   '<h2>Royal Wedding at Sasaram''s Finest</h2><p>Sneha and Amit always dreamed of a royal wedding. When they found Shershah Heritage Hall on VivahSthal, they knew it was the one. The heritage architecture provided the perfect backdrop for their grand celebration.</p><p>The couple chose the Diamond Package which included premium catering, floral decoration, professional photography, and a DJ setup. Over 800 guests attended across a two-day celebration.</p><p>"The AI chatbot on VivahSthal answered all our questions about the venue within seconds," says Amit. "And the pricing was transparent — no hidden costs!"</p>',
   'A royal celebration at Sasaram''s iconic heritage venue with 800+ guests.', true, NOW()),
  ('Ritu & Manish Verma', 'ritu-manish-mohania-garden', 'Mohania', 'Mohania Garden Resort', '2026-01-10',
   '<h2>Garden Wedding Paradise in Mohania</h2><p>Ritu and Manish wanted an intimate, nature-surrounded wedding. Mohania Garden Resort, discovered through VivahSthal, was exactly what they envisioned — lush green lawns, a beautiful mandap area, and modern amenities.</p><p>With the Silver Package, they got excellent value — professional setup, quality catering, and all essential decorations. The morning ceremony was followed by a joyous evening celebration.</p><p>"For anyone looking to get married in the Kaimur area, VivahSthal is the only platform you need," says Ritu.</p>',
   'An intimate garden wedding in Mohania that was beautiful and budget-friendly.', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Seed marriage packages
INSERT INTO marriage_packages (name, slug, tier, tagline, description, price, original_price, features, inclusions, is_popular, display_order) VALUES
  ('Silver Package', 'silver-wedding-package', 'silver',
   'Perfect Start for Your Special Day',
   'Our Silver Package gives you everything essential for a beautiful wedding celebration. Ideal for intimate gatherings of up to 300 guests with quality service and elegant setup.',
   149999, 199999,
   '[{"title":"Venue Booking","desc":"Full-day venue booking with basic setup"},{"title":"Basic Decoration","desc":"Mandap decoration, entrance gate, stage setup"},{"title":"Catering (Veg)","desc":"Welcome drink + 2 starters + main course + dessert for up to 300 guests"},{"title":"Sound System","desc":"Professional DJ with basic sound and lighting"},{"title":"Photography","desc":"1 photographer for ceremony coverage"}]'::jsonb,
   ARRAY['Venue for full day', 'Basic mandap decoration', 'Stage & entrance setup', 'Veg catering (300 guests)', 'DJ & sound system', '1 photographer', 'Parking management', 'Generator backup'],
   false, 1),
  ('Golden Package', 'golden-wedding-package', 'golden',
   'Most Popular — Complete Wedding Solution',
   'Our most popular package! The Golden Package includes everything you need for a grand wedding. Premium decoration, multi-cuisine catering, professional photography & videography, and entertainment.',
   349999, 449999,
   '[{"title":"Premium Venue","desc":"Full-day premium venue with AC banquet hall + lawn"},{"title":"Grand Decoration","desc":"Themed decoration, flower mandap, lighting, draping, entrance"},{"title":"Multi-Cuisine Catering","desc":"Welcome drinks + 4 starters + main course (veg/non-veg) + live counters + desserts for up to 500 guests"},{"title":"Entertainment","desc":"Professional DJ, LED wall, choreographed lighting"},{"title":"Photo & Video","desc":"2 photographers + 1 videographer + drone shoot + album"},{"title":"Bridal Makeup","desc":"Professional bridal makeup & groom styling"}]'::jsonb,
   ARRAY['Premium venue (hall + lawn)', 'Themed grand decoration', 'Flower mandap & phool ki chadar', 'Multi-cuisine catering (500 guests)', 'Live food counters', 'Professional DJ + LED wall', '2 photographers + videographer', 'Drone shoot + wedding film', 'Bridal makeup & styling', 'Mehndi artist', 'Valet parking', 'Generator backup', 'Dedicated coordinator'],
   true, 2),
  ('Diamond Package', 'diamond-wedding-package', 'diamond',
   'Ultra Luxury — Your Royal Wedding',
   'The Diamond Package is for couples who want nothing but the best. This all-inclusive luxury wedding experience covers everything from pre-wedding shoots to bidai with royal sophistication.',
   699999, 899999,
   '[{"title":"5-Star Venue","desc":"Full 2-day booking of premium heritage/palace venue"},{"title":"Royal Decoration","desc":"Celebrity designer decoration, imported flowers, crystal mandap, LED tunnels"},{"title":"Gourmet Catering","desc":"7-course fine dining, live counters, midnight snacks for up to 1000 guests"},{"title":"Entertainment","desc":"Celebrity DJ, live band, choreographer, fireworks"},{"title":"Cinema Package","desc":"3 photographers, 2 videographers, pre-wedding shoot, wedding film, drone + jib"},{"title":"Complete Styling","desc":"Bridal & groom makeover by celebrity stylist, family styling"},{"title":"Hospitality","desc":"Guest welcome kits, hotel bookings, airport transfers"}]'::jsonb,
   ARRAY['2-day premium venue booking', 'Celebrity designer decoration', 'Crystal/flower mandap + LED tunnels', 'Gourmet catering (1000 guests)', 'Multiple live food counters', 'Celebrity DJ + live band', 'Fireworks & sparklers', '3 photographers + 2 videographers', 'Pre-wedding shoot', 'Cinematic wedding film', 'Drone + jib coverage', 'Celebrity bridal makeover', 'Groom styling + family makeover', 'Mehndi + sangeet coordination', 'Haldi ceremony setup', 'Baraat arrangements (ghodi/car)', 'Guest welcome kits', 'Hotel booking assistance', 'Airport/station transfers', 'Dedicated wedding planner', '24/7 support team'],
   false, 3)
ON CONFLICT (slug) DO NOTHING;
