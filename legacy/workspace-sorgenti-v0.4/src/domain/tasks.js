// Ricostruito dal bundle fornito; comportamento originale conservato.
import { addDays, daysBetween } from "./dates.js";
const TASK_STATUS_LABELS = {
  validata: "Validata",
  da_rivedere: "Da rivedere",
  scaduta: "Scaduta",
  in_scadenza: "In scadenza",
  in_lavorazione: "In corso",
};
const TASK_STATUS_ICONS = {
  validata: "👍",
  da_rivedere: "⚠️",
  scaduta: "☠️",
  in_scadenza: "⏰",
  in_lavorazione: "⚙️",
};
const hasTaskContent = (e) => !!(e.titolo.trim() || e.descrizione.trim());
function taskStatus(task, today) {
  return task.validated && task.completed && task.dataChiusura
    ? "validata"
    : task.commenti.trim()
      ? "da_rivedere"
      : task.scadenza && task.scadenza < today
        ? "scaduta"
        : task.scadenza && task.scadenza <= addDays(today, 1)
          ? "in_scadenza"
          : "in_lavorazione";
}
const isOpenTask = (e, t) => taskStatus(e, t) !== "validata";
function dueInfo(task, today) {
  if (!task.scadenza)
    return {
      kind: "none",
      days: 0,
    };
  const days = daysBetween(task.scadenza, today);
  return {
    kind:
      days < 0
        ? "overdue"
        : days === 0
          ? "today"
          : days === 1
            ? "tomorrow"
            : "future",
    days: days,
  };
}
const TASK_STATUS_ORDER = {
  scaduta: 0,
  da_rivedere: 1,
  in_scadenza: 2,
  in_lavorazione: 3,
  validata: 4,
};
function compareTasks(today) {
  return (t, n) =>
    TASK_STATUS_ORDER[taskStatus(t, today)] -
      TASK_STATUS_ORDER[taskStatus(n, today)] ||
    (t.scadenza ?? "9999").localeCompare(n.scadenza ?? "9999");
}
export {
  TASK_STATUS_LABELS,
  TASK_STATUS_ICONS,
  hasTaskContent,
  taskStatus,
  isOpenTask,
  dueInfo,
  TASK_STATUS_ORDER,
  compareTasks,
};
