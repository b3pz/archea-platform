// Ricostruito dal bundle fornito; comportamento originale conservato.
import { dueInfo, taskStatus, TASK_STATUS_LABELS } from "../../domain/tasks.js";
import { formatShortDate } from "../../domain/dates.js";
import { useApp } from "../context.jsx";
import { TaskStatusIcon } from "./icons.jsx";
function DueBadge({ t: task, today: today }) {
  const due = dueInfo(task, today);
  if (due.kind === "none" || taskStatus(task, today) === "validata")
    return null;
  const label =
    due.kind === "overdue"
      ? `Scaduta · ${-due.days} g`
      : due.kind === "today"
        ? "Oggi"
        : due.kind === "tomorrow"
          ? "Domani"
          : formatShortDate(task.scadenza);
  return <span className={`pill due-${due.kind}`}>{label}</span>;
}
function TaskCard({ t: task, showProject = true }) {
  const { today: today, open: open, data: data } = useApp(),
    status = taskStatus(task, today),
    project =
      data == null
        ? void 0
        : data.progetti.find((a) => a.codice === task.progettoCodice);
  return (
    <button
      className={`task-card st-${status}`}
      onClick={() =>
        open({
          kind: "task",
          id: task.id,
        })
      }
    >
      <span className="tc-top">
        <span className="tc-proj">
          {showProject
            ? `${task.progettoCodice || "—"}${project ? ` · ${project.nome}` : ""}`
            : task.tipologia}
        </span>
        <DueBadge t={task} today={today} />
      </span>
      <span className="tc-title">{task.titolo || task.descrizione}</span>
      <span className={`tc-status s-${status}`}>
        <TaskStatusIcon s={status} /> {TASK_STATUS_LABELS[status]}
      </span>
    </button>
  );
}
export { DueBadge, TaskCard };
