const STORAGE_KEY = 'archea-planning-suite-v3';
const VERSION = '0.14.5';
const PROFILE_KEY = 'archea-platform-profile';
const PROFILE_NAME_KEY = 'archea-platform-name';

const PLATFORM_PROFILES = {
  resource:{ label:'Risorsa', professional:'Architect', base:'lleyra', description:'Attività personali, consuntivi e calendario.', color:'#7f9185' },
  project_manager:{ label:'Project Manager', professional:'Senior Architect', base:'abotrini', description:'Piano, team, baseline e costi esterni.', color:'#66776c' },
  resource_manager:{ label:'Resource Manager', professional:'Resource Manager', base:'fdiamanti', description:'Pool globale, capacità, ferie e richieste.', color:'#88785f' },
  pmo_admin:{ label:'PMO / Amministratore', professional:'PMO', base:'fdiamanti', description:'Portfolio, standard, template e pubblicazioni.', color:'#68717a' },
  finance_direction:{ label:'Finance / Direzione', professional:'Property', base:'property', description:'Ricavi, costi, marginalità e società.', color:'#735f63' },
  client:{ label:'Cliente · sola lettura', professional:'Cliente', base:'lleyra', description:'Cronoprogramma filtrato senza dati interni.', color:'#7d8580' },
  platform_owner:{ label:'Platform Owner', professional:'Partner Architect', base:'fdiamanti', description:'Configurazione, utenti, permessi e log.', color:'#252a27' },
  reception:{ label:'Reception', professional:'Segreteria', base:'alaurini', description:'Agenda, sale riunioni, pacchi e accoglienza.', color:'#8a918c' },
  interior_head:{ label:'Responsabile Interior', professional:'Interior Department', base:'scardia', description:'Richieste interior, viste, risorse e consegne.', color:'#7d887f' },
  concept_head:{ label:'Responsabile Concept', professional:'Concept Department', base:'mgamberi', description:'Concept, priorità, assegnazioni e consegne.', color:'#707b73' },
  visual_head:{ label:'Responsabile Visual', professional:'Visual Department', base:'afrongia', description:'Render, artisti, priorità e consegne.', color:'#626c66' },
  material_manager:{ label:'Architect · Gestore Materioteca', professional:'Architect', base:'mmadaghiele', description:'Attività da Architect e gestione completa della materioteca.', color:'#78827b' },
  hr_manager:{ label:'HR Manager', professional:'Human Resources', base:'fdiamanti', description:'Persone, colloqui, appuntamenti, organico e insight HR.', color:'#7b8580' },
};
const DEMO_ACCOUNTS = [
  { id:'resource', name:'Lisandro Leyra', email:'risorsa@demo.archea.it' },
  { id:'project_manager', name:'Alessandro Botrini', email:'pm@demo.archea.it' },
  { id:'resource_manager', name:'Silvia Fabi', email:'resource.manager@demo.archea.it' },
  { id:'pmo_admin', name:'Elena Bianchi', email:'pmo@demo.archea.it' },
  { id:'finance_direction', name:'ARCHEA Direzione', email:'finance@demo.archea.it' },
  { id:'client', name:'ACF Fiorentina', email:'cliente@demo.archea.it' },
  { id:'platform_owner', name:'Francesco Diamanti', email:'owner@demo.archea.it' },
  { id:'reception', name:'Alessandra Laurini', email:'reception@demo.archea.it' },
  { id:'interior_head', name:'Simone Cardia', email:'interior@demo.archea.it' },
  { id:'concept_head', name:'Marco Gamberi', email:'concept@demo.archea.it' },
  { id:'visual_head', name:'Andrea Frongia', email:'visual@demo.archea.it' },
  { id:'material_manager', name:'Mirko Madaghiele', email:'mirko.madaghiele@archea.it' },
  { id:'hr_manager', name:'Elisabetta Pietrelli', email:'elisabetta.pietrelli@archea.it' },
];

