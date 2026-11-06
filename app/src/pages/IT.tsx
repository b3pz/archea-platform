import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUtente } from '../lib/auth';
import { aggiornaTicket, tuttiTicket, type Ticket } from '../lib/tickets';
import { TicketList } from '../components/Ticket';

const useTutti = () => useQuery({ queryKey: ['ticket', 'tutti'], queryFn: tuttiTicket, refetchInterval: 30_000 });

function usePrendi() {
  const u = useUtente(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Ticket) => aggiornaTicket(u, t.id, { assigned_to: u.profilo.id, assegnato_a: u.profilo.nome, stato: 'IN LAVORAZIONE' }, `Preso in carico da ${u.profilo.nome}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket'] }),
  });
}

/** Prima pagina del reparto IT. */
export function Dashboard() {
  const u = useUtente();
  const q = useTutti();
  const prendi = usePrendi();
  const aperti = (q.data || []).filter(t => t.stato !== 'CHIUSO');
  const nonAss = aperti.filter(t => !t.assigned_to);
  const numeri: [string, number, string][] = [
    ['Da prendere in carico', nonAss.length, '/it/coda?f=liberi'],
    ['Assegnati a te', aperti.filter(t => t.assigned_to === u.profilo.id).length, '/it/coda?f=miei'],
    ['Urgenti', aperti.filter(t => t.priorita === 'URGENTE').length, '/it/coda?f=urgenti'],
    ['Aperti in tutto', aperti.length, '/it/coda'],
  ];
  return (
    <>
      <header className="page-head"><h1>Dashboard IT</h1><p className="muted">Si aggiorna da sola ogni 30 secondi.</p></header>
      <div className="kpis">{numeri.map(([l, n, to]) => <Link key={l} to={to} className="card kpi"><span>{l}</span><b>{q.isLoading ? '…' : n}</b></Link>)}</div>
      <section className="card"><h2>Da prendere in carico</h2>
        {q.error ? <p className="error">{(q.error as Error).message}</p> :
          <TicketList it tickets={nonAss.slice(0, 10)} azione={t => <button className="btn small" disabled={prendi.isPending} onClick={() => prendi.mutate(t)}>Prendi</button>} />}
      </section>
    </>
  );
}

const FILTRI: Record<string, [string, (t: Ticket, uid: string) => boolean]> = {
  aperti: ['Aperti', t => t.stato !== 'CHIUSO'],
  liberi: ['Non assegnati', t => t.stato !== 'CHIUSO' && !t.assigned_to],
  miei: ['Assegnati a me', (t, uid) => t.stato !== 'CHIUSO' && t.assigned_to === uid],
  urgenti: ['Urgenti', t => t.stato !== 'CHIUSO' && t.priorita === 'URGENTE'],
  chiusi: ['Chiusi', t => t.stato === 'CHIUSO'],
};

export function Coda() {
  const u = useUtente();
  const q = useTutti();
  const prendi = usePrendi();
  const iniziale = useSearchParams()[0].get('f') || 'aperti';
  const [f, setF] = useState(FILTRI[iniziale] ? iniziale : 'aperti');
  const [cerca, setCerca] = useState('');
  const lista = useMemo(() => {
    const s = cerca.trim().toLowerCase();
    return (q.data || []).filter(t => FILTRI[f][1](t, u.profilo.id))
      .filter(t => !s || [t.numero_ticket, t.oggetto, t.richiedente_nome, t.richiedente_email, t.categoria].some(v => (v || '').toLowerCase().includes(s)));
  }, [q.data, f, cerca, u.profilo.id]);
  return (
    <>
      <header className="page-head"><h1>Coda ticket</h1></header>
      <div className="toolbar">
        <div className="chips" role="tablist">{Object.entries(FILTRI).map(([k, [l]]) => (
          <button key={k} role="tab" aria-selected={f === k} className={`chip${f === k ? ' on' : ''}`} onClick={() => setF(k)}>
            {l} <b>{(q.data || []).filter(t => FILTRI[k][1](t, u.profilo.id)).length}</b></button>))}</div>
        <input type="search" placeholder="Cerca numero, oggetto, persona…" value={cerca} onChange={e => setCerca(e.target.value)} aria-label="Cerca" />
      </div>
      <section className="card">{q.isLoading ? <p className="muted">Caricamento…</p> : q.error ? <p className="error">{(q.error as Error).message}</p> :
        <TicketList it tickets={lista} azione={t => !t.assigned_to && t.stato !== 'CHIUSO' ? <button className="btn small" onClick={() => prendi.mutate(t)}>Prendi</button> : null} />}</section>
    </>
  );
}
