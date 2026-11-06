// ARCHEA Platform · un solo Service Desk per tutta la sessione + barra laterale raggruppata
//
// 1) Il Service Desk (servicedesk/) si carica UNA volta e resta aperto: le sezioni della piattaforma
//    che lo mostrano (Inizio, Chat, Calendario, Off topic, Foto cantiere) hanno solo un "posto" (.sd-slot)
//    e qui la stessa finestra viene appoggiata sopra. Cambiando sezione non si ricarica e non passa dal login.
// 2) La barra laterale mostra le funzioni raggruppate (le stesse cartelle dell'Inizio), sempre a portata.
(function () {
  const live = () => { try { return sessionStorage.getItem('archea-live') === '1'; } catch (e) { return false; } };
  let frame = null, sdWin = null, ready = false, lastView = null, pending = null;

  // ---------- Service Desk sempre aperto ----------
  function ensureFrame(slot) {
    if (frame) return frame;
    let src = slot.dataset.src || './servicedesk/?embed=1&mode=live';
    src = src.replace(/&view=[^&]*/g, '').replace(/&solo=1/g, '') + '&shell=1';
    frame = document.createElement('iframe');
    frame.id = 'archeaSD';
    frame.className = 'archea-sd-frame';
    frame.title = 'Service Desk';
    frame.allow = 'camera; geolocation; clipboard-write; fullscreen';
    frame.src = src;
    document.body.appendChild(frame);
    return frame;
  }
  // chiamata dal Service Desk quando ha caricato profilo e permessi
  let landed = false;
  window.archeaSdReady = function (win) {
    sdWin = win; ready = true; lastView = null;
    // Prima pagina del PM (che non è IT né HR): il riepilogo del lavoro di oggi
    if (!landed) {
      landed = true;
      try {
        const pmOnly = win.hasPerm && win.hasPerm('gestione_progetti') && !win.isITRole() && !win.isHR();
        const atStart = !location.hash || location.hash === '#/' || location.hash === '#/servicedesk' || location.hash === '#/oggi';
        if (pmOnly && atStart && !/[?&](ticket|scan)=/.test(location.search)) setTimeout(() => goTab('oggi'), 0);
      } catch (e) {}
    }
    flushPending();
  };
  function flushPending() {
    if (!ready || !sdWin || !pending) return;
    const k = pending; pending = null;
    try { sdWin.startAction ? sdWin.startAction(k) : sdWin.nav(k); } catch (e) { console.warn('SD', e); }
  }

  function tick() {
    const slot = document.querySelector('.sd-slot');
    if (!live()) {
      if (frame && document.querySelector('.login-submit')) { frame.remove(); frame = null; sdWin = null; ready = false; }
    } else if (slot && slot.offsetParent !== null) {
      ensureFrame(slot);
      const r = slot.getBoundingClientRect();
      const st = frame.style;
      st.left = r.left + 'px'; st.top = r.top + 'px'; st.width = r.width + 'px'; st.height = r.height + 'px';
      if (st.visibility !== 'visible') st.visibility = 'visible';
      const v = slot.dataset.view || '';
      if (ready && v !== lastView) { // sezioni Chat/Calendario/Off topic/Foto: si apre la vista giusta
        lastView = v;
        if (v && !pending) { try { sdWin.nav(v); } catch (e) {} }
      }
      flushPending();
    } else if (frame && frame.style.visibility !== 'hidden') {
      frame.style.visibility = 'hidden';
      lastView = null;
    }
    syncActive();
    ensureNavMounted();
    requestAnimationFrame(tick);
  }

  // ---------- Menu a sinistra: le sezioni della piattaforma raggruppate per tipo ----------
  // (le funzioni del Service Desk stanno nella barra in alto; qui tutto il resto, niente "Altro" nascosto)
  const ICONS = {
    home: 'M3 11l9-7 9 7v9H3z',
    lavoro: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    progetti: 'M3 7h6l2 2h10v10H3z',
    chat: 'M4 5h16v10H9l-5 4V5Z',
    agenda: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
    persone: 'M9 7a4 4 0 1 0 0 .01M2 21v-2a7 7 0 0 1 14 0v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a6 6 0 0 0-4-5.6',
    studio: 'M4 20V8l8-4 8 4v12M9 20v-6h6v6',
    altro: 'M5 12h.01M12 12h.01M19 12h.01',
  };
  const icon = k => `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[k] || ICONS.altro}"/></svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const GROUPS = [
    ['lavoro', 'Il mio lavoro', 'lavoro', ['oggi', 'taskmanager', 'ore', 'note']],
    ['progetti', 'Progetti e cantieri', 'progetti', ['projectmanager', 'progetti', 'avanzamento', 'cantiere', 'fotocantiere']],
    ['comunicazione', 'Comunicazione', 'chat', ['chat', 'offtopic', 'calendario']],
    ['persone', 'Persone', 'persone', ['bio']],
    ['studio', 'Studio', 'studio', ['contabilita', 'insight', 'inarchea', 'fornitori', 'materioteca', 'abacotecnico', 'bim', 'visual', 'interior', 'concept']],
  ];
  function goTab(id) {
    if (location.hash === '#/' + id) history.replaceState(null, '', '#/_');
    location.hash = '#/' + id;
  }
  function run(key) {
    const tab = key.slice(4);
    if (tab === 'servicedesk') { pending = 'home-start'; goTab('servicedesk'); flushPending(); return; }
    goTab(tab);
  }
  function navData() {
    const tabs = (window.__archeaTabs || []).filter(([id]) => id !== 'servicedesk');
    const used = new Set();
    const groups = GROUPS.map(([id, title, ic, ids]) => {
      const items = ids.map(t => tabs.find(x => x[0] === t)).filter(Boolean).map(([t, label]) => { used.add(t); return { key: 'tab:' + t, label }; });
      return { id, title, icon: ic, items };
    }).filter(g => g.items.length);
    const rest = tabs.filter(([t]) => !used.has(t)).map(([t, label]) => ({ key: 'tab:' + t, label }));
    if (rest.length) groups.push({ id: 'altro', title: 'Altri strumenti', icon: 'altro', items: rest });
    return groups;
  }
  let lastSig = '';
  function paint(force) {
    const nav = document.getElementById('archeaNav');
    if (!nav) return;
    // sezione mostrata davvero: se è visibile il Service Desk vale lui (l'indirizzo può dire ancora #/oggi)
    const slot = document.querySelector('.sd-slot');
    const SLOT_TAB = { chat: 'chat', agenda: 'calendario', offtopic: 'offtopic', cantiere: 'fotocantiere' };
    const h = slot && slot.offsetParent !== null ? (SLOT_TAB[slot.dataset.view] || 'servicedesk')
      : (location.hash.replace(/^#\/?/, '').split(/[?/]/)[0] || 'servicedesk');
    const groups = navData();
    const sig = h + '|' + JSON.stringify(groups);
    if (!force && sig === lastSig) return;
    lastSig = sig;
    const aps = nav.querySelectorAll('.aps-desktop-launcher, .aps-desktop-subnav');
    nav.innerHTML = `<button type="button" class="archea-nav-home ${h === 'servicedesk' ? 'on' : ''}" data-key="tab:servicedesk">${icon('home')}<span>Inizio</span></button>` +
      groups.map(g => `<div class="archea-nav-sec"><span class="archea-nav-label">${esc(g.title)}</span>${g.items.map(i =>
        `<button type="button" class="${i.key === 'tab:' + h ? 'on' : ''}" data-key="${esc(i.key)}">${esc(i.label)}</button>`).join('')}</div>`).join('');
    aps.forEach(el => nav.appendChild(el)); // Pianificazione (Super admin) resta in fondo
    nav.querySelectorAll('[data-key]').forEach(b => b.onclick = () => run(b.dataset.key));
  }
  function syncActive() { paint(false); }
  const SIDE_NAV = true;
  function ensureNavMounted() {
    const side = document.querySelector('.desk-sidebar');
    const on = SIDE_NAV && live() && side && (window.__archeaTabs || []).length;
    document.documentElement.classList.toggle('archea-sidenav', !!on);
    if (!on) return;
    let nav = document.getElementById('archeaNav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'archeaNav'; nav.className = 'archea-nav'; nav.setAttribute('aria-label', 'Sezioni');
      const reactNav = side.querySelector(':scope > nav:not(#archeaNav)');
      if (reactNav) reactNav.after(nav); else side.appendChild(nav);
      paint(true);
    }
    // il pulsante Pianificazione (planning-suite) nasce nel menu originale: lo portiamo nel nostro
    const reactNav = side.querySelector(':scope > nav:not(#archeaNav)');
    if (reactNav) reactNav.querySelectorAll(':scope > .aps-desktop-launcher, :scope > .aps-desktop-subnav').forEach(el => nav.appendChild(el));
  }

  // Inizio: per il reparto IT la prima pagina è la Dashboard, per gli altri l'Inizio a cartelle
  window.archeaSdHome = function () { try { return sdWin && sdWin.isITRole && sdWin.isITRole() ? 'home' : 'start'; } catch (e) { return 'start'; } };
  const _flush = flushPending;
  flushPending = function () {
    if (pending === 'home-start') { if (!ready || !sdWin) return; pending = null; try { sdWin.nav(window.archeaSdHome()); } catch (e) {} return; }
    _flush();
  };

  // Chi ha già la sessione: il Service Desk si carica subito, mentre la piattaforma si disegna,
  // così la prima pagina (Dashboard, HR, richieste) è pronta senza riquadro vuoto.
  try {
    if (localStorage.getItem('archea_sd_session')) {
      const pre = () => { if (!frame && document.body) ensureFrame({ dataset: { src: './servicedesk/?embed=1&mode=live&lang=it' } }); };
      document.body ? pre() : document.addEventListener('DOMContentLoaded', pre);
    }
  } catch (e) {}
  requestAnimationFrame(tick);
})();
