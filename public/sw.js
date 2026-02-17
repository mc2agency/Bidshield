const CACHE_NAME = "bidshield-v1";
const STATIC_ASSETS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Install: pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for pages/API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, chrome-extension, convex websocket, clerk auth
  if (
    event.request.method !== "GET" ||
    url.protocol === "chrome-extension:" ||
    url.hostname.includes("convex") ||
    url.hostname.includes("clerk") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Static assets: cache-first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|css|js)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
