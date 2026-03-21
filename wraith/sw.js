/* ═══════════════════════════════════════════════
   PERSONA FORGE � Service Worker
   Cache-first strategy, full offline support
   ═══════════════════════════════════════════════ */

const CACHE_NAME = 'wraith-v1';
const CACHE_VERSION = '1.0.0-beta';

// All assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app-state.js',
  './js/scene-composer.js',
  './js/prompt-engine.js',
  './js/prompt-analysis.js',
  './js/library.js',
  './js/pwa.js',
  './js/main.js',
  // Google Fonts � cache the CSS + actual font files
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@300;400;500&display=swap'
];

// -- INSTALL: pre-cache all core assets
self.addEventListener('install', event => {
  console.log('[SW] Installing WRAITH v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching assets');
        // Cache what we can � font CDN may fail in some environments, that's OK
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache:', url, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Install complete — skipping wait');
        return self.skipWaiting();
      })
  );
});

// -- ACTIVATE: clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// -- FETCH: cache-first for app shell, network-first for fonts
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts — network first, cache fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // App shell & all local assets — cache first
  event.respondWith(cacheFirstWithNetwork(request));
});

// Cache-first: try cache, fall back to network and update cache
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Serve from cache, update in background
    updateCache(request);
    return cached;
  }
  // Not in cache — fetch from network and cache it
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Full offline fallback — return cached index.html
    const fallback = await caches.match('./index.html');
    return fallback || new Response('WRAITH is offline. Open it once while online to cache it.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network-first: try network, fall back to cache
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

// Background cache update (stale-while-revalidate pattern)
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response);
    }
  } catch {
    // Background update failed silently — cached version still served
  }
}

// -- MESSAGE: handle cache clear requests from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0]?.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});



