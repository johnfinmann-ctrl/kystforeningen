# CHANGELOG – Kystforeningen Djursland

## v1.0.34 (31. oktober 2026)

### Kontrol og verifikation
- Avisartikler: Direkte artikel-URLs ikke verificerbare (bag betalingsmure) – links holdes som forsidelinks med tydelig note om at den præcise URL kræver log-in hos avisen
- Hero-billede: CSS-sti verificeret korrekt i GitHub repo (`css/styles.css` → `url('../assets/landskab-aalerne.jpg')`); billede bekræftet til stede i `assets/`
- GitHub Pages: Live repo er v1.0.32 – v1.0.33-filer (nye Grobund-faner) IKKE deployet endnu; denne leverance (v1.0.34) er første komplette leverance klar til upload
- Bliv medlem-funktion: Analyseret – se kontrolrapport nedenfor

### Bliv-medlem analyse
- Modtageradresse: `info@kystforeningendj.dk` (SITE.email fallback) og den Supabase `contact_email`-indstilling, der vises i k-email-elementet
- Mekanisme: Åbner brugerens eget mailprogram med `mailto:` – der sendes INGEN mail automatisk fra serveren
- Oplysninger i formularen: Navn (påkrævet), e-mail (påkrævet), telefon (valgfrit), kommentar (valgfrit)
- Automatisk bekræftelse til nyt medlem: NEJ – ingen bekræftelsesmail sendes automatisk
- Fejlhåndtering: Hvis brugerens mailprogram ikke åbner, vises besked med kopi-knap
- Datalagring: Ingen – formulardata gemmes IKKE i database, localStorage eller server

### Teknisk
- Service Worker CACHE_VERSION: kfd-v1.0.34
- config.js APP_VERSION: 1.0.34

---

## v1.0.33 (31. oktober 2026)

### Grobund/Ålerne – udvidet

**Presse og debat (fane):**
- "Presse"-fanen omdøbt til "Presse og debat"
- Foreningens eget debatindlæg tilføjet: "Bidrager Grobund positivt til samfundet?" (Elsebeth Due Kjeldsen)
- Tilføjet debatindlæg: JP 2. feb 2026 – "Politikere svigter naturen" (link + omtale, ikke fuldt indhold – copyright JP)
- Tilføjet debatindlæg: Ebeltoft Folketidende 4. feb 2026 – samme indlæg (link + omtale – copyright Ebeltoft Folketidende)
- Tilføjet debatindlæg: Din Avis 27. apr 2026 – "Er Grobund vigtigere end velfærd?" af John Finmann (link + omtale – copyright JP Lokalaviser)
- Tilføjet nyhedsartikel: Ebeltoft Folketidende 4. marts 2026 – "Politisk vilje til at finde en løsning" (link + omtale)

**Ny fane: Trafik og infrastruktur:**
- Beskriver trafikudfordringen på Langagervej, Christianslundsvej, Færgevejen og Ålervejen
- Nævner Rambøll-analyse som internt kommunalt grundlag (ikke publiceret, IKKE linket som PDF – rapport er fortrolig)
- Foreningens krav om reelle trafiktællinger
- Link til John Finmanns debatindlæg om trafik

**Ny fane: Vandhåndtering og miljø:**
- Beskriver K-LAR's vandhåndteringsnotat (27. marts 2026) – ikke publiceret officielt, IKKE linket som PDF
- Spildevandsproblematikken som central hindring
- Link til eksisterende Din Avis-artikel om spildevandsprop
- Beskyttede naturtyper og grundvand

### Nye dokumentfiler
- assets/documents/grobund/bidrager-grobund-til-samfundet.pdf (foreningens eget – kan publiceres)

### Sikkerhed (uændret)
- Rambøll Trafikafviklingsplan (Confidential, jan 2026): IKKE publiceret, IKKE linket
- K-LAR Vandhåndteringsplan (ikke officielt frigivet): IKKE publiceret som download
- Avisartikler (JP, Ebeltoft Folketidende, Din Avis): Kun overskrift, omtale og link – ingen fulde tekster (ophavsret)
- Service Role Key: ikke til stede i frontend

### Teknisk
- Service Worker CACHE_VERSION: kfd-v1.0.33
- config.js APP_VERSION: 1.0.33

---

## v1.0.32 korrektioner (31. oktober 2026)

### Rettelser
- Hero-billede: styles.css placeret i css/-undermappe så url('../assets/landskab-aalerne.jpg') virker korrekt på alle enheder
- GF 2026: Fjernet dobbelt dokument "Bestyrelsens beretning 2026" – kun "Velkomst og beretning 2026" vises
- Grobund/Ålerne presse: Tilføjet artikler fra Din Avis (juni 2025), TV 2 Østjylland og DR Østjylland (links + kort omtale, ingen fulde tekster)

---

## v1.0.32 (31. oktober 2026)

### Nye dokumenter tilføjet
- GF 2026: beretning-generalforsamling-2026.pdf (ny)
- GF 2026: referat-generalforsamling-2026.pdf (ny)
- GF 2026: velkomst-og-beretning-generalforsamling-2026.pdf (ny)
- GF 2025: referat-generalforsamling-2025.pdf (bevaret)
- GF 2025: velkomst-og-beretning-generalforsamling-2025.pdf (bevaret)
- Grobund: vandhaandteringsplan-grobund-2026.pdf (ny)
- Indsigelse: indsigelse-dispensation-kaarsbergsvej-2026.pdf (ny)
- Alle 9 nyhedsbreve (03–11) bekræftet til stede

### Billeder
- Hero-billede: assets/landskab-aalerne.jpg bekræftet på alle breakpoints
- Sagsbilleder til alle 5 aktuelle sager verificeret og tilføjet
- QR-kode til Facebook tilføjet (assets/facebook-qr.png)

### Teknisk
- Service Worker CACHE_VERSION opdateret: kfd-v1.0.32
- config.js APP_VERSION opdateret: 1.0.32
- Alle 22 PDF-links verificeret 22/22 (ingen manglende filer)
- Alle 7 billedreferencer i index.html verificeret OK

### Sikkerhed (uændret)
- Rambølls trafikrapport (Confidential) er IKKE inkluderet i ZIP
- 5 avisartikler er IKKE inkluderet (ophavsret ikke afklaret)
- Service Role Key er ikke til stede i frontend-kode
- RLS-politikker: brugere kan ikke selv tildele admin-rolle

### Kendte begrænsninger
- Vedtægt-PDF (vedtaegter-kystforeningen-djursland.pdf) indeholder vedtægterne
  fra 2024; HTML-teksten er korrekt opdateret ("Ændret på generalforsamling
  25. september 2026"), men den opdaterede PDF er endnu ikke modtaget.
  Leverandøren skal uploade en ny vedtægt-PDF, når den foreligger.
- PWA-ikoner (icon-192.png, icon-512.png) er ikke inkluderet i denne leverance;
  hvis de ikke allerede er deployet på GitHub Pages, skal de tilføjes manuelt.
- Supabase-URL og anon-nøgle er stadig placeholders i config.js.
  Indstilles i Supabase-dashboardet inden deployment.

---

## v1.0.31 (oktober 2026)
- Hero-billede ændret til landskab-aalerne.jpg
- Grobund-sektion udvidet med 5 dokumentkategorier
- GF 2025-dokumenter tilføjet
- Supabase-sikkerhed: ingen self-promotion-sårbarhed
- Service Worker og PWA-manifest opdateret

## v1.0.30 og tidligere
Se tidligere versioner i projektarkiv.
