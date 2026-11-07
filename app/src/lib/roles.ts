// Ruoli, permessi e menu: logica pura, senza React, così si può testare.

export type Ruolo = 'USER' | 'SUPER_IT';
export type Permesso = 'gestione_utenti' | 'moderazione_offtopic' | 'gestione_calendario' | 'gestione_mappe' | 'gestione_progetti' | 'gestione_it' | 'gestione_hr';

export interface Profilo { id: string; email: string; nome: string | null; ruolo: Ruolo }

export interface Utente { profilo: Profilo; permessi: Permesso[] }

export const isIT = (u: Utente) => u.permessi.includes('gestione_it');
export const isHR = (u: Utente) => u.permessi.includes('gestione_hr');
export const has = (u: Utente, p: Permesso) => u.permessi.includes(p);

export const ETICHETTA_RUOLO: Record<Ruolo, string> = { USER: 'Utente', SUPER_IT: 'Super admin tecnico' };

/** Una voce del menu: o una pagina della nuova app (to) o una funzione ancora nel sito attuale (legacy). */
export interface Voce { key: string; label: string; to?: string; legacy?: string }
export interface Gruppo { id: string; titolo: string; icona: IconaNome; voci: Voce[] }
export type IconaNome = 'lavoro' | 'progetti' | 'it' | 'persone' | 'calendario' | 'chat' | 'admin' | 'home';

// Funzioni non ancora portate: si aprono nel sito attuale (hash della piattaforma)
const old = (hash: string) => `../#/${hash}`;

/** Il menu a sinistra, uguale per tutti nella forma: cambia solo quali gruppi e voci si vedono. */
export function gruppiMenu(u: Utente): Gruppo[] {
  const it = isIT(u), hr = isHR(u), pm = has(u, 'gestione_progetti'), admin = has(u, 'gestione_utenti');
  const g: Gruppo[] = [];
  g.push({ id: 'lavoro', titolo: 'Il mio lavoro', icona: 'lavoro', voci: [
    { key: 'new', label: 'Apri un ticket', to: '/ticket/nuovo' },
    { key: 'mine', label: 'I miei ticket', to: '/ticket/miei' },
    { key: 'taskmanager', label: 'Le mie task', legacy: old('taskmanager') },
    { key: 'cantiere', label: 'Foto cantiere', legacy: old('fotocantiere') },
  ] });
  if (pm) g.push({ id: 'pm', titolo: 'Progetti e cantieri', icona: 'progetti', voci: [
    { key: 'projectmanager', label: 'Progetti e squadre', legacy: old('projectmanager') },
    { key: 'progetti', label: 'Elenco progetti', legacy: old('progetti') },
    { key: 'ore', label: 'Ore', legacy: old('ore') },
  ] });
  if (it) g.push({ id: 'it', titolo: 'Reparto IT', icona: 'it', voci: [
    { key: 'dashboard', label: 'Dashboard', to: '/it' },
    { key: 'coda', label: 'Coda ticket', to: '/it/coda' },
    { key: 'censimento', label: 'Censimento e asset', legacy: old('servicedesk') },
  ] });
  if (hr || it) g.push({ id: 'persone', titolo: hr && it ? 'Persone e spazi' : hr ? 'HR · Persone' : 'Persone e spazi', icona: 'persone', voci: [
    { key: 'movimenti', label: 'Ingressi, uscite, spostamenti', legacy: old('servicedesk') },
    { key: 'organico', label: 'Organico', legacy: old('bio') },
    { key: 'planimetrie', label: 'Planimetrie e postazioni', legacy: old('servicedesk') },
  ] });
  g.push({ id: 'calendario', titolo: 'Calendario', icona: 'calendario', voci: [
    { key: 'agenda', label: 'Calendario comune', legacy: old('calendario') },
  ] });
  g.push({ id: 'comunicazione', titolo: 'Comunicazione', icona: 'chat', voci: [
    { key: 'chat', label: 'Chat', legacy: old('chat') },
    { key: 'offtopic', label: 'Off topic', legacy: old('offtopic') },
  ] });
  if (admin) g.push({ id: 'admin', titolo: 'Amministrazione', icona: 'admin', voci: [
    { key: 'utenti', label: 'Utenti e gruppi', legacy: old('servicedesk') },
  ] });
  return g;
}

/** Prima pagina: il reparto IT parte dalla Dashboard, gli altri dall'Inizio. */
export const primaPagina = (u: Utente) => (isIT(u) ? '/it' : '/');

// ---- Ticket ----
export type Stato = 'APERTO' | 'IN LAVORAZIONE' | 'CHIUSO';
export const STATI: Stato[] = ['APERTO', 'IN LAVORAZIONE', 'CHIUSO'];
export const PRIORITA = ['BASSA', 'NORMALE', 'ALTA', 'URGENTE'];
export const CATEGORIE = ['Supporto IT', 'Installazioni', 'Manutenzioni', 'Hardware', 'Accessi', 'Rete / Wi-Fi', 'Altro'];
export const numeroTicket = (id: number, anno = new Date().getFullYear()) => `TKT-${anno}-${String(id).padStart(5, '0')}`;
