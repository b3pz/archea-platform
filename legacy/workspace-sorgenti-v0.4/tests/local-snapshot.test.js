import { expect, it } from 'vitest';
import { SNAPSHOT_KEY, readSavedExcel, saveExcelSnapshot, removeSavedExcel } from '../src/data/localSnapshot.js';
import { buildDataset } from '../src/data/build.js';
import { createDemoWorkbook } from '../src/data/demo/workbook.js';
function memoryStorage() {
 const values = new Map();
 return { getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value), removeItem:key=>values.delete(key) };
}
const imported = label => buildDataset(createDemoWorkbook('2026-10-02'), 'excel', label);
it('mantiene solo l’ultimo Excel importato, senza aggiungere dati demo',()=>{
 const storage=memoryStorage(), first=imported('primo.xlsx'),latest=imported('ultimo.xlsx');
 latest.progetti=latest.progetti.filter(p=>p.codice==='M86');
 saveExcelSnapshot(first,storage);saveExcelSnapshot(latest,storage);
 expect(readSavedExcel(storage)).toEqual(JSON.parse(JSON.stringify(latest)));
 expect(readSavedExcel(storage).progetti).toHaveLength(1);
});
it('rimuove i dati persistenti quando si torna alla demo',()=>{
 const storage=memoryStorage();saveExcelSnapshot(imported('test.xlsx'),storage);removeSavedExcel(storage);
 expect(readSavedExcel(storage)).toBeNull();
});
it('rifiuta copie danneggiate e dataset demo',()=>{
 const storage=memoryStorage();storage.setItem(SNAPSHOT_KEY,'broken');expect(()=>readSavedExcel(storage)).toThrow('non è leggibile');
 expect(()=>saveExcelSnapshot(buildDataset(createDemoWorkbook('2026-10-02'),'demo','Demo'),storage)).toThrow();
});
it('propaga il problema quando la memoria del browser è piena',()=>{
 const storage=memoryStorage();storage.setItem=()=>{throw new Error('QuotaExceededError');};
 expect(()=>saveExcelSnapshot(imported('test.xlsx'),storage)).toThrow('QuotaExceededError');
});
