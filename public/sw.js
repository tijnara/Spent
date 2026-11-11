const PAGE_CACHE_NAME = 'spent-pages-v3';
const STATIC_CACHE_NAME = 'spent-static-v3';

function pageCacheKey(url) {
    const key = new URL(url);
    key.search = '';
    key.hash = '';
    return new Request(key.toString(), { method: 'GET' });
}

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(names.map((name) => {
                if (
                    (name.startsWith('spent-cache-') ||
                        name.startsWith('spent-pages-') ||
                        name.startsWith('spent-static-')) &&
                    name !== PAGE_CACHE_NAME &&
                    name !== STATIC_CACHE_NAME
                ) {
                    return caches.delete(name);
                }
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
        event.respondWith((async () => {
            const pages = await caches.open(PAGE_CACHE_NAME);
            const cachedPage = await pages.match(pageCacheKey(request.url));

            try {
                const response = await fetch(request);
                const contentType = response.headers.get('content-type') || '';
                const isSamePage = new URL(response.url).pathname === url.pathname;

                if (
                    response.ok &&
                    !response.redirected &&
                    isSamePage &&
                    contentType.includes('text/html')
                ) {
                    await pages.put(pageCacheKey(request.url), response.clone());
                }

                if (response.status >= 500 && cachedPage) return cachedPage;
                return response;
            } catch {
                if (cachedPage) return cachedPage;

                const dashboardUrl = new URL('/dashboard', self.location.origin);
                const dashboard = await pages.match(pageCacheKey(dashboardUrl.toString()));
                if (dashboard && url.pathname !== dashboardUrl.pathname) {
                    return Response.redirect(dashboardUrl.toString(), 302);
                }

                return new Response(
                    'Spent is offline. Open a page you have already visited after the app has finished loading.',
                    { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
                );
            }
        })());
        return;
    }

    const isAppAsset =
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/_next/image') ||
        url.pathname === '/manifest.json' ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.woff2');

    if (isAppAsset) {
        event.respondWith((async () => {
            const assets = await caches.open(STATIC_CACHE_NAME);
            const cached = await assets.match(request);
            if (cached) return cached;

            const response = await fetch(request);
            if (response.ok) await assets.put(request, response.clone());
            return response;
        })());
    }
});
