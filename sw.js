const CACHE_NAME = 'eee-33-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png'
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url === sheetUrl) {
        // Handle fetching and caching the spreadsheet URL
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Update the cache with the latest data
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // If offline, serve from the cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Default fetch handler
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});

// Periodically update the cached sheet in the background
self.addEventListener('sync', event => {
    if (event.tag === 'update-sheet') {
        event.waitUntil(
            fetch(sheetUrl)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(sheetUrl, networkResponse.clone());
                    });
                })
                .catch(err => console.error('Failed to update sheet cache:', err))
        );
    }
});
