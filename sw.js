const CACHE_NAME = 'archea-platform-v3.2.1';
const APP_SHELL = [
  './',
  './config/platform.js?v=2.3.0',
  './config/help.js?v=2.0.0',
  './assets/workspace.js?v=3.0.4',
  './assets/workspace.css?v=1.2.0',
  './assets/platform.css?v=3.0.6',
  './assets/planning-suite.css?v=1.2.0',
  './assets/archea-update-0142.css?v=1.2.0',
  './assets/archea-update-0143.css?v=1.2.0',
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

// clic su una notifica del sistema: apre (o porta in primo piano) la piattaforma
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) { try { await c.navigate(url); } catch (e) {} return c.focus(); } }
    return clients.openWindow(url);
  })());
});

// notifica vera dal server (Web Push): arriva anche con il sito chiuso
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { title: 'ARCHEA', body: event.data ? event.data.text() : '' }; }
  const base = self.registration.scope;
  const url = base + (d.ticket_id ? `?ticket=${encodeURIComponent(d.ticket_id)}` : '') + '#/servicedesk';
  event.waitUntil(self.registration.showNotification(d.title || 'ARCHEA', {
    body: d.body || '',
    icon: base + 'icons/archea-apple-touch-icon.png',
    badge: base + 'icons/archea-favicon-32.png',
    tag: d.id ? 'archea-' + d.id : undefined,
    renotify: !!d.id,
    data: { url },
  }));
});

// il browser ha rinnovato l'iscrizione: la pagina la salva di nuovo al prossimo avvio
self.addEventListener('pushsubscriptionchange', () => {});
