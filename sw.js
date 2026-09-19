const CACHE_NAME = 'fin-center-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// Install and immediately take over
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
    );
});

// Clean up old caches automatically
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

// Network-First Strategy
self.addEventListener('fetch', event => {
    // --- ADD THIS LINE TO PROTECT YOUR DATA SYNC ---
    if (event.request.url.includes('script.google.com')) return; 
    // -----------------------------------------------

    event.respondWith(
        fetch(event.request)
        .then(response => {
            // If network works, update the cache with the fresh file
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            return response;
        })
        .catch(() => {
            // If offline, serve from cache
            return caches.match(event.request);
        })
    );
});
