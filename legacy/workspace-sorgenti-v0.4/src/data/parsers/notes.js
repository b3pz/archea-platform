// Ricostruito dal bundle fornito; comportamento originale conservato.
import { NOTES_LAYOUT, NOTE_MARKERS } from "../../config/sheets.js";
import { cellText, projectCode, contentHash } from "../../domain/normalize.js";
import { parseDate } from "../../domain/dates.js";
const noteStatus = (e) =>
  /chius/i.test(e) ? "chiusa" : /corso/i.test(e) ? "in_corso" : "aperta";
function parseNotes(rows, warnings) {
  const blocks = new Map(),
    notes = [];
  if (!rows)
    return (
      warnings.push("Scheda 03_Note non trovata."),
      {
        note: notes,
        blocchi: blocks,
      }
    );
  const columns = NOTES_LAYOUT.cols;
  for (let o = NOTES_LAYOUT.firstRow - 1; o < rows.length; o++) {
    const i = rows[o] ?? [],
      a = cellText(i[columns.marker - 1]);
    if (a.startsWith(NOTE_MARKERS.header)) {
      blocks.set(projectCode(a.slice(2)), cellText(i[columns.progetto - 1]));
      continue;
    }
    if (!a.startsWith(NOTE_MARKERS.note)) {
      i.some((h) => cellText(h)) &&
        warnings.push(
          `03_Note riga ${o + 1}: contenuto senza marcatore, ignorato.`,
        );
      continue;
    }
    const u = cellText(i[columns.testo - 1]);
    if (!u) continue;
    const c = projectCode(a.slice(2)),
      f = cellText(i[columns.autore - 1]),
      v = parseDate(i[columns.creata - 1]);
    notes.push({
      id: `N-${c}-${v ?? "_"}-${contentHash(f + u)}`,
      progettoCodice: c,
      autore: f,
      creata: v,
      testo: u,
      stato: noteStatus(cellText(i[columns.stato - 1])),
      chiusa: parseDate(i[columns.chiusa - 1]),
    });
  }
  return {
    note: notes,
    blocchi: blocks,
  };
}
export { noteStatus, parseNotes };
