const assert = require("assert");

const password = process.env.DEPARTMENT_TEST_PASSWORD;
let socket;
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const current = ++id;
    pending.set(current, { resolve, reject });
    socket.send(JSON.stringify({ id: current, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function login(email, selector, statsSelector, navCount) {
  await evaluate(`fetch('/api/auth/logout',{method:'POST'}).then(()=>location.reload())`);
  await waitFor(`document.querySelector('#login-form')`);
  await evaluate(`(() => {
    document.querySelector('input[name=email]').value=${JSON.stringify(email)};
    document.querySelector('input[name=password]').value=${JSON.stringify(password)};
    document.querySelector('#login-form').requestSubmit();
    return true;
  })()`);
  await waitFor(`document.querySelector('${selector}')`);
  const result = await evaluate(`({
    heading: document.querySelector('.page-head h1')?.textContent,
    stats: document.querySelectorAll('${statsSelector}').length,
    nav: document.querySelectorAll('.executive-sidebar .nav-item').length,
    textLength: document.querySelector('.content')?.innerText.length || 0,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: innerWidth
  })`);
  assert.equal(result.stats, 12);
  assert.equal(result.nav, navCount);
  assert(result.textLength > 1000);
  assert(result.scrollWidth <= result.viewport + 1);
  return result;
}

async function main() {
  assert(password, "DEPARTMENT_TEST_PASSWORD is required");
  const targets = await fetch("http://127.0.0.1:9231/json/list").then(response => response.json());
  const page = targets.find(item => item.type === "page" && item.url.includes("127.0.0.1:3000"));
  assert(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const item = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message));
    else item.resolve(message.result);
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  const welfare = await login("welfare@kasangatig40.test", ".welfare-command", ".welfare-stat", 14);
  const legal = await login("legal@kasangatig40.test", ".legal-command", ".legal-stat", 16);
  const audit = await login("auditor@tujenge.test", ".audit-command", ".audit-stat", 15);
  console.log(JSON.stringify({ welfare, legal, audit }, null, 2));
  socket.close();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
  if (socket) socket.close();
});
