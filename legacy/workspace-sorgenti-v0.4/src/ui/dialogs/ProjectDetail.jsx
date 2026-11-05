// Ricostruito dal bundle fornito; comportamento originale conservato.
import { useApp } from "../context.jsx";
import { visibleTasks, visibleNotes } from "../../config/permissions.js";
import {
  isAssignedTo,
  BottomSheet,
  projectStatusClass,
} from "../components/common.jsx";
import { isOpenTask, compareTasks } from "../../domain/tasks.js";
import { TaskCard } from "../components/TaskCard.jsx";
import { NoteCard } from "../screens/Notes.jsx";
function ProjectDetail({ code: code }) {
  const { data: data, viewer: viewer, today: today, close: close } = useApp(),
    project =
      data == null ? void 0 : data.progetti.find((f) => f.codice === code);
  if (!project || !data || !viewer) return null;
  const tasks = visibleTasks(viewer, data.task, isAssignedTo).filter(
      (f) => f.progettoCodice === code,
    ),
    openTasks = tasks
      .filter((f) => isOpenTask(f, today))
      .sort(compareTasks(today)),
    closedCount = tasks.length - openTasks.length,
    notes = visibleNotes(viewer, data.note).filter(
      (f) => f.progettoCodice === code,
    );
  return (
    <BottomSheet title={`${project.codice} · ${project.nome}`} onClose={close}>
      <div className="d-badges">
        <span className={`pill ${projectStatusClass(project.stato)}`}>
          {project.stato}
        </span>
        {!project.inElenco && (
          <span className="pill ps-nd">{"Storico · assente da #DV"}</span>
        )}
      </div>
      <div className="section-head">
        <h2>
          {"Task aperte ("}
          {openTasks.length}
          {")"}
        </h2>
      </div>
      <div className="list">
        {openTasks.map((f) => (
          <TaskCard t={f} showProject={false} key={f.id} />
        ))}
        {!openTasks.length && <p className="empty">{"Nessuna task aperta."}</p>}
      </div>
      {closedCount > 0 && (
        <p className="hint">
          {closedCount} {closedCount === 1 ? "task chiusa" : "task chiuse"}
          {" (validate) non mostrate."}
        </p>
      )}
      <div className="section-head">
        <h2>
          {"Note ("}
          {notes.length}
          {")"}
        </h2>
      </div>
      <div className="list">
        {notes.map((f) => (
          <NoteCard n={f} key={f.id} />
        ))}
        {!notes.length && <p className="empty">{"Nessuna nota."}</p>}
      </div>
    </BottomSheet>
  );
}
export { ProjectDetail };
