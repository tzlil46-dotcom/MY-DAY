const CACHE = 'myday-v3';
const ASSETS = ['./', './index.html', './app.js?v=2', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => /^myday-v\d+$/.test(key) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request, {cache: 'no-cache'});
      if (response.ok) { try { await cache.put(request, response.clone()); } catch {} }
      return response;
    } catch (error) {
      const saved = await cache.match(request);
      if (saved) return saved;
      if (request.mode === 'navigate') { const home = await cache.match('./index.html'); if (home) return home; }
      throw error;
    }
  })());
});
