# CHANGELOG
## Nordic Operations Platform – Kystforeningen Djursland

---

## Version 1.0.11 – RC5.9 – Oktober 2026

**Status: Release Candidate**

### Rettelser og tilføjelser – Vosnæs

**Sag 3: Vosnæs – vindmøller**
- Rettelse: Borgmester navnefejl rettet: "Michael Stegger Jensen (A)" → "Michael Harregaard Stegger (S)" (to steder: Seneste nyt + Presse-kort 1)
- Vosnæs → Presse: Tilføjet Din Avis debatindlæg ECE19763125: "Ministeren har tilsidesat Syddjurs – Aarhus kan stadig sige nej" (dato ukendt, Oktober 2026)

### PWA
- APP_VERSION bump: 1.0.10 → 1.0.11
- CACHE_VERSION bump: kfd-v1.0.10 → kfd-v1.0.11

---

## Version 1.0.10 – RC5.8 – Oktober 2026

**Status: Release Candidate**

### Tilføjet indhold – Vosnæs og Dråby (5 artikler)

**Sag 3: Vosnæs – vindmøller**
- Seneste nyt opdateret med ministerafgørelse: Signe Munk (SF) ophæver Syddjurs' planveto, 22. oktober 2026 (topnyhed)
- Kilde-note opdateret; gammel note om "ingen afgørelse" erstattet af faktuel status
- Vosnæs → Presse: Tilføjet Din Avis 22/10/2026 (nyhedsartikel om ministerafgørelse)
- Vosnæs → Presse: Tilføjet Din Avis 23/10/2026 (Venstre-debatindlæg af Jørgen Rosengren; delvis bag betalingsmur, noteret)

**Sag 2: Dråby – sommerhusområdet**
- Dråby → Presse: Tilføjet Din Avis 17/9/2026: Byrådet sender Lokalplan 474 i høring (21-6), Anne Frank Henriksen
- Dråby → Presse: Tilføjet TV2 Østjylland ca. 9/10/2026: "Er naturen eller turismen vigtigst?" – Anne Marie Stoustrup Petersen
- Dråby → Presse: Tilføjet TV2 Østjylland ca. 19/10/2026: Thorkild Hansen imod kæmpesommerhuse – Sebastian Høeg Lerhøj Wiis & Anne Marie Stoustrup Petersen

### PWA
- APP_VERSION bump: 1.0.9 → 1.0.10
- CACHE_VERSION bump: kfd-v1.0.9 → kfd-v1.0.10

---

## Version 1.0.9 – RC5.7 – Oktober 2026

**Status: Release Candidate**

### Ajourført indhold – alle fem sager

**Sag 1: Fjellerup Strand**
- Lokalplan 134-707 og Kommuneplantillæg nr. 3 vedtaget af Norddjurs Kommunalbestyrelse 6. oktober 2026 (kilde: beslutningsprotokol)
- Opdateret Seneste nyt med tre daterede nyheder: vedtagelse, høringsfrist, offentliggørelse af forslag
- Tilføjet tydelig præcision om manglende øvrige tilladelser fra Kystdirektoratet og Norddjurs Kommune
- Tilføjet forventning om ibrugtagning sommer 2028 (under forudsætning af at planen ikke ankes)
- Tilføjet tre dokumentlinks: beslutningsprotokol, kommuneplantillæg PDF, DN Norddjurs-henvendelse
- Kilde: norddjurs.meetingsplus.dk, norddjurs.dk/oplev-norddjurs/fjellerup-udvikling

**Sag 2: Dråby – sommerhusområdet**
- Opdateret Seneste nyt: byråd sender lokalplanforslag i 8 ugers offentlig høring, borgermøde 2. november 2026, miljøscreening
- Tilføjet Dansk Byudvikling-artikel (21. september 2026) i Presse
- Kilde: dansk-byudvikling.dk/plan-for-over-100-store-sommerhuse-sendes-i-hoering/

**Sag 3: Vosnæs – vindmøller**
- Opdateret Seneste nyt: ministerens afgørelse udskudt pga. valg (marts 2026), 784 høringssvar (august 2025), Syddjurs' planveto (juli 2025)
- Eksplicit note: ingen ny afgørelse per oktober 2026
- Kilde: deltag.aarhus.dk, dinavis.dk (5. marts 2026)

**Sag 4: Grobund/Ålerne**
- Ingen ny verificeret nyhed fundet. Eksisterende indhold bevaret uændret.
- Seneste bekræftede beslutning: Helhedsplan vedtaget af byrådet 25. juni 2025
- Lokalplan for Grobunds arealer ikke politisk igangsat per kilde (syddjurs.dk)

**Sag 5: Hjelm Banke**
- Bevaret uændret fra RC5.6
- Fiskeritidende-artikel (september 2026) forsøgt hentet – ikke tilgængelig (fetch-fejl). Tilføjes ikke uden verificeret indhold.

### PWA
- APP_VERSION bump: 1.0.8 → 1.0.9
- CACHE_VERSION bump: kfd-v1.0.8 → kfd-v1.0.9
- sw.js-mekanisme verificeret: skipWaiting + clients.claim + controllerchange-flow er korrekt implementeret
- Afventer live-test på installeret iPhone PWA – Stable-godkendelse gives ikke før live-test

---

## Version 1.0.8 – RC5.6 – Oktober 2026

**Status: Release Candidate**

