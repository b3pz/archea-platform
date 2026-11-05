const CACHE_NAME = 'archea-workspace-v0.14.5-agenda1';
const APP_SHELL = ['./', './assets/index-o7haKe_J.js?v=0.14.5-agenda1', './planning-suite.js?v=0.14.5-agenda1', './planning-suite.css?v=0.14.5-agenda1', './archea-update-0142.css?v=0.14.5-agenda1', './archea-update-0143.css?v=0.14.5-agenda1', './archea-update-0143.js?v=0.14.5-agenda1'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('archea-workspace-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      });
      return cached || network;
    }),
  );
});
