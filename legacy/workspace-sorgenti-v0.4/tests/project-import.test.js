import { it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { createDemoWorkbook } from '../src/data/demo/workbook.js';
import { importExcel } from '../src/data/adapters/excel.js';
import { parseProjects } from '../src/data/parsers/projects.js';

async function importWorkbook(raw) {
  const wb=XLSX.utils.book_new();
  for(const [name,rows] of Object.entries(raw.sheets))
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),name);
  const bytes=XLSX.write(wb,{type:'array',bookType:'xlsx'});
  return importExcel({name:'aggiornato.xlsx',arrayBuffer:async()=>bytes});
}
it('importa tutti i progetti con intervalli Excel che non iniziano da A1',async()=>{
 const data=await importWorkbook(createDemoWorkbook('2026-10-02'));
 expect(data.progetti.filter(p=>p.inElenco)).toHaveLength(9);
 expect(data.progetti.filter(p=>p.stato==='Attivo').map(p=>p.codice)).toEqual(['P51','M86','O80','H05','I04']);
 expect(data.task).toHaveLength(13);
 expect(data.meta.stats.colonneData).toBe(365);
});
it('legge stati in M, nomi scheda con spazi e valori con emoji',async()=>{
 const raw=createDemoWorkbook('2026-10-02');
 for(const row of raw.sheets['#InsightData'])if(row){row[12]=row[13]==='Attivo'?'🟢 ATTIVO ':row[13];row[13]='';}
 raw.sheets['Insight Data']=raw.sheets['#InsightData'];delete raw.sheets['#InsightData'];
 const data=await importWorkbook(raw);
 expect(data.progetti.filter(p=>p.stato==='Attivo')).toHaveLength(5);
 expect(data.progetti.find(p=>p.codice==='P13').stato).toBe('Freeze');
});
it('riconosce stati dopo la riga 57',()=>{
 const projects=Array.from({length:5},()=>[]);projects[4][3]='P51_Fiorentina';
 const states=[];states[75]=[];states[75][10]='P51_Fiorentina';states[75][12]='Attivo';
 expect(parseProjects(projects,states,[])[0].stato).toBe('Attivo');
});
it('segnala stati contrastanti fra M e N, conservando precedenza di N',()=>{
 const projects=Array.from({length:5},()=>[]);projects[4][3]='P51_Fiorentina';
 const states=[];states[31]=[];states[31][10]='P51_Fiorentina';states[31][12]='Freeze';states[31][13]='Attivo';
 const warnings=[];
 expect(parseProjects(projects,states,warnings)[0].stato).toBe('Attivo');
 expect(warnings.some(w=>w.includes('contrastanti'))).toBe(true);
});
it('non considera attivo un progetto con stato sconosciuto o assente',()=>{
 const projects=Array.from({length:5},()=>[]);projects[4][3]='P51_Fiorentina';
 const states=[];states[31]=[];states[31][10]='P51_Fiorentina';states[31][12]='NON ATTIVO';
 expect(parseProjects(projects,states,[])[0].stato).not.toBe('Attivo');
});
