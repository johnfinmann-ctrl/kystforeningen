# Kystforeningen Djursland
## Nordic Operations CMS v2

Hjemmeside og CMS-admin bygget af [Nordic Operations](https://nordic-operations.dk).

---

## Filstruktur

```
kystforeningen-djursland/
├── index.html              Offentlig hjemmeside (PWA)
├── admin.html              CMS-adminpanel
├── sw.js                   Service Worker (PWA)
├── manifest.json           PWA-manifest
│
├── assets/
│   ├── kyst-hero.jpg       Hero-billede (Randers Fjord) – må ikke udskiftes
│   ├── sager-hero.jpg      Billede til aktuelle sager
│   └── icons/
│       ├── icon-192.png    PWA-ikon
│       └── icon-512.png    PWA-ikon
│
├── css/
│   ├── styles.css          Offentlig side
│   └── admin.css           Admin-panel
│
├── js/
│   ├── config.js           ★ UDFYLD DISSE TO LINJER FØR BRUG
│   ├── supabase-client.js  Delt Supabase-klient
│   ├── app.js              Offentlig applogik
│   └── admin.js            Admin-logik (alle 9 moduler)
│
└── supabase/
    ├── schema.sql          Databsetabeller (kør først)
    ├── policies.sql        Row Level Security (kør efter schema)
    └── seed.sql            Startindhold (kør sidst)
```

---

## ★ Opsætning fra nul

### Trin 1 – Opret Supabase-konto og -projekt

1. Gå til **[supabase.com](https://supabase.com)**
2. Klik **"Start your project"** → opret gratis konto
3. Klik **"New project"**
   - Name: `kystforeningen-djursland`
   - Database Password: vælg stærkt kodeord og gem det
   - Region: **West EU (Ireland)**
4. Klik **"Create new project"** – vent 1–2 minutter

### Trin 2 – Find dine API-nøgler

1. Klik **Settings** (tandhjul) → **API**
2. Kopiér:
   - **Project URL** – eks: `https://abcdefgh.supabase.co`
   - **anon public key** – starter med `eyJ...`

3. Åbn `js/config.js` og indsæt de to værdier:
```javascript
const SUPABASE_URL  = 'https://DIT-PROJEKT.supabase.co';
const SUPABASE_ANON = 'eyJhbGci...din_nøgle...';
```
⚠️ Brug aldrig **service_role key** i frontend.

### Trin 3 – Opret databasen

1. I Supabase: klik **SQL Editor** → **New query**
2. Kopiér indholdet af `supabase/schema.sql` → indsæt → klik **Run**
3. Du bør se "Success. No rows returned."

### Trin 4 – Opsæt sikkerhed

1. Klik **New query**
2. Kopiér `supabase/policies.sql` → indsæt → klik **Run**

### Trin 5 – Indlæs startindhold

1. Klik **New query**
2. Kopiér `supabase/seed.sql` → indsæt → klik **Run**

### Trin 6 – Opret første administrator

1. Supabase: klik **Authentication** → **Users** → **Add user** → **Create new user**
2. Udfyld e-mail og et stærkt kodeord
3. Klik **Create user**
4. Gå til **Table Editor** → tabellen **profiles**
5. Find den nye bruger → sæt `role` til `admin` → klik **Save**

### Trin 7 – Upload til GitHub Pages

1. Gå til [github.com](https://github.com) → **New repository**
2. Navn: `kystforeningen-djursland` · Public
3. Upload alle filer (hold mappestrukturen)
4. **Settings** → **Pages** → Branch: `main` / `/ (root)` → **Save**
5. Siden er live på: `https://dit-brugernavn.github.io/kystforeningen-djursland/`

### Trin 8 – Log ind i admin

- Gå til `din-adresse/admin.html`
- Log ind med den e-mail og adgangskode du oprettede

---

## Admin-vejledning

| Modul | Funktion |
|-------|---------|
| Dashboard | Overblik over antal indhold |
| Nyheder | Opret, rediger, publicer nyheder |
| Aktiviteter | Administrer de 6 årsaktiviteter og nye |
| Aktuelle sager | Forvalt sager med prioritet og forsidevisning |
| Bestyrelse | Opdatér navne, roller og fotos |
| Dokumenter | Upload PDF, Word, Excel til generalforsamling |
| Billeder | Upload og administrer billeder |
| Kontakt & Kontingent | Opdatér kontaktoplysninger og kontingentpriser |

### Tilføj ny administrator
1. Supabase → Authentication → Add user
2. Udfyld e-mail og kodeord → Create user
3. Table Editor → profiles → sæt `role = admin`

---

## PWA-opdatering

Når koden opdateres:
1. Opdatér `APP_VERSION` i `js/config.js` (eks. `'1.0.1'`)
2. Opdatér `CACHE_VERSION` i `sw.js` til samme version
3. Indsæt ny version i Supabase via SQL:
   ```sql
   INSERT INTO app_versions(version, release_notes)
   VALUES('1.0.1', 'Beskrivelse af opdateringen');
   ```
4. Upload nye filer til GitHub

Brugerne ser nu: *"En ny version er klar – Opdater nu"*

---

## Bygget af Nordic Operations
[nordicoperations.dk](https://nordic-operations.dk)

---

## LIVE VALIDERING

Udfyld denne tjekliste, når Supabase er oprettet og GitHub Pages er aktivt.

Afkryds hvert punkt efterhånden som det er testet og bekræftet.

```
□ Supabase Project oprettet
□ config.js udfyldt med Project URL og anon key
□ Authentication testet (bruger kan oprettes)
□ Login testet (e-mail + adgangskode virker)
□ Logout testet (session afsluttes korrekt)
□ Password reset testet (mail modtages og virker)
□ Database testet (indhold hentes fra Supabase)
□ Storage upload testet (fil gemmes i bucket)
□ Dokumentupload testet (PDF/Word/Excel uploades)
□ Billedupload testet (billede komprimeres og uploades)
□ Realtime testet (ændring i admin vises straks på hjemmesiden)
□ PWA installeret (siden kan tilføjes til hjemskærm)
□ Service Worker testet (side indlæses offline)
□ Ny version-banner testet (banner vises ved ny CACHE_VERSION)
□ GitHub Pages testet (side er live på github.io-URL)
□ Mobil testet (iPhone og/eller Android)
□ Tablet testet (iPad eller Android-tablet)
□ Desktop testet (Chrome/Edge/Safari/Firefox)
```

Når alle punkter er afkrydset, er Version 1.0 **Stable**.

---

*Nordic Operations Platform · Version 1.0 Release Candidate*
*Referenceprojekt: Kystforeningen Djursland*
*Bygget af [Nordic Operations](https://nordic-operations.dk)*
