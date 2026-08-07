/* Ordered application loader. */
[
  "app-core.js?v=110",
  "department-theme.js?v=63",
  "department-core.js?v=67",
  "audit-dashboard.js?v=63",
  "audit-modules.js?v=63",
  "welfare-module.js?v=63",
  "legal-module.js?v=64",
  "legal-biodata-module.js?v=67",
  "legal-family-ui.js?v=2",
  "legal-member-exit-ui.js?v=1",
  "legal-registration-module.js?v=63",
  "supervisory-module.js?v=63",
  "department-events.js?v=63",
  "official-policy-ui.js?v=7",
  "member-portal.js?v=93",
  "loan-calculator.js?v=5",
  "department-bootstrap.js?v=63"
].forEach((source) => document.write(`<script src="${source}"><\/script>`));
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js?v=128", { updateViaCache: "none" });
      await registration.update();
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}
