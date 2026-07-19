/**
 * NORDIC OPERATIONS CMS v2 – sw.js
 * Service Worker: PWA-caching og opdateringsdetektering
 *
 * VED NY KODEVERSION: Opdatér CACHE_VERSION herunder (samme som APP_VERSION i config.js)
 * Det rydder gammel cache og viser opdateringsbanneret til alle brugere.
 */

const CACHE_VERSION = 'kfd-v1.0.0';
const CACHE_NAME    = CACHE_VERSION;

// Filer der caches ved installation
// Brug relative stier (./) så det virker på GitHub Pages i subrepoer
const PRECACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/supabase-client.js',
  './js/app.js',
  './assets/kyst-hero.jpg',
  './manifest.json',
];

// ── Install: precache kerneressourcer ─────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())   // aktivér med det samme
  );
});

// ── Activate: ryd alle ældre caches ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // overtag eksisterende faner
  );
});

// ── Fetch strategi ────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Supabase API – altid netværk (vi må aldrig cache database-svar)
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('supabase.in')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // CDN-ressourcer (Supabase JS, fonts) – netværk first, cache fallback
  if (url.hostname.includes('jsdelivr.net') ||
      url.hostname.includes('cdn.') ||
      url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Egne filer – stale-while-revalidate
  // Returnér cached version med det samme, opdatér cache i baggrunden
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request)
          .then(response => {
            if (response.ok && request.method === 'GET') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);   // offline: brug cache
        return cached || networkFetch;
      })
    )
  );
});

// ── Besked fra app.js ─────────────────────────────────────────
// Når bruger klikker "Opdater nu" sender app.js 'SKIP_WAITING'
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
