// Service Worker for СантехПро PWA (Optimized for resilient loading and immediate update delivery in RF)
const CACHE_NAME = 'santehpro-v5';
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

  // Navigation requests (HTML page): Network-first with fast timeout and cache fallback
  // Ensures user gets fresh updates immediately when online!
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const networkResponse = await fetch(event.request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, resClone);
            await cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          }
        } catch (_err) {
          // Fall back to cache on timeout or offline
        }

        const cached = (await caches.match(event.request)) || (await caches.match('/index.html')) || (await caches.match('/'));
        if (cached) return cached;

        return new Response('Офлайн-режим СантехПро. Проверьте интернет-соединение.', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      })()
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
