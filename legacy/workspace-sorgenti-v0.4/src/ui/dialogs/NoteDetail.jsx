// Ricostruito dal bundle fornito; comportamento originale conservato.
import { useApp } from "../context.jsx";
import { BottomSheet, NoteStatusBadge } from "../components/common.jsx";
import { DetailRow } from "./TaskDetail.jsx";
import { formatFullDate } from "../../domain/dates.js";
function NoteDetail({ id: id }) {
  const { data: data, close: close } = useApp(),
    note = data == null ? void 0 : data.note.find((o) => o.id === id);
  if (!note || !data) return null;
  const project = data.progetti.find((o) => o.codice === note.progettoCodice);
  return (
    <BottomSheet title="Nota" onClose={close}>
      <p className="d-proj">
        {note.progettoCodice}
        {project ? ` · ${project.nome}` : ""}
      </p>
      <div className="d-badges">
        <NoteStatusBadge s={note.stato} />
      </div>
      <p className="d-text full">{note.testo}</p>
      <dl className="kvs">
        <DetailRow k="Autore">{note.autore || "—"}</DetailRow>
        <DetailRow k="Inserita il">
          {note.creata ? formatFullDate(note.creata) : "—"}
        </DetailRow>
        {note.stato === "chiusa" && (
          <DetailRow k="Chiusa il">
            {note.chiusa ? formatFullDate(note.chiusa) : "—"}
          </DetailRow>
        )}
      </dl>
    </BottomSheet>
  );
}
export { NoteDetail };
