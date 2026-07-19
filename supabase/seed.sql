-- ================================================================
-- NORDIC OPERATIONS CMS v2 – seed.sql
-- Startdata for Kystforeningen Djursland
-- Køres EFTER schema.sql og policies.sql
-- ================================================================

-- ----------------------------------------------------------------
-- SITE SETTINGS
-- ----------------------------------------------------------------
INSERT INTO site_settings (key, value, label) VALUES
  ('contact_name',       '[Formandens navn]',           'Kontaktpersons navn'),
  ('contact_email',      'info@kystforeningendj.dk',    'Kontakt e-mail'),
  ('contact_phone',      '+45 00 00 00 00',             'Kontakt telefon'),
  ('contact_address',    'Djursland, Region Midtjylland','Adresse'),
  ('facebook_url',       '',                            'Facebook URL'),
  ('instagram_url',      '',                            'Instagram URL'),
  ('cvr',                '',                            'CVR-nummer'),
  ('membership_single',  '150 kr.',                    'Kontingent – enkelt'),
  ('membership_family',  '250 kr.',                    'Kontingent – familie'),
  ('membership_note',    'per år',                     'Kontingent – note'),
  ('site_title',         'Kystforeningen Djursland',   'Sidetitel'),
  ('site_tagline',       'Bevarelse af naturen og de rekreative kystområder på Djursland', 'Tagline')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------
-- AKTIVITETER  (de 6 grundaktiviteter 2026)
-- ----------------------------------------------------------------
INSERT INTO activities
  (title, event_date, time_start, location, excerpt, body, status, sort_order)
VALUES
(
  'Generalforsamling',
  '2026-03-19', '19:00',
  'Lokalt forsamlingshus, Djursland',
  'Årets generalforsamling med valg til bestyrelse og orientering om foreningens arbejde i det forgangne år.',
  'Alle medlemmer inviteres til den årlige generalforsamling. Dagsordenen omfatter beretning fra bestyrelsen, fremlæggelse og godkendelse af regnskab, fastsættelse af kontingent, valg til bestyrelse og suppleanter samt eventuelt. Kontakt bestyrelsen senest 14 dage i forvejen, hvis du ønsker punkter på dagsordenen.',
  'published', 1
),
(
  'Forårsvandring langs kysten',
  '2026-06-14', '10:00',
  'Mols Bjerge – mødested oplyses',
  'Guidet vandring med naturformidling om kystlandskab, planter og fugle. Ca. 3 km, let terræn.',
  'Kom med på en guidet tur langs Djurslands smukke kystlandskab. Vi ser på kystens flora og fauna, hører om de geologiske processer der former kysten og drøfter de rekreative værdier. Turen er ca. 3 km på let terræn og passer til alle aldre. Medbringe godt fodtøj og vand. Ingen tilmelding nødvendig.',
  'published', 2
),
(
  'Temaaften om natur og planlægning',
  '2026-09-10', '19:00',
  'Lokalt forsamlingshus, Djursland',
  'Foredrag og åben debat om naturbeskyttelse, kommunal planlægning og borgernes rolle i planprocessen.',
  'En aften med foredrag og dialog om natur, miljø og kommunal planlægning. En ekstern foredragsholder belyser aktuelle udfordringer og muligheder for naturbeskyttelse langs Djurslands kyster. Der er rig mulighed for spørgsmål og fælles drøftelse af, hvad vi som borgere kan gøre.',
  'published', 3
),
(
  'Sommerarrangement ved kysten',
  '2026-07-12', '11:00',
  'Helgenæs – mødested oplyses',
  'Guidet tur og socialt samvær ved kysten. Fælles madpakke. For hele familien.',
  'En hyggelig sommerdag for hele familien med guidet tur langs kysten, fokus på kystnaturen og dens rekreative værdier. Medbring madpakke og drikke. Arrangementet er gratis og åbent for alle – medlemmer såvel som ikke-medlemmer.',
  'published', 4
),
(
  'Borgermøde om aktuelle kystsager',
  '2026-10-08', '19:00',
  'Lokalt forsamlingshus, Djursland',
  'Information og dialog om aktuelle projekter og planer der berører Djurslands kystområder.',
  'Foreningen afholder borgermøde om igangværende sager langs Djurslands kyster. Bestyrelsen orienterer om planprocesser og aktuelle projekter, og der er åben dialog om foreningens arbejde og borgernes muligheder for indflydelse. Alle er velkomne – tilmelding ikke nødvendig.',
  'published', 5
),
(
  'Efterårsvandring',
  '2026-11-08', '10:00',
  'Nordkysten, Djursland – mødested oplyses',
  'Vandring med fokus på natur, kulturhistorie og de rekreative værdier ved Djurslands kyster.',
  'Årets efterårsvandring byder på smukke udsigter og naturformidling langs Djurslands nordkyst. Vi hører om kystens kulturhistorie, de naturlige processer og om de værdier vi arbejder for at bevare for fremtidige generationer. Ca. 4 km på varieret terræn. Godt fodtøj anbefales.',
  'published', 6
);

