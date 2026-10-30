/* Ordered application loader. */
[
  "app-core.js?v=259",
  "department-theme.js?v=65",
  "department-core.js?v=95",
  "audit-dashboard.js?v=83",
  "audit-modules.js?v=64",
  "welfare-module.js?v=100",
  "legal-module.js?v=96",
  "legal-biodata-module.js?v=71",
  "legal-family-ui.js?v=2",
  "legal-member-exit-ui.js?v=2",
  "legal-registration-module.js?v=64",
  "supervisory-module.js?v=83",
  "department-events.js?v=63",
  "official-policy-ui.js?v=12",
  "member-portal.js?v=150",
  "loan-calculator.js?v=7",
  "department-bootstrap.js?v=64"
].forEach((source) => document.write(`<script src="${source}"><\/script>`));
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js?v=240", { updateViaCache: "none" });
      await registration.update();
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}
