const CACHE_NAME = 'pwa-sklad-v4';
const ASSETS = [
  './',
  './index.html',
  './sklad.html',
  './recepty.html',
  './manifest.json',
  './icon.png' // <-- Nová ikona
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
