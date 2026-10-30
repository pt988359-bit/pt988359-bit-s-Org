// PRO TECK Admin Service Worker (Minimal PWA Pass-Through)
// Registers installation and activation only, forwarding all requests directly to the network
// to guarantee zero caching interference for visitor traffic and live showroom operations.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Direct pass-through to network without any offline caching
});
