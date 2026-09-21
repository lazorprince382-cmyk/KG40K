/* Rehydrate department command-center data after all workspace modules are registered. */
setTimeout(async () => {
  const cfg = window.DepartmentUi?.configs?.[state.role];
  if (!cfg) return;
  const key = cfg.key === "audit" ? "auditCenter" : cfg.key;
  if (state[key]) return;
  try {
    state[key] = await api(`/api/${cfg.key}/command-center`);
    render();
  } catch (error) {
    console.error("Department workspace initialization failed", error);
  }
}, 0);
