# CHANGELOG – Kystforeningen Djursland

## Version 1.0.20 – RC6 fejlrettelse (26. oktober 2026)

### Ændrede filer
- `index.html` (HTML-strukturfejl rettet; Hjelm Banke-billede opdateret)
- `css/styles.css` (grid-layout og mobilkomprimering)
- `js/config.js` (versionsnummer)
- `sw.js` (service worker cache-version)
- `assets/hjelm-banke.jpg` (erstattet med rigtigt billede)

---

### Rettede fejl

#### FEJL 1 – Hjelm Banke: mørkeblå flade i stedet for billede
- **Årsag:** `assets/hjelm-banke.jpg` var en 2115-byte PNG med ensfarvet marineblå (#0d2233) – aldrig et rigtigt foto
- **Rettelse:** Erstattet med et center-cropped udsnit af `kyst-hero.jpg` (800×450px JPEG, 78KB)
- **Princip:** Kun eksisterende projektbilleder anvendt – ingen genererede fotos, ingen stockfotos

#### FEJL 2+3 – Fjellerup og sagskort ikke ensartede
- **Årsag 1:** CSS-grid brugte `repeat(auto-fit, minmax(280px, 1fr))` → 5. kort alene i række 2 spændte til fuld bredde
- **Rettelse CSS:** Ændret til `repeat(3, 1fr)` med eksplicit `grid-column` for kort 4 og 5
- **Årsag 2:** HTML-strukturfejl i SAG 4 (Hjelm Banke) – den tilføjede Din Avis-artikel i RC6 var placeret UDEN FOR `<div class="presse-grid">`, hvilket skabte et overflødig `</div>` og lod det 5. sag-kort falde ud af grid-containeren
- **Rettelse HTML:** Din Avis-artiklen flyttes korrekt IND I presse-grid; det overflødige `</div>` fjernes
- **Resultat:** Alle 5 kort måler præcist 335px brede – max forskel: 0px

#### FEJL 4 – Mobilforsiden for lang
- **Årsag:** Hero 88-92vh, intro-padding 9rem, dark-section 5.5rem padding, dark-frames min-height 340px → samlet side meget lang på mobil
- **Rettelse CSS** (gælder kun `max-width: 768px` og `max-width: 480px`):
  - Hero: reduceret til 55vh (min. 320px)
  - Intro-sektion: padding reduceret til `--sp-lg` (3rem) – fra `--sp-2xl` (9rem)
  - Intro-overskrift: font-size reduceret til `clamp(1.45rem, 6vw, 2rem)`
  - Dark-section: padding reduceret til `--sp-lg`, margin-bottom til `--sp-md`
  - Dark-tagline: font-size reduceret til 1.25rem
  - Dark-frame: min-height reduceret til 140px (fra 340px desktop / 220px tablet)
  - Section-hdr: margin-bottom reduceret til `--sp-md`
- **Bevarede:** Alle 5 sager, tre indgange, nyheder, høringer, forsidebillede, OPLEV·FORSTÅ·BEVAR – kun afstande ændret

#### FEJL 5 – Kun eksisterende billeder
- Bekræftet: Intet genereret, ingen stockfotos – kun `kyst-hero.jpg` brugt

#### FEJL 6 – Kvalitetskontrol
- Playwright-screenshots taget og gennemgået for alle visninger inden levering

---

### Teknisk
- `js/config.js`: `APP_VERSION` → `'1.0.20'`
- `sw.js`: `CACHE_VERSION` → `'kfd-v1.0.20'`

---

## Version 1.0.19 – RC6 (26. oktober 2026)

### Ændrede filer
- `index.html` (hoveddokument)
- `css/styles.css` (design-tokens)
- `js/config.js` (versionsnummer)
- `sw.js` (service worker cache-version)
- `manifest.json` (PWA start_url og scope)

---

### Nye funktioner og ændringer

#### Design (RC6)
- Google Fonts tilføjet i `<head>`: Playfair Display (overskrifter) + Source Sans 3 (brødtekst/UI)
- Font-variabler opdateret i CSS tokens (`--font-display`, `--font-body`)
- Mere afrundede hjørner: `--r-sm: 6px`, `--r-md: 10px`, `--r-lg: 16px`

#### Navigation
- Hero `aria-labelledby` opdateret (ingen "Randers Fjord"-reference)
- **Sagernes rækkefølge ændret til:**
  1. Dråby Sommerhuse
  2. Vosnæs Vindmøller
  3. Grobund / Ålerne
  4. Hjelm Banke
  5. Fjellerup Strand

#### Standardfane
- **"Seneste nyt" åbner nu som standard** for alle 5 sager (tidligere: "Baggrund")

#### Nye kilder – Grobund / Ålerne
- **Baggrund-tekst opdateret**: nævner nu korrekt at Helhedsplan for Ålerne blev vedtaget den **25. juni 2025**, og præciserer at en helhedsplan ikke i sig selv giver byggeret
- **Kommunale kilder**: Ny kilde tilføjet:
  - Syddjurs Kommune – Helhedsplan for Ålerne (officiel projektside)
  - URL: https://www.syddjurs.dk/politik/udviklingsprojekter/helhedsplan-for-aalerne
  - Vedtaget: 25. juni 2025
  - Note: "En helhedsplan er ikke juridisk bindende og giver ikke i sig selv ret til at bygge – en lokalplan skal vedtages særskilt."

#### Nye kilder – Hjelm Banke
- **Presse**: Ny historisk artikel tilføjet:
  - "Hjelm Dyb ikke robust nok" – Din Avis, april 2022
  - URL: https://dinavis.dk/samfund/ECE13891207/hjelm-dyb-ikke-robust-nok/
  - Markeret: "Historisk artikel · April 2022"

#### Nye kilder – Vosnæs Vindmøller
- **Presse**: Nyt historisk debatindlæg tilføjet:
  - "Vosnæsmøller vil levere masser af grøn strøm til aarhusianerne" – Din Avis, maj 2021
  - URL: https://dinavis.dk/debat/ECE12976028/vosnaesmoeller-vil-levere-masser-af-groen-stroem-til-aarhusianerne/
  - Markeret: "Historisk debatindlæg · Maj 2021"
  - Viser forskellige perspektiver i Vosnæs-sagen
  - Ministerafgørelsen er ikke fremstillet som endelig tilladelse til at opføre vindmøllerne

#### PWA / Teknisk
- `manifest.json`: `start_url` og `scope` ændret fra `"/"` til `"/kystforeningen/"`
- `js/config.js`: `APP_VERSION` → `'1.0.19'`
- `sw.js`: `CACHE_VERSION` → `'kfd-v1.0.19'`

---

## Version 1.0.18 – RC5.5 (23. oktober 2026)
(Se tidligere CHANGELOG for detaljer)
