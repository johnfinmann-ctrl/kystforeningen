-- ================================================================
-- NORDIC OPERATIONS CMS v2 – seed.sql
-- Startdata for Kystforeningen Djursland
-- Køres EFTER schema.sql og policies.sql
-- ================================================================

-- ----------------------------------------------------------------
-- SITE SETTINGS
-- ----------------------------------------------------------------
INSERT INTO site_settings (key, value, label) VALUES
  ('contact_name',       'Elsebeth Due Kjeldsen',           'Kontaktpersons navn'),
  ('contact_email',      '',    'Kontakt e-mail'),
  ('contact_phone',      '',             'Kontakt telefon'),
  ('contact_address',    'Langagervej 5, 8400 Ebeltoft','Adresse'),
  ('facebook_url',       '',                            'Facebook URL'),
  ('instagram_url',      '',                            'Instagram URL'),
  ('cvr',                '44995514',                            'CVR-nummer'),
  ('membership_single',  '100 kr.',                    'Kontingent – enkelt'),
  ('membership_family',  '50 kr.',                    'Kontingent – familie'),
  ('membership_note',    'per år',                     'Kontingent – note'),
  ('site_title',         'Kystforeningen Djursland',   'Sidetitel'),
  ('site_tagline',       'Bevarelse af naturen og de rekreative kystområder på Djursland', 'Tagline')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- Ingen fiktive aktiviteter eller nyheder indsættes. Indhold oprettes kun fra verificerede kilder.