const day = value => new Date(`${value}T12:00:00Z`);
const iso = value => value.toISOString().slice(0, 10);
const addDays = (value, amount, working = false) => {
  const result = day(value);
  let left = Math.abs(Number(amount) || 0);
  const step = amount < 0 ? -1 : 1;
  while (left > 0) {
    result.setUTCDate(result.getUTCDate() + step);
    if (!working || ![0, 6].includes(result.getUTCDay())) left -= 1;
  }
  return iso(result);
};
const diffDays = (from, to) => Math.round((day(to) - day(from)) / 86400000);
const money = value => new Intl.NumberFormat('it-IT', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(value || 0);
const dateLabel = value => value ? new Intl.DateTimeFormat('it-IT', { day:'2-digit', month:'short', year:'numeric' }).format(day(value)) : '—';
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

const demoData = {
  projects: [
    { id:'p51', code:'P51', name:'Viola Park', status:'Active', businessUnit:'Architecture', client:'ACF Fiorentina S.r.l.', clientType:'Private', category:'Sport and Recreational', typology:'New Construction', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Florence-Bagno a Ripoli', studio:'Firenze', manager:'Alessandro Botrini', sponsor:'Marco Casamonti', priority:'High', budget:920000, revenue:1250000, externalCosts:210000, internalHours:6840, calendar:'ARCHEA ITALIA · 9h', start:'2026-09-01', end:'2027-06-30', onHoldReason:'', plot:260000, building:52000, underground:6400 },
    { id:'p44', code:'P44', name:'Stadio Flaminio', status:'Active', businessUnit:'Architecture', client:'Roma Capitale', clientType:'Public', category:'Sport and Recreational', typology:'Restoration', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Rome-Flaminio', studio:'Roma', manager:'Francesco Diamanti', sponsor:'Laura Andreini', priority:'High', budget:1450000, revenue:1900000, externalCosts:340000, internalHours:7920, calendar:'ARCHEA ITALIA · 9h', start:'2026-07-01', end:'2028-03-31', onHoldReason:'', plot:72000, building:28600, underground:4200 },
    { id:'p38', code:'P38', name:'Milanello Training Center', status:'Planning', businessUnit:'Architecture', client:'AC Milan S.p.A.', clientType:'Private', category:'Sport and Recreational', typology:'Renovation', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Varese-Carnago', studio:'Milano', manager:'Francesco Diamanti', sponsor:'Giovanni Polazzi', priority:'Medium', budget:760000, revenue:980000, externalCosts:170000, internalHours:4380, calendar:'ARCHEA ITALIA · 9h', start:'2026-10-12', end:'2027-12-20', onHoldReason:'', plot:180000, building:18400, underground:3100 },
    { id:'p32', code:'P32', name:'Waterfront Tirana', status:'On Hold', businessUnit:'Architecture', client:'Adriatic Development', clientType:'Private', category:'Mixed-Use', typology:'New Construction', executor:'Archea Albania Architecture&Interior', owner:'Archea Albania Architecture&Interior', location:'Albania-Tirana-Waterfront', studio:'Tirana', manager:'Arben Kola', sponsor:'Silvia Fabi', priority:'Low', budget:540000, revenue:720000, externalCosts:126000, internalHours:2920, calendar:'ARCHEA TIRANA · 9h', start:'2026-04-15', end:'2027-08-30', onHoldReason:'Client Decision', plot:91000, building:68000, underground:12000 },
  ],
  resources: [
    { id:'r1', name:'Francesco Diamanti', role:'Partner Architect', kind:'Internal · Nominal', company:'Archea Associati', department:'Architecture', location:'Firenze', manager:'Marco Casamonti', rate:38, capacity:45, absence:[] },
    { id:'r2', name:'Alessandro Botrini', role:'Senior Architect', kind:'Internal · Nominal', company:'Archea Associati', department:'Architecture', location:'Firenze', manager:'Francesco Diamanti', rate:31, capacity:45, absence:[['2026-11-09','2026-11-13','Ferie']] },
    { id:'r3', name:'Lisandro Leyra', role:'Architect', kind:'Internal · Nominal', company:'Archea Associati', department:'BIM', location:'Roma', manager:'Alessandro Botrini', rate:22, capacity:45, absence:[] },
    { id:'r4', name:'Maria Rossi', role:'Architect', kind:'Internal · Nominal', company:'Archea Associati', department:'Interior', location:'Milano', manager:'Francesco Diamanti', rate:22, capacity:45, absence:[['2026-11-02','2026-11-03','Permesso']] },
    { id:'r5', name:'_IG_VISUAL', role:'Visual Department', kind:'Internal · Generic', company:'Archea Associati', department:'Visual', location:'Firenze', manager:'Silvia Fabi', rate:25, capacity:45, absence:[] },
    { id:'r6', name:'_EG_MEP CONSULTANCY', role:'MEP Consultant', kind:'External · Generic', company:'External', department:'MEP', location:'Milano', manager:'Alessandro Botrini', rate:65, capacity:40, absence:[] },
    { id:'r7', name:'_EN_STIMP', role:'Structural Consultant', kind:'External · Nominal', company:'STIMP', department:'Structure', location:'Roma', manager:'Francesco Diamanti', rate:72, capacity:40, absence:[] },
  ],
  tasks: [
    { id:'t100', project:'P51', wbs:'1', parent:null, title:'CONCEPT DESIGN [PD]', type:'Summary', phase:'Concept Design (PD)', discipline:'Architecture', milestone:'', assignee:'r2', start:'2026-10-19', duration:30, calendar:'working', progress:47, actualHours:0, plannedHours:0, predecessor:'', relation:'FS', lag:0 },
    { id:'t101', project:'P51', wbs:'1.1', parent:'t100', title:'Architecture and landscape concept', type:'Work', phase:'Concept Design (PD)', discipline:'Architecture', milestone:'', assignee:'r2', start:'2026-10-19', duration:10, calendar:'working', progress:72, actualHours:238, plannedHours:320, predecessor:'', relation:'FS', lag:0 },
    { id:'t102', project:'P51', wbs:'1.2', parent:'t100', title:'Landscape development', type:'Work', phase:'Concept Design (PD)', discipline:'Landscaping', milestone:'', assignee:'r3', start:'2026-11-02', duration:12, calendar:'working', progress:36, actualHours:82, plannedHours:240, predecessor:'t101', relation:'FS', lag:1 },
    { id:'t103', project:'P51', wbs:'1.3', parent:'t100', title:'Approval by client', type:'Approval', phase:'Concept Design (PD)', discipline:'Permits and Approvals', milestone:'Approval', assignee:'r2', start:'2026-11-19', duration:1, calendar:'solar', progress:0, actualHours:0, plannedHours:8, predecessor:'t102', relation:'FS', lag:0 },
    { id:'t104', project:'P51', wbs:'1.4', parent:'t100', title:'Payment 30% after approval', type:'Payment', phase:'Concept Design (PD)', discipline:'Others', milestone:'Invoicing', assignee:'r1', start:'2026-11-19', duration:1, calendar:'solar', progress:0, actualHours:0, plannedHours:2, predecessor:'t103', relation:'FF', lag:0, contractualFee:375000 },
    { id:'t200', project:'P44', wbs:'1', parent:null, title:'DESIGN DEVELOPMENT [DD]', type:'Summary', phase:'Design Development (DD)', discipline:'Architecture', milestone:'', assignee:'r1', start:'2026-10-05', duration:45, calendar:'working', progress:42, actualHours:0, plannedHours:0, predecessor:'', relation:'FS', lag:0 },
    { id:'t201', project:'P44', wbs:'1.1', parent:'t200', title:'Structural survey and model', type:'Work', phase:'Design Development (DD)', discipline:'Structure', milestone:'', assignee:'r7', start:'2026-10-05', duration:16, calendar:'working', progress:80, actualHours:168, plannedHours:220, predecessor:'', relation:'FS', lag:0 },
    { id:'t202', project:'P44', wbs:'1.2', parent:'t200', title:'Museum architectural package', type:'Work', phase:'Design Development (DD)', discipline:'Architecture', milestone:'', assignee:'r1', start:'2026-10-12', duration:25, calendar:'working', progress:45, actualHours:212, plannedHours:420, predecessor:'t201', relation:'SS', lag:5 },
    { id:'t203', project:'P44', wbs:'1.3', parent:'t200', title:'Soprintendenza approval', type:'Approval', phase:'Design Development (DD)', discipline:'Permits and Approvals', milestone:'Submission', assignee:'r1', start:'2026-11-16', duration:30, calendar:'solar', progress:0, actualHours:0, plannedHours:18, predecessor:'t202', relation:'FS', lag:0 },
    { id:'t300', project:'P38', wbs:'1', parent:null, title:'PRE-CONTRACT PHASE', type:'Summary', phase:'Pre-Contract Phase', discipline:'Architecture', milestone:'', assignee:'r1', start:'2026-10-12', duration:22, calendar:'working', progress:64, actualHours:0, plannedHours:0, predecessor:'', relation:'FS', lag:0 },
    { id:'t301', project:'P38', wbs:'1.1', parent:'t300', title:'Input data and feasibility', type:'Work', phase:'Pre-Contract Phase', discipline:'Urban Planning', milestone:'', assignee:'r4', start:'2026-10-12', duration:12, calendar:'working', progress:86, actualHours:116, plannedHours:140, predecessor:'', relation:'FS', lag:0 },
    { id:'t302', project:'P38', wbs:'1.2', parent:'t300', title:'Contract review', type:'Approval', phase:'Pre-Contract Phase', discipline:'Others', milestone:'Approval', assignee:'r1', start:'2026-10-28', duration:5, calendar:'working', progress:20, actualHours:8, plannedHours:24, predecessor:'t301', relation:'FS', lag:0 },
  ],
  baselines: [],
  requests: [
    { id:'req1', project:'P51', department:'Visual', profile:'Renderista senior', weeks:3, hours:72, status:'In valutazione', requestedBy:'Alessandro Botrini' },
  ],
};

demoData.companies = [
  { id:'archea', name:'Archea Associati', tenant:'Archea Group', studios:['Firenze','Roma','Milano','Genova'] },
  { id:'modourbano', name:'Modourbano', tenant:'Archea Group', studios:['Milano'] },
  { id:'albania', name:'Archea Albania Architecture&Interior', tenant:'Archea Group', studios:['Tirana'] },
  { id:'brasil', name:'Archea Brasil Arquitetura e Interiores', tenant:'Archea Group', studios:['San Paolo'] },
  { id:'paris', name:'Archea Paris Architecture', tenant:'Archea Group', studios:['Parigi'] },
  { id:'dubai', name:'Archea Dubai', tenant:'Tenant Dubai · federato', studios:['Dubai'] },
  { id:'shanghai', name:'Archea Shanghai', tenant:'Archea Group', studios:['Shanghai'] },
];
demoData.calendars = [
  { id:'it', name:'ARCHEA ITALIA', hours:9, days:[1,2,3,4,5], studios:['Firenze','Roma','Milano','Genova'] },
  { id:'tirana', name:'ARCHEA TIRANA', hours:9, days:[1,2,3,4,5], studios:['Tirana'] },
  { id:'brasil', name:'ARCHEA BRASIL', hours:9, days:[1,2,3,4,5], studios:['San Paolo'] },
  { id:'global', name:'CALENDARIO SOLARE', hours:24, days:[0,1,2,3,4,5,6], studios:['Tutte'] },
];
demoData.templates = [
  { id:'tpl-building', name:'Generic Building', typology:'New Construction', phases:['Pre-Contract Phase','Concept Design (PD)','Schematic Design (SD)','Design Development (DD)','Construction Documents (CD)','Construction Administration (CA)'], tasks:24, status:'Pubblicato' },
  { id:'tpl-restoration', name:'Restoration & Heritage', typology:'Restoration', phases:['Survey','Concept Design (PD)','Permits and Approvals','Design Development (DD)','Construction Documents (CD)','Construction Administration (CA)'], tasks:31, status:'Pubblicato' },
  { id:'tpl-sport', name:'Sport Facilities', typology:'Sport and Recreational', phases:['Feasibility','Masterplan (MP)','Concept Design (PD)','Design Development (DD)','Bidding phase-Tender (BI)','Construction Administration (CA)'], tasks:36, status:'Bozza' },
];
demoData.timesheets = [
  { id:'ts1', resource:'r3', project:'P51', task:'t102', date:'2026-10-19', hours:7, note:'Sviluppo sistemazioni paesaggistiche', status:'Approvato' },
  { id:'ts2', resource:'r3', project:'P51', task:'t102', date:'2026-10-20', hours:8, note:'Coordinamento modello e piante', status:'Inviato' },
  { id:'ts3', resource:'r2', project:'P51', task:'t101', date:'2026-10-20', hours:6, note:'Revisione concept con cliente', status:'Inviato' },
  { id:'ts4', resource:'r1', project:'P44', task:'t202', date:'2026-10-21', hours:5, note:'Coordinamento museo e strutture', status:'Bozza' },
];
demoData.externalContracts = [
  { id:'ec1', project:'P44', supplier:'STIMP', task:'t201', model:'Pacchetto', amount:72000, purchasedHours:0, usedHours:0, status:'Attivo' },
  { id:'ec2', project:'P51', supplier:'MEP Consultancy', task:'t101', model:'A ore', amount:26000, purchasedHours:400, usedHours:168, status:'Attivo' },
];
demoData.intercompany = [
  { id:'ic1', project:'P32', owner:'Archea Associati', executor:'Archea Albania Architecture&Interior', revenueShare:62, costShare:38, hours:1460 },
];
demoData.publications = [
  { id:'pub1', project:'P51', date:'2026-10-18T17:35:00', by:'Alessandro Botrini', reason:'Aggiornamento settimanale', status:'Pubblicato' },
  { id:'pub2', project:'P44', date:'2026-10-17T18:10:00', by:'Francesco Diamanti', reason:'Nuova schedulazione', status:'Pubblicato' },
];
demoData.audit = [
  { id:'log1', date:'2026-10-23T09:14:00', actor:'Alessandro Botrini', action:'Baseline 1 creata', target:'P51', severity:'info' },
  { id:'log2', date:'2026-10-23T10:02:00', actor:'Silvia Fabi', action:'Richiesta renderista presa in carico', target:'REQ-01', severity:'info' },
  { id:'log3', date:'2026-10-23T11:40:00', actor:'Sistema', action:'Sovrallocazione rilevata', target:'Alessandro Botrini', severity:'warning' },
];
demoData.users = DEMO_ACCOUNTS.map((account,index) => ({ id:account.id, name:account.name, email:account.email, profile:account.id, professional:PLATFORM_PROFILES[account.id].professional, company:index === 5 ? 'ACF Fiorentina' : 'Archea Associati', active:true, projects:account.id === 'client' ? ['P51'] : account.id === 'resource' ? ['P51'] : account.id === 'project_manager' ? ['P51'] : [] }));
demoData.tasks.push(
  { id:'t204', project:'P44', wbs:'1.4', parent:'t200', title:'Acconto contrattuale DD', type:'Payment', phase:'Design Development (DD)', discipline:'Others', milestone:'Paid', assignee:'r1', start:'2026-10-15', finishTime:'18:00', duration:1, calendar:'solar', progress:100, actualHours:1, plannedHours:1, predecessor:'t201', relation:'FF', lag:0, contractualFee:380000 },
  { id:'t303', project:'P38', wbs:'1.3', parent:'t300', title:'Acconto alla firma', type:'Payment', phase:'Pre-Contract Phase', discipline:'Others', milestone:'Invoicing', assignee:'r1', start:'2026-11-04', finishTime:'18:00', duration:1, calendar:'solar', progress:45, actualHours:1, plannedHours:1, predecessor:'t302', relation:'FS', lag:2, contractualFee:196000 }
);
demoData.projects.push(
  { id:'p52', code:'P52', name:'Social Housing Firenze', status:'Active', businessUnit:'Architecture', client:'Firenze Living S.r.l.', clientType:'Private', category:'Residential', typology:'New Construction', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Florence-Novoli', studio:'Firenze', manager:'Alessandro Botrini', sponsor:'Marco Casamonti', priority:'High', budget:610000, revenue:840000, externalCosts:118000, internalHours:3260, calendar:'ARCHEA ITALIA · 9h', start:'2026-09-14', end:'2027-09-30', onHoldReason:'', plot:24500, building:31800, underground:5100 },
  { id:'h05', code:'H05', name:'Stadio di Pisa', status:'Planning', businessUnit:'Architecture', client:'Pisa Sporting Club', clientType:'Private', category:'Sport and Recreational', typology:'Renovation', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Pisa-Porta a Lucca', studio:'Firenze', manager:'Alessandro Botrini', sponsor:'Laura Andreini', priority:'Medium', budget:480000, revenue:690000, externalCosts:94000, internalHours:2540, calendar:'ARCHEA ITALIA · 9h', start:'2026-11-02', end:'2027-11-26', onHoldReason:'', plot:37500, building:19400, underground:2200 },
  { id:'i04', code:'I04', name:'Capannoncino', status:'Active', businessUnit:'Industrial Design', client:'Manifattura Toscana', clientType:'Private', category:'Industrial', typology:'Renovation', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Prato-Macrolotto', studio:'Firenze', manager:'Alessandro Botrini', sponsor:'Silvia Fabi', priority:'Medium', budget:295000, revenue:410000, externalCosts:52000, internalHours:1780, calendar:'ARCHEA ITALIA · 9h', start:'2026-08-24', end:'2027-04-30', onHoldReason:'', plot:13800, building:9200, underground:0 },
  { id:'d18', code:'D18', name:'Dubai Waterfront Hotel', status:'Active', businessUnit:'Architecture', client:'Gulf Hospitality', clientType:'Private', category:'Hospitality', typology:'New Construction', executor:'Archea Dubai', owner:'Archea Associati', location:'UAE-Dubai-Waterfront', studio:'Dubai', manager:'Francesco Diamanti', sponsor:'Marco Casamonti', priority:'High', budget:1880000, revenue:2650000, externalCosts:460000, internalHours:9240, calendar:'ARCHEA ITALIA · 9h', start:'2026-06-15', end:'2028-02-28', onHoldReason:'', plot:46000, building:78000, underground:17000 },
  { id:'s21', code:'S21', name:'Shanghai Cultural Center', status:'Planning', businessUnit:'Architecture', client:'Shanghai Culture Group', clientType:'Public', category:'Cultural', typology:'New Construction', executor:'Archea Shanghai', owner:'Archea Shanghai', location:'China-Shanghai-Pudong', studio:'Shanghai', manager:'Francesco Diamanti', sponsor:'Laura Andreini', priority:'High', budget:1320000, revenue:1840000, externalCosts:305000, internalHours:6880, calendar:'CALENDARIO SOLARE', start:'2026-10-05', end:'2028-06-30', onHoldReason:'', plot:55000, building:64000, underground:14800 },
  { id:'r27', code:'R27', name:'Roma Arena', status:'Completed', businessUnit:'Architecture', client:'Roma Eventi', clientType:'Private', category:'Sport and Recreational', typology:'Renovation', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Rome-EUR', studio:'Roma', manager:'Francesco Diamanti', sponsor:'Marco Casamonti', priority:'Low', budget:720000, revenue:1040000, externalCosts:180000, internalHours:5120, calendar:'ARCHEA ITALIA · 9h', start:'2025-02-03', end:'2026-07-31', onHoldReason:'', plot:62000, building:32400, underground:4300 },
  { id:'g12', code:'G12', name:'Genova Waterfront Offices', status:'On Hold', businessUnit:'Architecture', client:'Liguria Development', clientType:'Private', category:'Office', typology:'New Construction', executor:'Archea Associati', owner:'Archea Associati', location:'Italy-Genoa-Waterfront', studio:'Genova', manager:'Alessandro Botrini', sponsor:'Silvia Fabi', priority:'Low', budget:395000, revenue:560000, externalCosts:76000, internalHours:2180, calendar:'ARCHEA ITALIA · 9h', start:'2026-05-18', end:'2027-10-29', onHoldReason:'Attesa variante urbanistica', plot:18400, building:22600, underground:6100 }
);
[
  ['P52','t400','CONCEPT E FATTIBILITÀ','Concept Design (PD)','2026-09-14',38,'r2',54],
  ['P52','t401','Sviluppo tipologico residenze','Concept Design (PD)','2026-10-05',18,'r3',42],
  ['H05','t500','RILIEVO E PRE-FATTIBILITÀ','Pre-Contract Phase','2026-11-02',28,'r2',18],
  ['H05','t501','Restituzione prospetti','Pre-Contract Phase','2026-11-02',12,'r3',35],
  ['I04','t600','DESIGN DEVELOPMENT','Design Development (DD)','2026-09-07',34,'r2',61],
  ['I04','t601','Coordinamento involucro','Design Development (DD)','2026-10-12',15,'r4',48],
  ['D18','t700','SCHEMATIC DESIGN','Schematic Design (SD)','2026-10-01',42,'r1',37],
  ['D18','t701','Mock-up camere tipo','Schematic Design (SD)','2026-10-19',20,'r5',28],
  ['S21','t800','MASTERPLAN','Masterplan (MP)','2026-10-05',36,'r1',22],
  ['S21','t801','Studio flussi pubblici','Masterplan (MP)','2026-10-26',14,'r4',12],
  ['R27','t900','CONSTRUCTION ADMINISTRATION','Construction Administration (CA)','2026-05-04',30,'r1',100],
  ['G12','t1000','CONCEPT DESIGN','Concept Design (PD)','2026-05-18',25,'r2',30]
].forEach(([project,id,title,phase,start,duration,assignee,progress],index)=>demoData.tasks.push({ id, project, wbs:index%2?'1.1':'1', parent:index%2?`t${Number(id.slice(1))-1}`:null, title, type:index%2?'Work':'Summary', phase, discipline:'Architecture', milestone:'', assignee, start, duration, calendar:'working', progress, actualHours:index%2?Math.round(duration*5*progress/100):0, plannedHours:index%2?duration*9:0, predecessor:'', relation:'FS', lag:0 }));
demoData.projects.forEach((project,index) => Object.assign(project, {
  promoter:project.sponsor,
  contractSigned:index !== 2,
  contractFile:index !== 2 ? `${project.code}_Contratto_firmato.pdf` : '',
  template:index === 1 ? 'tpl-restoration' : index === 0 ? 'tpl-sport' : 'tpl-building',
  governanceStatus:index === 2 ? 'Draft' : project.status === 'On Hold' ? 'On Hold' : 'Published',
  actualStart:project.start,
  actualEnd:'',
}));

const loadData = () => {
  try { return { ...structuredClone(demoData), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return structuredClone(demoData); }
};
let state = loadData();
if (!state.users?.some(user => user.id === 'hr_manager')) {
  state.users ||= [];
  state.users.push({ id:'hr_manager', name:'Elisabetta Pietrelli', email:'elisabetta.pietrelli@archea.it', profile:'hr_manager', professional:'Human Resources', company:'Archea Associati', active:true, projects:[] });
}
let undoStack = [];
let currentTab = 'dashboard';
let selectedProject = state.projects[0].code;
let planView = 'gantt';
let phaseFilter = 'all';
let resourceFilter = 'all';
let groupFilter = 'none';
let portfolioStatus = 'all';
let portfolioCompany = 'all';
let financeFilter = 'all';
let modalAction = null;
let previousBaseNavButton = null;

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const checkpoint = () => { undoStack.push(JSON.stringify(state)); if (undoStack.length > 20) undoStack.shift(); };
const undo = () => { if (!undoStack.length) return toast('Nessuna modifica da annullare'); state = JSON.parse(undoStack.pop()); save(); render(); toast('Ultima modifica annullata'); };
const profile = () => sessionStorage.getItem(PROFILE_KEY) || ({ fdiamanti:'platform_owner', abotrini:'project_manager', lleyra:'resource', property:'finance_direction', alaurini:'reception', scardia:'interior_head', mgamberi:'concept_head', afrongia:'visual_head', mmadaghiele:'material_manager', epietrelli:'hr_manager' }[sessionStorage.getItem('archea-demo-user')] || 'platform_owner');
const profileInfo = () => PLATFORM_PROFILES[profile()] || PLATFORM_PROFILES.platform_owner;
const can = action => ({
  viewAllProjects:['resource_manager','pmo_admin','finance_direction','platform_owner'],
  editPlan:['project_manager','pmo_admin','platform_owner'],
  manageResources:['resource_manager','pmo_admin','platform_owner'],
  approveTime:['project_manager','pmo_admin','platform_owner'],
  manageStandards:['pmo_admin','platform_owner'],
  viewSales:['project_manager','pmo_admin','finance_direction','platform_owner'],
  viewExternalCosts:['project_manager','pmo_admin','finance_direction','platform_owner'],
  viewInternalCosts:['finance_direction','platform_owner'],
  manageFinance:['finance_direction','platform_owner'],
  manageUsers:['platform_owner'],
  publish:['project_manager','pmo_admin','platform_owner'],
  share:['project_manager','pmo_admin','platform_owner'],
}[action]?.includes(profile()) || false);
const canPlan = () => can('editPlan');
const canSeeCosts = () => can('viewInternalCosts');
const currentResourceId = () => profile() === 'resource' ? 'r3' : profile() === 'project_manager' ? 'r2' : profile() === 'platform_owner' ? 'r1' : '';
const visibleProjectCodes = () => {
  if (profile() === 'client') return ['P51'];
  if (profile() === 'resource') return [...new Set(state.tasks.filter(task => task.assignee === currentResourceId()).map(task => task.project))];
  if (profile() === 'project_manager') return state.projects.filter(project => project.manager === 'Alessandro Botrini').map(project => project.code);
  return state.projects.map(project => project.code);
};
const visibleProjects = () => state.projects.filter(project => visibleProjectCodes().includes(project.code));
const resourceName = id => state.resources.find(item => item.id === id)?.name || 'Da assegnare';
const projectByCode = code => state.projects.find(item => item.code === code);
const taskEnd = task => addDays(task.start, Math.max(0, task.duration - 1), task.calendar === 'working');
const leafTasks = code => state.tasks.filter(task => task.project === code && task.type !== 'Summary');

function autoSchedule(code) {
  checkpoint();
  const tasks = state.tasks.filter(task => task.project === code);
  for (let pass = 0; pass < tasks.length + 1; pass += 1) {
    tasks.forEach(task => {
      if (!task.predecessor) return;
      const predecessor = state.tasks.find(item => item.id === task.predecessor);
      if (!predecessor) return;
      const working = task.calendar === 'working';
      const lag = Number(task.lag) || 0;
      if (task.relation === 'FS') task.start = addDays(taskEnd(predecessor), lag + 1, working);
      if (task.relation === 'SS') task.start = addDays(predecessor.start, lag, working);
      if (task.relation === 'FF') { task.start = addDays(addDays(taskEnd(predecessor), lag, working), -(task.duration - 1), working); task.finishTime = predecessor.finishTime || '18:00'; }
      if (task.relation === 'SF') task.start = addDays(addDays(predecessor.start, lag, working), -(task.duration - 1), working);
      const resource = state.resources.find(item => item.id === task.assignee);
      const absence = resource?.absence.find(([from,to]) => task.start >= from && task.start <= to);
      if (absence) { task.start = addDays(absence[1],1,working); task.capacityAlert = `Riprogrammata dopo ${absence[2].toLowerCase()} di ${resource.name}`; }
      else task.capacityAlert = '';
    });
  }
  tasks.filter(task => task.type === 'Summary').forEach(parent => {
    const children = tasks.filter(task => task.parent === parent.id);
    if (!children.length) return;
    parent.start = children.map(item => item.start).sort()[0];
    const maxEnd = children.map(taskEnd).sort().at(-1);
    parent.duration = Math.max(1, diffDays(parent.start, maxEnd) + 1);
    parent.progress = Math.round(children.reduce((sum, item) => sum + item.progress, 0) / children.length);
  });
  save(); render(); toast('Cronoprogramma ricalcolato a cascata');
}

function captureBaseline(incremental = false) {
  checkpoint();
  const snapshot = state.baselines.find(item => item.project === selectedProject && item.active);
  if (incremental && snapshot) {
    const known = new Set(snapshot.tasks.map(item => item.id));
    state.tasks.filter(task => task.project === selectedProject && !known.has(task.id)).forEach(task => snapshot.tasks.push({ id:task.id, start:task.start, end:taskEnd(task), duration:task.duration }));
    snapshot.updatedAt = new Date().toISOString();
    toast('Nuove attività aggiunte alla baseline senza sovrascrivere lo storico');
  } else {
    state.baselines.forEach(item => { if (item.project === selectedProject) item.active = false; });
    const number = state.baselines.filter(item => item.project === selectedProject).length + 1;
    state.baselines.push({ id:uid('baseline'), project:selectedProject, name:`Baseline ${number}`, date:new Date().toISOString(), active:true, tasks:state.tasks.filter(task => task.project === selectedProject).map(task => ({ id:task.id, start:task.start, end:taskEnd(task), duration:task.duration })) });
    toast(`Baseline ${number} salvata`);
  }
  save(); render();
}

function projectKpis(project) {
  const tasks = leafTasks(project.code);
  const planned = tasks.reduce((sum, item) => sum + Number(item.plannedHours || 0), 0);
  const actual = tasks.reduce((sum, item) => sum + Number(item.actualHours || 0), 0);
  const progress = tasks.length ? Math.round(tasks.reduce((sum, item) => sum + item.progress, 0) / tasks.length) : 0;
  const internalCost = project.internalHours * 10;
  const margin = project.revenue - project.externalCosts - internalCost;
  return { planned, actual, progress, internalCost, margin, marginPct:Math.round(margin / Math.max(1, project.revenue) * 100) };
}

function navIcon(name) {
  const icons = {
    plan:'<path d="M4 5h16M4 12h16M4 19h16M8 3v4M14 10v4M11 17v4"/>',
    dashboard:'<path d="M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z"/>',
    gantt:'<path d="M4 5h6v3H4V5Zm4 6h10v3H8v-3Zm-4 6h14v3H4v-3Z"/>',
    resources:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87"/>',
    baseline:'<path d="M5 3v18M19 3v18M8 7h7l-2 3 2 3H8V7Z"/>',
    portfolio:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>',
    share:'<path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 18 8ZM6 15a3 3 0 1 0-2.83-4A3 3 0 0 0 6 15Zm12 7a3 3 0 1 0-2.83-4A3 3 0 0 0 18 22ZM8.6 12.5l6.8-4M8.6 13.8l6.8 4"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.plan}</svg>`;
}

function allowedPlanningTabs() {
  return {
    resource:[],
    project_manager:['dashboard','plan','resources','timesheets','baseline','finance','portfolio','share'],
    resource_manager:['dashboard','resources','timesheets','portfolio'],
    pmo_admin:['dashboard','plan','resources','timesheets','baseline','portfolio','admin','share'],
    finance_direction:['dashboard','portfolio','finance'],
    client:['dashboard','plan'],
    platform_owner:['dashboard','plan','resources','timesheets','baseline','portfolio','finance','admin','users','share'],
    hr_manager:[],
  }[profile()] || [];
}

const planningTabs = () => [
  ['dashboard','dashboard','Quadro generale'],['plan','gantt','Piano di progetto'],['resources','resources','Risorse e capacità'],['timesheets','timesheets','Ore e consuntivi'],['baseline','baseline','Baseline'],['portfolio','portfolio','Portfolio'],['finance','finance','Economia'],['admin','admin','PMO e standard'],['users','users','Utenti e permessi'],['share','share','Condivisione'],
];

function ensureShell() {
  if (document.querySelector('#archea-planning-suite')) return;
  const root = document.createElement('div');
  root.id = 'archea-planning-suite';
  root.className = 'aps';
  root.hidden = true;
  root.innerHTML = `<div class="aps-shell"><aside class="aps-nav"><div class="aps-wordmark"><img src="./icons/archea-associati-logo.svg" alt="ARCHEA ASSOCIATI"></div><nav></nav><div class="aps-nav-foot"><span><i></i>DEMO LOCALE</span><small>v${VERSION}</small></div></aside><section class="aps-workspace"><header class="aps-top"><div><small>ARCHEA WORKSPACE</small><b>Pianificazione e controllo</b></div><div><button class="aps-role" title="Cambia account demo"></button><button class="aps-close" aria-label="Chiudi"><span>×</span></button></div></header><main class="aps-main"></main></section></div><div class="aps-modal" hidden></div><div class="aps-toast" hidden></div>`;
  document.body.append(root);
  root.querySelector('.aps-close').addEventListener('click', closeSuite);
  root.querySelector('.aps-role').addEventListener('click',profileSwitcher);
  root.addEventListener('pointerdown', event => {
    const select = event.target.closest?.('select');
    if (!select) return;
    event.preventDefault();
    openSelectPicker(select);
  }, true);
}

function syncBaseNavigation(planningIsOpen, restore = true) {
  const buttons = [...document.querySelectorAll('.desk-sidebar nav > button:not(.aps-desktop-launcher)')];
  if (planningIsOpen) {
    previousBaseNavButton ||= buttons.find(button => button.classList.contains('on')) || null;
    buttons.forEach(button => {
      button.classList.remove('on');
      if (button.getAttribute('aria-current') === 'page') button.removeAttribute('aria-current');
      if (button.getAttribute('aria-selected') === 'true') button.setAttribute('aria-selected','false');
    });
    return;
  }
  if (restore && previousBaseNavButton?.isConnected) previousBaseNavButton.classList.add('on');
  previousBaseNavButton = null;
}

function openSuite(tab = 'dashboard') {
  if (!allowedPlanningTabs().length) return;
  ensureShell();
  currentTab = tab;
  if (!visibleProjectCodes().includes(selectedProject)) selectedProject = visibleProjectCodes()[0] || state.projects[0].code;
  const root = document.querySelector('#archea-planning-suite');
  const integrated = !!document.querySelector('.desktop-app');
  root.classList.toggle('aps-integrated', integrated);
  root.hidden = false;
  const appRoot=document.querySelector('#root'); if(appRoot&&!integrated){appRoot.inert=true;appRoot.setAttribute('aria-hidden','true');}
  document.querySelector('.aps-desktop-launcher')?.classList.add('on','expanded');
  document.querySelector('.aps-desktop-subnav')?.classList.add('open');
  syncBaseNavigation(true);
  document.body.classList.add('aps-open');
  render();
}
function closeSuite(restoreBaseNavigation = true) {
  const root = document.querySelector('#archea-planning-suite');
  if (root) root.hidden = true;
  const appRoot=document.querySelector('#root'); if(appRoot){appRoot.inert=false;appRoot.removeAttribute('aria-hidden');}
  document.querySelector('.aps-desktop-launcher')?.classList.remove('on','expanded');
  document.querySelector('.aps-desktop-subnav')?.classList.remove('open');
  syncBaseNavigation(false, restoreBaseNavigation);
  document.body.classList.remove('aps-open');
}
function toast(message) {
  const box = document.querySelector('.aps-toast');
  if (!box) return;
  box.textContent = message; box.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { box.hidden = true; }, 2800);
}

function renderNav() {
  const allowed = allowedPlanningTabs();
  const allTabs = planningTabs();
  if (!allowed.length) { closeSuite(); return; }
  const tabs = allTabs.filter(([id]) => allowed.includes(id));
  if (!allowed.includes(currentTab)) currentTab = allowed[0];
  const nav = document.querySelector('.aps-nav nav');
  nav.innerHTML = tabs.map(([id,icon,label]) => `<button data-tab="${id}" class="${currentTab === id ? 'on' : ''}">${navIcon(icon)}<span>${label}</span></button>`).join('');
  nav.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { currentTab = button.dataset.tab; render(); }));
  renderDesktopPlanningSubnav(tabs);
  const fullName=sessionStorage.getItem(PROFILE_NAME_KEY)||profileInfo().professional;
  const firstName=fullName.split(/\s+/)[0];
  const todayText=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const header=document.querySelector('.aps-top>div:first-child');
  if(header) header.innerHTML=`<b>Ciao ${escapeHtml(firstName)}</b><span>${escapeHtml(todayText.charAt(0).toUpperCase()+todayText.slice(1))}</span>`;
  document.querySelector('.aps-role').textContent = `${fullName} · ${profileInfo().label}`;
  document.querySelector('.aps-close').hidden = ['resource_manager','pmo_admin','client'].includes(profile());
}

function renderDesktopPlanningSubnav(tabs = planningTabs().filter(([id]) => allowedPlanningTabs().includes(id))) {
  const subnav = document.querySelector('.aps-desktop-subnav');
  if (!subnav) return;
  subnav.innerHTML = tabs.map(([id,icon,label]) => `<button type="button" data-planning-tab="${id}" class="${currentTab===id?'on':''}">${navIcon(icon)}<span>${label}</span></button>`).join('');
  subnav.querySelectorAll('[data-planning-tab]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation(); openSuite(button.dataset.planningTab);
  }));
}

const heading = (title, subtitle, actions = '') => `<div class="aps-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="aps-actions">${actions}</div></div>`;
const stat = (label, value, meta = '', tone = '') => `<article class="aps-stat ${tone}"><small>${label}</small><b>${value}</b><span>${meta}</span></article>`;
const projectSelect = () => `<label class="aps-project-select aps-popup-select"><span>PROGETTO</span><select id="aps-project-picker">${visibleProjects().map(project => `<option value="${project.code}" ${project.code === selectedProject ? 'selected' : ''}>${project.code} · ${escapeHtml(project.name)}</option>`).join('')}</select></label>`;
const capacityRows = () => state.resources.map((resource,index) => {
  const assigned = state.tasks.filter(task => task.assignee === resource.id && task.type !== 'Summary');
  const base = assigned.reduce((sum,task) => sum + Number(task.plannedHours || 0) / Math.max(1,task.duration),0);
  const weeks = Array.from({length:4},(_,week) => Math.round(Math.max(0,Math.min(145, base / Math.max(1,resource.capacity) * 100 + ((index * 13 + week * 17) % 28) - 8))));
  if (resource.absence.length) weeks[2] = 0;
  return { resource, weeks, max:Math.max(...weeks), absent:resource.absence.length > 0 };
});
const capacityBars = () => `<div class="aps-capacity-bars">${capacityRows().filter(item => item.resource.kind.includes('Internal')).map(item => `<div><span>${escapeHtml(item.resource.name)}<small>${item.resource.department} · ${item.resource.location}${item.absent?' · assenza pianificata':''}</small></span><i><em class="${item.max>100?'over':''}" style="width:${Math.min(100,item.max)}%"></em></i><b>${item.max}%</b></div>`).join('')}</div>`;
const studioFinancePanel = () => { const groups = Object.groupBy ? Object.groupBy(visibleProjects(),item => item.studio) : visibleProjects().reduce((all,item)=>((all[item.studio]??=[]).push(item),all),{}); return `<section class="aps-panel"><header><div><small>MULTI SOCIETÀ</small><h2>Andamento per studio</h2></div><button class="aps-link" data-go="finance">Apri economia</button></header><div class="aps-studio-finance">${Object.entries(groups).map(([studio,projects]) => { const revenue=projects.reduce((s,p)=>s+p.revenue,0); const margin=projects.reduce((s,p)=>s+projectKpis(p).margin,0); return `<article><span><b>${studio}</b><small>${projects.length} commesse · ${money(revenue)}</small></span><i><em style="width:${Math.max(4,Math.round(margin/Math.max(1,revenue)*100))}%"></em></i><strong>${Math.round(margin/Math.max(1,revenue)*100)}%</strong></article>`; }).join('')}</div></section>`; };
const statRowClient = (project,kpi) => `<div class="aps-stats">${stat('Avanzamento',`${kpi.progress}%`,'piano condiviso')}${stat('Inizio',dateLabel(project.start),'contrattuale')}${stat('Fine prevista',dateLabel(project.end),'corrente')}${stat('Milestone',state.tasks.filter(item=>item.project===project.code&&['Approval','Payment','Milestone'].includes(item.type)).length,'condivise')}</div>`;

function dashboardView() {
  const project = projectByCode(selectedProject);
  const kpi = projectKpis(project);
  const delayed = leafTasks(project.code).filter(task => task.progress < 100 && taskEnd(task) < iso(new Date())).length;
  const active = visibleProjects().filter(item => ['Active','Planning'].includes(item.status));
  const health = `<section class="aps-panel aps-progress-card"><header><div><small>PROJECT HEALTH</small><h2>${project.code} · ${escapeHtml(project.name)}</h2></div><span class="aps-status ${project.status.toLowerCase().replace(' ','-')}">${project.status}</span></header><div class="aps-ring" style="--p:${kpi.progress}"><span><b>${kpi.progress}%</b><small>completato</small></span></div><div class="aps-health-lines"><p><span>Tempo</span><i><em style="width:${Math.min(100,kpi.progress + 8)}%"></em></i><b>${Math.min(100,kpi.progress + 8)}%</b></p>${profile() !== 'client' ? `<p><span>Ore</span><i><em style="width:${Math.min(100,kpi.actual / Math.max(1,kpi.planned) * 100)}%"></em></i><b>${Math.round(kpi.actual / Math.max(1,kpi.planned) * 100)}%</b></p>` : ''}${can('viewExternalCosts') ? `<p><span>Budget esterno</span><i><em style="width:${Math.round(project.externalCosts / Math.max(1,project.budget) * 100)}%"></em></i><b>${Math.round(project.externalCosts / Math.max(1,project.budget) * 100)}%</b></p>` : ''}</div></section>`;
  if (profile() === 'resource') {
    const mine = state.tasks.filter(task => task.assignee === currentResourceId() && task.type !== 'Summary');
    const submitted = state.timesheets.filter(item => item.resource === currentResourceId()).reduce((sum,item) => sum + item.hours,0);
    return `${heading('Il mio lavoro','Attività assegnate, scadenze e consuntivi personali.',projectSelect())}<div class="aps-stats">${stat('Task assegnate',mine.length,'su progetti visibili')}${stat('In scadenza',mine.filter(item => item.progress < 100).length,'da completare','warn')}${stat('Ore registrate',`${submitted} h`,'settimana demo')}${stat('Richieste in verifica',state.timesheets.filter(item => item.resource === currentResourceId() && item.status === 'Inviato').length,'consuntivi')}</div><div class="aps-grid aps-grid-dashboard">${health}<section class="aps-panel"><header><div><small>LE MIE ATTIVITÀ</small><h2>Prossime consegne</h2></div><button class="aps-link" data-go="plan">Apri piano</button></header><div class="aps-project-list">${mine.map(item => `<button data-task="${item.id}"><span><b>${item.wbs} · ${escapeHtml(item.title)}</b><small>${item.project} · ${item.phase}</small></span><i><em style="width:${item.progress}%"></em></i><strong>${item.progress}%</strong></button>`).join('')}</div></section></div>`;
  }
  if (profile() === 'resource_manager') {
    return `${heading('Resource control','Disponibilità globale, assenze, richieste e sovrallocazioni.')}<div class="aps-stats">${stat('Pool risorse',state.resources.length,'tutte le società')}${stat('Sovrallocazioni',capacityRows().filter(item => item.max > 100).length,'richiedono intervento','alert')}${stat('Assenze',state.resources.reduce((sum,item) => sum + item.absence.length,0),'pianificate')}${stat('Richieste aperte',state.requests.filter(item => item.status !== 'Assegnata').length,'da gestire','warn')}</div><div class="aps-grid"><section class="aps-panel aps-wide"><header><div><small>CAPACITY</small><h2>Carico delle risorse</h2></div><button class="aps-primary" data-go="resources">Gestisci pool</button></header>${capacityBars()}</section></div>`;
  }
  if (profile() === 'finance_direction') {
    const projects = visibleProjects(); const revenue = projects.reduce((sum,item)=>sum+item.revenue,0); const ext=projects.reduce((sum,item)=>sum+item.externalCosts,0); const internal=projects.reduce((sum,item)=>sum+projectKpis(item).internalCost,0);
    return `${heading('Controllo direzionale','Portfolio economico multi-società, scostamenti e marginalità.')}<div class="aps-stats">${stat('Fatturato',money(revenue),'tutte le commesse')}${stat('Costi esterni',money(ext),'consulenti e servizi')}${stat('Costo interno',money(internal),'valore medio risorse')}${stat('Margine previsto',money(revenue-ext-internal),`${Math.round((revenue-ext-internal)/Math.max(1,revenue)*100)}%`,'dark')}</div>${studioFinancePanel()} `;
  }
  if (profile() === 'client') {
    return `${heading(`Cronoprogramma · ${project.name}`,'Vista condivisa in sola lettura. Dati interni, risorse e costi sono esclusi.')}${statRowClient(project,kpi)}<div class="aps-grid aps-grid-dashboard">${health}<section class="aps-panel"><header><div><small>MILESTONE CONDIVISE</small><h2>Approvazioni e pagamenti</h2></div></header><div class="aps-request-list">${state.tasks.filter(item => item.project === project.code && ['Approval','Payment','Milestone'].includes(item.type)).map(item => `<article><span><b>${escapeHtml(item.title)}</b><small>${dateLabel(taskEnd(item))} · ${item.phase}</small></span><em>${item.progress}%</em></article>`).join('')}</div></section></div>`;
  }
  return `${heading('Controllo progetti','Tempi, capacità, costi e avanzamento in un’unica vista.')}<div class="aps-section-controls">${projectSelect()}</div><div class="aps-stats">${stat('Avanzamento',`${kpi.progress}%`,'media attività')}${stat('Ore pianificate',`${kpi.planned} h`,`${kpi.actual} h consuntivate`)}${stat('Task in ritardo',delayed,'rispetto al piano',delayed ? 'alert' : '')}${stat('Scostamento ore',`${kpi.actual-kpi.planned>0?'+':''}${kpi.actual-kpi.planned} h`,'actual vs planned',kpi.actual>kpi.planned?'warn':'')}${canSeeCosts()?stat('Margine previsto',`${kpi.marginPct}%`,money(kpi.margin),'dark'):''}</div><div class="aps-grid aps-grid-dashboard">${health}<section class="aps-panel"><header><div><small>PORTFOLIO</small><h2>Commesse accessibili</h2></div><strong>${active.length}</strong></header><div class="aps-project-list">${active.map(item => { const values=projectKpis(item); return `<button data-project="${item.code}"><span><b>${item.code}</b><small>${escapeHtml(item.name)} · ${item.studio}</small></span><i><em style="width:${values.progress}%"></em></i><strong>${values.progress}%</strong></button>`; }).join('')}</div></section>${can('manageResources')?`<section class="aps-panel aps-wide"><header><div><small>CAPACITY</small><h2>Carico delle risorse</h2></div><button class="aps-link" data-go="resources">Apri risorse</button></header>${capacityBars()}</section>`:''}</div>`;
}

function filteredTasks() {
  return state.tasks.filter(task => task.project === selectedProject
    && (profile() !== 'resource' || task.type === 'Summary' || task.assignee === currentResourceId())
    && (profile() !== 'client' || ['Summary','Approval','Payment','Milestone'].includes(task.type) || task.clientVisible)
    && (phaseFilter === 'all' || task.phase === phaseFilter)
    && (resourceFilter === 'all' || task.assignee === resourceFilter));
}
function planToolbar() {
  const phases = [...new Set(state.tasks.filter(task => task.project === selectedProject).map(task => task.phase))];
  return `<div class="aps-filterbar"><label><span>Fase</span><select id="aps-phase-filter"><option value="all">Tutte le fasi</option>${phases.map(value => `<option ${value === phaseFilter ? 'selected' : ''}>${value}</option>`).join('')}</select></label>${profile()!=='client'?`<label><span>Risorsa</span><select id="aps-resource-filter"><option value="all">Tutte le risorse</option>${state.resources.map(item => `<option value="${item.id}" ${item.id === resourceFilter ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>`:''}<label><span>Raggruppa</span><select id="aps-group-filter"><option value="none">Nessun gruppo</option>${[['phase','Fase'],['assignee','Assegnatario'],['type','Tipo'],['progress','Stato']].map(([value,label])=>`<option value="${value}" ${value===groupFilter?'selected':''}>${label}</option>`).join('')}</select></label><div class="aps-segments">${[['list','Elenco'],['gantt','Gantt'],['board','Kanban']].map(([id,label]) => `<button data-view="${id}" class="${planView === id ? 'on' : ''}">${label}</button>`).join('')}</div></div>`;
}
function listView() {
  const tasks = filteredTasks();
  const row = task => `<tr data-task="${task.id}" class="${task.type==='Summary'?'summary':''}"><td><span class="aps-wbs">${task.wbs}</span><b>${escapeHtml(task.title)}</b><small>${task.type} · ${task.discipline}${task.contractualFee?` · ${money(task.contractualFee)}`:''}</small></td><td>${task.phase}</td><td>${profile()==='client'?'—':escapeHtml(resourceName(task.assignee))}</td><td>${dateLabel(task.start)}</td><td>${dateLabel(taskEnd(task))}${task.finishTime?` · ${task.finishTime}`:''}</td><td>${task.duration} ${task.calendar==='working'?'gg lav.':'gg sol.'}</td><td>${task.predecessor?`${task.relation}${task.lag?` +${task.lag}g`:''}`:'—'}</td><td><div class="aps-progress"><i><em style="width:${task.progress}%"></em></i><b>${task.progress}%</b></div></td></tr>`;
  let body = tasks.map(row).join('');
  if (groupFilter !== 'none') { const key = task => groupFilter === 'assignee' ? resourceName(task.assignee) : groupFilter === 'progress' ? task.progress===100?'Completate':task.progress?'In lavorazione':'Da iniziare' : task[groupFilter]; const groups=tasks.reduce((all,task)=>((all[key(task)]??=[]).push(task),all),{}); body=Object.entries(groups).map(([name,items])=>`<tr class="aps-group-row"><td colspan="8">${escapeHtml(name)} <b>${items.length}</b></td></tr>${items.map(row).join('')}`).join(''); }
  return `<div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>WBS / Attività</th><th>Fase</th><th>Responsabile</th><th>Inizio</th><th>Fine</th><th>Durata</th><th>Legame</th><th>Avanzamento</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function ganttView() {
  const tasks = filteredTasks();
  if (!tasks.length) return '<div class="aps-empty">Nessuna attività con questi filtri.</div>';
  const min = tasks.map(task => task.start).sort()[0];
  const max = tasks.map(taskEnd).sort().at(-1);
  const total = Math.max(45, diffDays(min,max) + 10);
  const scale = 30;
  const weeks = Array.from({ length:Math.ceil(total / 7) }, (_, index) => addDays(min,index * 7));
  return `<div class="aps-gantt"><div class="aps-gantt-labels"><header>ATTIVITÀ</header>${tasks.map(task => `<button data-task="${task.id}" class="${task.type === 'Summary' ? 'summary' : ''}"><small>${task.wbs}</small><span>${escapeHtml(task.title)}</span></button>`).join('')}</div><div class="aps-gantt-scroll"><div class="aps-gantt-canvas" style="width:${total * scale}px"><header>${weeks.map(value => `<span style="width:${7 * scale}px">${dateLabel(value).replace(/\s\d{4}$/,'')}</span>`).join('')}</header>${tasks.map(task => { const left = diffDays(min,task.start) * scale; const width = Math.max(scale, (diffDays(task.start,taskEnd(task)) + 1) * scale); const remaining=100-task.progress; return `<div class="aps-gantt-row"><button data-task="${task.id}" class="aps-gantt-bar ${task.type.toLowerCase()}" style="left:${left}px;width:${width}px"><i style="width:${task.progress}%"></i>${task.progress?`<span class="aps-gantt-value done" style="left:0;width:${task.progress}%">${task.progress}%</span>`:''}${remaining?`<span class="aps-gantt-value remaining" style="left:${task.progress}%;width:${remaining}%">${remaining}%</span>`:''}</button></div>`; }).join('')}</div></div></div>`;
}
function boardView() {
  const tasks = filteredTasks().filter(task => task.type !== 'Summary');
  const columns = [['todo','Da iniziare',task => task.progress === 0],['doing','In lavorazione',task => task.progress > 0 && task.progress < 80],['review','In verifica',task => task.progress >= 80 && task.progress < 100],['done','Completate',task => task.progress === 100]];
  return `<div class="aps-board">${columns.map(([id,label,test]) => `<section><header><span>${label}</span><b>${tasks.filter(test).length}</b></header>${tasks.filter(test).map(task => `<button data-task="${task.id}"><small>${task.wbs} · ${task.phase}</small><b>${escapeHtml(task.title)}</b><span>${escapeHtml(resourceName(task.assignee))}</span><i><em style="width:${task.progress}%"></em></i></button>`).join('')}</section>`).join('')}</div>`;
}
function planPage() {
  const actions = canPlan() ? '<button class="aps-secondary" id="aps-undo">Annulla</button><button class="aps-secondary" id="aps-schedule">Ricalcola</button><button class="aps-primary" id="aps-new-task">+ Attività</button>' : '';
  return `${heading('Piano di progetto','WBS contrattuale, attività operative, dipendenze e avanzamento.',actions)}<div class="aps-section-controls">${projectSelect()}</div>${planToolbar()}<section class="aps-panel aps-plan-panel">${planView === 'list' ? listView() : planView === 'board' ? boardView() : ganttView()}</section>`;
}

function resourcesPage() {
  const weeks = ['27 ott','3 nov','10 nov','17 nov'];
  const rows=capacityRows();
  const actions = profile()==='project_manager'?'<button class="aps-primary" id="aps-request-resource">+ Richiedi risorsa</button>':can('manageResources')?'<button class="aps-secondary" id="aps-new-absence">+ Ferie / permesso</button><button class="aps-primary" id="aps-new-resource">+ Risorsa</button>':'';
  return `${heading('Risorse e capacità','Pool unico multi-società, disponibilità futura, assenze e richieste.',actions)}
    <div class="aps-stats">${stat('Risorse nel pool',state.resources.length,'interne, esterne e generiche')}${stat('Sovrallocazioni',rows.filter(item=>item.max>100).length,'da risolvere','alert')}${stat('Assenze pianificate',state.resources.reduce((sum,item)=>sum+item.absence.length,0),'ferie e permessi')}${stat('Richieste aperte',state.requests.filter(item=>item.status!=='Assegnata').length,'al Resource Manager')}</div>
    <section class="aps-panel"><header><div><small>CAPACITY PLANNING</small><h2>Allocazione prossime quattro settimane</h2></div><span class="aps-legend"><i></i>Disponibile <i></i>Critica <i></i>Assenza</span></header><div class="aps-capacity-table"><div class="aps-capacity-head"><span>Risorsa</span>${weeks.map(week=>`<b>${week}</b>`).join('')}</div>${rows.map(({resource,weeks:values})=>`<button data-resource="${resource.id}"><span><b>${escapeHtml(resource.name)}</b><small>${resource.kind} · ${resource.company} · ${resource.location}</small></span>${values.map((value,index)=>{const absent=resource.absence.length&&index===2;return `<i class="${absent?'absence':value>100?'over':value>90?'warn':''}">${absent?'ASSENTE':`${value}%`}</i>`}).join('')}</button>`).join('')}</div></section>
    <div class="aps-grid aps-spaced-grid"><section class="aps-panel"><header><div><small>RICHIESTE</small><h2>Risorse supplementari</h2></div><strong>${state.requests.length}</strong></header><div class="aps-request-list">${state.requests.map(item=>`<article><span><b>${item.profile}</b><small>${item.project} · ${item.department} · ${item.hours} h · richiesta da ${item.requestedBy}</small></span>${can('manageResources')&&item.status!=='Assegnata'?`<button class="aps-mini" data-request-assign="${item.id}">Assegna</button>`:`<em>${item.status}</em>`}</article>`).join('')}</div></section><section class="aps-panel"><header><div><small>TIPOLOGIE</small><h2>Composizione del pool</h2></div></header><div class="aps-donut-set">${['Internal · Nominal','Internal · Generic','External · Nominal','External · Generic'].map((kind,index)=>{const count=state.resources.filter(item=>item.kind===kind).length;return `<div><span style="--v:${count/state.resources.length*100};--c:${['#7f9185','#b9bfba','#bb9466','#a96868'][index]}"><b>${count}</b></span><small>${kind.replace(' · ',' ')}</small></div>`}).join('')}</div></section></div>`;
}

function baselinePage() {
  const baseline = state.baselines.find(item => item.project === selectedProject && item.active);
  const project = projectByCode(selectedProject);
  const tasks = state.tasks.filter(task => task.project === selectedProject && task.type !== 'Summary');
  return `${heading('Baseline e avanzamento','Confronta la previsione contrattuale con il piano corrente.',`${canPlan() ? '<button class="aps-secondary" id="aps-baseline-increment">Aggiorna nuove attività</button><button class="aps-primary" id="aps-capture-baseline">Scatta baseline</button>' : ''}`)}
    <div class="aps-section-controls">${projectSelect()}</div>
    ${baseline ? `<div class="aps-baseline-banner"><span><small>BASELINE ATTIVA</small><b>${baseline.name}</b></span><span>Creata ${new Date(baseline.date).toLocaleString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span><em>${baseline.tasks.length} attività congelate</em></div>` : '<div class="aps-empty aps-baseline-empty"><b>Nessuna baseline salvata</b><span>Salva la pianificazione contrattuale per misurare gli scostamenti futuri.</span></div>'}
    <section class="aps-panel"><header><div><small>VARIANZE</small><h2>${project.code} · ${escapeHtml(project.name)}</h2></div></header><div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>Attività</th><th>Fine baseline</th><th>Fine corrente</th><th>Slittamento</th><th>Avanzamento</th></tr></thead><tbody>${tasks.map(task => { const old = baseline?.tasks.find(item => item.id === task.id); const slip = old ? diffDays(old.end,taskEnd(task)) : null; return `<tr data-task="${task.id}"><td><b>${task.wbs} · ${escapeHtml(task.title)}</b><small>${task.phase}</small></td><td>${old ? dateLabel(old.end) : 'Nuova attività'}</td><td>${dateLabel(taskEnd(task))}</td><td><span class="aps-variance ${slip > 0 ? 'late' : slip < 0 ? 'early' : ''}">${slip == null ? '—' : slip > 0 ? `+${slip} gg` : `${slip} gg`}</span></td><td>${task.progress}%</td></tr>`; }).join('')}</tbody></table></div></section>`;
}

function timesheetsPage() {
  const own = profile()==='resource';
  const rows = state.timesheets.filter(item => !own || item.resource===currentResourceId()).filter(item => visibleProjectCodes().includes(item.project));
  const total = rows.reduce((sum,item)=>sum+Number(item.hours),0);
  const pending = rows.filter(item=>item.status==='Inviato').length;
  return `${heading('Ore e consuntivi',own?'Registra il lavoro sulle attività assegnate.':'Controlla, approva e collega le ore alla pianificazione.',own?'<button class="aps-primary" id="aps-new-time">+ Registra ore</button>':'')}
    <div class="aps-stats">${stat('Ore registrate',`${total} h`,'periodo demo')}${stat('Da approvare',pending,'consuntivi','warn')}${stat('Approvate',rows.filter(item=>item.status==='Approvato').length,'registrazioni')}${stat('Progetti',new Set(rows.map(item=>item.project)).size,'coinvolti')}</div>
    <section class="aps-panel"><div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>Data / risorsa</th><th>Progetto</th><th>Attività</th><th>Descrizione</th><th>Ore</th><th>Stato</th>${can('approveTime')?'<th>Verifica</th>':''}</tr></thead><tbody>${rows.map(item=>{const task=state.tasks.find(task=>task.id===item.task);return `<tr><td><b>${dateLabel(item.date)}</b><small>${escapeHtml(resourceName(item.resource))}</small></td><td>${item.project}</td><td>${task?`${task.wbs} · ${escapeHtml(task.title)}`:'Attività generale'}</td><td>${escapeHtml(item.note)}</td><td><b>${item.hours} h</b></td><td><span class="aps-status ${item.status==='Approvato'?'active':item.status==='Respinto'?'on-hold':'planning'}">${item.status}</span></td>${can('approveTime')?`<td>${item.status==='Inviato'?`<button class="aps-mini" data-time-approve="${item.id}">Approva</button><button class="aps-mini muted" data-time-reject="${item.id}">Correggi</button>`:'—'}</td>`:''}</tr>`}).join('')}</tbody></table></div></section>`;
}

function financePage() {
  const projects = profile()==='project_manager' ? visibleProjects() : state.projects;
  const filtered = projects.filter(project => financeFilter==='all' || (financeFilter==='to-collect' && state.tasks.some(task=>task.project===project.code&&task.type==='Payment'&&task.progress<100)) || (financeFilter==='external' && project.externalCosts>0) || (financeFilter==='low-margin' && projectKpis(project).marginPct<55));
  const revenue=projects.reduce((sum,item)=>sum+item.revenue,0); const external=projects.reduce((sum,item)=>sum+item.externalCosts,0); const internal=projects.reduce((sum,item)=>sum+projectKpis(item).internalCost,0); const margin=revenue-external-internal;
  return `${heading('Economia di commessa',canSeeCosts()?'Controllo completo di ricavi, costi interni, consulenti e marginalità.':'Valori contrattuali, milestone di pagamento e soli costi esterni.',`${can('manageFinance')||profile()==='project_manager'?'<button class="aps-primary" id="aps-new-external">+ Costo esterno</button>':''}`)}
    <div class="aps-section-controls">${projectSelect()}</div>
    <div class="aps-stats">${stat('Valore contrattuale',money(revenue),'portfolio visibile')}${stat('Consulenti esterni',money(external),'pacchetti e ore')}${canSeeCosts()?stat('Costo interno',money(internal),'riservato Finance'):stat('Ore pianificate',`${projects.reduce((sum,item)=>sum+projectKpis(item).planned,0)} h`,'senza costo interno')}${canSeeCosts()?stat('Margine',money(margin),`${Math.round(margin/Math.max(1,revenue)*100)}%`,'dark'):stat('Contratti firmati',projects.filter(item=>item.contractSigned).length,'commesse')}</div>
    <div class="aps-filterbar"><label><span>Vista economica</span><select id="aps-finance-filter"><option value="all">Tutte le commesse</option><option value="to-collect" ${financeFilter==='to-collect'?'selected':''}>Da incassare</option><option value="external" ${financeFilter==='external'?'selected':''}>Con costi esterni</option>${canSeeCosts()?`<option value="low-margin" ${financeFilter==='low-margin'?'selected':''}>Margine sotto soglia</option>`:''}</select></label></div>
    <div class="aps-grid"><section class="aps-panel aps-wide"><header><div><small>COMMESSE</small><h2>Quadro economico</h2></div></header><div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>Progetto</th><th>Contratto</th><th>Fatturato</th><th>Costi esterni</th><th>Ore</th>${canSeeCosts()?'<th>Costo interno</th><th>Margine</th>':''}</tr></thead><tbody>${filtered.map(project=>{const kpi=projectKpis(project);return `<tr data-project-detail="${project.code}"><td><b>${project.code} · ${escapeHtml(project.name)}</b><small>${project.studio} · ${project.executor}</small></td><td>${project.contractSigned?'Firmato':'In definizione'}<small>${project.contractFile||'Nessun PDF'}</small></td><td>${money(project.revenue)}</td><td>${money(project.externalCosts)}</td><td>${kpi.actual} / ${kpi.planned} h</td>${canSeeCosts()?`<td>${money(kpi.internalCost)}</td><td><b>${money(kpi.margin)}</b><small>${kpi.marginPct}%</small></td>`:''}</tr>`}).join('')}</tbody></table></div></section><section class="aps-panel"><header><div><small>PAGAMENTI</small><h2>Milestone contrattuali</h2></div></header><div class="aps-request-list">${state.tasks.filter(task=>task.type==='Payment'&&projects.some(project=>project.code===task.project)).map(task=>`<article><span><b>${task.project} · ${escapeHtml(task.title)}</b><small>Scadenza ${dateLabel(taskEnd(task))}</small></span><em class="aps-payment ${task.progress===100?'paid':task.progress>0?'partial':'due'}">${task.progress===100?'Pagato':task.progress>0?'Parziale':'Da pagare'} · ${money(task.contractualFee||0)}</em></article>`).join('')||'<p class="aps-copy">Nessuna milestone di pagamento nel filtro corrente.</p>'}</div></section><section class="aps-panel"><header><div><small>CONSULENTI</small><h2>Contratti esterni</h2></div></header><div class="aps-request-list">${state.externalContracts.filter(item=>projects.some(project=>project.code===item.project)).map(item=>`<article><span><b>${item.supplier}</b><small>${item.project} · ${item.model}${item.purchasedHours?` · ${item.usedHours}/${item.purchasedHours} h`:''}</small></span><em>${money(item.amount)}</em></article>`).join('')}</div></section>${canSeeCosts()?`<section class="aps-panel"><header><div><small>INTERCOMPANY</small><h2>Ripartizioni tra società</h2></div></header><div class="aps-request-list">${state.intercompany.map(item=>`<article><span><b>${item.project} · ${item.executor}</b><small>Owner ${item.owner} · ${item.hours} h</small></span><em>${item.revenueShare}% ricavi</em></article>`).join('')}</div></section>`:''}</div>`;
}

function adminPage() {
  return `${heading('PMO e standard','Template, nomenclature, calendari, pubblicazioni e ciclo di vita dei progetti.','<button class="aps-primary" id="aps-new-from-template">+ Progetto da template</button>')}
    <div class="aps-stats">${stat('Template',state.templates.length,'modelli disponibili')}${stat('Campi progetto','21','dizionario enterprise')}${stat('Calendari',state.calendars.length,'sedi e solare')}${stat('Da pubblicare',state.projects.filter(item=>item.governanceStatus==='Draft').length,'progetti','warn')}</div>
    <div class="aps-grid"><section class="aps-panel"><header><div><small>TEMPLATE</small><h2>Modelli di progetto</h2></div></header><div class="aps-request-list">${state.templates.map(item=>`<article><span><b>${escapeHtml(item.name)}</b><small>${item.typology} · ${item.phases.length} fasi · ${item.tasks} attività</small></span><em>${item.status}</em></article>`).join('')}</div></section><section class="aps-panel"><header><div><small>CALENDARI</small><h2>Orari e sedi</h2></div></header><div class="aps-request-list">${state.calendars.map(item=>`<article><span><b>${item.name}</b><small>${item.studios.join(', ')}</small></span><em>${item.hours} h/g</em></article>`).join('')}</div></section><section class="aps-panel aps-wide"><header><div><small>GOVERNANCE</small><h2>Pubblicazione, chiusura e archiviazione</h2></div></header><div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>Progetto</th><th>Template</th><th>Stato</th><th>Ultima pubblicazione</th><th>Azioni</th></tr></thead><tbody>${state.projects.map(project=>{const publication=state.publications.filter(item=>item.project===project.code).at(-1);return `<tr><td><b>${project.code} · ${escapeHtml(project.name)}</b><small>${project.manager}</small></td><td>${state.templates.find(item=>item.id===project.template)?.name||'—'}</td><td><span class="aps-status ${project.status.toLowerCase().replace(' ','-')}">${project.governanceStatus}</span></td><td>${publication?`${dateLabel(publication.date.slice(0,10))}<small>${publication.by}</small>`:'Mai'}</td><td><button class="aps-mini" data-publish="${project.code}">Pubblica</button><button class="aps-mini muted" data-archive="${project.code}">${project.status==='Archived'?'Ripristina':'Archivia'}</button></td></tr>`}).join('')}</tbody></table></div></section><section class="aps-panel"><header><div><small>DIZIONARI</small><h2>Campi Enterprise</h2></div></header><div class="aps-governance"><div><article><b>Progetto</b><span>Business Unit, Client, Budget, superfici, categoria, codice, società, PM, owner, priorità, stato, tipologia, promoter, sponsor, revenue.</span></article><article><b>Attività</b><span>Agreement, categoria, disciplina, milestone status e fase.</span></article><article><b>Risorsa</b><span>Società, dipartimento, tipologia, sede e responsabile.</span></article></div></div></section><section class="aps-panel"><header><div><small>MIGRAZIONE</small><h2>Import vecchio sistema</h2></div></header><p class="aps-copy">Wizard dimostrativo per ricreare o importare gli 80/90 progetti attivi, con validazione dei campi e report anomalie.</p><button class="aps-secondary" id="aps-legacy-import">Avvia simulazione</button></section></div>`;
}

function usersPage() {
  const permissions=['viewAllProjects','editPlan','manageResources','approveTime','manageStandards','viewSales','viewExternalCosts','viewInternalCosts','manageFinance','manageUsers','publish','share'];
  return `${heading('Utenti e permessi','Account demo, ruoli professionali e profili applicativi separati.','<button class="aps-primary" id="aps-new-user">+ Utente</button>')}
    <section class="aps-panel"><div class="aps-table-wrap"><table class="aps-table"><thead><tr><th>Utente</th><th>Ruolo professionale</th><th>Profilo piattaforma</th><th>Società</th><th>Stato</th></tr></thead><tbody>${state.users.map(user=>`<tr data-user="${user.id}"><td><b>${escapeHtml(user.name)}</b><small>${user.email}</small></td><td>${user.professional}</td><td>${PLATFORM_PROFILES[user.profile]?.label||user.profile}</td><td>${user.company}</td><td><span class="aps-status ${user.active?'active':'on-hold'}">${user.active?'Attivo':'Sospeso'}</span></td></tr>`).join('')}</tbody></table></div></section>
    <section class="aps-panel"><header><div><small>MATRICE RBAC</small><h2>Permessi effettivi per profilo</h2></div></header><div class="aps-permission-matrix"><table><thead><tr><th>Profilo</th>${permissions.map(item=>`<th>${item.replace(/[A-Z]/g,m=>` ${m}`).toLowerCase()}</th>`).join('')}</tr></thead><tbody>${Object.entries(PLATFORM_PROFILES).map(([id,item])=>`<tr><td><b>${item.label}</b></td>${permissions.map(permission=>`<td class="${({viewAllProjects:['resource_manager','pmo_admin','finance_direction','platform_owner'],editPlan:['project_manager','pmo_admin','platform_owner'],manageResources:['resource_manager','pmo_admin','platform_owner'],approveTime:['project_manager','pmo_admin','platform_owner'],manageStandards:['pmo_admin','platform_owner'],viewSales:['project_manager','pmo_admin','finance_direction','platform_owner'],viewExternalCosts:['project_manager','pmo_admin','finance_direction','platform_owner'],viewInternalCosts:['finance_direction','platform_owner'],manageFinance:['finance_direction','platform_owner'],manageUsers:['platform_owner'],publish:['project_manager','pmo_admin','platform_owner'],share:['project_manager','pmo_admin','platform_owner']}[permission]||[]).includes(id)?'yes':''}">${({viewAllProjects:['resource_manager','pmo_admin','finance_direction','platform_owner'],editPlan:['project_manager','pmo_admin','platform_owner'],manageResources:['resource_manager','pmo_admin','platform_owner'],approveTime:['project_manager','pmo_admin','platform_owner'],manageStandards:['pmo_admin','platform_owner'],viewSales:['project_manager','pmo_admin','finance_direction','platform_owner'],viewExternalCosts:['project_manager','pmo_admin','finance_direction','platform_owner'],viewInternalCosts:['finance_direction','platform_owner'],manageFinance:['finance_direction','platform_owner'],manageUsers:['platform_owner'],publish:['project_manager','pmo_admin','platform_owner'],share:['project_manager','pmo_admin','platform_owner']}[permission]||[]).includes(id)?'✓':'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
    <section class="aps-panel"><header><div><small>AUDIT</small><h2>Log applicativo</h2></div></header><div class="aps-request-list">${state.audit.map(item=>`<article><span><b>${escapeHtml(item.action)}</b><small>${item.actor} · ${item.target}</small></span><em>${new Date(item.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</em></article>`).join('')}</div></section>`;
}

function portfolioPage() {
  const accessible = visibleProjects();
  const projects = accessible.filter(item => (portfolioStatus==='all'||item.status===portfolioStatus) && (portfolioCompany==='all'||item.executor===portfolioCompany));
  const totalRevenue = accessible.reduce((sum,item) => sum + item.revenue,0);
  const totalExternal = accessible.reduce((sum,item) => sum + item.externalCosts,0);
  const margin = accessible.reduce((sum,item) => sum + projectKpis(item).margin,0);
  return `${heading('Portfolio','Vista globale multi-società con filtri e accessi regolati dal profilo.',canPlan()?'<button class="aps-primary" id="aps-new-project">+ Nuovo progetto</button>':'')}
    <div class="aps-stats">${stat('Progetti',accessible.length,'visibili al profilo')}${stat('Attivi',accessible.filter(item => item.status==='Active').length,'in produzione')}${can('viewSales')?stat('Fatturato',money(totalRevenue),'valore contrattuale'):stat('Ore complessive',`${accessible.reduce((sum,item)=>sum+item.internalHours,0).toLocaleString('it-IT')} h`,'portfolio')}${canSeeCosts()?stat('Margine previsto',money(margin),`${money(totalExternal)} costi esterni`,'dark'):stat('Società',new Set(accessible.map(item=>item.executor)).size,'nel perimetro')}</div>
    <div class="aps-filterbar"><label><span>Stato progetto</span><select id="aps-portfolio-status"><option value="all">Tutti gli stati</option>${['Planning','Active','On Hold','Completed','Archived'].map(item=>`<option ${item===portfolioStatus?'selected':''}>${item}</option>`).join('')}</select></label><label><span>Società</span><select id="aps-company-filter"><option value="all">Tutte le società</option>${state.companies.map(item=>`<option ${item.name===portfolioCompany?'selected':''}>${escapeHtml(item.name)}</option>`).join('')}</select></label></div>
    <section class="aps-panel"><div class="aps-table-wrap"><table class="aps-table aps-portfolio-table"><thead><tr><th>Progetto</th><th>Società / studio</th><th>Cliente</th><th>PM / Sponsor</th><th>Stato</th><th>Periodo</th><th>Progresso</th>${canSeeCosts()?'<th>Margine</th>':''}</tr></thead><tbody>${projects.map(project => { const kpi=projectKpis(project); return `<tr data-project-detail="${project.code}"><td><b>${project.code} · ${escapeHtml(project.name)}</b><small>${project.category} · ${project.typology}</small></td><td>${project.executor}<small>${project.studio}</small></td><td>${escapeHtml(project.client)}<small>${project.clientType}</small></td><td>${project.manager}<small>Sponsor · ${project.sponsor}</small></td><td><span class="aps-status ${project.status.toLowerCase().replace(' ','-')}">${project.status}</span>${project.onHoldReason?`<small>${project.onHoldReason}</small>`:''}</td><td>${dateLabel(project.start)}<small>${dateLabel(project.end)}</small></td><td><div class="aps-progress"><i><em style="width:${kpi.progress}%"></em></i><b>${kpi.progress}%</b></div></td>${canSeeCosts()?`<td><b>${money(kpi.margin)}</b><small>${kpi.marginPct}%</small></td>`:''}</tr>`; }).join('')}</tbody></table></div></section>`;
}

function sharePage() {
  return `${heading('Condivisione e interscambio','Report, link in sola lettura e compatibilità con gli strumenti esterni.')}
    <div class="aps-share-grid">
      <button id="aps-share-link"><span>${navIcon('share')}</span><div><small>CLIENTE</small><b>Link pubblico in sola lettura</b><p>Genera una vista filtrata del cronoprogramma senza dati economici o interni.</p></div><em>Crea link</em></button>
      <button id="aps-print"><span>${navIcon('portfolio')}</span><div><small>REPORT</small><b>Stampa / PDF del Gantt</b><p>Prepara una vista chiara per riunioni, contratti e stakeholder.</p></div><em>Esporta</em></button>
      <button id="aps-export-xml"><span>${navIcon('gantt')}</span><div><small>MICROSOFT PROJECT</small><b>Esporta Project XML</b><p>Gerarchia WBS, date, milestone e dipendenze in formato interoperabile.</p></div><em>Scarica XML</em></button>
      <label><span>${navIcon('plan')}</span><div><small>IMPORTAZIONE</small><b>Importa .mpp / XML</b><p>Nella demo il file viene verificato localmente senza inviarlo a servizi esterni.</p></div><em>Scegli file</em><input id="aps-import" type="file" accept=".mpp,.xml"></label>
      <button id="aps-export-json"><span>${navIcon('baseline')}</span><div><small>BACKUP DEMO</small><b>Esporta dati JSON</b><p>Scarica progetti, WBS, risorse, richieste e baseline della simulazione.</p></div><em>Scarica</em></button>
      <button id="aps-reset"><span>${navIcon('dashboard')}</span><div><small>RIPRISTINO</small><b>Ripristina dati dimostrativi</b><p>Elimina soltanto le modifiche della nuova area Pianificazione.</p></div><em>Ripristina</em></button>
    </div>
    <section class="aps-panel aps-governance"><header><div><small>GOVERNANCE</small><h2>Profili applicativi separati dai ruoli professionali</h2></div></header><div>${Object.values(PLATFORM_PROFILES).map(item=>`<article><b>${item.label}</b><span>${item.description}</span></article>`).join('')}</div></section>`;
}

function render() {
  ensureShell(); renderNav();
  const main = document.querySelector('.aps-main');
  main.innerHTML = ({dashboard:dashboardView,plan:planPage,resources:resourcesPage,timesheets:timesheetsPage,baseline:baselinePage,portfolio:portfolioPage,finance:financePage,admin:adminPage,users:usersPage,share:sharePage}[currentTab] || dashboardView)();
  bindPage();
  animatePlanningMetrics();
}

function animatePlanningMetrics() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const candidates = document.querySelectorAll('.aps-main .aps-stat b,.aps-main .aps-ring b,.aps-main .aps-donut-set b,.aps-main .aps-health-lines b,.aps-main .aps-project-list strong,.aps-main .aps-progress b,.aps-main .aps-capacity-table button>i:not(.absence)');
  candidates.forEach(element => {
    const original = element.textContent.trim();
    if (/\b(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\b/i.test(original)) return;
    const match = original.match(/^([^\d+-]*)([+-]?[\d.]+(?:,[\d]+)?)(.*)$/);
    if (!match || /\d/.test(match[3]) || (/[a-z]/i.test(match[3]) && !/^\s*h\b/i.test(match[3]))) return;
    const raw = match[2];
    const target = Number(raw.replace(/\./g,'').replace(',','.'));
    if (!Number.isFinite(target)) return;
    const prefix = match[1];
    const suffix = match[3];
    const decimals = raw.includes(',') ? raw.split(',')[1].length : 0;
    const formatter = new Intl.NumberFormat('it-IT',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
    const setText = value => {
      if (element.childNodes.length === 1 && element.firstChild?.nodeType === Node.TEXT_NODE) element.firstChild.nodeValue = value;
      else element.textContent = value;
    };
    const start = performance.now();
    const frame = now => {
      const progress = Math.min(1,(now-start)/1000);
      const eased = 1-Math.pow(1-progress,3);
      const value = target * eased;
      const displayed = decimals ? value : Math.round(value);
      setText(`${prefix}${formatter.format(displayed)}${suffix}`);
      if (progress < 1) requestAnimationFrame(frame);
      else setText(original);
    };
    requestAnimationFrame(frame);
  });
}

function bindPage() {
  const picker = document.querySelector('#aps-project-picker');
  if (picker) picker.addEventListener('change', event => { selectedProject = event.target.value; render(); });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => { currentTab = button.dataset.go; render(); }));
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => { selectedProject = button.dataset.project; currentTab = 'plan'; render(); }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { planView = button.dataset.view; render(); }));
  document.querySelector('#aps-phase-filter')?.addEventListener('change', event => { phaseFilter = event.target.value; render(); });
  document.querySelector('#aps-resource-filter')?.addEventListener('change', event => { resourceFilter = event.target.value; render(); });
  document.querySelector('#aps-group-filter')?.addEventListener('change', event => { groupFilter = event.target.value; render(); });
  document.querySelector('#aps-portfolio-status')?.addEventListener('change', event => { portfolioStatus = event.target.value; render(); });
  document.querySelector('#aps-company-filter')?.addEventListener('change', event => { portfolioCompany = event.target.value; render(); });
  document.querySelector('#aps-finance-filter')?.addEventListener('change', event => { financeFilter = event.target.value; render(); });
  document.querySelector('#aps-schedule')?.addEventListener('click', () => autoSchedule(selectedProject));
  document.querySelector('#aps-undo')?.addEventListener('click', undo);
  document.querySelector('#aps-new-task')?.addEventListener('click', () => taskModal());
  document.querySelectorAll('[data-task]').forEach(button => button.addEventListener('click', () => taskModal(state.tasks.find(item => item.id === button.dataset.task))));
  document.querySelectorAll('[data-resource]').forEach(button => button.addEventListener('click', () => resourceModal(state.resources.find(item => item.id === button.dataset.resource))));
  document.querySelector('#aps-request-resource')?.addEventListener('click', requestModal);
  document.querySelector('#aps-new-time')?.addEventListener('click', timeModal);
  document.querySelectorAll('[data-time-approve]').forEach(button => button.addEventListener('click',()=>updateTimesheet(button.dataset.timeApprove,'Approvato')));
  document.querySelectorAll('[data-time-reject]').forEach(button => button.addEventListener('click',()=>updateTimesheet(button.dataset.timeReject,'Da correggere')));
  document.querySelectorAll('[data-request-assign]').forEach(button => button.addEventListener('click',()=>assignRequest(button.dataset.requestAssign)));
  document.querySelector('#aps-new-absence')?.addEventListener('click',absenceModal);
  document.querySelector('#aps-new-resource')?.addEventListener('click',resourceCreateModal);
  document.querySelector('#aps-new-external')?.addEventListener('click',externalCostModal);
  document.querySelector('#aps-new-from-template')?.addEventListener('click',templateProjectModal);
  document.querySelector('#aps-legacy-import')?.addEventListener('click',()=>toast('Simulazione completata · 86 progetti analizzati, 79 pronti e 7 da verificare'));
  document.querySelectorAll('[data-publish]').forEach(button => button.addEventListener('click',()=>publishProject(button.dataset.publish)));
  document.querySelectorAll('[data-archive]').forEach(button => button.addEventListener('click',()=>archiveProject(button.dataset.archive)));
  document.querySelectorAll('[data-user]').forEach(row => row.addEventListener('click',()=>userModal(row.dataset.user)));
  document.querySelector('#aps-new-user')?.addEventListener('click',()=>userModal());
  document.querySelector('#aps-capture-baseline')?.addEventListener('click', () => captureBaseline(false));
  document.querySelector('#aps-baseline-increment')?.addEventListener('click', () => captureBaseline(true));
  document.querySelectorAll('[data-project-detail]').forEach(row => row.addEventListener('click', () => projectModal(projectByCode(row.dataset.projectDetail))));
  document.querySelector('#aps-new-project')?.addEventListener('click', () => projectModal());
  document.querySelector('#aps-share-link')?.addEventListener('click', () => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/shared-${selectedProject}`); toast('Link dimostrativo copiato'); });
  document.querySelector('#aps-print')?.addEventListener('click', () => { currentTab = 'plan'; planView = 'gantt'; render(); setTimeout(() => window.print(),100); });
  document.querySelector('#aps-export-json')?.addEventListener('click', () => download(`ARCHEA_PLANNING_${iso(new Date())}.json`, JSON.stringify(state,null,2),'application/json'));
  document.querySelector('#aps-export-xml')?.addEventListener('click', exportProjectXml);
  document.querySelector('#aps-import')?.addEventListener('change', event => { const file = event.target.files?.[0]; if (file) toast(file.name.endsWith('.xml') ? 'Project XML verificato · importazione demo pronta' : 'File .mpp riconosciuto · conversione prevista nella versione con backend'); event.target.value = ''; });
  document.querySelector('#aps-reset')?.addEventListener('click', () => { if (!confirm('Ripristinare i dati demo della Pianificazione?')) return; localStorage.removeItem(STORAGE_KEY); state = structuredClone(demoData); render(); toast('Dati dimostrativi ripristinati'); });
}

function openModal(title, subtitle, body, submitLabel, onSubmit) {
  const modal = document.querySelector('.aps-modal');
  modal.hidden = false;
  modal.innerHTML = `<div class="aps-dialog"><header><div><small>ARCHEA PLANNING</small><h2>${title}</h2><p>${subtitle || ''}</p></div><button class="aps-dialog-close"><span>×</span></button></header><form>${body}<footer><button type="button" class="aps-cancel">Annulla</button>${submitLabel ? `<button class="aps-primary" type="submit">${submitLabel}</button>` : ''}</footer></form></div>`;
  const close = () => { modal.hidden = true; modal.onmousedown = null; modal.innerHTML = ''; modalAction = null; };
  modal.querySelector('.aps-dialog-close').addEventListener('click', close);
  modal.querySelector('.aps-cancel').addEventListener('click', close);
  modal.onmousedown = event => { if (event.target === modal) close(); };
  modal.querySelector('form').addEventListener('submit', event => { event.preventDefault(); onSubmit?.(new FormData(event.target)); close(); });
}

function openSelectPicker(select) {
  const root = document.querySelector('#archea-planning-suite');
  if (!root || !select?.options?.length || select.disabled) return;
  const field = select.closest('label');
  const inlineLabel = field ? [...field.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.nodeValue.trim()).filter(Boolean).join(' ') : '';
  const title = field?.querySelector(':scope > span')?.textContent?.trim() || inlineLabel || select.name || 'Seleziona';
  const options = [...select.options].map(option => ({ value:option.value, label:option.textContent.trim(), selected:option.selected }));
  root.querySelector('.aps-select-layer')?.remove();
  const layer=document.createElement('div');
  layer.className='aps-modal aps-select-layer';
  const optionMeta=option=>{
    const project=state.projects.find(item=>item.code===option.value);
    if(project) return `${project.status} · ${project.studio}`;
    const resource=state.resources.find(item=>item.id===option.value||item.name===option.value);
    if(resource) return `${resource.role} · ${resource.location}`;
    if(option.value==='all'||option.value==='none') return 'Vista completa';
    return '';
  };
  layer.innerHTML = `<div class="aps-dialog aps-select-dialog"><header><div><small>ARCHEA WORKSPACE</small><h2>${escapeHtml(title)}</h2><p>Cerca e seleziona una voce</p></div><button type="button" class="aps-dialog-close"><span>×</span></button></header><div class="aps-select-body"><input class="aps-select-search" type="search" placeholder="Cerca…" autofocus><div class="aps-select-options">${options.map(option=>{const meta=optionMeta(option);return `<button type="button" data-select-value="${escapeHtml(option.value)}" class="${option.selected?'on':''}"><span><b>${escapeHtml(option.label)}</b>${meta?`<small>${escapeHtml(meta)}</small>`:''}</span><i>${option.selected?'✓':''}</i></button>`}).join('')}</div></div></div>`;
  root.append(layer);
  const close = () => layer.remove();
  layer.querySelector('.aps-dialog-close').addEventListener('click',close);
  layer.onmousedown = event => { if (event.target===layer) close(); };
  const search=layer.querySelector('.aps-select-search');
  search.addEventListener('input',()=>layer.querySelectorAll('[data-select-value]').forEach(button=>button.hidden=!button.textContent.toLowerCase().includes(search.value.toLowerCase())));
  layer.querySelectorAll('[data-select-value]').forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.selectValue;
    close();
    select.value=value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  requestAnimationFrame(()=>search.focus());
}

function timeModal() {
  const tasks=state.tasks.filter(item=>item.assignee===currentResourceId()&&item.type!=='Summary');
  openModal('Registra ore','Il consuntivo sarà inviato al Project Manager per la verifica.',`<div class="aps-form-grid"><label>Data<input type="date" name="date" value="${iso(new Date())}" required></label><label>Progetto<select name="project">${visibleProjects().map(item=>`<option>${item.code}</option>`).join('')}</select></label><label class="wide">Attività<select name="task">${tasks.map(item=>`<option value="${item.id}">${item.project} · ${item.wbs} · ${escapeHtml(item.title)}</option>`).join('')}</select></label><label>Ore<input type="number" name="hours" min="0.5" max="9" step="0.5" value="8"></label><label class="wide">Descrizione<input name="note" required placeholder="Attività svolta"></label></div>`,'Invia consuntivo',form=>{checkpoint();const values=Object.fromEntries(form);state.timesheets.push({id:uid('time'),resource:currentResourceId(),...values,hours:Number(values.hours),status:'Inviato'});save();render();toast('Ore inviate al Project Manager');});
}
function updateTimesheet(id,status){checkpoint();const row=state.timesheets.find(item=>item.id===id);if(row){const wasApproved=row.status==='Approvato';row.status=status;if(status==='Approvato'&&!wasApproved){const task=state.tasks.find(item=>item.id===row.task);if(task)task.actualHours=Number(task.actualHours||0)+Number(row.hours||0);}}state.audit.unshift({id:uid('log'),date:new Date().toISOString(),actor:profileInfo().label,action:`Consuntivo ${status.toLowerCase()}`,target:id,severity:status==='Approvato'?'info':'warning'});save();render();toast(status==='Approvato'?'Consuntivo approvato e piano aggiornato':'Correzione richiesta alla risorsa');}
function assignRequest(id){const request=state.requests.find(item=>item.id===id);openModal('Assegna risorsa',`${request.project} · ${request.profile}`,`<div class="aps-form-grid"><label class="wide">Risorsa disponibile<select name="resource">${state.resources.filter(item=>item.kind.includes('Internal')).map(item=>`<option value="${item.id}">${escapeHtml(item.name)} · ${item.department} · ${item.location}</option>`).join('')}</select></label><label>Dal<input type="date" name="from" value="${iso(new Date())}"></label><label>Al<input type="date" name="to" value="${addDays(iso(new Date()),request.weeks*7)}"></label></div>`,'Conferma assegnazione',form=>{checkpoint();request.status='Assegnata';request.assignedTo=form.get('resource');request.from=form.get('from');request.to=form.get('to');save();render();toast('Risorsa assegnata e Project Manager notificato');});}
function absenceModal(){openModal('Ferie o permesso','L’assenza viene considerata nel controllo delle allocazioni.',`<div class="aps-form-grid"><label class="wide">Risorsa<select name="resource">${state.resources.filter(item=>item.kind.includes('Internal')).map(item=>`<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Dal<input type="date" name="from" required></label><label>Al<input type="date" name="to" required></label><label class="wide">Tipo<select name="type"><option>Ferie</option><option>Permesso</option><option>Trasferta</option><option>Malattia</option></select></label></div>`,'Registra assenza',form=>{checkpoint();const values=Object.fromEntries(form);state.resources.find(item=>item.id===values.resource)?.absence.push([values.from,values.to,values.type]);save();render();toast('Assenza registrata · capacità aggiornata');});}
function resourceCreateModal(){openModal('Nuova risorsa','Inserimento centralizzato nel pool Enterprise.',`<div class="aps-form-grid"><label class="wide">Nome / risorsa generica<input name="name" required></label><label>Tipologia<select name="kind"><option>Internal · Nominal</option><option>Internal · Generic</option><option>External · Nominal</option><option>External · Generic</option></select></label><label>Società<select name="company">${state.companies.map(item=>`<option>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Dipartimento<input name="department" required></label><label>Sede<input name="location" required></label><label>Responsabile<input name="manager" required></label><label>Capacità settimanale<input type="number" name="capacity" value="45"></label><label>Costo orario riservato<input type="number" name="rate" value="10"></label></div>`,'Aggiungi al pool',form=>{checkpoint();const values=Object.fromEntries(form);state.resources.push({id:uid('resource'),...values,capacity:Number(values.capacity),rate:Number(values.rate),role:values.department,absence:[]});save();render();toast('Risorsa aggiunta al pool globale');});}
function externalCostModal(){openModal('Costo esterno','Consulente a pacchetto oppure acquistato a ore.',`<div class="aps-form-grid"><label>Progetto<select name="project">${visibleProjects().map(item=>`<option>${item.code}</option>`).join('')}</select></label><label>Fornitore<input name="supplier" required></label><label>Modello<select name="model"><option>Pacchetto</option><option>A ore</option></select></label><label>Importo<input type="number" name="amount" required></label><label>Ore acquistate<input type="number" name="purchasedHours" value="0"></label><label>Ore utilizzate<input type="number" name="usedHours" value="0"></label></div>`,'Salva costo',form=>{checkpoint();const values=Object.fromEntries(form);state.externalContracts.push({id:uid('external'),...values,amount:Number(values.amount),purchasedHours:Number(values.purchasedHours),usedHours:Number(values.usedHours),status:'Attivo'});const project=projectByCode(values.project);project.externalCosts+=Number(values.amount);save();render();toast('Costo esterno registrato');});}
function templateProjectModal(){openModal('Progetto da template','Crea WBS e attività iniziali partendo dallo standard selezionato.',`<div class="aps-form-grid"><label class="wide">Template<select name="template">${state.templates.map(item=>`<option value="${item.id}">${escapeHtml(item.name)} · ${item.tasks} attività</option>`).join('')}</select></label><label>Codice<input name="code" required placeholder="P60"></label><label>Nome progetto<input name="name" required></label><label>Società esecutrice<select name="executor">${state.companies.map(item=>`<option>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Project Manager<select name="manager">${state.resources.filter(item=>/Senior|Partner/.test(item.role)).map(item=>`<option>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Inizio<input type="date" name="start" value="${iso(new Date())}"></label><label>Fine contrattuale<input type="date" name="end" value="${addDays(iso(new Date()),365)}"></label></div>`,'Crea progetto',form=>{checkpoint();const values=Object.fromEntries(form);const template=state.templates.find(item=>item.id===values.template);state.projects.push({id:uid('project'),code:values.code,name:values.name,status:'Planning',businessUnit:'Architecture',client:'Da definire',clientType:'Private',category:'Other',typology:template.typology,executor:values.executor,owner:values.executor,location:'Da definire',studio:'Firenze',manager:values.manager,sponsor:'Da definire',promoter:'',priority:'Medium',budget:0,revenue:0,externalCosts:0,internalHours:0,calendar:'ARCHEA ITALIA · 9h',start:values.start,end:values.end,onHoldReason:'',plot:0,building:0,underground:0,template:values.template,governanceStatus:'Draft',contractSigned:false,contractFile:''});template.phases.forEach((phase,index)=>state.tasks.push({id:uid('task'),project:values.code,wbs:String(index+1),parent:null,title:phase.toUpperCase(),type:'Summary',phase,discipline:'Architecture',milestone:'',assignee:'r5',start:addDays(values.start,index*20,true),duration:20,calendar:'working',progress:0,actualHours:0,plannedHours:0,predecessor:'',relation:'FS',lag:0}));selectedProject=values.code;save();render();toast('Progetto e WBS creati dal template');});}
function publishProject(code){checkpoint();const project=projectByCode(code);project.governanceStatus='Published';state.publications.push({id:uid('publication'),project:code,date:new Date().toISOString(),by:profileInfo().label,reason:'Pubblicazione manuale',status:'Pubblicato'});save();render();toast(`${code} pubblicato · team notificato`);}
function archiveProject(code){const project=projectByCode(code);if(project.status!=='Archived'&&project.status!=='Completed'&&!can('manageUsers')){toast('Prima di archiviare: chiudere le attività, impostare Completed e pubblicare');return;}checkpoint();project.status=project.status==='Archived'?'Completed':'Archived';project.governanceStatus=project.status==='Archived'?'Archived':'Published';save();render();toast(project.status==='Archived'?(can('manageUsers')?'Archiviazione forzata registrata':'Progetto archiviato'):'Progetto ripristinato');}
function userModal(id=null){const user=state.users.find(item=>item.id===id);openModal(user?'Permessi utente':'Nuovo utente',user?user.email:'Account dimostrativo',`<div class="aps-form-grid"><label class="wide">Nome<input name="name" value="${escapeHtml(user?.name||'')}" required></label><label>Email<input type="email" name="email" value="${escapeHtml(user?.email||'')}" required></label><label>Ruolo professionale<input name="professional" value="${escapeHtml(user?.professional||'Architect')}"></label><label>Profilo piattaforma<select name="profile">${Object.entries(PLATFORM_PROFILES).map(([key,item])=>`<option value="${key}" ${key===user?.profile?'selected':''}>${item.label}</option>`).join('')}</select></label><label>Società<input name="company" value="${escapeHtml(user?.company||'Archea Associati')}"></label><label>Stato<select name="active"><option value="true" ${user?.active!==false?'selected':''}>Attivo</option><option value="false" ${user?.active===false?'selected':''}>Sospeso</option></select></label></div>`,'Salva permessi',form=>{checkpoint();const values=Object.fromEntries(form);values.active=values.active==='true';if(user)Object.assign(user,values);else state.users.push({id:uid('user'),...values,projects:[]});state.audit.unshift({id:uid('log'),date:new Date().toISOString(),actor:'Platform Owner',action:user?'Permessi aggiornati':'Utente creato',target:values.email,severity:'info'});save();render();toast('Utente e permessi aggiornati');});}

function taskModal(task = null) {
  if (!canPlan() && !task) return;
  if (task && !canPlan()) {
    const publicView = profile() === 'client';
    openModal('Dettaglio attività',`${task.wbs} · ${task.phase}`,`<div class="aps-resource-detail"><div class="wide"><small>ATTIVITÀ</small><b>${escapeHtml(task.title)}</b><span>${task.type} · ${task.discipline}</span></div><div><small>PERIODO</small><b>${dateLabel(task.start)} – ${dateLabel(taskEnd(task))}</b><span>${task.duration} ${task.calendar==='working'?'giorni lavorativi':'giorni solari'}</span></div><div><small>AVANZAMENTO</small><b>${task.progress}%</b><span>${task.milestone||'Attività operativa'}</span></div>${publicView?'':`<div><small>RESPONSABILE</small><b>${escapeHtml(resourceName(task.assignee))}</b><span>${task.plannedHours||0} h pianificate</span></div><div><small>CONSUNTIVO</small><b>${task.actualHours||0} h</b><span>${task.actualStart?`Avvio ${dateLabel(task.actualStart)}`:'Non avviata'}</span></div>`}${task.contractualFee&&can('viewSales')?`<div class="wide confidential"><small>VALORE CONTRATTUALE</small><b>${money(task.contractualFee)}</b><span>Milestone di pagamento</span></div>`:''}</div>`,null);
    return;
  }
  const projectTasks = state.tasks.filter(item => item.project === selectedProject);
  const value = (name,fallback='') => escapeHtml(task?.[name] ?? fallback);
  openModal(task ? 'Dettaglio attività' : 'Nuova attività', task ? `${task.wbs} · ${task.phase}` : `${selectedProject} · codice WBS assegnato automaticamente`, `<div class="aps-form-grid"><label class="wide">Nome attività<input name="title" required value="${value('title')}"></label><label>Tipo<select name="type">${['Summary','Work','Approval','Payment','Milestone'].map(item => `<option ${item === task?.type ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Task padre / WBS<select name="parent"><option value="">Livello principale</option>${projectTasks.filter(item=>item.id!==task?.id&&item.type==='Summary').map(item=>`<option value="${item.id}" ${item.id===task?.parent?'selected':''}>${item.wbs} · ${escapeHtml(item.title)}</option>`).join('')}</select></label><label>Fase<select name="phase">${['Pre-Contract Phase','Masterplan (MP)','Massing-Pre Concept (MA)','Concept Design (PD)','Schematic Design (SD)','Design Development (DD)','Bidding phase-Tender (BI)','Construction Documents (CD)','Construction Administration (CA)','Post Construction/Handover phase (PC)'].map(item => `<option ${item === task?.phase ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Disciplina<select name="discipline">${['Urban Planning','Architecture','Landscaping','Interior','Structure','MEP','Outdoor Lighting Design','Site Safety','Permits and Approvals','Others'].map(item => `<option ${item === task?.discipline ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Responsabile<select name="assignee">${state.resources.map(item => `<option value="${item.id}" ${item.id === task?.assignee ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Inizio<input type="date" name="start" required value="${value('start',iso(new Date()))}"></label><label>Ora fine<input type="time" name="finishTime" value="${value('finishTime','18:00')}"></label><label>Durata<input type="number" min="1" name="duration" value="${value('duration',5)}"></label><label>Calendario<select name="calendar"><option value="working" ${task?.calendar !== 'solar' ? 'selected' : ''}>Giorni lavorativi</option><option value="solar" ${task?.calendar === 'solar' ? 'selected' : ''}>Giorni solari</option></select></label><label>Avanzamento %<input type="number" min="0" max="100" name="progress" value="${value('progress',0)}"></label><label>Predecessore<select name="predecessor"><option value="">Nessuno</option>${projectTasks.filter(item => item.id !== task?.id && item.type !== 'Summary').map(item => `<option value="${item.id}" ${item.id === task?.predecessor ? 'selected' : ''}>${item.wbs} · ${escapeHtml(item.title)}</option>`).join('')}</select></label><label>Legame<select name="relation">${['FS','FF','SS','SF'].map(item => `<option ${item === task?.relation ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Lag (giorni)<input type="number" name="lag" value="${value('lag',0)}"></label><label class="wide">Vincolo testuale<input name="linkText" value="${task?.predecessor?`${projectTasks.find(item=>item.id===task.predecessor)?.wbs||''}${task.relation||'FS'}${task.lag?`${task.lag>0?'+':''}${task.lag}d`:''}`:''}" placeholder="Es. 1.2FS+2d oppure 1.3FF"></label><label>Ore previste<input type="number" name="plannedHours" value="${value('plannedHours',40)}"></label><label>Ore effettive<input type="number" name="actualHours" value="${value('actualHours',0)}"></label><label>Inizio effettivo<input type="date" name="actualStart" value="${value('actualStart')}"></label><label>Durata rimanente<input type="number" name="remainingDuration" value="${value('remainingDuration',task?Math.max(0,task.duration*(1-task.progress/100)):5)}"></label><label>Stato milestone<select name="milestone"><option value="">Nessuno</option>${['Submission','Approval','Invoicing','Paid'].map(item=>`<option ${item===task?.milestone?'selected':''}>${item}</option>`).join('')}</select></label><label>Valore contrattuale<input type="number" name="contractualFee" value="${value('contractualFee',0)}"></label><label class="wide">Agreement / nota contrattuale<input name="agreement" value="${value('agreement')}"></label></div>`,task ? 'Salva modifiche' : 'Crea attività', form => {
    checkpoint();
    const values = Object.fromEntries(form);
    const link = String(values.linkText||'').trim().match(/^([\w.]+)(FS|FF|SS|SF)?(?:([+-]\d+)d)?$/i);
    if (link) { const predecessor=projectTasks.find(item=>item.wbs===link[1]||item.id===link[1]); if (predecessor) { values.predecessor=predecessor.id; values.relation=(link[2]||'FS').toUpperCase(); values.lag=Number(link[3]||0); } }
    delete values.linkText;
    const parsed = { ...values, duration:Number(values.duration), progress:Number(values.progress), lag:Number(values.lag), plannedHours:Number(values.plannedHours), actualHours:Number(values.actualHours), remainingDuration:Number(values.remainingDuration), contractualFee:Number(values.contractualFee) };
    if (task) Object.assign(task,parsed); else {
      const parent=projectTasks.find(item=>item.id===parsed.parent); const next=parent?projectTasks.filter(item=>item.parent===parent.id).length+1:projectTasks.filter(item=>!item.parent).length+1;
      state.tasks.push({ id:uid('task'), project:selectedProject, wbs:parent?`${parent.wbs}.${next}`:String(next), milestone:values.type === 'Milestone' ? 'Submission' : '', ...parsed });
    }
    save(); render(); toast(task ? 'Attività aggiornata' : 'Attività creata');
  });
}

function resourceModal(resource) {
  openModal(resource.name, `${resource.kind} · ${resource.company}`, `<div class="aps-resource-detail"><div><small>RUOLO / REPARTO</small><b>${resource.role}</b><span>${resource.department}</span></div><div><small>SEDE</small><b>${resource.location}</b><span>${resource.company}</span></div><div><small>RESPONSABILE</small><b>${resource.manager}</b><span>${resource.capacity} h/settimana</span></div><div><small>DISPONIBILITÀ</small><b>${resource.absence.length ? 'Assenze pianificate' : 'Disponibile'}</b><span>${resource.absence.map(item => `${dateLabel(item[0])}–${dateLabel(item[1])} · ${item[2]}`).join(', ') || 'Nessuna assenza registrata'}</span></div>${canSeeCosts() ? `<div class="wide confidential"><small>DATO RISERVATO PROPERTY</small><b>${money(resource.rate)} / ora</b><span>Non visibile ai Project Manager</span></div>` : ''}</div>`,null);
}

function requestModal() {
  openModal('Richiedi una risorsa','La richiesta viene inviata al responsabile del pool aziendale.',`<div class="aps-form-grid"><label>Progetto<select name="project">${state.projects.map(item => `<option>${item.code}</option>`).join('')}</select></label><label>Dipartimento<select name="department">${['Architecture','BIM','Concept','Design','Interior','Surveyor','Tender','Visual'].map(item => `<option>${item}</option>`).join('')}</select></label><label class="wide">Profilo richiesto<input name="profile" required placeholder="Es. BIM Coordinator senior"></label><label>Settimane<input type="number" name="weeks" min="1" value="2"></label><label>Ore previste<input type="number" name="hours" min="1" value="40"></label></div>`,'Invia richiesta',form => { checkpoint(); state.requests.push({ id:uid('request'), ...Object.fromEntries(form), weeks:Number(form.get('weeks')), hours:Number(form.get('hours')), status:'Inviata', requestedBy:sessionStorage.getItem('archea-demo-user') || 'Demo' }); save(); render(); toast('Richiesta inviata al Resource Manager'); });
}

function projectModal(project = null) {
  if (!project && !canPlan()) return;
  if (project && !can('editPlan') && !can('manageStandards')) {
    const kpi=projectKpis(project);
    openModal(`${project.code} · ${project.name}`,'Scheda commessa in sola lettura',`<div class="aps-resource-detail"><div><small>CLIENTE</small><b>${escapeHtml(project.client)}</b><span>${project.clientType} · ${project.location}</span></div><div><small>SOCIETÀ</small><b>${project.executor}</b><span>${project.studio} · Owner ${project.owner}</span></div><div><small>RESPONSABILI</small><b>${project.manager}</b><span>Sponsor ${project.sponsor}</span></div><div><small>PERIODO</small><b>${dateLabel(project.start)} – ${dateLabel(project.end)}</b><span>${project.status} · ${kpi.progress}%</span></div>${can('viewSales')?`<div><small>VALORE CONTRATTUALE</small><b>${money(project.revenue)}</b><span>${project.contractSigned?'Contratto firmato':'Contratto in definizione'}</span></div>`:''}${canSeeCosts()?`<div class="confidential"><small>MARGINE RISERVATO</small><b>${money(kpi.margin)}</b><span>${kpi.marginPct}%</span></div>`:''}</div>`,null);
    return;
  }
  const val = (key,fallback='') => escapeHtml(project?.[key] ?? fallback);
  openModal(project ? `${project.code} · ${project.name}` : 'Nuovo progetto',project ? 'Anagrafica completa della commessa' : 'I campi obbligatori seguono lo standard Archea.',`<div class="aps-form-grid"><label>Codice commessa<input name="code" required value="${val('code')}"></label><label>Nome progetto<input name="name" required value="${val('name')}"></label><label>Business Unit<select name="businessUnit">${['Architecture','Industrial Design','Interior'].map(item => `<option ${item === project?.businessUnit ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Stato<select name="status">${['Planning','Active','On Hold','Completed','Archived'].map(item => `<option ${item === project?.status ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label class="wide">Cliente<input name="client" required value="${val('client')}"></label><label>Tipo cliente<select name="clientType">${['Private','Public','Mix'].map(item => `<option ${item === project?.clientType ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Priorità<select name="priority">${['High','Medium','Low'].map(item => `<option ${item === project?.priority ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Società esecutrice<input name="executor" value="${val('executor','Archea Associati')}"></label><label>Project Owner<input name="owner" value="${val('owner','Archea Associati')}"></label><label>Studio<input name="studio" value="${val('studio','Firenze')}"></label><label>Project Manager<input name="manager" value="${val('manager')}"></label><label>Sponsor<input name="sponsor" value="${val('sponsor')}"></label><label>Promoter<input name="promoter" value="${val('promoter')}"></label><label>Localizzazione<input name="location" value="${val('location','Italy-Florence-')}"></label><label>Categoria<input name="category" value="${val('category','Other')}"></label><label>Tipologia<input name="typology" value="${val('typology','New Construction')}"></label><label>Motivo On Hold<input name="onHoldReason" value="${val('onHoldReason')}"></label><label>Inizio<input type="date" name="start" value="${val('start',iso(new Date()))}"></label><label>Fine<input type="date" name="end" value="${val('end',addDays(iso(new Date()),180))}"></label><label>Budget approvato<input type="number" name="budget" value="${val('budget',0)}"></label><label>Valore contrattuale<input type="number" name="revenue" value="${val('revenue',0)}"></label><label>Gross Building Area<input type="number" name="building" value="${val('building',0)}"></label><label>Gross Land Plot<input type="number" name="plot" value="${val('plot',0)}"></label><label>Gross Underground<input type="number" name="underground" value="${val('underground',0)}"></label><label>Template<select name="template">${state.templates.map(item=>`<option value="${item.id}" ${item.id===project?.template?'selected':''}>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Contratto firmato<select name="contractSigned"><option value="true" ${project?.contractSigned?'selected':''}>Sì</option><option value="false" ${!project?.contractSigned?'selected':''}>No</option></select></label><label>PDF contratto<input name="contractFile" value="${val('contractFile')}"></label></div>`,'Salva progetto',form => { checkpoint(); const values = Object.fromEntries(form); ['budget','revenue','building','plot','underground'].forEach(key=>values[key]=Number(values[key])); values.contractSigned=values.contractSigned==='true'; if (values.status==='On Hold'&&!values.onHoldReason){toast('Inserire il motivo dello stato On Hold');return;} if (project) Object.assign(project,values); else { values.id = uid('project'); values.externalCosts = 0; values.internalHours = 0; values.calendar = 'ARCHEA ITALIA · 9h'; values.governanceStatus='Draft'; state.projects.push(values); selectedProject = values.code; } save(); render(); toast(project ? 'Progetto aggiornato' : 'Progetto creato'); });
}

function download(name, content, type) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content],{type})); link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href),1000);
}
function exportProjectXml() {
  const project = projectByCode(selectedProject);
  const tasks = state.tasks.filter(item => item.project === selectedProject);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Project xmlns="http://schemas.microsoft.com/project"><Name>${escapeHtml(project.name)}</Name><StartDate>${project.start}T09:00:00</StartDate><FinishDate>${project.end}T18:00:00</FinishDate><Tasks>${tasks.map((task,index) => `<Task><UID>${index + 1}</UID><ID>${index + 1}</ID><Name>${escapeHtml(task.title)}</Name><OutlineNumber>${task.wbs}</OutlineNumber><OutlineLevel>${task.wbs.split('.').length}</OutlineLevel><Start>${task.start}T09:00:00</Start><Finish>${taskEnd(task)}T18:00:00</Finish><Duration>PT${task.duration * 9}H0M0S</Duration><PercentComplete>${task.progress}</PercentComplete>${task.predecessor ? `<PredecessorLink><PredecessorUID>${tasks.findIndex(item => item.id === task.predecessor) + 1}</PredecessorUID><Type>${{FF:0,FS:1,SF:2,SS:3}[task.relation]}</Type><LinkLag>${task.lag * 4800}</LinkLag></PredecessorLink>` : ''}</Task>`).join('')}</Tasks></Project>`;
  download(`${project.code}_${project.name.replace(/\s+/g,'_')}_Project.xml`,xml,'application/xml'); toast('Project XML esportato');
}

function selectDemoProfile(id) {
  const account=DEMO_ACCOUNTS.find(item=>item.id===id); const info=PLATFORM_PROFILES[id];
  if(!account||!info)return;
  sessionStorage.setItem(PROFILE_KEY,id);
  sessionStorage.setItem(PROFILE_NAME_KEY,account.name);
  sessionStorage.setItem('archea-demo-user',info.base);
  sessionStorage.removeItem('archea-planning-autopen');
  history.replaceState(null,'','#/oggi');
  location.reload();
}
function profileSwitcher(){
  openModal('Account demo','Il selettore esiste solo nel prototipo. Nella versione reale il profilo deriva dall’account aziendale.',`<div class="aps-profile-grid">${DEMO_ACCOUNTS.map(account=>{const info=PLATFORM_PROFILES[account.id];return `<button type="button" data-profile-pick="${account.id}" class="${account.id===profile()?'on':''}"><i style="--profile:${info.color}"></i><span><b>${escapeHtml(account.name)}</b><small>${info.label} · ${info.professional}</small><em>${account.email}</em></span></button>`}).join('')}</div>`,null);
  document.querySelectorAll('[data-profile-pick]').forEach(button=>button.addEventListener('click',()=>selectDemoProfile(button.dataset.profilePick)));
}
function injectDemoAccounts(){
  const container=document.querySelector('.demo-accounts');
  if(!container)return;
  if(container.querySelector('.demo-account-picker'))return;
  const existing=[...container.querySelectorAll(':scope > button')];
  const alreadyComplete=existing.length===DEMO_ACCOUNTS.length&&existing.every(button=>button.hasAttribute('data-login-profile'));
  if(alreadyComplete)return;
  container.querySelector('.aps-login-accounts')?.remove();
  existing.forEach(button=>button.remove());
  DEMO_ACCOUNTS.forEach(account=>{
    const info=PLATFORM_PROFILES[account.id];
    const button=document.createElement('button');
    button.type='button';
    button.dataset.loginProfile=account.id;
    button.className=account.id===profile()?'on':'';
    button.innerHTML=`<span>${escapeHtml(account.name)}${account.id==='platform_owner'?'<em>MASTER</em>':''}</span><small>${info.label} · ${info.professional}</small>`;
    button.addEventListener('click',()=>selectDemoProfile(account.id));
    container.append(button);
  });
}
function effectiveShellProfile(){
  const signedIn=sessionStorage.getItem('archea-demo-user');
  return sessionStorage.getItem(PROFILE_KEY)||({fdiamanti:'platform_owner',abotrini:'project_manager',lleyra:'resource',property:'finance_direction',alaurini:'reception',scardia:'interior_head',mgamberi:'concept_head',afrongia:'visual_head',mmadaghiele:'material_manager',epietrelli:'hr_manager'}[signedIn])||profile();
}
function applyShellPermissions(){
  const effectiveProfile=effectiveShellProfile();
  const allowed={resource:['Oggi','Progetti','Task Manager','Note','Chat','Ore','Calendario','Altro'],material_manager:['Oggi','Progetti','Task Manager','Note','Chat','Ore','Calendario','Altro'],project_manager:['Oggi','Progetti','Task Manager','Note','Chat','Ore','Cantiere','Contabilità','Insight','Calendario','Altro','Pianificazione'],resource_manager:['Oggi','Chat','Calendario','Pianificazione'],pmo_admin:['Oggi','Progetti','Task Manager','Insight','Calendario','Pianificazione'],finance_direction:['Oggi','Progetti','Contabilità','Insight','Calendario','Organico','Pianificazione'],client:['Pianificazione'],reception:['Oggi','Pacchi','Calendario','Chat','Altro'],interior_head:['Oggi','Progetti','Note','Chat','Ore','Calendario','Altro'],concept_head:['Oggi','Progetti','Note','Chat','Ore','Calendario','Altro'],visual_head:['Oggi','Progetti','Note','Chat','Ore','Calendario','Altro'],hr_manager:['Oggi','Chat','Calendario','Organico','Ore','Insight','Altro'],platform_owner:null}[effectiveProfile];
  document.documentElement.dataset.apsProfile=effectiveProfile;
  document.querySelectorAll('button').forEach(button=>{
    if(button.closest('#archea-planning-suite')||button.closest('.aps-login-accounts'))return;
    const label=button.textContent.trim();
    if(!['Oggi','Progetti','Task Manager','Note','Chat','Ore','Cantiere','Contabilità','Insight','Calendario','Altro','Organico','Pianificazione','Console sviluppatore','Impostazioni'].some(name=>label.startsWith(name)))return;
    button.hidden=Array.isArray(allowed)&&!allowed.some(name=>label.startsWith(name));
  });
}

function applyRuntimePolish(){
  document.querySelectorAll('.desk-footer,.foot,.dev-release,.dev-system-info').forEach(container=>{
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(node.nodeValue.includes('0.12.1')) node.nodeValue=node.nodeValue.replaceAll('0.12.1',VERSION);
      if(node.nodeValue.includes('0.14.2')) node.nodeValue=node.nodeValue.replaceAll('0.14.2',VERSION);
    }
  });
  const icons={
    validata:'<path d="m4 12 4 4L20 6"/>',
    in_verifica:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    da_rivedere:'<path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/>',
    scaduta:'<path d="M12 4 21 20H3Z"/><path d="M12 9v5M12 17h.01"/>',
    in_scadenza:'<circle cx="12" cy="12" r="8"/><path d="M12 8v5h4"/>',
    in_lavorazione:'<circle cx="12" cy="12" r="8"/><path d="m10 8 6 4-6 4Z"/>',
    aperta:'<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>'
  };
  document.querySelectorAll('.desk-flow-dot').forEach(dot=>{
    const key=Object.keys(icons).find(name=>dot.classList.contains(name))||'aperta';
    if(dot.dataset.apsIcon===key)return;
    dot.dataset.apsIcon=key;
    dot.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>`;
  });
}

function injectLaunchers() {
  if(document.querySelector('.login-screen')) closeSuite(false);
  const shellRoleText=document.querySelector('.desk-sidebar')?.textContent||'';
  const restrictedDepartmentShell=/Responsabile (Interior|Concept|Visual) Department/.test(shellRoleText);
  if(['resource','material_manager','reception','interior_head','concept_head','visual_head','hr_manager'].includes(effectiveShellProfile())||restrictedDepartmentShell){
    document.querySelector('.aps-desktop-launcher')?.remove();
    document.querySelector('.aps-desktop-subnav')?.remove();
    document.querySelector('.aps-mobile-launcher')?.remove();
    document.querySelector('.aps-mobile-more-launcher')?.remove();
    closeSuite();
    injectDemoAccounts(); applyShellPermissions(); applyRuntimePolish(); return;
  }
  if (!document.querySelector('.aps-desktop-launcher')) {
    const nav = document.querySelector('.desk-sidebar nav');
    if (nav) {
      const button = document.createElement('button'); button.className = 'aps-desktop-launcher'; button.innerHTML = `${navIcon('plan')}<span>Pianificazione</span><i aria-hidden="true">⌄</i>`; nav.append(button);
      const subnav=document.createElement('div'); subnav.className='aps-desktop-subnav'; nav.append(subnav); renderDesktopPlanningSubnav();
    }
  }
  document.querySelector('.aps-mobile-launcher')?.remove();
  if (!document.querySelector('.desktop-app') && !document.querySelector('.aps-mobile-more-launcher')) {
    const title=[...document.querySelectorAll('.big.title-row')].find(item=>/^(Altro|More)$/i.test(item.textContent.trim()));
    const list=title?.parentElement?.querySelector('.menu-list');
    if(list){
      const button=document.createElement('button');
      button.type='button';
      button.className='aps-mobile-more-launcher';
      button.setAttribute('aria-label','Apri Pianificazione');
      button.innerHTML=`<span class="menu-icon">${navIcon('plan')}</span><span><b>Pianificazione</b><small>Piani, risorse, tempi e avanzamento</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;
      list.append(button);
    }
  }
  injectDemoAccounts();
  applyShellPermissions();
  applyRuntimePolish();
  if(!document.querySelector('#archea-planning-suite')?.hidden) syncBaseNavigation(true);
}

ensureShell();
const observer = new MutationObserver(() => injectLaunchers());
observer.observe(document.documentElement,{childList:true,subtree:true});
injectLaunchers();
document.addEventListener('click', event => {
  const clicked=event.target.closest?.('button');
  if(clicked?.textContent.includes('Esci dalla demo')){closeSuite(false);history.replaceState(null,'','#/oggi');sessionStorage.removeItem(PROFILE_KEY);sessionStorage.removeItem(PROFILE_NAME_KEY);sessionStorage.removeItem('archea-planning-autopen');}
  if(clicked&&!clicked.closest('.aps-login-accounts')&&document.querySelector('.aps-login-accounts')&&['Francesco Diamanti','Alessandro Botrini','Lisandro Leyra','ARCHEA Property'].some(name=>clicked.textContent.includes(name))){sessionStorage.removeItem(PROFILE_KEY);sessionStorage.removeItem(PROFILE_NAME_KEY);}
  if (event.target.closest?.('.aps-desktop-launcher,.aps-mobile-launcher,.aps-mobile-more-launcher')) {
    event.preventDefault();
    event.stopPropagation();
    const root=document.querySelector('#archea-planning-suite');
    if(root&&!root.hidden) closeSuite(); else openSuite('dashboard');
  }
  const baseNavButton=event.target.closest?.('.desk-sidebar nav > button:not(.aps-desktop-launcher),.desk-developer-button,.desk-settings-button');
  if(baseNavButton&&!event.target.closest?.('.aps-desktop-subnav')) closeSuite(false);
}, true);
document.addEventListener('submit',event=>{if(event.target.closest?.('.login-screen')){history.replaceState(null,'','#/oggi');sessionStorage.removeItem('archea-planning-autopen');}},true);
window.addEventListener('keydown',event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !document.querySelector('#archea-planning-suite')?.hidden) { event.preventDefault(); undo(); } if (event.key === 'Escape' && !document.querySelector('#archea-planning-suite')?.hidden) closeSuite(); });

