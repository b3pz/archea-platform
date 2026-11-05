// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { useApp } from "../context.jsx";
import {
  visibleTasks,
  visibleNotes,
  visibleProjects,
  isManager,
} from "../../config/permissions.js";
import {
  isAssignedTo,
  SearchBox,
  SegmentedControl,
  projectStatusClass,
  EmptyState,
} from "../components/common.jsx";
import { isOpenTask } from "../../domain/tasks.js";
import { normalizeText } from "../../domain/normalize.js";
import { BuildingIcon, ListIcon, NoteIcon } from "../components/icons.jsx";
function useProjectCounts() {
  const { data: e, viewer: t, today: n } = useApp();
  return React.useMemo(() => {
    const r = new Map();
    if (!e || !t) return r;
    const l = (o, i) => {
      var a;
      return r.set(o, {
        ...(r.get(o) ?? {
          tasks: 0,
          notes: 0,
        }),
        [i]: (((a = r.get(o)) == null ? void 0 : a[i]) ?? 0) + 1,
      });
    };
    return (
      visibleTasks(t, e.task, isAssignedTo)
        .filter((o) => isOpenTask(o, n))
        .forEach((o) => l(o.progettoCodice, "tasks")),
      visibleNotes(t, e.note)
        .filter((o) => o.stato !== "chiusa")
        .forEach((o) => l(o.progettoCodice, "notes")),
      r
    );
  }, [e, t, n]);
}
function ProjectsScreen() {
  const { data: data, viewer: viewer, open: open, language } = useApp(),
    [filter, setFilter] = React.useState("attivi"),
    [search, setSearch] = React.useState(""),
    counts = useProjectCounts();
  if (!data || !viewer) return null;
  const en = language === 'en', searchKey = normalizeText(search),
    filteredProjects = visibleProjects(viewer, data.progetti).filter(
      (f) =>
        (filter === "tutti" || f.stato.toLowerCase() === "attivo") &&
        (!searchKey ||
          normalizeText(`${f.codice} ${f.nome}`).includes(searchKey)),
    );
  return (
    <>
      <h1 className="big title-row">{en ? "Projects" : "Progetti"}</h1>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={en ? "Search projects" : "Cerca un progetto"}
      />
      <SegmentedControl
        label="Filtro progetti"
        value={filter}
        onChange={setFilter}
        options={[
          ["attivi", en ? "Active" : "Attivi"],
          ["tutti", en ? "All" : "Tutti"],
        ]}
      />
      {!isManager(viewer) && (
        <p className="hint">
          {"Elenco condiviso con tutti i membri (da confermare)."}
        </p>
      )}
      <div className="list">
        {filteredProjects.map((f) => {
          const v = counts.get(f.codice) ?? {
            tasks: 0,
            notes: 0,
          };
          return (
            <button
              className="proj-card"
              onClick={() =>
                open({
                  kind: "project",
                  id: f.codice,
                })
              }
              key={f.id}
            >
              <span className="thumb">
                <BuildingIcon />
              </span>
              <span className="pc-main">
                <span className="pc-top">
                  <b>{f.codice}</b>
                  <span className={`pill ${projectStatusClass(f.stato)}`}>
                    {f.stato}
                  </span>
                </span>
                <span className="pc-name">{f.nome}</span>
                <span className="pc-meta">
                  <span>
                    <ListIcon /> {v.tasks}
                    {en ? " open tasks" : " task aperte"}
                  </span>
                  <span>
                    <NoteIcon size={18} /> {v.notes}{" "}
                    {en ? (v.notes === 1 ? "note" : "notes") : (v.notes === 1 ? "nota" : "note")}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
        {!filteredProjects.length && (
          <EmptyState>
            {filter === 'attivi' && !search
              ? (en ? 'No active project found. You can view all projects and check the data warnings.' : 'Nessun progetto attivo rilevato. Puoi consultare tutti i progetti e verificare le segnalazioni in Persona e dati.')
              : (en ? 'No project found.' : 'Nessun progetto trovato.')}
            {filter === 'attivi' && !search && <><br /><button className="link" onClick={() => setFilter('tutti')}>{en ? 'Show all projects' : 'Mostra tutti i progetti'}</button></>}
          </EmptyState>
        )}
      </div>
    </>
  );
}
export { useProjectCounts, ProjectsScreen };