### Tilføjet
- **Sag nr. 5: Hjelm Banke – råstofindvinding i Kattegat**
  - Miljøstyrelsen meddelte 6. februar 2026 tilladelse til indvinding af op til 8 mio. m³ sand sydøst for Hjelm
  - Direkte link til Miljøstyrelsens officielle afgørelse (PDF) på mst.dk
  - Faner: Baggrund / Seneste nyt / Vores arbejde / Dokumenter / Presse / Myndighedskilder
  - Myndighedskilder korrekt betegnet som statslig myndighed (Miljøstyrelsen), ikke kommunal
  - Foreningens egne holdninger og handlinger er ikke påstået – kun kendte kendsgerninger
- APP_VERSION bump: 1.0.6 → 1.0.7
- CACHE_VERSION bump: kfd-v1.0.6 → kfd-v1.0.7

### Bemærkning om billede
Billedet `assets/hjelm-banke.jpg` er en teknisk placeholder (navy baggrund).
Et rettighedsfrit billede af Hjelm/Kattegat skal indsættes manuelt.
Mulige kilder: Wikimedia Commons, Miljøstyrelsen, Geodatastyrelsen (kortudsnit).

### Ikke ændret
Alle fire eksisterende sager, design, navigation, PWA, bestyrelse, dokumenter og øvrige indhold er uændret.

---

## Version 1.0.0 – Release Candidate – Juli 2026

**Status: Release Candidate**
Afventer live validering med aktiv Supabase-instans.
Skifter til **Stable** når alle punkter i README.md → LIVE VALIDERING er bekræftet.

**Referenceprojekt:** Kystforeningen Djursland
**Første installation af Nordic Operations Platform**

### Ny funktionalitet

**Offentlig hjemmeside**
- Komplet SPA med 8 sider og hash-navigation (browser-tilbage virker)
- Hero med Randers Fjord-billede — foreningens permanente visuelle identitet
- Forside: hero + intro + tre live-opdaterede bokse (aktivitet, nyhed, sag)
- PWA: installérbar fra browser, offline-kapabel via Service Worker
- Opdateringsbanner vises automatisk ved ny kodeversion
- Realtime: alle brugere ser CMS-ændringer straks
- Responsivt design: mobil, tablet og desktop
- Cookie-banner med privatlivspolitik og cookiepolitik
- Kontaktformular og tilmeldingsformular (mailto-baseret)

**CMS Admin**
- Supabase Authentication: login, logout, password reset, session-persistering
- 8 moduler: Dashboard, Nyheder, Aktiviteter, Aktuelle sager, Bestyrelse, Dokumenter, Billeder, Kontakt & Indstillinger
- Dashboard: live tæller for alle tabeller
- Nyheder: opret, rediger, slet, publicer, kladde, billede-URL
- Aktiviteter: opret, rediger, slet, dato/tid/sted/tilmeldingslink, publicer/kladde
- Aktuelle sager: prioritet, forsidevisning, status (draft/published/archived)
- Bestyrelse: fotoupload med browserkomprimering, rækkefølge, aktiv/inaktiv
- Dokumenter: PDF, Word, Excel — upload til Supabase Storage, kategorier + årstal
- Billeder: upload med browserkomprimering (1600px, 82%), alt-tekst, billedtekst (caption), kopiér URL, slet
- Kontakt & Indstillinger: kontaktperson, kontingent, CVR, Facebook — gemt med upsert

**Sikkerhed**
- Row Level Security på alle 9 tabeller
- Offentlige brugere ser kun `published` indhold
- Admin/editor: fuld CRUD
- Storage policies: kun staff kan uploade og slette
- Ingen service role key i frontend
- Ingen localStorage som database

**PWA**
- Service Worker med stale-while-revalidate for egne filer
- Network-first for Supabase API
- SKIP_WAITING → controllerchange-flow for korrekt opdatering
- Relative stier i precache (GitHub Pages kompatibel)
- Opdateringsbanner skjult som standard, vises kun ved ny version

**Database**
- 9 tabeller: profiles, site_settings, news, activities, cases, board_members, documents, media, app_versions
- Auto-trigger: updated_at opdateres automatisk
- Auto-profil: oprettes ved ny Supabase-bruger
- Indekser på hyppigt forespurgte kolonner

**Dokumentation**
- README.md: komplet trin-for-trin opsætningsvejledning + live valideringsliste
- OVERDRAGELSE.md: GitHub, Supabase, domæne, backup, eksport, branding
- PLATFORM.md: arkitektur, teknisk stack, ny kundekopi, vedligeholdelse
- CHANGELOG.md: denne fil

### Kendte begrænsninger (adresseres i v1.1)
- Billedet kan ikke erstattes in-place (slet + genupload er workaround)
- Drag-and-drop sortering ikke implementeret (numerisk rækkefølge bruges)
- Kontaktformularen åbner e-mailprogram — ingen server-side afsendelse
- Live test med rigtig Supabase-instans afventer

---

## Version 1.1 – Planlagt

Afhænger af live validering og feedback fra Version 1.0.

**Planlagt funktionalitet:**
- Erstat billede: udskift eksisterende URL uden slet + genupload
- Drag-and-drop sortering af bestyrelsesmedlemmer og aktiviteter
- Kontaktformular med server-side afsendelse (Supabase Edge Functions eller Resend)
- Søgefunktion i dokumentbibliotek
- Aktivitetskalender (årshjul-visning)

---

## Version 1.2 – Planlagt

- Avancerede brugerroller (editor: kun eget indhold, admin: alt)
- Statistik-dashboard med besøgstal
- Automatisk e-mailnotifikation ved nye tilmeldinger
- Formularbygger til admin

---

## Version 2.0 – Langsigtede mål

- Multi-sprog (dansk + engelsk)
- API-integrationer (GolfBox, MemberPad m.fl.)
- Avanceret mediebibliotek med mapper og søgning
- White-label dashboard til Nordic Operations-overblik over alle installationer

---

*Nordic Operations Platform · nordicoperations.dk*
