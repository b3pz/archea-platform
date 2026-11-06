// ARCHEA Platform · un solo Service Desk per tutta la sessione + barra laterale raggruppata
//
// 1) Il Service Desk (servicedesk/) si carica UNA volta e resta aperto: le sezioni della piattaforma
//    che lo mostrano (Inizio, Chat, Calendario, Off topic, Foto cantiere) hanno solo un "posto" (.sd-slot)
//    e qui la stessa finestra viene appoggiata sopra. Cambiando sezione non si ricarica e non passa dal login.
// 2) La barra laterale mostra le funzioni raggruppate (le stesse cartelle dell'Inizio), sempre a portata.
(function () {
  const live = () => { try { return sessionStorage.getItem('archea-live') === '1'; } catch (e) { return false; } };
  const NAV_CACHE = 'archea-nav-cache';
  let frame = null, sdWin = null, ready = false, lastView = null, pending = null, activeKey = null, openGroup = null;

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
    try {
      const groups = win.sdNavGroups();
      localStorage.setItem(NAV_CACHE, JSON.stringify(groups));
      renderNav(groups);
    } catch (e) { console.warn('nav', e); }
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

  // ---------- Barra laterale raggruppata ----------
  const ICONS = {
    mine: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    cantiere: 'M4 8h3l2-3h6l2 3h3v11H4z M12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7',
    it: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
    persone: 'M9 7a4 4 0 1 0 0 .01M2 21v-2a7 7 0 0 1 14 0v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a6 6 0 0 0-4-5.6',
    agenda: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
    chat: 'M4 5h16v10H9l-5 4V5Z',
    utenti: 'M9 7a4 4 0 1 0 0 .01M2 21v-2a7 7 0 0 1 14 0v2M19 8v6M16 11h6',
    home: 'M3 11l9-7 9 7v9H3z',
    altro: 'M5 12h.01M12 12h.01M19 12h.01',
  };
  const icon = k => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[k] || ICONS.altro}"/></svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  // sezioni della piattaforma già raggiungibili dai gruppi
  const COVERED = ['servicedesk', 'oggi', 'taskmanager', 'calendario', 'chat', 'offtopic', 'fotocantiere', 'bio', 'projectmanager', 'progetti', 'ore', 'altro', 'developer'];

  function goTab(id) {
    if (location.hash === '#/' + id) history.replaceState(null, '', '#/_');
    location.hash = '#/' + id;
  }
  function run(key, groupId) {
    activeKey = key; openGroup = groupId || openGroup;
    if (key === 'tab:servicedesk') { pending = sdHomeKey(); goTab('servicedesk'); flushPending(); paint(); return; }
    if (key.startsWith('tab:')) { goTab(key.slice(4)); paint(); return; }
    if (key.startsWith('ws:')) {
      let tab = key.slice(3);
      if (window.matchMedia('(max-width: 900px)').matches) tab = { taskmanager: 'oggi', projectmanager: 'progetti' }[tab] || tab;
      goTab(tab); paint(); return;
    }
    pending = key;
    goTab('servicedesk');
    flushPending();
    paint();
  }
  const sdHomeKey = () => 'home-start';

  let groupsCache = null;
  function renderNav(groups) {
    groupsCache = groups || groupsCache;
    paint();
  }
  function navData() {
    let groups = groupsCache;
    if (!groups) { try { groups = JSON.parse(localStorage.getItem(NAV_CACHE) || 'null'); } catch (e) {} }
    groups = groups || [];
    const tabs = (window.__archeaTabs || []).filter(([id]) => !COVERED.includes(id));
    const extra = tabs.length ? [{ id: 'altro', title: 'Altro', icon: 'altro', items: tabs.map(([id, label]) => ({ key: 'tab:' + id, label, tab: id })) }] : [];
    return [...groups, ...extra];
  }
  function paint() {
    const nav = document.getElementById('archeaNav');
    if (!nav) return;
    const groups = navData();
    if (!openGroup) { const g = groups.find(x => x.items.some(i => i.key === activeKey)); openGroup = g ? g.id : null; }
    nav.innerHTML = `
      <button type="button" class="archea-nav-home ${activeKey === 'tab:servicedesk' ? 'on' : ''}" data-key="tab:servicedesk">${icon('home')}<span>Inizio</span></button>
      ${groups.map(g => `<div class="archea-nav-group ${openGroup === g.id ? 'open' : ''}">
        <button type="button" class="archea-nav-head" data-group="${esc(g.id)}" aria-expanded="${openGroup === g.id}">${icon(g.icon)}<span>${esc(g.title)}</span><i aria-hidden="true">›</i></button>
        <div class="archea-nav-items">${g.items.map(i => `<button type="button" class="${i.key === activeKey ? 'on' : ''}" data-key="${esc(i.key)}" data-g="${esc(g.id)}">${esc(i.label)}</button>`).join('')}</div>
      </div>`).join('')}`;
    nav.querySelectorAll('[data-group]').forEach(b => b.onclick = () => { openGroup = openGroup === b.dataset.group ? null : b.dataset.group; paint(); });
    nav.querySelectorAll('[data-key]').forEach(b => b.onclick = () => run(b.dataset.key, b.dataset.g));
  }
  // evidenzia la voce giusta anche quando si naviga da dentro le pagine
  let lastSeen = '';
  function syncActive() {
    if (!document.getElementById('archeaNav')) return;
    const slot = document.querySelector('.sd-slot');
    let sig;
    if (slot && slot.offsetParent !== null && ready) {
      let v = ''; try { v = sdWin.sdCurrentView ? sdWin.sdCurrentView() : ''; } catch (e) {}
      sig = 'sd:' + v;
      if (sig !== lastSeen) {
        lastSeen = sig;
        const groups = navData();
        const cur = groups.flatMap(g => g.items.map(i => ({ ...i, g: g.id })));
        const keep = cur.find(i => i.key === activeKey && i.view === v);
        if (!keep) {
          const hit = cur.find(i => i.g === openGroup && i.view === v) || cur.find(i => i.view === v || i.key === v);
          activeKey = hit ? hit.key : (v === 'start' ? 'tab:servicedesk' : activeKey);
          if (hit) openGroup = hit.g;
        }
        paint();
      }
    } else {
      const h = location.hash.slice(2);
      sig = 'tab:' + h;
      if (sig !== lastSeen) {
        lastSeen = sig;
        const cur = navData().flatMap(g => g.items.map(i => ({ ...i, g: g.id })));
        const hit = cur.find(i => i.key === 'ws:' + h || i.key === 'tab:' + h);
        if (hit) { activeKey = hit.key; openGroup = hit.g; paint(); }
      }
    }
  }
  // Menu raggruppato a sinistra disattivato: si usa la barra delle funzioni in alto (preferita)
  const SIDE_NAV = false;
  function ensureNavMounted() {
    const side = document.querySelector('.desk-sidebar');
    const on = SIDE_NAV && live() && side;
    document.documentElement.classList.toggle('archea-sidenav', !!on);
    if (!on) return;
    if (!document.getElementById('archeaNav')) {
      const nav = document.createElement('div');
      nav.setAttribute('role', 'navigation');
      nav.id = 'archeaNav'; nav.className = 'archea-nav'; nav.setAttribute('aria-label', 'Funzioni');
      const reactNav = side.querySelector(':scope > nav');
      if (reactNav) reactNav.after(nav); else side.appendChild(nav);
      paint();
    }
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
