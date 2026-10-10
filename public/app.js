/* Ordered application loader. */
[
  "app-core.js?v=231",
  "department-theme.js?v=64",
  "department-core.js?v=92",
  "audit-dashboard.js?v=81",
  "audit-modules.js?v=63",
  "welfare-module.js?v=97",
  "legal-module.js?v=96",
  "legal-biodata-module.js?v=70",
  "legal-family-ui.js?v=2",
  "legal-member-exit-ui.js?v=2",
  "legal-registration-module.js?v=64",
  "supervisory-module.js?v=81",
  "department-events.js?v=63",
  "official-policy-ui.js?v=11",
  "member-portal.js?v=133",
  "loan-calculator.js?v=7",
  "department-bootstrap.js?v=64"
].forEach((source) => document.write(`<script src="${source}"><\/script>`));
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js?v=222", { updateViaCache: "none" });
      await registration.update();
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}
