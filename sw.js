const CACHE_NAME = 'sermonscribe-v4-cache';
const STATIC_ASSETS = ['./','./index.html','./live.html','./analytics.html','./notes.html','./devotions.html','./bulletin.html','./prayer-wall.html','./calendar.html','./features.html','./about.html','./offline.html','./manifest.json','./assets/css/style.css','./assets/js/app.js','./assets/js/utils.js','./assets/js/storage.js','./assets/js/bible.js','./assets/js/export.js','./assets/js/broadcast.js','./assets/js/outline-generator.js','./assets/js/discussion-generator.js','./assets/js/repurposer.js','https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('bible-api.com')) { e.respondWith(fetch(e.request).then(r => { caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match('./offline.html'))); }
  else { e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())); return r; }).catch(() => c))); }
});
