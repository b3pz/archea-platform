import { buildDataset } from '../build.js';

async function importExcel(file) {
  const xlsx = await import('xlsx');
  const workbook = xlsx.read(await file.arrayBuffer(), {
    type: 'array',
    cellDates: false,
  });
  const raw = { sheets: {} };
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet['!ref']) {
      raw.sheets[name] = [];
      continue;
    }
    // Absolute row and column positions are part of the spreadsheet contract.
    // Without an A1 origin, SheetJS trims leading empty rows/columns.
    const range = xlsx.utils.decode_range(sheet['!ref']);
    range.s = { r: 0, c: 0 };
    raw.sheets[name] = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      range,
      raw: true,
      defval: null,
      blankrows: true,
    });
  }
  return buildDataset(raw, 'excel', `Importazione statica: ${file.name}`);
}
export { importExcel };
