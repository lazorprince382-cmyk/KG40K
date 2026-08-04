const CACHE="kasangati-v101";
const SHELL=[
  "/","/index.html","/styles.css?v=73","/brand-theme.css?v=64","/brand-no-green.css?v=13","/legal-member-exit.css?v=1","/app.js?v=95",
  "/app-core.js?v=91","/department-theme.js?v=63","/department-core.js?v=65",
  "/audit-dashboard.js?v=63","/audit-modules.js?v=63","/welfare-module.js?v=63",
  "/legal-module.js?v=63","/legal-biodata-module.js?v=66","/legal-family-ui.js?v=2","/legal-member-exit-ui.js?v=1",
  "/legal-registration-module.js?v=63","/supervisory-module.js?v=63","/department-events.js?v=63",
  "/member-portal.js?v=78","/official-policy-ui.js?v=3","/loan-calculator.js?v=5",
  "/brand-logo.png?v=51","/brand-logo-slogan.png?v=51","/manifest.webmanifest"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==location.origin)return;
  if(new URL(event.request.url).pathname.startsWith("/api/")){event.respondWith(fetch(event.request));return;}
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("/index.html"))));
});
