const CACHE="kasangati-v261";
const SHELL=[
  "/","/index.html","/styles.css?v=136","/brand-theme.css?v=64","/brand-no-green.css?v=17","/legal-member-exit.css?v=2","/app.js?v=242",
  "/app-core.js?v=231","/department-theme.js?v=64","/department-core.js?v=93",
  "/audit-dashboard.js?v=82","/audit-modules.js?v=63","/welfare-module.js?v=97",
  "/legal-module.js?v=96","/legal-biodata-module.js?v=70","/legal-family-ui.js?v=2","/legal-member-exit-ui.js?v=2",
  "/legal-registration-module.js?v=64","/supervisory-module.js?v=81","/department-events.js?v=63",
  "/official-policy-ui.js?v=11","/member-portal.js?v=133","/loan-calculator.js?v=7","/department-bootstrap.js?v=64",
  "/legal-biodata-styles.css?v=37",
  "/brand-logo.png?v=51","/brand-logo-slogan.png?v=51","/manifest.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Never cache API responses — they must always hit the live server.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
