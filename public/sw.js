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

self.addEventListener('push', (event) => {
  try {
    const d = event.data ? event.data.json() : {};
    const title = d.title || 'PRO TECK';
    const body = d.message || '';
    const url = d.url || '/admin';
    event.waitUntil(self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url },
    }));
  } catch { /* silent */ }
});

self.addEventListener('notificationclick', (event) => {
  try {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/admin';
    event.waitUntil((async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of all) {
        if ('focus' in c) { await c.focus(); if ('navigate' in c) { try { await c.navigate(url); } catch {} } return; }
      }
      await self.clients.openWindow(url);
    })());
  } catch { /* silent */ }
});
