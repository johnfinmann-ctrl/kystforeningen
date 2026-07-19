-- ================================================================
-- NORDIC OPERATIONS CMS v2 – schema.sql
-- Kunde: Kystforeningen Djursland
-- Køres i Supabase SQL Editor én gang
-- ================================================================

-- ----------------------------------------------------------------
-- AUTO-TRIGGER: sæt updated_at ved hver UPDATE
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Makro: tilknyt trigger til en tabel
CREATE OR REPLACE FUNCTION create_updated_at_trigger(t TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
     CREATE TRIGGER trg_updated_at
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t, t);
END;
$$;

-- ----------------------------------------------------------------
-- PROFILES  (udvider auth.users)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'editor'
              CHECK (role IN ('admin','editor')),
  avatar_url  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('profiles');

-- Auto-opret profil ved ny bruger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles(id, email, full_name)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT(id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------------
-- SITE_SETTINGS  (nøgle/værdi-par)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT DEFAULT '',
  label       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('site_settings');

-- ----------------------------------------------------------------
-- NEWS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL DEFAULT '',
  excerpt      TEXT DEFAULT '',
  body         TEXT DEFAULT '',
  image_url    TEXT DEFAULT '',
  author       TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('news');
CREATE INDEX IF NOT EXISTS idx_news_pub ON news(status, published_at DESC);

-- ----------------------------------------------------------------
-- ACTIVITIES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL DEFAULT '',
  event_date   DATE,
  time_start   TIME,
  time_end     TIME,
  location     TEXT DEFAULT '',
  excerpt      TEXT DEFAULT '',
  body         TEXT DEFAULT '',
  image_url    TEXT DEFAULT '',
  signup_url   TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published')),
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('activities');
CREATE INDEX IF NOT EXISTS idx_act_date ON activities(event_date ASC, status);

-- ----------------------------------------------------------------
-- CASES  (aktuelle sager)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL DEFAULT '',
  excerpt      TEXT DEFAULT '',
  body         TEXT DEFAULT '',
  image_url    TEXT DEFAULT '',
  external_links JSONB DEFAULT '[]'::jsonb,
  priority     INT  NOT NULL DEFAULT 10,
  on_frontpage BOOLEAN NOT NULL DEFAULT false,
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('cases');
CREATE INDEX IF NOT EXISTS idx_cases_pub   ON cases(status, priority ASC);
CREATE INDEX IF NOT EXISTS idx_cases_front ON cases(on_frontpage) WHERE on_frontpage;

-- ----------------------------------------------------------------
-- BOARD_MEMBERS  (bestyrelse)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS board_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT '',
  role_title  TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  photo_url   TEXT DEFAULT '',
  bio         TEXT DEFAULT '',
  sort_order  INT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('board_members');
CREATE INDEX IF NOT EXISTS idx_board_sort ON board_members(is_active, sort_order);

-- ----------------------------------------------------------------
-- DOCUMENTS  (generalforsamling, vedtægter, referater m.m.)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'Andre'
              CHECK (category IN (
                'Vedtægter','Indkaldelser','Dagsordener',
                'Referater','Regnskaber','Årsberetninger',
                'Høringssvar','Pressemeddelelser','Bilag','Andre'
              )),
  file_url    TEXT DEFAULT '',
  file_name   TEXT DEFAULT '',
  file_type   TEXT DEFAULT '',
  file_size   BIGINT DEFAULT 0,
  doc_year    SMALLINT,
  description TEXT DEFAULT '',
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('documents');
CREATE INDEX IF NOT EXISTS idx_docs_cat ON documents(category, doc_year DESC);

-- ----------------------------------------------------------------
-- MEDIA  (billeder og filer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name   TEXT NOT NULL DEFAULT '',
  original_name TEXT DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  thumb_url   TEXT DEFAULT '',
  bucket      TEXT NOT NULL DEFAULT 'images',
  file_type   TEXT DEFAULT '',
  file_size   BIGINT DEFAULT 0,
  width       INT  DEFAULT 0,
  height      INT  DEFAULT 0,
  alt_text    TEXT DEFAULT '',
  caption     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
SELECT create_updated_at_trigger('media');
CREATE INDEX IF NOT EXISTS idx_media_bucket ON media(bucket, created_at DESC);

-- ----------------------------------------------------------------
-- APP_VERSIONS  (PWA-opdateringer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version     TEXT NOT NULL,
  release_notes TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indsæt version 1.0.0
INSERT INTO app_versions(version, release_notes)
VALUES('1.0.0', 'Første version af Nordic Operations CMS for Kystforeningen Djursland.')
ON CONFLICT DO NOTHING;
