/**
 * NORDIC OPERATIONS CMS v2 – sw.js
 * Service Worker: PWA-caching og opdateringsdetektering
 *
 * VIGTIGT: Opdater CACHE_VERSION ved ny kodeversion.
 * Det udløser en opdateringsmeddelelse til alle brugere.
 */

const CACHE_VERSION = 'kfd-v1.0.0';
const CACHE_NAME    = CACHE_VERSION;

// Filer der caches til offline-brug
const PRECACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/app.js',
  '/assets/kyst-hero.jpg',
  '/manifest.json',
];

// ── Install: precache kerneressourcer ──────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: ryd gamle caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for assets ──────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase API – altid netværk (fresh data)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // CDN ressourcer – netværk first
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdn.')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Egne filer – stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok && event.request.method === 'GET') {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});

// ── Besked fra app: skip waiting ──────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
