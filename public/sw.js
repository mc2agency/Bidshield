const CACHE_NAME = "bidshield-v2";

// Install: skip waiting immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: delete ALL old caches, claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for everything
// Only cache as offline fallback, never serve stale content
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, external domains, API, websockets
  if (
    event.request.method !== "GET" ||
    url.protocol === "chrome-extension:" ||
    url.hostname.includes("convex") ||
    url.hostname.includes("clerk") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Network-first: always try network, cache as fallback
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
