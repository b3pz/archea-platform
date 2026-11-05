// Ricostruito dal bundle fornito; comportamento originale conservato.
import { parseProjects } from "./parsers/projects.js";
import { findSheet, normalizeText, projectName } from "../domain/normalize.js";
import {
  SHEET_NAMES,
  EXCLUDED_HOUR_PEOPLE,
  PROJECT_STATUS_ORDER,
} from "../config/sheets.js";
import { parseTasks } from "./parsers/tasks.js";
import { parseNotes } from "./parsers/notes.js";
import { parseHours } from "./parsers/hours.js";
import { DEMO_ACCOUNTS } from "../config/accounts.js";
function buildDataset(workbook, source, label) {
  const warnings = [],
    sheets = workbook.sheets,
    listedProjects = parseProjects(
      findSheet(sheets, SHEET_NAMES.dv),
      findSheet(sheets, SHEET_NAMES.insight),
      warnings,
    ),
    tasks = parseTasks(findSheet(sheets, SHEET_NAMES.tasks), warnings),
    { note: notes, blocchi: noteBlocks } = parseNotes(
      findSheet(sheets, SHEET_NAMES.notes),
      warnings,
    ),
    hours = parseHours(findSheet(sheets, SHEET_NAMES.hours), warnings),
    people = DEMO_ACCOUNTS.filter(d => !d.virtual).map(({ appRole, virtual, ...d }) => ({
      ...d,
      inRiepiloghiOre: true,
    })),
    excluded = [],
    unrecognized = [];
  for (const d of hours.people) {
    const m = normalizeText(d);
    if (people.some((N) => normalizeText(N.nome) === m)) continue;
    const k = EXCLUDED_HOUR_PEOPLE.find((N) => N.match(m));
    k
      ? (people.push({
          id: k.id,
          nome: d,
          ruolo: "membro",
          inRiepiloghiOre: false,
        }),
        excluded.push(d))
      : (people.push({
          id: `x-${m}`,
          nome: d,
          ruolo: "membro",
          inRiepiloghiOre: false,
        }),
        unrecognized.push(d));
  }
  (excluded.length &&
    warnings.push(
      `Esclusi dai riepiloghi ore (come concordato; registrazioni conservate): ${excluded.join(", ")}.`,
    ),
    unrecognized.length &&
      warnings.push(
        `Persone in 04_Ore né principali né nell'elenco esclusioni: ${unrecognized.join(", ")}. Non incluse nei riepiloghi: da confermare.`,
      ));
  for (const d of DEMO_ACCOUNTS.filter(d => !d.virtual))
    hours.people.some((m) => normalizeText(m) === normalizeText(d.nome)) ||
      warnings.push(`Persona principale assente da 04_Ore: ${d.nome}.`);
  const listedCodes = new Set(listedProjects.map((d) => d.codice)),
    historicalProjects = [],
    nameFromNotes = (d) => noteBlocks.get(d) || "";
  for (const d of new Set([
    ...tasks.map((m) => m.progettoCodice),
    ...notes.map((m) => m.progettoCodice),
    ...hours.regs.map((m) => m.progettoCodice),
  ]))
    !d ||
      listedCodes.has(d) ||
      historicalProjects.push({
        id: d,
        codice: d,
        nome: projectName(nameFromNotes(d)) || d,
        stato: "Storico",
        ordine: 1e6 + historicalProjects.length,
        inElenco: false,
      });
  historicalProjects.length &&
    warnings.push(
      `Progetti assenti da #DV ma con dati collegati (conservati come storici): ${historicalProjects.map((d) => d.codice).join(", ")}.`,
    );
  const statusRank = (d) => {
      const m = PROJECT_STATUS_ORDER.findIndex(
        (k) => k.toLowerCase() === d.toLowerCase(),
      );
      return m < 0 ? 99 : m;
    },
    projects = [...listedProjects, ...historicalProjects].sort(
      (d, m) =>
        (d.stato.toLowerCase() === "attivo" ? 0 : 1) -
          (m.stato.toLowerCase() === "attivo" ? 0 : 1) ||
        statusRank(d.stato) - statusRank(m.stato) ||
        d.ordine - m.ordine,
    );
  return {
    persone: people,
    progetti: projects,
    task: tasks,
    note: notes,
    ore: hours.regs,
    meta: {
      source: source,
      label: label,
      loadedAt: new Date().toISOString(),
      warnings: warnings,
      stats: {
        task: tasks.length,
        note: notes.length,
        registrazioniOre: hours.regs.length,
        celleOFF: hours.stats.off,
        celleInattese: hours.stats.unexpected,
        colonneData: hours.stats.dateCols,
      },
    },
  };
}
export { buildDataset };
