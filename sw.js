/* Service worker — Cartões 2.0 (página: rede primeiro; resto: cache primeiro; Firestore nunca é interceptado) */
const CACHE = 'nt-cartoes-v2.0.0';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const EXT = ['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
self.addEventListener('install', e => { e.waitUntil((async () => { const c = await caches.open(CACHE); await c.addAll(SHELL); await Promise.all(EXT.map(u => c.add(new Request(u, { mode: 'no-cors' })).catch(() => {}))); await self.skipWaiting(); })()); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return; const url = new URL(req.url);
  if (/googleapis\.com|firebaseapp\.com|firebaseio\.com|identitytoolkit|securetoken/.test(url.host) && !/fonts\./.test(url.host)) return;
  if (req.mode === 'navigate' || req.destination === 'document') { e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (url.origin === location.origin || EXT.includes(req.url)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});
