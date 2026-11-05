const STUDIOS = [
  { id: 'firenze', name: 'Firenze' },
  { id: 'roma', name: 'Roma' },
  { id: 'milano', name: 'Milano' },
  { id: 'genova', name: 'Genova' },
  { id: 'rio', name: 'Rio de Janeiro · Brasile' },
  { id: 'tirana', name: 'Tirana' },
];

const PROJECT_STUDIOS = {
  P51: 'firenze', I05: 'firenze', I04: 'firenze', P52: 'firenze',
  M86: 'roma', P13: 'roma', O80: 'milano', H05: 'genova', M01: 'genova',
};

const EMPLOYEES = {
  fdiamanti: { id:'fdiamanti', name:'Francesco Diamanti', studio:'firenze', years:null, role:'Partner Architect', contract:'FD_Contratto.pdf', annualCompensation:null, expiresAt:null },
  abotrini: { id:'abotrini', name:'Alessandro Botrini', studio:'firenze', years:null, role:'Senior Architect', contract:'AB_Contratto.pdf', annualCompensation:null, expiresAt:null },
  lleyra: { id:'lleyra', name:'Lisandro Leyra', studio:'roma', years:null, role:'Architect', contract:'LL_Contratto.pdf', annualCompensation:null, expiresAt:null },
  mrossi: { id:'mrossi', name:'Maria Rossi', studio:'milano', years:null, role:'Architect', contract:'MR_Contratto.pdf', annualCompensation:null, expiresAt:null },
  gsantos: { id:'gsantos', name:'Gabriel Santos', studio:'rio', years:null, role:'Architect', contract:'GS_Contratto.pdf', annualCompensation:null, expiresAt:null },
  akola: { id:'akola', name:'Arben Kola', studio:'tirana', years:null, role:'Architect', contract:'AK_Contratto.pdf', annualCompensation:null, expiresAt:null },
  lbianchi: { id:'lbianchi', name:'Luca Bianchi', studio:'genova', years:null, role:'Architect', contract:'LB_Contratto.pdf', annualCompensation:null, expiresAt:null },
};

const PROJECT_GROUPS = {
  P51: [
    { id:'p51-fi-1', studio:'firenze', name:'Gruppo progettazione', share:.65, members:['fdiamanti','abotrini'] },
    { id:'p51-mi-1', studio:'milano', name:'Gruppo visualizzazione', share:.35, members:['mrossi'] },
  ],
  M86: [
    { id:'m86-rm-1', studio:'roma', name:'Gruppo architettura', share:.55, members:['lleyra','fdiamanti'] },
    { id:'m86-fi-1', studio:'firenze', name:'Gruppo museo', share:.45, members:['abotrini'] },
  ],
  O80: [
    { id:'o80-mi-1', studio:'milano', name:'Gruppo masterplan', share:.7, members:['mrossi','fdiamanti'] },
    { id:'o80-fi-1', studio:'firenze', name:'Gruppo autorizzazioni', share:.3, members:['abotrini'] },
  ],
  H05: [{ id:'h05-ge-1', studio:'genova', name:'Gruppo rilievo e progetto', share:1, members:['lbianchi','lleyra'] }],
  I04: [{ id:'i04-fi-1', studio:'firenze', name:'Gruppo progetto', share:1, members:['fdiamanti','abotrini'] }],
};

const statusCategory = status => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'attivo') return 'active';
  if (normalized === 'standby' || normalized === 'stand by') return 'standby';
  if (['fermo','freeze'].includes(normalized)) return 'stopped';
  return 'completed';
};
const studioForProject = code => PROJECT_STUDIOS[code] ?? 'firenze';
const groupsForProject = code => PROJECT_GROUPS[code] ?? [];
export { STUDIOS, EMPLOYEES, PROJECT_STUDIOS, PROJECT_GROUPS, statusCategory, studioForProject, groupsForProject };
