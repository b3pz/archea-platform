// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { useApp } from "../context.jsx";
import {
  Avatar,
  NoteStatusBadge,
  EmptyState,
  BottomSheet,
  SearchBox,
  projectStatusClass,
} from "../components/common.jsx";
import { formatFullDate } from "../../domain/dates.js";
import { visibleProjects, visibleNotes } from "../../config/permissions.js";
import { normalizeText } from "../../domain/normalize.js";
import { ChevronDownIcon } from "../components/icons.jsx";
function NoteCard({ n: note }) {
  const { open: open } = useApp();
  return (
    <button
      className={`note-card${note.stato === "chiusa" ? " closed" : ""}`}
      onClick={() =>
        open({
          kind: "note",
          id: note.id,
        })
      }
    >
      <span className="nc-head">
        <Avatar name={note.autore || "?"} size={36} />
        <span className="nc-who">
          <b>{note.autore || "Autore non indicato"}</b>
          <small>
            {note.creata ? formatFullDate(note.creata) : "Data non indicata"}
          </small>
        </span>
        <NoteStatusBadge s={note.stato} />
      </span>
      <span className="nc-text">{note.testo}</span>
      {note.stato === "chiusa" && note.chiusa && (
        <small className="nc-closed">
          {"Chiusa il "}
          {formatFullDate(note.chiusa)}
        </small>
      )}
    </button>
  );
}
function NotesScreen() {
  const {
      data: data,
      viewer: viewer,
      noteProject: noteProject,
      setNoteProject: setNoteProject,
      language: language,
    } = useApp(),
    [pickerOpen, setPickerOpen] = React.useState(false),
    [search, setSearch] = React.useState(""),
    projects = React.useMemo(
      () => (data && viewer ? visibleProjects(viewer, data.progetti) : []),
      [data, viewer],
    );
  if (!data || !viewer) return null;
  const en = language === 'en', notes = visibleNotes(viewer, data.note),
    selectedProject =
      projects.find((j) => j.codice === noteProject) ??
      projects.find((j) => notes.some((p) => p.progettoCodice === j.codice)) ??
      projects[0],
    projectNotes = selectedProject
      ? notes.filter((j) => j.progettoCodice === selectedProject.codice)
      : [],
    openNotes = projectNotes.filter((j) => j.stato !== "chiusa"),
    closedNotes = projectNotes.filter((j) => j.stato === "chiusa"),
    searchKey = normalizeText(search),
    noteCount = (j) => notes.filter((p) => p.progettoCodice === j).length;
  return (
    <>
      <h1 className="big title-row">{en ? "Notes" : "Taccuino"}</h1>
      <button
        className="picker"
        onClick={() => setPickerOpen(true)}
        aria-haspopup="dialog"
      >
        <span>
          {selectedProject
            ? `${selectedProject.codice} · ${selectedProject.nome}`
            : (en ? "No project" : "Nessun progetto")}
        </span>
        <ChevronDownIcon />
      </button>
      <p className="hint">
        {en ? "Read-only: notes are viewed here and edited in the sheet." : "Sola lettura: le note si leggono qui, si scrivono nel foglio."}
      </p>
      <div className="section-head">
        <h2>{en ? "Open notes" : "Note aperte"}</h2>
      </div>
      <div className="list">
        {openNotes.map((j) => (
          <NoteCard n={j} key={j.id} />
        ))}
        {!openNotes.length && (
          <EmptyState>{en ? "No open notes for this project." : "Nessuna nota aperta per questo progetto."}</EmptyState>
        )}
      </div>
      <div className="section-head">
        <h2>{en ? "Closed notes" : "Note chiuse"}</h2>
      </div>
      <div className="list">
        {closedNotes.map((j) => (
          <NoteCard n={j} key={j.id} />
        ))}
        {!closedNotes.length && (
          <EmptyState>{en ? "No closed notes." : "Nessuna nota chiusa."}</EmptyState>
        )}
      </div>
      {pickerOpen && (
        <BottomSheet
          title={en ? "Choose project" : "Scegli progetto"}
          onClose={() => setPickerOpen(false)}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder={en ? "Search by code or name" : "Cerca per codice o nome"}
          />
          <div className="list tight">
            {projects
              .filter(
                (j) =>
                  !searchKey ||
                  normalizeText(`${j.codice} ${j.nome}`).includes(searchKey),
              )
              .map((j) => (
                <button
                  className={`pick-row${j.codice === (selectedProject == null ? void 0 : selectedProject.codice) ? " on" : ""}`}
                  onClick={() => {
                    (setNoteProject(j.codice),
                      setPickerOpen(false),
                      setSearch(""));
                  }}
                  key={j.id}
                >
                  <b>{j.codice}</b>
                  <span>{j.nome}</span>
                  <span className={`pill ${projectStatusClass(j.stato)}`}>
                    {j.stato}
                  </span>
                  <small>
                    {noteCount(j.codice)}
                    {" note"}
                  </small>
                </button>
              ))}
          </div>
        </BottomSheet>
      )}
    </>
  );
}
export { NoteCard, NotesScreen };
