/* Service worker COLREGs: Jaga Anjungan. Versi berubah otomatis setiap build. */
const VERSION = 'cj-app-d352a33153a7';
const FONTS = 'cj-fonts-v1';
const CORE = ["./", "./index.html", "./unduh.html", "./privasi.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-1024.png", "./icon-maskable-192.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png", "./icon.svg"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const u = new URL(req.url);
  if(u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if(r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if(u.origin !== self.location.origin) return;
  const root = new URL(self.registration.scope).pathname;
  if(req.mode === 'navigate'){
    if(u.pathname === root || u.pathname === root + 'index.html'){
      e.respondWith(caches.match('./index.html', {cacheName:VERSION}).then(r => r || fetch(req)).catch(() => fetch(req)));
    } else {
      const local = () => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match(u.pathname.replace(/\/?$/, '') + '.html')).then(r => r || caches.match('./unduh.html'));
      e.respondWith(fetch(req).then(r => r && r.ok ? r : local().then(c => c || r)).catch(local));
    }
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch:true}).then(r => r || fetch(req).then(res => {
    if(res && res.ok){ const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return res;
  })));
});
