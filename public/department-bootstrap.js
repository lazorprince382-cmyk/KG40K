/* Rehydrate department command-center data after all workspace modules are registered. */
setTimeout(async () => {
  if (!window.DepartmentUi?.configs?.[state.role]) return;
  try {
    await refreshData();
    render();
  } catch (error) {
    console.error("Department workspace initialization failed", error);
  }
}, 0);
