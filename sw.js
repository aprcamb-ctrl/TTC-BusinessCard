const CACHE_NAME = 'ttc-card-v2'; // Incremented version to force update

self.addEventListener('install', (event) => {
    // Force the new service worker to take over immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Delete any old caches to ensure fresh data
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first strategy with aggressive cache-busting
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request, { cache: 'no-store' })
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
    );
});
