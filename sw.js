/**
 * NORDIC OPERATIONS CMS v2 – sw.js
 * Service Worker: PWA-caching og opdateringsdetektering
 *
 * VED NY KODEVERSION: Opdatér KUN CACHE_VERSION herunder.
 * Det rydder gammel cache og trigger opdatering hos alle brugere.
 *
 * Update-flow (iPhone PWA):
 * 1. Bruger åbner installeret PWA
 * 2. App.js sætter controllerchange-listener OP FØRST
 * 3. navigator.serviceWorker.ready → reg.update() kald
 * 4. Browser fetcher ny sw.js fra netværket (network-first på sw.js)
 * 5. Ny SW installeres → skipWaiting() → ny SW aktiveres
 * 6. clients.claim() overtager PWA-vinduet
 * 7. controllerchange-event → reload (med loop-guard)
 * 8. Brugeren ser ny version
 */

const CACHE_VERSION = 'kfd-v1.0.6';
const CACHE_NAME    = CACHE_VERSION;

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
// skipWaiting() her sikrer at ny SW ikke venter – den overtager med det samme.
// Dette kombineret med clients.claim() nedenfor giver automatisk opdatering
// uden at brugeren skal lukke og genåbne appen.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: ryd ALLE ældre caches, overtag alle åbne klienter ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: strategi per kildetype ────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Supabase – aldrig cache
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('supabase.in')) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Ekstern CDN – netværk first, cache fallback
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // sw.js og index.html/navigation – ALTID network first
  // Kritisk: Sikrer at installeret PWA aldrig starter på en låst gammel sw.js
  const isNavigation = request.mode === 'navigate';
  const isSW = url.pathname.endsWith('/sw.js');

  if (isNavigation || isSW) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && response.status < 400) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request) || caches.match('./index.html'))
    );
    return;
  }

  // Statiske assets – stale-while-revalidate (hurtig load, opdateres i baggrunden)
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
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
