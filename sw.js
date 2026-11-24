// Offline support. Network first, so a new day and any update always show up when there's signal.
// If the network is slow (over 4 s) or gone, the copy from last time is used instead.
// On install it saves everything index.html loads, so the game works offline from the second visit.
// Today's Chain Letter word book and the detailed map are saved the first time they load.
const CACHE = 'postmarked-1';
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const html = await (await fetch('./', { cache: 'no-cache' })).text();
    const urls = ['./', ...[...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1])];
    await Promise.all(urls.map(u => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (FONTS.test(req.url)) return e.respondWith(cacheFirst(req));
  if (url.origin !== location.origin) return;
  e.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  // Game pages carry ?day / ?from etc.; the saved copy of the page itself is stored without them.
  const key = req.mode === 'navigate' ? './' : req;
  const fresh = fetch(req).then(res => {
    if (res.ok) cache.put(key, res.clone());
    return res;
  });
  const saved = await cache.match(key);
  if (!saved) return fresh;
  const slow = new Promise(resolve => setTimeout(() => resolve(saved), 4000));
  return Promise.race([fresh.catch(() => saved), slow]);
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
