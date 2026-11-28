/*
 * SaudiRecruit service worker.
 *
 * Deliberately small and privacy-safe:
 *  - Pages always come from the network, so users never see stale jobs or
 *    someone else's dashboard. If the network is down, a cached offline page
 *    is shown instead of the browser's error screen.
 *  - Only public, versioned build files (/_next/static, icons) are cached.
 *  - Nothing private is ever cached: no HTML of signed-in pages, no API
 *    responses, no CV downloads.
 */

const VERSION = "v1";
const CACHE = `saudirecruit-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" })));
      // Also keep the styles and scripts the offline page needs, so it looks right with no network.
      const page = await cache.match(OFFLINE_URL);
      if (page) {
        const html = await page.text();
        const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])];
        await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("saudirecruit-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network only, offline page as the fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  // Immutable build assets and app icons: cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
  // Everything else (API, CVs, data) goes straight to the network, uncached.
});
