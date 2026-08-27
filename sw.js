const CACHE_NAME = 'pwa-sklad-v5'; // Zvedni číslo verze
const ASSETS = [
  './',
  './index.html',
  './sklad.html',
  './recepty.html',
  './manifest.json',
  './icon.png'
];

// 1. Při instalaci se stačí VŠECHNY soubory do paměti a přeskočí se čekání
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Okamžitá aktivace nového Service Workeru
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Ukládám všechny stránky do offline paměti...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Po aktivaci si okamžitě přivlastníme všechny otevřené stránky
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Smazání starých verzí mezipaměti
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Při jakémkoliv požadavku vracíme soubory primárně z offline mezipaměti
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
