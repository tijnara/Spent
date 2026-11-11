const CACHE_NAME = 'spent-cache-v2';
const PRECACHE_ASSETS = ['/offline.html', '/manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(names.map((name) => {
                if (name !== CACHE_NAME) return caches.delete(name);
            })))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then((response) => {
                if (response.status < 500) return response;
                return caches.match('/offline.html').then((offline) => offline || response);
            }).catch(async () => {
                return (await caches.match('/offline.html')) || new Response(
                    'Spent is offline. Reopen the app when a connection is available.',
                    { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
                );
            })
        );
        return;
    }

    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname === '/manifest.json' ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.woff2')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                });
            })
        );
    }
});
