const PRECACHE = "precache-v1";
const RUNTIME = "runtime-v1";

const PRECACHE_URLS = [
  "/manifest.json",
  "/icons/favicon-16x16-dunplab-manifest-21527.jpg",
  "/icons/apple-icon-144x144-dunplab-manifest-21527.jpg",
  "/index.html",
  "/style/bootstrap.min.css",
  "/style/index.css",
  "/style/dark-theme.css",
  "/js/jquery-3.5.1.min.js",
  "/js/bootstrap.bundle.min.js",
  "/js/index.js",
  "/js/data.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    console.log(event.request.url);
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
