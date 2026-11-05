/** Contratti documentati durante la ricostruzione. Il runtime recuperato è JavaScript/JSX. */
export type TaskStatus =
  "validata" | "da_rivedere" | "scaduta" | "in_scadenza" | "in_lavorazione";
export type NoteStatus = "aperta" | "in_corso" | "chiusa";
export type DataSource = "demo" | "excel" | "live";
export type Period = "giorno" | "settimana" | "mese" | "anno" | "custom";
export interface Person {
  id: string;
  nome: string;
  ruolo: "responsabile" | "membro";
  inRiepiloghiOre: boolean;
}
export interface Project {
  id: string;
  codice: string;
  nome: string;
  stato: string;
  ordine: number;
  inElenco: boolean;
}
export interface Task {
  id: string;
  numero: string;
  progettoCodice: string;
  assegnatario: string;
  tipologia: string;
  priorita: string;
  titolo: string;
  descrizione: string;
  inizio?: string;
  scadenza?: string;
  orario?: string;
  statoSorgente: string;
  completed: boolean;
  dataChiusura?: string;
  validated: boolean;
  notValidated: boolean;
  commenti: string;
  immagini: string[];
  linkServer: string;
  sharedRaw: string;
}
export interface Note {
  id: string;
  progettoCodice: string;
  autore: string;
  creata?: string;
  testo: string;
  stato: NoteStatus;
  chiusa?: string;
}
export interface HourRegistration {
  id: string;
  persona: string;
  progettoCodice: string;
  data: string;
  ore: number;
  nota?: string;
}
export interface Dataset {
  persone: Person[];
  progetti: Project[];
  task: Task[];
  note: Note[];
  ore: HourRegistration[];
  meta: {
    source: DataSource;
    label: string;
    loadedAt: string;
    warnings: string[];
    stats: Record<string, number>;
  };
}
export interface DateRange {
  from: string;
  to: string;
  label?: string;
}
