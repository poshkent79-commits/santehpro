// Service Worker for СантехПро PWA (Optimized for resilient loading in RF)
const CACHE_NAME = 'santehpro-v4';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache error during install:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (
            name !== CACHE_NAME &&
            name !== 'santehpro-api-cache-v1' &&
            !name.startsWith('santehpro-offline')
          ) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Fast cache for GET /api/articles and GET /api/specialists
  if (url.origin === self.location.origin && event.request.method === 'GET' && (url.pathname.startsWith('/api/articles') || url.pathname.startsWith('/api/specialists') || url.pathname.startsWith('/api/questions'))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open('santehpro-api-cache-v1').then((cache) => cache.put(event.request, resClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Skip cross-origin requests, non-GET, auth endpoints, and API endpoints
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // Navigation requests (HTML page): Cache-first with background revalidation to prevent ERR_TIMED_OUT in RF
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        // Fast fetch with 3.5s timeout race to prevent ERR_TIMED_OUT
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('HTML fetch timeout in RF')), 3500)
        );
        const fetchPromise = Promise.race([fetch(event.request), timeoutPromise])
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return networkResponse;
          })
          .catch(() => cachedIndex || caches.match('/'));

        // If we have cached index.html, return it instantly!
        if (cachedIndex) {
          // Trigger background update
          fetchPromise.catch(() => {});
          return cachedIndex;
        }

        return fetchPromise;
      })
    );
    return;
  }

  // Cache-First strategy for static assets (JS, CSS, icons, fonts)
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Instant response from cache if available!
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network with timeout protection
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Asset fetch timeout in RF')), 5000)
        );

        return Promise.race([fetch(event.request), timeoutPromise])
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('SW asset fetch failed or timed out:', err);
            return cachedResponse || new Response('', { status: 408 });
          });
      })
    );
    return;
  }

  // Default network with cache fallback for other GET requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Offline mode in RF', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
