document.addEventListener("click", event => {
  const action = event.target.closest(".dept-quick-grid [data-dept-modal]");
  if (!action) return;
  event.preventDefault();
  const config = window.DepartmentUi?.configs?.[state.role];
  if (!config) return;
  const type = action.dataset.deptModal;
  closeModal();
  setTimeout(() => window.DepartmentUi.quick[config.key]?.(type), 0);
});
