-- ============================================================
-- VivahSthal - Enhancement Migration
-- Adds: youtube_videos & social_links to venues + blog_posts table
-- Run this in Supabase Dashboard → SQL Editor
-- (Your DB already has 001 + 002 applied)
-- ============================================================

-- ── Add new columns to existing venues table ──────────────
ALTER TABLE venues ADD COLUMN IF NOT EXISTS youtube_videos TEXT[] DEFAULT '{}';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS social_links   JSONB DEFAULT '{}';

-- ── Blog Posts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  cover_image   TEXT,
  youtube_url   TEXT,
  tags          TEXT[] DEFAULT '{}',
  is_published  BOOLEAN DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug        ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published   ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_author      ON blog_posts(author_id);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
DO $$ BEGIN
  CREATE POLICY "Published posts viewable by all"
    ON blog_posts FOR SELECT
    USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins (service-role bypass) can do everything
DO $$ BEGIN
  CREATE POLICY "Admins can manage all blog posts"
    ON blog_posts FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- updated_at trigger for blog_posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
