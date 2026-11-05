// Only a parsed Excel snapshot is saved in this browser. Nothing is uploaded.
const SNAPSHOT_KEY = 'archea-workspace:excel-snapshot:v1';
const SNAPSHOT_SCHEMA = 1;

function validateSnapshot(data) {
  if (data?.meta?.source !== 'excel' || typeof data.meta.label !== 'string' ||
      !['persone', 'progetti', 'task', 'note', 'ore'].every(key => Array.isArray(data[key])) ||
      !Array.isArray(data.meta.warnings)) {
    throw new Error('La copia Excel salvata non è leggibile. Importa nuovamente il file.');
  }
  return data;
}

function readSavedExcel(storage) {
  const text = (storage ?? window.localStorage).getItem(SNAPSHOT_KEY);
  if (!text) return null;
  let snapshot;
  try { snapshot = JSON.parse(text); }
  catch { throw new Error('La copia Excel salvata non è leggibile. Importa nuovamente il file.'); }
  if (snapshot.schema !== SNAPSHOT_SCHEMA) {
    throw new Error('La copia Excel salvata richiede una nuova importazione.');
  }
  return validateSnapshot(snapshot.data);
}

function saveExcelSnapshot(data, storage) {
  validateSnapshot(data);
  (storage ?? window.localStorage).setItem(SNAPSHOT_KEY, JSON.stringify({schema: SNAPSHOT_SCHEMA, data}));
}

function removeSavedExcel(storage) {
  (storage ?? window.localStorage).removeItem(SNAPSHOT_KEY);
}

export { SNAPSHOT_KEY, readSavedExcel, saveExcelSnapshot, removeSavedExcel };
