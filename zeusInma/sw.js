const CACHE_NAME = 'spidey-climber-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  // Sprites
  './sprites/selecB.gif',
  './sprites/selecG.gif',
  './sprites/SBparado.gif',
  './sprites/SGparado.gif',
  './sprites/SBsalto.gif',
  './sprites/SGsalto.gif',
  './sprites/SBdoblesalto.gif',
  './sprites/SGdoblesalto.gif',
  './sprites/SBagachado.gif',
  './sprites/SGagachado.gif',
  './sprites/SBmuerte.gif',
  './sprites/SGmuerte.gif',
  './sprites/SBgameover.gif',
  './sprites/SGgameover.gif',
  './sprites/ganaste.png',
  // Sonidos
  './sound/zeus.mp3',
  './sound/inma.mp3',
  './sound/gameover.mp3',
  './sound/victoria.mp3',
  // Tailwind (para que la UI se vea offline)
  'https://cdn.tailwindcss.com'
];

// Instalación: precache de todos los assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación: limpia caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First (ideal para juegos offline)
self.addEventListener('fetch', (event) => {
  // Solo manejamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en cache, intentamos red y lo guardamos
      return fetch(event.request).then((networkResponse) => {
        // Solo cacheamos respuestas válidas
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback si no hay red y no está cacheado
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
