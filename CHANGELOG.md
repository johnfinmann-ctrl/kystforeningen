# CHANGELOG – Kystforeningen Djursland

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
