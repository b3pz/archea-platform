const SITE_TASKS = [
  { id: "s1", project: "P51", title: "Verificare avanzamento opere esterne", done: false, checklist: ["Foto panoramica", "Quote principali", "Note impresa"] },
  { id: "s2", project: "M86", title: "Controllo campione finitura calcestruzzo", done: false, checklist: ["Confronto capitolato", "Foto dettaglio", "Approvazione DL"] },
  { id: "s3", project: "O80", title: "Sopralluogo area Guest Hub", done: true, checklist: ["Accessi", "Interferenze", "Verbale"] },
];
const EVENTS = [
  { id: "e1", day: "07", month: "OTT", title: "Riunione Milanello", meta: "10:30 · Sala Lungarno" },
  { id: "e2", day: "09", month: "OTT", title: "Sopralluogo Flaminio", meta: "09:00 · Roma" },
  { id: "e3", day: "14", month: "OTT", title: "Review ampliamento Viola Park", meta: "15:00 · Google Meet" },
];
const RESOURCES = [
  { id: "fiat500", category: "Auto", name: "500", available: true },
  { id: "jeep", category: "Auto", name: "Jeep", available: false },
  { id: "troc", category: "Auto", name: "T-Roc", available: true },
  { id: "visor", category: "Materiale", name: "Visore 3D", available: true },
  { id: "lungarno", category: "Sale", name: "Sala Lungarno", available: false },
  { id: "cellini", category: "Sale", name: "Sala Cellini", available: true },
  { id: "ingresso", category: "Sale", name: "Sala Ingresso", available: true },
];
const COMMUNITY = {
  report: { issue: "REPORT · OTTOBRE 2026", title: "Persone, progetti, città", description: "Il nuovo numero della rivista mensile di studio." },
  items: [
    { id: "c1", kind: "Evento", title: "Festa d'autunno", meta: "23 ottobre · Corte interna" },
    { id: "c2", kind: "Visita", title: "Uscita di gruppo al cantiere Flaminio", meta: "6 novembre · Roma" },
  ],
  poll: { id: "p1", question: "Parteciperai alla festa d'autunno?", options: ["Sì", "No", "Forse"] },
};
export { SITE_TASKS, EVENTS, RESOURCES, COMMUNITY };