-- ----------------------------------------------------------------
-- NYHEDER
-- ----------------------------------------------------------------
INSERT INTO news (title, excerpt, body, status, published_at, sort_order) VALUES
(
  'Generalforsamling afholdt – ny bestyrelse valgt',
  'Årets generalforsamling fandt sted i marts 2026 med god tilslutning. Bestyrelsen blev genvalgt med enkelte ændringer, og regnskabet for 2025 blev godkendt.',
  'Kystforeningen Djursland afholdt sin årlige generalforsamling i marts 2026 med over 40 fremmødte medlemmer. Formandens beretning gennemgik foreningens arbejde i 2025, herunder opfølgning på aktuelle sager om vindmøller, kystsikring og lokalplaner. Regnskabet for 2025 blev godkendt med et lille overskud. Bestyrelsen blev genvalgt med enkelte justeringer. Referatet kan downloades under Generalforsamling og dokumenter.',
  'published', now(), 1
),
(
  'Foreningen følger Grobund-sagen tæt',
  'Vi holder løbende borgerne orienteret om planprocessen for Grobund-projektet nær kysten på Djursland.',
  'Kystforeningen Djursland følger nøje planprocessen for Grobund-projektet, der berører kystlandskabet på Djursland. Vi videreformidler offentligt tilgængeligt materiale fra kommunens planproces og opfordrer alle interesserede til at deltage i de offentlige høringer. Foreningen er ikke kampagneorganisation – vi oplyser og inddrager borgerne i den demokratiske planproces.',
  'published', now() - INTERVAL '14 days', 2
);

-- ----------------------------------------------------------------
-- AKTUELLE SAGER
-- ----------------------------------------------------------------
INSERT INTO cases
  (title, excerpt, body, on_frontpage, priority, status, sort_order)
VALUES
(
  'Vindmøller ved Vosnæs',
  'Planer om opstilling af vindmøller i kystnære områder ved Vosnæs er under kommunal behandling.',
  'Der er fremsat planer om opstilling af vindmøller i kystnære områder ved Vosnæs på Djursland. Foreningen følger den kommunale planproces og orienterer løbende om offentlige høringer. Vi formidler fakta og offentligt tilgængeligt materiale, så borgerne kan tage stilling og eventuelt afgive bemærkninger i høringsprocessen.',
  true, 1, 'published', 1
),
(
  'Ålerne / Grobund',
  'Projekt om etablering af ny bebyggelse og anlæg nær kystlandskabet ved Grobund-området.',
  'Foreningen følger sagen om Grobund-projektet, der omhandler planer om etablering nær kystlandskabet. Vi videreformidler offentligt tilgængeligt materiale om miljøvurdering, lokalplanproces og kommunale høringer. Grobund er én ud af flere sager, som foreningen følger. Vi er en oplysende forening, ikke en kampagneorganisation.',
  true, 2, 'published', 2
),
(
  'Kystsikring og naturlige kystprocesser',
  'Kystsikringsprojekter kan påvirke de naturlige kystprocesser og den rekreative adgang til kysten.',
  'Kystsikring er nødvendig for at beskytte ejendomme og infrastruktur mod erosion, men kan have konsekvenser for naturlige kystprocesser og den frie adgang til stranden. Foreningen formidler viden om igangværende og planlagte kystsikringsprojekter langs Djurslands kyster og holder øje med planprocesserne.',
  false, 3, 'published', 3
),
(
  'Kystnære lokalplaner',
  'Kommunale lokalplaner der berører kystzonen kan have stor betydning for natur og rekreative værdier.',
  'Lokalplaner der berører kystzonen fastlægger rammerne for, hvad der kan bygges og anlægges nær kysten. Foreningen samler information om aktuelle lokalplanforslag og hjælper borgere med at orientere sig i høringsmaterialet, så de kan udøve deres demokratiske ret til at deltage i planprocesserne.',
  false, 4, 'published', 4
);

-- ----------------------------------------------------------------
-- BESTYRELSE  (pladsholdere)
-- ----------------------------------------------------------------
INSERT INTO board_members
  (name, role_title, email, sort_order, is_active)
VALUES
  ('[Formand navn]',        'Formand',           'formand@kystforeningendj.dk',       1, true),
  ('[Næstformand navn]',    'Næstformand',        'naestformand@kystforeningendj.dk',   2, true),
  ('[Kasserer navn]',       'Kasserer',           'kasserer@kystforeningendj.dk',       3, true),
  ('[Bestyrelsesmedlem]',   'Bestyrelsesmedlem',  'bestyrelse@kystforeningendj.dk',     4, true),
  ('[Bestyrelsesmedlem]',   'Bestyrelsesmedlem',  'bestyrelse@kystforeningendj.dk',     5, true);

-- ----------------------------------------------------------------
-- DOKUMENTER  (pladsholdere – PDF-links indsættes via admin)
-- ----------------------------------------------------------------
INSERT INTO documents
  (title, category, doc_year, description, sort_order)
VALUES
  ('Vedtægter – Kystforeningen Djursland', 'Vedtægter',    2024, 'Vedtaget på stiftende generalforsamling', 1),
  ('Indkaldelse – Generalforsamling 2026', 'Indkaldelser', 2026, 'Med dagsorden',                           2),
  ('Referat – Generalforsamling 2026',     'Referater',    2026, 'Afholdt marts 2026',                      3),
  ('Regnskab 2025',                        'Regnskaber',   2025, 'Godkendt på generalforsamling 2026',      4);
