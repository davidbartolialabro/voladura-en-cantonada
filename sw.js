const CACHE_NAME = 'voladura-en-cantonada-v2';

// Tots els recursos que cal guardar per funcionar sense internet
const ASSETS = [
  '/voladura-en-cantonada/',
  '/voladura-en-cantonada/index.html',
  '/voladura-en-cantonada/manifest.json'
];

// Instal·lació: guarda tots els recursos al cau
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activació: esborra caus antics
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Intercepta peticions: primer mira al cau, si no hi és busca a la xarxa
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Guarda la resposta al cau per a futures visites
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Si no hi ha xarxa ni cau, intenta servir l'index
      return caches.match('/voladura-en-cantonada/index.html');
    })
  );
});
