import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { isIT } from './lib/roles';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { NuovoTicket } from './pages/NuovoTicket';
import { MieiTicket } from './pages/MieiTicket';
import { TicketDettaglio } from './pages/TicketDettaglio';
import { Coda, Dashboard } from './pages/IT';

function Rotte() {
  const { stato } = useAuth();
  if (stato.fase === 'avvio') return <div className="splash" aria-label="Caricamento"><span className="dot" /></div>;
  if (stato.fase === 'fuori') return <Login />;
  if (stato.fase === 'errore') return <Login errore={stato.messaggio} />;
  const it = isIT(stato.utente);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={it ? <Navigate to="/it" replace /> : <Home />} />
        <Route path="inizio" element={<Home />} />
        <Route path="ticket/nuovo" element={<NuovoTicket />} />
        <Route path="ticket/miei" element={<MieiTicket />} />
        <Route path="ticket/:id" element={<TicketDettaglio />} />
        {it && <Route path="it" element={<Dashboard />} />}
        {it && <Route path="it/coda" element={<Coda />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return <HashRouter><AuthProvider><Rotte /></AuthProvider></HashRouter>;
}
