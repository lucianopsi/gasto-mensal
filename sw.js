// Cache do app para abrir rápido e funcionar sem internet.
// Ao publicar uma versão nova, troque o número abaixo.
const VERSION = "gm-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./firebase-config.js", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const sameOrigin = url.origin === self.location.origin;
  const firebaseLib = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !firebaseLib && !fonts) return; // Firestore e login passam direto
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: sameOrigin });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
