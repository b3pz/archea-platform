import { PROJECT_STATUS_LAYOUT, PROJECT_LIST_LAYOUT } from '../../config/sheets.js';
import { projectCode, cellText, projectName, normalizeText } from '../../domain/normalize.js';

function canonicalProjectStatus(value) {
  const statuses = {
    attivo: 'Attivo', attiva: 'Attivo', active: 'Attivo',
    standby: 'Standby', freeze: 'Freeze', fermo: 'Fermo',
  };
  return statuses[normalizeText(value)];
}

function parseProjects(projectRows, statusRows, warnings) {
  if (!projectRows) {
    warnings.push('Scheda #DV non trovata: elenco progetti ricavato solo dai dati collegati.');
    return [];
  }
  const states = new Map();
  if (statusRows) {
    // Keep the original N-column precedence and accept M used by the live sheet.
    const statusColumns = PROJECT_STATUS_LAYOUT.statusCols ?? [PROJECT_STATUS_LAYOUT.statusCol];
    for (let rowIndex = 0; rowIndex < statusRows.length; rowIndex++) {
      const row = statusRows[rowIndex] ?? [];
      const code = projectCode(cellText(row[PROJECT_STATUS_LAYOUT.projectCol - 1]));
      if (!code) continue;
      const candidates = statusColumns
        .map(column => canonicalProjectStatus(row[column - 1]))
        .filter(Boolean);
      if (!candidates.length) continue;
      if (new Set(candidates).size > 1) {
        warnings.push(`Stati contrastanti per ${code} alla riga ${rowIndex + 1}: usato ${candidates[0]} secondo la precedenza delle colonne.`);
      }
      if (states.has(code) && states.get(code) !== candidates[0]) {
        warnings.push(`Stati contrastanti su più righe per ${code}: conservato ${states.get(code)}.`);
        continue;
      }
      states.set(code, candidates[0]);
    }
  } else {
    warnings.push('Scheda #InsightData non trovata: stati progetto non disponibili.');
  }

  const projects = [];
  const seenCodes = new Set();
  for (let rowIndex = PROJECT_LIST_LAYOUT.firstRow - 1; rowIndex < projectRows.length; rowIndex++) {
    const label = cellText(projectRows[rowIndex]?.[PROJECT_LIST_LAYOUT.column - 1]);
    if (!label || label.toUpperCase() === 'ND') continue;
    const code = projectCode(label);
    if (!code) continue;
    if (seenCodes.has(code)) {
      warnings.push(`Codice duplicato in #DV: ${code}`);
      continue;
    }
    seenCodes.add(code);
    projects.push({
      id: code, codice: code, nome: projectName(label),
      stato: states.get(code) || 'Non indicato',
      ordine: projects.length, inElenco: true,
    });
  }
  const missing = projects.filter(project => project.stato === 'Non indicato');
  if (statusRows && missing.length) {
    warnings.push(`Stato progetto non riconosciuto per: ${missing.map(project => project.codice).join(', ')}. I progetti sono visibili nel filtro Tutti.`);
  }
  return projects;
}
export { parseProjects, canonicalProjectStatus };
