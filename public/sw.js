// Service Worker for СантехПро PWA (High-performance caching with Stale-While-Revalidate & Image Cache)
const CACHE_NAME = 'santehpro-v7';
const API_CACHE_NAME = 'santehpro-api-cache-v2';
const MEDIA_CACHE_NAME = 'santehpro-media-cache-v1';

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
            name !== API_CACHE_NAME &&
            name !== MEDIA_CACHE_NAME &&
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

  // 1. Uploaded Media & Images (/uploads/*) -> Cache-First with permanent local storage
  if (url.origin === self.location.origin && event.request.method === 'GET' && url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cached || new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // 2. High-volume read APIs (/api/articles, /api/specialists, /api/media-files, /api/questions)
  // Strategy: Stale-While-Revalidate (Instant 0ms cached response + background revalidation)
  const isCachableApi =
    url.origin === self.location.origin &&
    event.request.method === 'GET' &&
    (url.pathname.startsWith('/api/articles') ||
      url.pathname.startsWith('/api/specialists') ||
      url.pathname.startsWith('/api/media-files') ||
      url.pathname.startsWith('/api/questions'));

  if (isCachableApi) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 304)) {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
            }
            return networkResponse;
          })
          .catch(() => cached);

        // Serve cached content immediately if available; revalidate in background!
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Skip other API routes, mutations, and auth endpoints
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // 3. Navigation requests (HTML page): Network-first with fast timeout and cache fallback
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

  // 4. Cache-First strategy for static assets (JS, CSS, icons, webp, woff2, svg)
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
        if (cachedResponse) {
          return cachedResponse;
        }

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

  // Default network with cache fallback
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
