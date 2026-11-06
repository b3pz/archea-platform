import { useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUtente } from '../lib/auth';
import { isIT, PRIORITA, STATI, type Stato } from '../lib/roles';
import { aggiornaTicket, aggiungiCommento, commenti, fmtData, ticket } from '../lib/tickets';
import { numero, PrioritaBadge, StatoBadge } from '../components/Ticket';

export function TicketDettaglio() {
  const id = Number(useParams().id);
  const u = useUtente();
  const it = isIT(u);
  const qc = useQueryClient();
  const creato = (useLocation().state as { creato?: string } | null)?.creato;
  const t = useQuery({ queryKey: ['ticket', id], queryFn: () => ticket(id) });
  const c = useQuery({ queryKey: ['commenti', id], queryFn: () => commenti(id) });
  const [testo, setTesto] = useState('');
  const [interna, setInterna] = useState(false);

  const ricarica = () => { qc.invalidateQueries({ queryKey: ['ticket'] }); qc.invalidateQueries({ queryKey: ['commenti', id] }); };
  const aggiorna = useMutation({
    mutationFn: (a: { campi: Parameters<typeof aggiornaTicket>[2]; evento: string }) => aggiornaTicket(u, id, a.campi, a.evento),
    onSuccess: ricarica,
  });
  const commenta = useMutation({
    mutationFn: () => aggiungiCommento(u, id, testo.trim(), it && interna),
    onSuccess: () => { setTesto(''); setInterna(false); ricarica(); },
  });

  if (t.isLoading) return <p className="muted">Caricamento…</p>;
  if (t.error || !t.data) return <p className="error">Ticket non trovato o non visibile per il tuo account.</p>;
  const x = t.data;
  const visibili = (c.data || []).filter(m => it || !m.nota_interna);
  const invia = (e: FormEvent) => { e.preventDefault(); if (testo.trim()) commenta.mutate(); };

  return (
    <>
      {creato && <p className="ok-banner" role="status">Ticket {creato} creato. L'IT è stato avvisato.</p>}
      <header className="page-head"><span className="eyebrow">{numero(x)} · {x.categoria}</span><h1>{x.oggetto}</h1>
        <p className="row gap"><StatoBadge stato={x.stato} /><PrioritaBadge p={x.priorita} /><span className="muted">Aperto il {fmtData(x.created_at)} da {x.richiedente_nome || x.richiedente_email}</span></p>
      </header>
      <div className="grid-2">
        <section className="card">
          <h2>Descrizione</h2><p className="pre">{x.descrizione || '—'}</p>
          <h2>Conversazione</h2>
          {visibili.length ? <ul className="thread">{visibili.map(m => (
            <li key={m.id} className={m.nota_interna ? 'internal' : m.autore_email === u.profilo.email ? 'mine' : ''}>
              <b>{m.autore || m.autore_email}</b>{m.nota_interna && <em> · nota interna IT</em>}<small>{fmtData(m.created_at)}</small><p className="pre">{m.testo}</p>
            </li>))}</ul> : <p className="muted">Ancora nessun messaggio.</p>}
          <form onSubmit={invia} className="form-inline">
            <textarea rows={3} value={testo} onChange={e => setTesto(e.target.value)} placeholder={it ? 'Scrivi al collega…' : 'Scrivi all\'IT…'} aria-label="Messaggio" />
            <div className="row">
              {it && <label className="check"><input type="checkbox" checked={interna} onChange={e => setInterna(e.target.checked)} /> Nota interna IT</label>}
              <span className="spacer" /><button className="btn primary" disabled={commenta.isPending || !testo.trim()}>Invia</button>
            </div>
            {commenta.error && <p className="error">{(commenta.error as Error).message}</p>}
          </form>
        </section>
        {it && (
          <section className="card">
            <h2>Gestione IT</h2>
            <p className="muted">Responsabile: <b>{x.assegnato_a || 'nessuno'}</b></p>
            {x.assigned_to !== u.profilo.id && x.stato !== 'CHIUSO' && (
              <button className="btn primary" onClick={() => aggiorna.mutate({ campi: { assigned_to: u.profilo.id, assegnato_a: u.profilo.nome, stato: x.stato === 'APERTO' ? 'IN LAVORAZIONE' : x.stato }, evento: `Preso in carico da ${u.profilo.nome}` })}>Prendi in carico</button>
            )}
            <label>Stato
              <select value={x.stato} onChange={e => aggiorna.mutate({ campi: { stato: e.target.value as Stato }, evento: `Stato: ${e.target.value}` })}>
                {STATI.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Priorità
              <select value={x.priorita || 'NORMALE'} onChange={e => aggiorna.mutate({ campi: { priorita: e.target.value }, evento: `Priorità: ${e.target.value}` })}>
                {PRIORITA.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            {aggiorna.isPending && <p className="muted">Salvataggio…</p>}
            {aggiorna.error && <p className="error">{(aggiorna.error as Error).message}</p>}
          </section>
        )}
      </div>
    </>
  );
}
