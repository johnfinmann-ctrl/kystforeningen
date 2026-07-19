/**
 * NORDIC OPERATIONS CMS v2 – config.js
 * ======================================
 * UDFYLD DISSE TO LINJER FØR UPLOAD:
 *
 * Find værdierne i Supabase Dashboard:
 *   Settings → API → Project URL + anon public key
 *
 * anon key er IKKE hemmelig og må godt ligge i frontend.
 * Service role key må ALDRIG indsættes her.
 *
 * Ved ny kundekopi: erstat kun disse to linjer.
 */
const SUPABASE_URL  = 'DIN_SUPABASE_URL_HER';       // https://xxxx.supabase.co
const SUPABASE_ANON = 'DIN_SUPABASE_ANON_KEY_HER';  // eyJhbGci...

/** PWA cache-version – øg med 1 ved ny kodeversion */
const APP_VERSION = '1.0.0';

/** Kunde-identifikation (bruges i admin-panel og footer) */
const SITE = {
  name:     'Kystforeningen Djursland',
  tagline:  'Bevarelse af naturen og de rekreative kystområder på Djursland',
  email:    'info@kystforeningendj.dk',
  builtBy:  'Nordic Operations',
  builtUrl: 'https://nordic-operations.dk',
};
