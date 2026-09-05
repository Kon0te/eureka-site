// Retirement worker for the obsolete Flutter administration at /admin/.
// Keep this URL deployed so an existing installation can relinquish control.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of ['flutter-app-cache', 'flutter-temp-cache', 'flutter-app-manifest']) {
      await caches.delete(key);
    }
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).pathname.startsWith('/admin/')) {
        await client.navigate('https://admin.eureka-apps.fr/#/admin');
      }
    }
  })());
});
