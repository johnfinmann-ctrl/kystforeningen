/**
 * NORDIC OPERATIONS CMS v2 – sw.js
 * Service Worker: PWA-caching og opdateringsdetektering
 *
 * VED NY KODEVERSION: Opdatér CACHE_VERSION (samme som APP_VERSION i config.js)
 * Det rydder gammel cache og viser opdateringsbanneret til alle brugere.
 *
 * Update-flow:
 * 1. Browser opdager ny sw.js (ved reg.update() eller navigation)
 * 2. Ny SW installeres og kører skipWaiting() – aktiverer straks
 * 3. clients.claim() overtager alle åbne faner
 * 4. controllerchange i app.js giver én reload – viser ny version
 */

const CACHE_VERSION = 'kfd-v1.0.5';
const CACHE_NAME    = CACHE_VERSION;

// Kernefiler der caches ved installation
// Relative stier virker på GitHub Pages-subrepoer (/kystforeningen/)
const PRECACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/supabase-client.js',
  './js/app.js',
  './assets/hero-kyst.jpg',
  './assets/hero-kyst-mobil.jpg',
  './manifest.json',
];

// ── Install: precache og skipWaiting straks ───────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())  // aktivér uden at vente på tab-luk
  );
});

// ── Activate: ryd ALLE ældre caches, overtag eksisterende faner ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Sletter gammel cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())  // overtag øjeblikkeligt
  );
});

// ── Fetch: strategi per kildetype ────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Supabase API – aldrig cache (database-svar er dynamiske)
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('supabase.in')) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Ekstern CDN (Supabase JS, Google Fonts, cdnjs) – netværk first
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // index.html og sw.js – NETWORK FIRST med cache fallback
  // Sikrer at ny version altid opdages, selv ved genåbning af PWA
  if (url.pathname.endsWith('/') ||
      url.pathname.endsWith('/index.html') ||
      url.pathname.endsWith('/sw.js')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Øvrige egne filer – stale-while-revalidate
  // Returnér cache med det samme, opdatér i baggrunden
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
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});

// ── Besked fra app.js ─────────────────────────────────────────
// 'SKIP_WAITING' sendes når bruger klikker "Opdater nu"
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
