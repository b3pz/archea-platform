import { supabase } from './supabase';
import { numeroTicket, type Stato, type Utente } from './roles';

export interface Ticket {
  id: number; numero_ticket: string | null; oggetto: string; descrizione: string | null; categoria: string;
  stato: Stato; priorita: string | null; richiedente_nome: string | null; richiedente_email: string;
  assigned_to: string | null; assegnato_a: string | null; sede: string | null;
  created_at: string; updated_at: string | null;
}
export interface Commento { id: number; ticket_id: number; autore: string | null; autore_email: string | null; testo: string; nota_interna: boolean; created_at: string }

const ok = <T,>(r: { data: T | null; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data as T; };

export const mieiTicket = async (email: string) =>
  ok(await supabase.from('tickets').select('*').eq('richiedente_email', email).order('created_at', { ascending: false })) as Ticket[];

export const tuttiTicket = async () =>
  ok(await supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(500)) as Ticket[];

export const ticket = async (id: number) => ok(await supabase.from('tickets').select('*').eq('id', id).single()) as Ticket;

export const commenti = async (id: number) =>
  ok(await supabase.from('comments').select('*').eq('ticket_id', id).order('created_at', { ascending: true })) as Commento[];

export async function creaTicket(u: Utente, dati: { categoria: string; oggetto: string; descrizione: string }) {
  const p = u.profilo;
  const t = ok(await supabase.from('tickets').insert({
    ...dati, stato: 'APERTO', priorita: 'NORMALE', richiedente_nome: p.nome, richiedente_email: p.email,
    created_by: p.id, created_by_name: p.nome, origine: 'Portale',
  }).select('id').single()) as { id: number };
  const numero = numeroTicket(t.id);
  ok(await supabase.from('tickets').update({ numero_ticket: numero }).eq('id', t.id));
  // avviso Telegram all'IT e storico: se falliscono il ticket resta comunque creato
  supabase.functions.invoke('telegram-new-ticket', { body: { ticket_id: t.id } }).catch(() => {});
  supabase.from('ticket_history').insert({ ticket_id: t.id, evento: 'Ticket creato', autore: p.nome }).then(() => {});
  return { id: t.id, numero };
}

export async function aggiornaTicket(u: Utente, id: number, campi: Partial<Pick<Ticket, 'stato' | 'assigned_to' | 'assegnato_a' | 'priorita'>>, evento: string) {
  ok(await supabase.from('tickets').update({ ...campi, updated_at: new Date().toISOString() }).eq('id', id));
  supabase.from('ticket_history').insert({ ticket_id: id, evento, autore: u.profilo.nome }).then(() => {});
}

export async function aggiungiCommento(u: Utente, id: number, testo: string, notaInterna: boolean) {
  ok(await supabase.from('comments').insert({ ticket_id: id, autore: u.profilo.nome, autore_email: u.profilo.email, testo, nota_interna: notaInterna }));
}

export const fmtData = (d: string | null) => d ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : '—';
