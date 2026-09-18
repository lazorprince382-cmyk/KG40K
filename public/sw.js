const CACHE="kasangati-v225";
const SHELL=[
  "/","/index.html","/styles.css?v=124","/brand-theme.css?v=64","/brand-no-green.css?v=17","/legal-member-exit.css?v=2","/app.js?v=206",
  "/app-core.js?v=206","/department-theme.js?v=63","/department-core.js?v=90",
  "/audit-dashboard.js?v=80","/audit-modules.js?v=63","/welfare-module.js?v=90",
  "/legal-module.js?v=91","/legal-biodata-module.js?v=69","/legal-family-ui.js?v=2","/legal-member-exit-ui.js?v=2",
  "/legal-registration-module.js?v=63","/supervisory-module.js?v=80","/department-events.js?v=63",
  "/official-policy-ui.js?v=11","/member-portal.js?v=124","/loan-calculator.js?v=7",
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
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
