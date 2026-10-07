// The old page at plumbline.toolwright.dev is retired (PLU-386).
// Its service worker was cache-first, so browsers that visited it kept the old
// page. This replacement deletes every cache, unregisters itself and reloads
// any open tab. Remove it, with CNAME and .nojekyll, once GitHub Pages is off.
self.addEventListener('install', function () {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (tabs) { tabs.forEach(function (t) { t.navigate(t.url).catch(function () {}); }); })
      .catch(function () {})
  );
});
