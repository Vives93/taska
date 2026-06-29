// Taska Service Worker
const CACHE = "taska-v2";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await clients.claim();
    })()
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const esNavegacion = e.request.mode === "navigate" ||
                       e.request.url.endsWith("/") ||
                       e.request.url.endsWith("index.html");

  if (esNavegacion) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
