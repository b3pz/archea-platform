// Ricostruito dal bundle fornito; comportamento originale conservato.
import { todayInRome, parseDate, parseTime } from "../../domain/dates.js";
import { findHeaders } from "./headers.js";
import {
  TASK_HEADER_ALIASES,
  HEADER_SCAN_ROWS,
  REQUIRED_TASK_HEADERS,
} from "../../config/sheets.js";
import {
  cellText,
  contentHash,
  projectCode,
  cellBoolean,
} from "../../domain/normalize.js";
import {
  hasTaskContent,
  TASK_STATUS_ICONS,
  taskStatus,
} from "../../domain/tasks.js";
function parseTasks(rows, warnings, today = todayInRome()) {
  if (!rows) return (warnings.push("Scheda 02_TaskManager non trovata."), []);
  const header = findHeaders(rows, TASK_HEADER_ALIASES, HEADER_SCAN_ROWS);
  if (!header)
    return (
      warnings.push("Task Manager: riga di intestazione non riconosciuta."),
      []
    );
  const missingHeaders = REQUIRED_TASK_HEADERS.filter(
    (c) => header.cols[c] === void 0,
  );
  missingHeaders.length &&
    warnings.push(
      `Task Manager: intestazioni mancanti (${missingHeaders.join(", ")}). Campi correlati vuoti.`,
    );
  const columns = header.cols,
    valueAt = (c, f) => (columns[f] === void 0 ? void 0 : c[columns[f]]),
    tasks = [];
  let mismatches = 0;
  for (let c = header.row + 1; c < rows.length; c++) {
    const f = rows[c] ?? [],
      v = cellText(valueAt(f, "titolo")),
      h = cellText(valueAt(f, "descrizione"));
    if (
      !hasTaskContent({
        titolo: v,
        descrizione: h,
      })
    )
      continue;
    const y = cellText(valueAt(f, "progetto")),
      g = valueAt(f, "scadenza"),
      x = cellText(valueAt(f, "numero")),
      j = {
        id: `T${x || "_"}-${contentHash(y + v + h.slice(0, 60))}`,
        numero: x,
        progettoCodice: projectCode(y),
        assegnatario: cellText(valueAt(f, "assegnatario")),
        tipologia: cellText(valueAt(f, "tipologia")),
        priorita: cellText(valueAt(f, "priorita")),
        titolo: v,
        descrizione: h,
        inizio: parseDate(valueAt(f, "inizio")),
        scadenza: parseDate(g),
        orario:
          parseTime(valueAt(f, "timing")) ??
          (cellText(valueAt(f, "timing")) || void 0),
        statoSorgente: cellText(valueAt(f, "stato")),
        completed: cellBoolean(valueAt(f, "completed")),
        dataChiusura: parseDate(valueAt(f, "dataChiusura")),
        validated: cellBoolean(valueAt(f, "validated")),
        notValidated: cellBoolean(valueAt(f, "notValidated")),
        commenti: cellText(valueAt(f, "commenti")),
        immagini: cellText(valueAt(f, "immagini"))
          .split(/\r?\n|\s{2,}/)
          .map((d) => d.trim())
          .filter(Boolean),
        linkServer: cellText(valueAt(f, "linkServer")),
        sharedRaw: cellText(valueAt(f, "shared")),
      };
    (j.progettoCodice ||
      warnings.push(
        `Task "${v || h.slice(0, 30)}": progetto senza codice riconoscibile ("${y}").`,
      ),
      g != null &&
        cellText(g) &&
        !j.scadenza &&
        warnings.push(
          `Task "${v || h.slice(0, 30)}": scadenza non interpretabile ("${cellText(g)}").`,
        ));
    const p = Object.values(TASK_STATUS_ICONS).find((d) =>
      j.statoSorgente.includes(d.replace("️", "")),
    );
    (p && p !== TASK_STATUS_ICONS[taskStatus(j, today)] && mismatches++,
      tasks.push(j));
  }
  return (
    mismatches &&
      warnings.push(
        `${mismatches} task con stato calcolato diverso dall'icona nella colonna STATUS: verificare la formula attuale del foglio.`,
      ),
    tasks
  );
}
export { parseTasks };
