/**
 * Kystforeningen Djursland – config.js
 * ======================================
 * SUPABASE (valgfrit – hjemmesiden fungerer uden):
 *   Udfyld SUPABASE_URL og SUPABASE_ANON for at aktivere:
 *     • Dynamiske bestyrelsesmedlemmer
 *     • Dynamiske dokumenter (dok-areas)
 *     • Dynamisk kontaktperson og pris på bliv-medlem-siden
 *
 *   Find værdierne i Supabase Dashboard:
 *     Settings → API → Project URL + anon public key
 *
 *   Uden nøgler: Hjemmesiden viser det statiske HTML-indhold
 *   og giver INGEN fejlbeskeder til besøgende (silent fallback).
 *
 *   anon key er IKKE hemmelig og må ligge i frontend.
 *   Service role key må ALDRIG indsættes her.
 *
 * MANGLENDE NØGLER – berørte funktioner:
 *   ✗ Dynamiske bestyrelsesmedlemmer (viser statisk HTML)
 *   ✗ Dynamisk kontaktinfo og medlemspris (viser statisk HTML)
 *   ✗ Dynamiske dokumenter i dok-areas-sektionen (viser ingenting)
 *   ✓ Alle sager, artikler, presse, nyheder, PDF-visning – virker altid
 *   ✓ Nyhedsbjælke, vedtægt-luk-knap, PDF-viewer – virker altid
 *   ✓ Service Worker, PWA-installation – virker altid
 */
const SUPABASE_URL  = 'DIN_SUPABASE_URL_HER';       // https://xxxx.supabase.co
const SUPABASE_ANON = 'DIN_SUPABASE_ANON_KEY_HER';  // eyJhbGci...

/** PWA cache-version – øg med 1 ved ny kodeversion (matcher sw.js CACHE_VERSION) */
const APP_VERSION = '1.0.48';

/**
 * DEBUG_MODE
 * true  = tekniske fejl og Supabase-status vises (kun til udvikling)
 * false = kun brugervenlige beskeder vises (produktion)
 *
 * Sæt ALTID til false inden upload til GitHub Pages.
 */
const DEBUG_MODE = false;

/** Kundeidentifikation */
const SITE = {
  name:     'Kystforeningen Djursland',
  tagline:  'Bevarelse af naturen og de rekreative kystområder på Djursland',
  email:    'info@kystforeningendj.dk',
  builtBy:  '',
  builtUrl: '',
};
