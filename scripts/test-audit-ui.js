const fs = require("fs");
const assert = require("assert");

const password = process.env.AUDIT_TEST_PASSWORD;
let socket;
let nextId = 1;
const pending = new Map();
const exceptions = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function main() {
  assert(password, "AUDIT_TEST_PASSWORD is required");
  const pages = await fetch("http://127.0.0.1:9231/json/list").then(response => response.json());
  const page = pages.find(item => item.type === "page" && item.url.includes("127.0.0.1:3000")) || pages.find(item => item.type === "page");
  assert(page, "Audit browser page was not found");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(message.error.message));
      else item.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails.text);
    }
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1536, height: 960, deviceScaleFactor: 1, mobile: false });
  await waitFor(`document.querySelector('#login-form') || document.querySelector('.audit-command')`);
  const hasLogin = await evaluate(`Boolean(document.querySelector('#login-form'))`);
  if (hasLogin) {
    await evaluate(`(() => {
      document.querySelector('input[name=email]').value='auditor@tujenge.test';
      document.querySelector('input[name=password]').value=${JSON.stringify(password)};
      document.querySelector('#login-form').requestSubmit();
      return true;
    })()`);
  }
  await waitFor(`document.querySelector('.audit-command')`, 20000);
  const desktop = await evaluate(`({
    heading: document.querySelector('.page-head h1')?.textContent,
    stats: document.querySelectorAll('.audit-stat').length,
    panels: document.querySelectorAll('.audit-dashboard-grid > .dept-panel').length,
    nav: document.querySelectorAll('.audit-sidebar .nav-item').length,
    readonly: document.body.innerText.includes('Source records remain read-only'),
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  })`);
  assert.equal(desktop.heading, "Audit Department Dashboard");
  assert.equal(desktop.stats, 12);
  assert.equal(desktop.panels, 8);
  assert.equal(desktop.nav, 15);
  assert.equal(desktop.readonly, true);
  assert.equal(desktop.scrollWidth <= desktop.viewport + 1, true);

  const pagesToTest = ["audit-plans","audits","audit-findings","audit-investigations","audit-recommendations",
    "audit-compliance","audit-risk","audit-fraud","audit-reports","audit-analytics","audit-documents",
    "audit-calendar","audit-notifications","settings"];
  const visited = {};
  for (const target of pagesToTest) {
    await evaluate(`document.querySelector('[data-page="${target}"]').click()`);
    await waitFor(`state.page === '${target}'`);
    visited[target] = await evaluate(`({
      heading: document.querySelector('.page-head h1')?.textContent,
      textLength: document.querySelector('.content')?.innerText.length || 0,
      visible: Boolean(document.querySelector('.dept-panel, .exec-report-grid, .audit-engagement-grid, .audit-investigation-grid, .fraud-alert-grid, .audit-settings-grid'))
    })`);
    assert(visited[target].textLength > 100, `${target} rendered too little content`);
    assert(visited[target].visible, `${target} did not render its module`);
  }

  await evaluate(`document.querySelector('[data-page="dashboard"]').click()`);
  await waitFor(`document.querySelector('.audit-command')`);
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  fs.writeFileSync("audit-dashboard-preview.png", Buffer.from(screenshot.data, "base64"));

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await new Promise(resolve => setTimeout(resolve, 500));
  const mobile = await evaluate(`({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    stats: document.querySelectorAll('.audit-stat').length,
    panels: document.querySelectorAll('.audit-dashboard-grid > .dept-panel').length
  })`);
  assert.equal(mobile.stats, 12);
  assert.equal(mobile.panels, 8);
  assert.equal(mobile.scrollWidth <= mobile.viewport + 1, true);
  assert.deepEqual(exceptions, []);

  console.log(JSON.stringify({ desktop, mobile, pages: visited, exceptions, screenshot: "audit-dashboard-preview.png" }, null, 2));
  socket.close();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
  if (socket) socket.close();
});
