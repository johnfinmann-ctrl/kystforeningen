# NORDIC OPERATIONS PLATFORM
## Arkitektur og genbrug – Version 1.0

Dette dokument beskriver platformens arkitektur, og hvordan den genbruges til nye kunder.

---

## VISION

Nordic Operations Platform er et genbrugeligt fundament for hjemmesider og CMS-løsninger.

**Eksempler på installationer:**
- Kystforeningen Djursland *(referenceprojekt – Version 1.0)*
- MFG Advisory
- Venstre Syddjurs
- SafetyScan
- Nordic Operations
- SmartPack AI
- LeadRadar

**Hvert projekt deler kode og arkitektur, men aldrig data.**

---

## GRUNDPRINCIPPER

| Princip | Forklaring |
|---------|-----------|
| **Én kode – mange kunder** | Samme filstruktur og komponenter til alle projekter |
| **Ingen delt data** | Hver kunde har eget Supabase-projekt |
| **Fuld overdragelse** | Kunden kan altid overtage løsningen 100% |
| **Modulær opbygning** | Aldrig én stor HTML-fil |
| **Supabase fra start** | Bruges på alle projekter med admin, data eller brugere |

---

## ARKITEKTUR

```
kunde-projekt/
├── index.html              Offentlig hjemmeside (SPA)
├── admin.html              CMS-adminpanel
├── sw.js                   Service Worker (PWA)
├── manifest.json           PWA-manifest
├── README.md               Opsætningsvejledning
├── OVERDRAGELSE.md         Overdragelsesvejledning
├── PLATFORM.md             Denne fil (platformdokumentation)
├── CHANGELOG.md            Versionshistorik
│
├── assets/
│   ├── [hero-billede]      Kundens primære hero-billede
│   ├── [øvrige billeder]   Lokale billeder til siden
│   └── icons/
│       ├── icon-192.png    PWA-ikon
│       └── icon-512.png    PWA-ikon
│
├── css/
│   ├── styles.css          Offentlig side – komplet design system
│   └── admin.css           Admin-panel styling
│
├── js/
│   ├── config.js           ★ Kunde-specifik: URL + anon key
│   ├── supabase-client.js  Delt Supabase-klient (genbrug uændret)
│   ├── app.js              Offentlig applogik (tilpas til kunde)
│   └── admin.js            Admin-logik (genbrug, tilpas moduler)
│
└── supabase/
    ├── schema.sql          Databasetabeller (genbrug uændret)
    ├── policies.sql        RLS-politikker (genbrug uændret)
    └── seed.sql            Startdata (tilpas til kunde)
```

---

## TEKNISK STACK

| Lag | Teknologi | Begrundelse |
|-----|-----------|-------------|
| Frontend | HTML + CSS + JavaScript | Ingen build-step, GitHub Pages-kompatibel |
| PWA | Service Worker + manifest.json | Offline, installérbar, opdateringsflow |
| Database | Supabase (PostgreSQL) | Gratis, skalérbar, RLS, realtime |
| Auth | Supabase Authentication | Email/password, JWT, session |
| Storage | Supabase Storage | Billeder og dokumenter, CDN-levering |
| Hosting | GitHub Pages | Gratis, custom domæne, versionstyret |

---

## DATABASEMODEL

Alle installationer bruger samme grundtabeller:

| Tabel | Formål |
|-------|--------|
| `profiles` | Administratorer og roller |
| `site_settings` | Kontaktinfo, kontingent, generelle indstillinger |
| `news` | Nyheder med publicering og kladde |
| `activities` | Aktiviteter og arrangementer |
| `cases` | Aktuelle sager med prioritet |
| `board_members` | Bestyrelsesmedlemmer med foto |
| `documents` | Dokumenter kategoriseret efter type og år |
| `media` | Billeder med alt-tekst og billedtekst |
| `app_versions` | PWA-versionering og opdateringsflow |

Tabeller tilføjes per kunde efter behov (eks. `members`, `leads`, `products`).

---

## SIKKERHEDSMODEL

