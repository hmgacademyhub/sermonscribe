/* ============================================
 HMG SermonScribe v3 — Service Worker
 Offline-first, cache-then-network, fallback page.
 Enterprise-grade PWA support.
 ============================================ */
const CACHE_NAME = 'hmg-sermonscribe-v3';
const OFFLINE_PAGE = './offline.html';

const STATIC_ASSETS = [
  './',
  './index.html',
  './live.html',
  './analytics.html',
  './notes.html',
  './devotions.html',
  './bulletin.html',
  './prayer-wall.html',
  './about.html',
  './features.html',
  './deploy.html',
  './offline.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/utils.js',
  './assets/js/bible.js',
  './assets/js/storage.js',
  './assets/js/export.js',
  './assets/js/broadcast.js',
  './assets/js/analytics.js',
  './assets/js/accessibility.js',
  './assets/js/sermon-timer.js',
  './assets/js/word-cloud.js',
  './assets/js/devotions.js',
  './assets/js/bulletin.js',
  './assets/js/prayer-wall.js',
  './assets/js/notes-mode.js',
  './assets/js/offline-library.js',
  './manifest.json',
  './assets/images/icon-192.svg',
  './assets/images/icon-512.svg',
  './assets/images/social-preview.jpg',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => Promise.resolve())
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const isSameOrigin = new URL(e.request.url).origin === self.location.origin;

  if (isSameOrigin) {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          if (r && r.status === 200) {
            const clone = r.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() =>
          caches.match(e.request).then((c) => {
            if (c) return c;
            if (e.request.mode === 'navigate') return caches.match(OFFLINE_PAGE);
            return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          })
        )
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((c) => {
        if (c) return c;
        return fetch(e.request).then((r) => {
          if (r && r.status === 200) {
            const clone = r.clone();
            caches.open(CACHE_NAME).then((cc) => cc.put(e.request, clone));
          }
          return r;
        }).catch(() => new Response('Unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
      })
    );
  }
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
