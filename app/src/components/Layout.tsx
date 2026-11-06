import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth, useUtente } from '../lib/auth';
import { ETICHETTA_RUOLO, gruppiMenu, isIT } from '../lib/roles';
import { Icona } from './Icona';
import { useTema } from '../lib/tema';

export function Layout() {
  const u = useUtente();
  const { esci } = useAuth();
  const [tema, cambiaTema] = useTema();
  const loc = useLocation();
  const gruppi = gruppiMenu(u);
  const attivo = gruppi.find(g => g.voci.some(v => v.to && (v.to === loc.pathname || (v.to !== '/' && loc.pathname.startsWith(v.to + '/')))))?.id ?? null;
  const [aperto, setAperto] = useState<string | null>(attivo);
  const [menuMobile, setMenuMobile] = useState(false);
  useEffect(() => { if (attivo) setAperto(attivo); setMenuMobile(false); }, [loc.pathname, attivo]);
  const nome = u.profilo.nome || u.profilo.email;

  return (
    <div className="shell">
      <aside className={`side${menuMobile ? ' open' : ''}`}>
        <div className="brand">ARCHEA ASSOCIATI</div>
        <nav aria-label="Funzioni">
          <NavLink end to={isIT(u) ? '/it' : '/'} className="side-home"><Icona nome="home" /><span>Inizio</span></NavLink>
          {gruppi.map(g => (
            <div key={g.id} className={`side-group${aperto === g.id ? ' open' : ''}`}>
              <button type="button" className="side-head" aria-expanded={aperto === g.id} onClick={() => setAperto(aperto === g.id ? null : g.id)}>
                <Icona nome={g.icona} /><span>{g.titolo}</span><i aria-hidden="true">›</i>
              </button>
              <div className="side-items">
                {g.voci.map(v => v.to
                  ? <NavLink key={v.key} end to={v.to}>{v.label}</NavLink>
                  : <a key={v.key} href={v.legacy} className="legacy" title="Ancora nella versione attuale">{v.label}<Icona nome="esterno" size={14} /></a>)}
              </div>
            </div>
          ))}
        </nav>
        <div className="side-user">
          <span className="avatar">{nome.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()}</span>
          <span className="who"><b>{nome}</b><small>{ETICHETTA_RUOLO[u.profilo.ruolo]}</small></span>
          <button type="button" className="icon-btn" onClick={esci} title="Esci" aria-label="Esci"><Icona nome="esci" /></button>
        </div>
      </aside>
      {menuMobile && <div className="scrim" onClick={() => setMenuMobile(false)} />}
      <div className="main">
        <header className="top">
          <button type="button" className="icon-btn only-mobile" onClick={() => setMenuMobile(true)} aria-label="Menu"><Icona nome="menu" /></button>
          <span className="top-brand only-mobile">ARCHEA</span>
          <span className="beta">Nuova versione · in prova</span>
          <span className="spacer" />
          <button type="button" className="icon-btn" onClick={cambiaTema} aria-label="Cambia tema" title="Tema chiaro o scuro"><Icona nome={tema === 'dark' ? 'sole' : 'luna'} /></button>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
