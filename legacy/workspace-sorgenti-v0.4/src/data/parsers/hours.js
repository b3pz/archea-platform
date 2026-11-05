// Ricostruito dal bundle fornito; comportamento originale conservato.
import { OFF_MARKER, HOURS_LAYOUT } from "../../config/sheets.js";
import { parseDate } from "../../domain/dates.js";
import { cellText, projectCode } from "../../domain/normalize.js";
function parseHoursCell(e) {
  if (e == null) return "skip";
  if (typeof e == "number") return Number.isFinite(e) ? e : "bad";
  const t = String(e).trim();
  return t === "" || t === "-" || t === "–"
    ? "skip"
    : t.toUpperCase() === OFF_MARKER
      ? "off"
      : /^\d+([.,]\d+)?$/.test(t)
        ? parseFloat(t.replace(",", "."))
        : "bad";
}
function parseHours(rows, warnings) {
  const result = {
    regs: [],
    people: [],
    stats: {
      off: 0,
      unexpected: 0,
      dateCols: 0,
    },
  };
  if (!rows) return (warnings.push("Scheda 04_Ore non trovata."), result);
  const dateRow = rows[HOURS_LAYOUT.dateRow - 1] ?? [],
    dates = new Map(),
    seenDates = new Set();
  for (let c = HOURS_LAYOUT.firstDayCol - 1; c < dateRow.length; c++) {
    const f = parseDate(dateRow[c]);
    if (f) {
      if (seenDates.has(f)) {
        warnings.push(
          `04_Ore: data duplicata in intestazione (${f}), seconda colonna ignorata.`,
        );
        continue;
      }
      (seenDates.add(f), dates.set(c, f));
    }
  }
  ((result.stats.dateCols = dates.size),
    dates.size ||
      warnings.push("04_Ore: nessuna data riconosciuta nella riga 2."));
  let currentPerson = "";
  const duplicates = new Map(),
    people = new Set();
  for (let c = HOURS_LAYOUT.firstRow - 1; c < rows.length; c++) {
    const f = rows[c] ?? [],
      v = cellText(f[HOURS_LAYOUT.personCol - 1]),
      h = cellText(f[HOURS_LAYOUT.projectCol - 1]);
    if (v && !h) {
      ((currentPerson = v), people.add(v));
      continue;
    }
    if ((v && ((currentPerson = v), people.add(v)), !h || !currentPerson))
      continue;
    const y = projectCode(h);
    if (!y) {
      warnings.push(
        `04_Ore riga ${c + 1}: progetto senza codice ("${h}"), riga saltata.`,
      );
      continue;
    }
    const g = cellText(f[HOURS_LAYOUT.noteCol - 1]) || void 0;
    for (const [x, j] of dates) {
      const p = parseHoursCell(f[x]);
      if (p === "skip") continue;
      if (p === "off") {
        result.stats.off++;
        continue;
      }
      if (p === "bad") {
        result.stats.unexpected++;
        continue;
      }
      const d = `${currentPerson}|${y}|${j}`,
        m = (duplicates.get(d) ?? 0) + 1;
      (duplicates.set(d, m),
        result.regs.push({
          id: m > 1 ? `${d}#${m}` : d,
          persona: currentPerson,
          progettoCodice: y,
          data: j,
          ore: p,
          nota: g,
        }));
    }
  }
  return (
    result.stats.unexpected &&
      warnings.push(
        `04_Ore: ${result.stats.unexpected} celle con testo/errore inatteso, non contate come ore.`,
      ),
    (result.people = [...people]),
    result
  );
}
export { parseHoursCell, parseHours };
