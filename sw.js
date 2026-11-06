const CACHE_NAME = 'archea-platform-v1.9.0';
const APP_SHELL = [
  './',
  './config/platform.js?v=1.2.0',
  './config/help.js?v=1.5.0',
  './assets/workspace.js?v=1.7.0',
  './assets/workspace.css?v=1.2.0',
  './assets/platform.css?v=1.7.2',
  './assets/planning-suite.js?v=1.2.0',
  './assets/planning-suite.css?v=1.2.0',
  './assets/archea-update-0142.css?v=1.2.0',
  './assets/archea-update-0143.css?v=1.2.0',
  './assets/archea-update-0143.js?v=1.7.1',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => (key.startsWith('archea-workspace-') || key.startsWith('archea-platform-')) && key !== CACHE_NAME).map(key => caches.delete(key))))
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
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || caches.match('./'))),
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
