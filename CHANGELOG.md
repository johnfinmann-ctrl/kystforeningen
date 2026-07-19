# CHANGELOG
## Nordic Operations Platform – Kystforeningen Djursland

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