```
Offentlig besøgende:
  → Kan kun læse published indhold
  → Kan ikke se draft, admin-data eller Storage-metadata

Editor / Admin:
  → Fuld CRUD på alt indhold
  → Upload til Storage buckets
  → Administrér andre brugere (admin-rolle)

Service Role Key:
  → Bruges ALDRIG i frontend
  → Kun i backend-scripts ved behov
```

RLS (Row Level Security) håndhæves af PostgreSQL – ikke kun af frontend.

---

## Opret ny kundekopi

### Trin 1 – Forbered filerne
```bash
# Kopiér referenceprojektet
cp -r kystforeningen-djursland ny-kunde

# Tilpas disse filer til ny kunde:
# - js/config.js  (navn, tagline, email)
# - css/styles.css (farvepalette, fonte)
# - assets/       (logo, hero-billede, PWA-ikoner)
# - index.html    (tekster, sider, struktur)
# - supabase/seed.sql (startindhold)
```

### Trin 2 – Opret Supabase-projekt
1. Supabase.com → New project
2. Navn: `[kunde-navn]`
3. Region: West EU (Ireland)
4. Notér **Project URL** og **anon key**

### Trin 3 – Konfigurér `js/config.js`
```javascript
const SUPABASE_URL  = 'https://[projekt].supabase.co';
const SUPABASE_ANON = 'eyJ...';
const APP_VERSION   = '1.0.0';
const SITE = {
  name:    '[Kundens navn]',
  tagline: '[Kundens tagline]',
  email:   '[Kontakt e-mail]',
  builtBy:  'Nordic Operations',
  builtUrl: 'https://nordic-operations.dk',
};
```

### Trin 4 – Kør SQL i Supabase
```
SQL Editor → New query:
1. Indsæt og kør: supabase/schema.sql
2. Indsæt og kør: supabase/policies.sql
3. Indsæt og kør: supabase/seed.sql  (tilpasset til kunden)
```

### Trin 5 – Opret første administrator
```
Authentication → Users → Add user
Table Editor → profiles → sæt role = 'admin'
```

### Trin 6 – GitHub Repository
1. Opret nyt repository: `[kunde-navn]`
2. Upload alle filer (bevar mappestruktur)
3. Settings → Pages → Branch: main → / (root) → Save

### Trin 7 – Test og lever
1. Åbn `https://[github-user].github.io/[repo]/`
2. Åbn `admin.html` og log ind
3. Lever `README.md` og `OVERDRAGELSE.md` til kunden

---

## PWA-OPDATERINGSFLOW

Når koden opdateres til en ny version:

1. Øg `APP_VERSION` i `js/config.js` (eks. `'1.0.0'` → `'1.0.1'`)
2. Øg `CACHE_VERSION` i `sw.js` til samme version
3. Indsæt ny version i Supabase:
   ```sql
   INSERT INTO app_versions(version, release_notes)
   VALUES('1.0.1', 'Beskrivelse af opdateringen');
   ```
4. Upload opdaterede filer til GitHub

**Resultat:** Alle brugere ser automatisk:
> *"En ny version er klar – opdater nu"*

---

## VEDLIGEHOLDELSE

| Opgave | Hyppighed | Ansvarlig |
|--------|-----------|-----------|
| Opdatér indhold via CMS | Løbende | Kunde |
| Backup af database | Månedlig | Kunde / Nordic Operations |
| Opdatér Supabase-bibliotek (CDN) | Halvårlig | Nordic Operations |
| Sikkerhedsgennemgang af RLS | Årlig | Nordic Operations |
| Ny kodeversion (v1.1, v1.2 osv.) | Efter behov | Nordic Operations |

---

## FREMTIDIGE VERSIONER

| Version | Planlagt indhold |
|---------|-----------------|
| 1.0 | Stabilt fundament – Kystforeningen Djursland *(nu)* |
| 1.1 | Alt-tekst-redigering, billedgalleri, erstat billede |
| 1.2 | Formularbuilder, kontaktformular til Supabase |
| 2.0 | Multi-sprog, avancerede brugerroller, API-integration |

---

*Nordic Operations Platform – Version 1.0*
*Bygget af Nordic Operations · nordicoperations.dk*
