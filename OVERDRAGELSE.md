# OVERDRAGELSE
## Nordic Operations Platform – Kystforeningen Djursland

Dette dokument beskriver, hvordan løsningen overdrages fuldt ud til kunden eller en ny teknisk partner. Efter overdragelse er der ingen afhængighed af Nordic Operations.

---

## Hvad overdragelsen omfatter

| Komponent | Ejer efter overdragelse |
|-----------|------------------------|
| GitHub Repository (kode + filer) | Kunden |
| Supabase Projekt (database + auth + storage) | Kunden |
| Domæne (DNS + hosting) | Kunden |
| Administratorlogins | Kunden |
| Billeder og dokumenter (Supabase Storage) | Kunden |
| Data (nyheder, aktiviteter, sager m.m.) | Kunden |

---

## 1. OVERDRAGELSE AF GITHUB REPOSITORY

### Mulighed A – Ejerskabsoverførsel (anbefales)
1. Log ind på GitHub med Nordic Operations-kontoen
2. Gå til repository → **Settings** → **Danger Zone**
3. Klik **"Transfer ownership"**
4. Angiv kundens GitHub-brugernavn
5. Bekræft overførslen

GitHub Pages fortsætter automatisk under kundens konto.

### Mulighed B – Kopi til ny konto
1. Download ZIP af repository (Code → Download ZIP)
2. Opret nyt repository under kundens GitHub-konto
3. Upload alle filer (bevar mappestrukturen)
4. Aktivér GitHub Pages: Settings → Pages → Branch: main → / (root)

---

## 2. OVERDRAGELSE AF SUPABASE PROJEKT

### Mulighed A – Invitér ny ejer (anbefales)
1. Log ind på Supabase med Nordic Operations-kontoen
2. Projekt → **Settings** → **Team**
3. Klik **"Invite"** → angiv kundens e-mail
4. Sæt rollen til **Owner**
5. Kunden accepterer invitationen
6. Nordic Operations fjernes herefter fra teamet

### Mulighed B – Fuld eksport og reimport

**Eksportér database:**
1. Supabase → Settings → Database → **Download backup**
   (eller brug connection string med `pg_dump`)

**Eksportér Storage-filer:**
1. Supabase → Storage → bucket `images` → download alle filer
2. Supabase → Storage → bucket `documents` → download alle filer

**Opret nyt projekt under kundens konto:**
1. Ny Supabase-konto på supabase.com
2. Nyt projekt
3. Kør `supabase/schema.sql` → `policies.sql` → `seed.sql`
4. Importér databasedump
5. Genupload billeder og dokumenter
6. Opdatér `js/config.js` med ny URL og anon key

---

## 3. ADMINISTRATORER

### Tilføj ny administrator
1. Supabase → **Authentication** → **Users** → **Add user**
2. Udfyld e-mail og kodeord → **Create user**
3. Supabase → **Table Editor** → tabellen **profiles**
4. Find den nye bruger → sæt `role = admin` → **Save**

### Fjern administrator
1. Supabase → Authentication → Users
2. Find brugeren → klik **Delete user**

### Nulstil adgangskode
- Brugeren klikker "Glemt adgangskode?" på `admin.html`
- Eller: Supabase → Authentication → Users → **Send password reset email**

---

## 4. DOMÆNE

### Tilpasset domæne på GitHub Pages
1. Køb domæne (eks. Simply.com, One.com, Namecheap)
2. GitHub → repository → **Settings → Pages → Custom domain**
3. Angiv domænet (eks. `kystforeningendj.dk`)
4. Hos domæneudbyder, opret CNAME-record:
   - Host: `www`
   - Peger på: `[github-brugernavn].github.io`
5. Vent 24–48 timer på DNS-opdatering

---

## 5. BACKUP

### Database
- Supabase → Settings → Database → **Download backup** (månedlig)
- Eller automatisk via Supabase Pro-plan (daglig backup)

### Billeder og dokumenter
- Supabase → Storage → download buckets `images` og `documents`
- Anbefales: månedlig download til lokal mappe

### Kode
- GitHub er backup af koden
- Download ZIP fra GitHub som ekstra sikkerhed

---

## 6. EKSPORT AF DATA

Kør i Supabase SQL Editor:
```sql
-- Eksportér nyheder som CSV
COPY (SELECT * FROM news) TO STDOUT WITH CSV HEADER;

-- Eksportér aktiviteter
COPY (SELECT * FROM activities) TO STDOUT WITH CSV HEADER;

-- Eksportér alle sager
COPY (SELECT * FROM cases) TO STDOUT WITH CSV HEADER;
```

---

## 7. DOWNLOAD AF BILLEDER OG DOKUMENTER

Via Supabase Dashboard:
1. Gå til **Storage**
2. Klik bucket `images` → download enkeltfiler eller via API
3. Klik bucket `documents` → download enkeltfiler

Via Supabase Storage API (programmatisk):
```javascript
const { data } = await supabase.storage.from('images').list();
// data indeholder liste af alle filer med download-URL
```

---

## 8. FJERNELSE AF NORDIC OPERATIONS-BRANDING

Find og udskift i disse filer:

| Fil | Element |
|-----|---------|
| `index.html` | Footer: "Hjemmeside: Nordic Operations" |
| `admin.html` | Sidebar-footer og login-siden |
| `js/config.js` | `builtBy` og `builtUrl` i SITE-objektet |
| `README.md` | Erstat eller slet |
| `OVERDRAGELSE.md` | Slet efter overdragelse |
| `PLATFORM.md` | Slet efter overdragelse |

---

## TEKNISK UAFHÆNGIGHED

Efter fuld overdragelse anvender løsningen kun:

| Service | Alternativ |
|---------|-----------|
| GitHub (gratis) | Ethvert webhotel med statisk hosting |
| Supabase (gratis plan) | Andet PostgreSQL-system |
| Supabase CDN (jsdelivr.net) | Standard open source bibliotek |

Der er **ingen teknisk afhængighed af Nordic Operations** efter overdragelse.

---

*Dokument udstedt af Nordic Operations · nordicoperations.dk*
