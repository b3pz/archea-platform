// Ricostruito dal bundle fornito; comportamento originale conservato.

const SHEET_NAMES = {
  tasks: "02_TaskManager",
  notes: "03_Note",
  hours: "04_Ore",
  dv: "#DV",
  insight: "#InsightData",
};
const TASK_HEADER_ALIASES = {
  numero: ["n", "n°", "no", "numero"],
  assegnatario: ["assigned to", "assignedto"],
  tipologia: ["typology"],
  progetto: ["project"],
  descrizione: ["task description"],
  linkServer: ["link server"],
  immagini: ["image", "images"],
  priorita: ["priority"],
  titolo: ["task name"],
  inizio: ["start date"],
  scadenza: ["dead line", "deadline"],
  timing: ["timing"],
  stato: ["status"],
  shared: ["shared"],
  completed: ["completed"],
  dataChiusura: ["date"],
  notValidated: ["not validated"],
  validated: ["validated"],
  commenti: ["comments", "comment"],
};
const REQUIRED_TASK_HEADERS = [
  "assegnatario",
  "progetto",
  "descrizione",
  "scadenza",
  "completed",
  "validated",
  "commenti",
];
const HEADER_SCAN_ROWS = 10;
const PROJECT_LIST_LAYOUT = {
  column: 4,
  firstRow: 5,
};
const PROJECT_STATUS_LAYOUT = {
  firstRow: 32,
  lastRow: 57,
  projectCol: 11,
  statusCol: 14,
  statusCols: [14, 13],
};
const NOTES_LAYOUT = {
  firstRow: 3,
  cols: {
    progetto: 1,
    autore: 2,
    creata: 3,
    testo: 4,
    stato: 5,
    chiusa: 6,
    marker: 7,
  },
};
const NOTE_MARKERS = {
  header: "P:",
  note: "N:",
};
const HOURS_LAYOUT = {
  dateRow: 2,
  firstRow: 3,
  personCol: 1,
  projectCol: 2,
  noteCol: 3,
  firstDayCol: 4,
};
const OFF_MARKER = "OFF";
const PROJECT_ALIASES = {
  P16: "P13",
};
const PROJECT_STATUS_ORDER = ["Attivo", "Standby", "Freeze", "Fermo"];
const EXCLUDED_HOUR_PEOPLE = [
  {
    id: "fdallo",
    label: "Francesco Dall'O'",
    match: (e) => e.startsWith("francescodall"),
  },
  {
    id: "dmastro",
    label: "Doriana Mastro",
    match: (e) => e === "dorianamastro",
  },
];
const APP_TIMEZONE = "Europe/Rome";
export {
  SHEET_NAMES,
  TASK_HEADER_ALIASES,
  REQUIRED_TASK_HEADERS,
  HEADER_SCAN_ROWS,
  PROJECT_LIST_LAYOUT,
  PROJECT_STATUS_LAYOUT,
  NOTES_LAYOUT,
  NOTE_MARKERS,
  HOURS_LAYOUT,
  OFF_MARKER,
  PROJECT_ALIASES,
  PROJECT_STATUS_ORDER,
  EXCLUDED_HOUR_PEOPLE,
  APP_TIMEZONE,
};
