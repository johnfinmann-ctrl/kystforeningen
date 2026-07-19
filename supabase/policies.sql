-- ================================================================
-- NORDIC OPERATIONS CMS v2 – policies.sql
-- Køres EFTER schema.sql
-- ================================================================

-- ----------------------------------------------------------------
-- Hjælpefunktion: er indlogget bruger admin eller editor?
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin','editor')
  );
$$;

-- ----------------------------------------------------------------
-- Aktivér RLS
-- ----------------------------------------------------------------
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions  ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------
CREATE POLICY "profiles_self_read"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_staff_read"
  ON profiles FOR SELECT USING (is_staff());
CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin')
  );

-- ----------------------------------------------------------------
-- SITE_SETTINGS
-- ----------------------------------------------------------------
CREATE POLICY "settings_public_read"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_staff_write"
  ON site_settings FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- NEWS
-- ----------------------------------------------------------------
CREATE POLICY "news_public_read"
  ON news FOR SELECT USING (status = 'published');
CREATE POLICY "news_staff_all"
  ON news FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- ACTIVITIES
-- ----------------------------------------------------------------
CREATE POLICY "act_public_read"
  ON activities FOR SELECT USING (status = 'published');
CREATE POLICY "act_staff_all"
  ON activities FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- CASES
-- ----------------------------------------------------------------
CREATE POLICY "cases_public_read"
  ON cases FOR SELECT USING (status = 'published');
CREATE POLICY "cases_staff_all"
  ON cases FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- BOARD_MEMBERS
-- ----------------------------------------------------------------
CREATE POLICY "board_public_read"
  ON board_members FOR SELECT USING (is_active = true);
CREATE POLICY "board_staff_all"
  ON board_members FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- DOCUMENTS
-- ----------------------------------------------------------------
CREATE POLICY "docs_public_read"
  ON documents FOR SELECT USING (true);
CREATE POLICY "docs_staff_all"
  ON documents FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- MEDIA
-- ----------------------------------------------------------------
CREATE POLICY "media_public_read"
  ON media FOR SELECT USING (true);
CREATE POLICY "media_staff_all"
  ON media FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- APP_VERSIONS
-- ----------------------------------------------------------------
CREATE POLICY "versions_public_read"
  ON app_versions FOR SELECT USING (true);
CREATE POLICY "versions_staff_write"
  ON app_versions FOR ALL USING (is_staff());

-- ----------------------------------------------------------------
-- STORAGE BUCKETS
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('images',    'images',    true, 10485760,  -- 10 MB
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('documents', 'documents', true, 52428800,  -- 50 MB
   ARRAY['application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Storage: offentlig læsning
CREATE POLICY "images_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "docs_public_read_storage"
  ON storage.objects FOR SELECT USING (bucket_id = 'documents');

-- Storage: kun staff kan uploade/slette
CREATE POLICY "images_staff_insert"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id='images' AND is_staff());
CREATE POLICY "images_staff_delete"
  ON storage.objects FOR DELETE USING (bucket_id='images' AND is_staff());
CREATE POLICY "docs_staff_insert"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id='documents' AND is_staff());
CREATE POLICY "docs_staff_delete"
  ON storage.objects FOR DELETE USING (bucket_id='documents' AND is_staff());
