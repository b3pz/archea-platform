import { useNavigate } from 'react-router-dom';
import { fmtData, type Ticket } from '../lib/tickets';
import { numeroTicket } from '../lib/roles';

export function StatoBadge({ stato }: { stato: string }) {
  const cls = stato === 'APERTO' ? 'open' : stato === 'IN LAVORAZIONE' ? 'working' : stato === 'CHIUSO' ? 'closed' : '';
  return <span className={`badge ${cls}`}>{stato}</span>;
}
export function PrioritaBadge({ p }: { p: string | null }) {
  if (!p) return null;
  return <span className={`badge prio-${p.toLowerCase()}`}>{p}</span>;
}

export const numero = (t: Ticket) => t.numero_ticket || numeroTicket(t.id, new Date(t.created_at).getFullYear());

/** Elenco ticket: tabella sul computer, schede sul telefono (stesso markup, cambia il CSS). */
export function TicketList({ tickets, it = false, azione }: { tickets: Ticket[]; it?: boolean; azione?: (t: Ticket) => React.ReactNode }) {
  const go = useNavigate();
  if (!tickets.length) return <p className="empty">Nessun ticket.</p>;
  return (
    <div className="tlist" role="table">
      <div className="tl-row tl-head" role="row">
        <span>Ticket</span><span>Oggetto</span>{it && <span>Richiedente</span>}<span>Stato</span>{it && <span>Assegnato a</span>}<span>Aperto</span>{azione && <span />}
      </div>
      {tickets.map(t => (
        <div key={t.id} className="tl-row" role="row" tabIndex={0} onClick={() => go(`/ticket/${t.id}`)} onKeyDown={e => e.key === 'Enter' && go(`/ticket/${t.id}`)}>
          <span className="tl-num">{numero(t)}</span>
          <span className="tl-sub"><b>{t.oggetto}</b><small>{t.categoria}</small></span>
          {it && <span>{t.richiedente_nome || t.richiedente_email}</span>}
          <span><StatoBadge stato={t.stato} /> {it && <PrioritaBadge p={t.priorita} />}</span>
          {it && <span>{t.assegnato_a || <em className="muted">non assegnato</em>}</span>}
          <span className="muted">{fmtData(t.created_at)}</span>
          {azione && <span onClick={e => e.stopPropagation()}>{azione(t)}</span>}
        </div>
      ))}
    </div>
  );
}
