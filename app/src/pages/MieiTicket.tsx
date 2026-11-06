import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUtente } from '../lib/auth';
import { mieiTicket } from '../lib/tickets';
import { TicketList } from '../components/Ticket';

export function MieiTicket() {
  const u = useUtente();
  const q = useQuery({ queryKey: ['ticket', 'miei', u.profilo.email], queryFn: () => mieiTicket(u.profilo.email) });
  return (
    <>
      <header className="page-head row"><div><h1>I miei ticket</h1><p className="muted">Lo stato delle tue richieste all'IT.</p></div>
        <Link to="/ticket/nuovo" className="btn primary">+ Apri un ticket</Link></header>
      <section className="card">{q.isLoading ? <p className="muted">Caricamento…</p> : q.error ? <p className="error">{(q.error as Error).message}</p> : <TicketList tickets={q.data!} />}</section>
    </>
  );
}
