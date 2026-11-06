import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUtente } from '../lib/auth';
import { gruppiMenu } from '../lib/roles';
import { mieiTicket } from '../lib/tickets';
import { Icona } from '../components/Icona';
import { TicketList } from '../components/Ticket';

const saluto = () => { const h = new Date().getHours(); return h < 5 ? 'Buonasera' : h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'; };

/** Inizio: ogni gruppo con le sue funzioni già visibili, un clic e sei dentro. */
export function Home() {
  const u = useUtente();
  const miei = useQuery({ queryKey: ['ticket', 'miei', u.profilo.email], queryFn: () => mieiTicket(u.profilo.email) });
  const primo = (u.profilo.nome || '').split(/\s+/)[0] || 'ciao';
  return (
    <>
      <section className="hero"><h1>{saluto()}, {primo}!</h1><p className="muted">Cosa facciamo?</p></section>
      <div className="sections">
        {gruppiMenu(u).map(g => (
          <section key={g.id} className="card sec">
            <h2><span className="ico"><Icona nome={g.icona} /></span>{g.titolo}</h2>
            <div className="sec-actions">
              {g.voci.map(v => v.to
                ? <Link key={v.key} to={v.to} className="act">{v.label}</Link>
                : <a key={v.key} href={v.legacy} className="act legacy">{v.label}<Icona nome="esterno" size={14} /></a>)}
            </div>
          </section>
        ))}
      </div>
      {!!miei.data?.length && (
        <section className="card"><h2>Le tue ultime richieste</h2><TicketList tickets={miei.data.slice(0, 3)} /></section>
      )}
    </>
  );
}
