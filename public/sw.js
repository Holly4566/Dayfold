const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_KEY = SCOPE_URL.pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
const CACHE_PREFIX = `dayfold-shell-${SCOPE_KEY}-`;
const CACHE_NAME = `${CACHE_PREFIX}__DAYFOLD_BUILD_ID__`;
const PRECACHE_ASSETS = /* __DAYFOLD_PRECACHE__ */ [];
const scopedPath = (path = "") => new URL(path, SCOPE_URL).pathname;
const INDEX_PATH = scopedPath("index.html");
const CACHE_MATCH_OPTIONS = { ignoreSearch: true, ignoreVary: true };
const APP_SHELL = [
  "",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  ...PRECACHE_ASSETS,
].map(scopedPath);
const APP_SHELL_PATHS = new Set(APP_SHELL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(SCOPE_URL.pathname)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(INDEX_PATH, CACHE_MATCH_OPTIONS)
        .then((cached) => cached || fetchAndCache(event.request))
        .catch(() => Response.error()),
    );
    return;
  }

  if (APP_SHELL_PATHS.has(requestUrl.pathname)) {
    event.respondWith(
      caches.match(requestUrl.pathname, CACHE_MATCH_OPTIONS)
        .then((cached) => cached || fetchAndCache(event.request))
        .catch(() => Response.error()),
    );
    return;
  }

  event.respondWith(
    fetchAndCache(event.request)
      .catch(async () => {
        const cached = await caches.match(requestUrl.pathname, CACHE_MATCH_OPTIONS);
        if (cached) return cached;
        return Response.error();
      }),
  );
});
