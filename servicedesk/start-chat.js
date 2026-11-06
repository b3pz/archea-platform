/*
 * Service Desk V9.1 · Inizio (saluto + azioni rapide) e Chat tra utenti
 * Caricato dopo app.js: usa le sue funzioni (select, insert, update, rpc, nav, page, esc…).
 *
 * Chat LIVE: richiede supabase/migrations/20261106_chat.sql (tabella chat_messages,
 * funzione chat_contacts, notifica automatica al destinatario).
 */

// ---------- INIZIO ----------
const START_ACTIONS = {
  new:            ['Apri un ticket', 'Segnala un problema o chiedi assistenza', 'new'],
  mine:           ['I miei ticket', 'Segui lo stato delle tue richieste', 'mine'],
  booking:        ['Prenota materiale', 'Matterport, iPad, laptop…', 'prenotazioni'],
  chat:           ['Chat', 'Scrivi a un collega o al reparto IT', 'chat'],
  utenti:         ['Utenti e gruppi', 'Aggiungi colleghi, ruoli e permessi', 'utenti'],
  cantiere:       ['Foto cantiere', 'Scatta e archivia le foto per commessa', 'cantiere'],
  offtopic:       ['Off topic', 'Eventi, consigli, mercatino: due chiacchiere', 'offtopic'],
  agenda:         ['Calendario comune', 'Appuntamenti, sale e auto di tutti', 'agenda'],
  appt:           ['Fissa un appuntamento', 'Invita i colleghi: ricevono la notifica', 'agenda'],
  room:           ['Prenota sala meeting', 'Controlla se è libera e prenota', 'room'],
  car:            ['Prenota auto', 'Auto aziendali per cantieri e trasferte', 'car'],
  it:             ['Coda ticket', 'Prendi in carico e gestisci', 'it'],
  home:           ['Dashboard', 'Panoramica e carico del team', 'home'],
  scan:           ['Scansiona asset', 'Apri la scheda con la fotocamera', 'censimento'],
  censimento:     ['Censimento', 'Asset, verifiche e storico', 'censimento'],
  persone:        ['Persone', 'Anagrafica e asset assegnati', 'persone'],
  movimenti:      ['Movimenti', 'Ingressi, uscite e spostamenti', 'movimenti'],
  'hr-new':       ['Nuovo movimento', 'Ingresso, uscita o cambio sede', 'hr-new'],
  'hr-history':   ['Storico movimenti', 'Movimenti da confermare', 'hr-history'],
  'hr-stats':     ['Statistiche HR', 'Andamento di ingressi e uscite', 'hr-stats'],
  mappa:          ['Postazioni', 'Elenco postazioni e magazzino', 'mappa'],
  planimetrie:    ['Planimetrie', 'Chi siede dove, sposta persone e dispositivi', 'planimetrie'],
  calendar:       ['Appuntamenti IT', 'Appuntamenti legati ai ticket', 'calendar'],
  prenotazioni:   ['Prestiti materiale', 'Gestisci il materiale in prestito', 'prenotazioni'],
  eliminazioni:   ['Eliminazioni', 'Richieste di eliminazione da approvare', 'eliminazioni'],
  // voci del Workspace (si aprono nella piattaforma)
  'ws:taskmanager':    ['Le mie task', 'Le attività che ti hanno assegnato: aggiornale qui', 'mine'],
  'ws:oggi':           ['Il mio lavoro di oggi', 'Task in scadenza, ore e scadenze', 'home'],
  'ws:bio':            ['Organico', 'Ruoli, contratti e dati del personale', 'persone'],
  'ws:projectmanager': ['Nuovo progetto e squadra', 'Crea la commessa e scegli chi ci lavora', 'planimetrie'],
  'ws:progetti':       ['Progetti', 'Le commesse e il loro avanzamento', 'home'],
  'ws:ore':            ['Ore', 'Ore registrate da te e dal team', 'calendar']
};
START_ACTIONS['hr-new'] = ['Ingresso, uscita o spostamento', 'Nuovo arrivo, chi lascia lo studio, cambio sede', 'hr-new'];

// Inizio: le funzioni raggruppate per argomento. Ogni ruolo vede i suoi gruppi, tutto visibile.
// Inizio: poche "cartelle" grandi; dentro ognuna le sue funzioni (restano nascoste finché non la apri)
// [id, titolo, descrizione, icona, azioni]
function startGroups() {
  const it = isITRole(), hrOnly = isHR() && !it, pm = typeof hasPerm === 'function' && hasPerm('gestione_progetti');
  const admin = typeof hasPerm === 'function' && hasPerm('gestione_utenti');
  const g = [];
  // le foto di cantiere stanno con i progetti: nel lavoro di tutti, e nella cartella Progetti per i PM
  g.push(['lavoro', 'Il mio lavoro', 'Le tue task, i tuoi ticket, le foto di cantiere', 'mine', ['ws:taskmanager', 'new', 'mine', 'cantiere', 'ws:oggi']]);
  if (pm) g.push(['pm', 'Progetti e cantieri', 'Crea progetti, assegna task, foto di cantiere', 'cantiere', ['ws:projectmanager', 'ws:progetti', 'cantiere', 'ws:ore']]);
  if (it) g.push(['it', 'Reparto IT', 'Ticket da gestire, asset e censimento', 'it', ['it', 'home', 'scan', 'censimento', 'calendar', 'prenotazioni', 'eliminazioni']]);
  if (hrOnly) g.push(['hr', 'HR · Persone', 'Ingressi, uscite, spostamenti e organico', 'persone', ['hr-new', 'persone', 'hr-history', 'hr-stats', 'ws:bio', 'planimetrie', 'mappa']]);
  if (it) g.push(['persone', 'Persone e spazi', 'Anagrafica, movimenti, planimetrie', 'persone', ['persone', 'movimenti', 'ws:bio', 'planimetrie', 'mappa']]);
  g.push(['calendario', 'Calendario e prenotazioni', 'Appuntamenti, sale, auto e materiale', 'agenda', ['appt', 'room', 'car', 'agenda', ...(it ? [] : ['booking'])]]);
  g.push(['comunicazione', 'Comunicazione', 'Chat con i colleghi e Off topic', 'chat', ['chat', 'offtopic']]);
  if (admin) g.push(['admin', 'Amministrazione', 'Utenti, gruppi e permessi', 'utenti', ['utenti']]);
  return g;
}
function startActionsForRole() { return startGroups().flatMap(g => g[4]); }
function startActionsBase() { return startActionsForRole(); }

function greetingWord() {
  const h = new Date().getHours();
  return h < 5 ? 'Buonasera' : h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
}

async function start() {
  const epoch = navigationEpoch;
  const first = String(profile?.nome || user?.email || '').trim().split(/\s+/)[0] || 'ciao';
  page('Inizio', 'Service Desk ARCHEA');

  // contatori e ultime richieste: dentro le rispettive cartelle, non sulla prima pagina
  let itSummary = '', userSummary = '', itBadge = '';
  try {
    if (isITRole()) {
      const d = await select('tickets', 'select=id,stato,priorita,assigned_to');
      const open = d.filter(x => x.stato !== 'CHIUSO');
      const unassigned = open.filter(x => !x.assigned_to).length;
      if (unassigned) itBadge = `${unassigned} da assegnare`;
      const chips = [
        ['Non assegnati', unassigned],
        ['Urgenti', open.filter(x => x.priorita === 'URGENTE').length],
        ['Assegnati a te', open.filter(x => x.assigned_to === user.id).length],
        ['Aperti', open.length]
      ];
      itSummary = `<div class="start-summary">${chips.map(([l, n]) => `<button class="start-chip" data-start="it"><b>${n}</b><span>${esc(l)}</span></button>`).join('')}</div>`;
    }
    const mineT = await select('tickets', `select=id,numero_ticket,oggetto,stato,created_at&richiedente_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=3`);
    if (mineT.length) userSummary = `<div class="panel start-recent"><h3>Le tue ultime richieste</h3>${mineT.map(t => `<button class="start-ticket" data-open-ticket="${t.id}"><b>${esc(t.numero_ticket || num(t.id))}</b><span>${esc(t.oggetto)}</span>${badge(t.stato)}</button>`).join('')}</div>`;
  } catch (e) { console.warn('Riepilogo inizio non disponibile:', e.message); }
  if (epoch !== navigationEpoch) return;

  const groups = startGroups();
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${NAV_ICON_PATHS[k] || NAV_ICON_PATHS.mine}</svg>`;
  const badgeFor = id => id === 'it' && itBadge ? `<em class="start-folder-badge">${esc(itBadge)}</em>` : '';
  const renderHome = () => {
    document.documentElement.classList.add('sd-on-start');
    $('content').innerHTML = `
      <section class="start-hero">
        <span class="eyebrow">SERVICE DESK</span>
        <h3>${greetingWord()}, ${esc(first)}!</h3>
        <p>Cosa facciamo?</p>
      </section>
      <div class="start-folders">
        ${groups.map(([id, title, sub, ic, keys]) => `<button class="start-folder" data-folder="${id}">
          <span class="start-icon">${icon(ic)}</span>
          <span class="start-text"><b>${esc(title)}${badgeFor(id)}</b><small>${esc(sub)}</small></span>
          <i class="start-folder-arrow" aria-hidden="true">›</i>
        </button>`).join('')}
      </div>`;
    document.querySelectorAll('[data-folder]').forEach(b => b.onclick = () => renderGroup(b.dataset.folder));
  };
  const renderGroup = id => {
    document.documentElement.classList.add('sd-on-start');
    const grp = groups.find(x => x[0] === id); if (!grp) return renderHome();
    const [, title, sub, , keys] = grp;
    $('content').innerHTML = `
      <button class="secondary compact start-back" id="startBack">‹ Inizio</button>
      <section class="start-hero small"><h3>${esc(title)}</h3><p>${esc(sub)}</p></section>
      ${id === 'it' ? itSummary : id === 'lavoro' ? userSummary : ''}
      <div class="start-grid">
        ${keys.filter(k => START_ACTIONS[k]).map((key, i) => {
          const [t, s2, ic] = START_ACTIONS[key];
          return `<button class="start-action${i === 0 ? ' primary-action' : ''}" data-start="${key}">
            <span class="start-icon">${icon(ic)}</span>
            <span class="start-text"><b>${esc(t)}</b><small>${esc(s2)}</small></span>
          </button>`;
        }).join('')}
      </div>`;
    $('startBack').onclick = renderHome;
    document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startAction(b.dataset.start));
    document.querySelectorAll('[data-open-ticket]').forEach(b => b.onclick = () => openSubView('ticket-detail', () => detail(+b.dataset.openTicket)));
    window.scrollTo(0, 0);
  };
  renderHome();
  if (typeof fotoFlushQueue === 'function') fotoFlushQueue();
}

function startAction(key) {
  // voci del Workspace: si apre la sezione nella piattaforma
  if (key.startsWith('ws:')) {
    let tab = key.slice(3);
    // sul telefono alcune sezioni hanno un'altra forma
    if (window.matchMedia('(max-width: 900px)').matches) tab = { taskmanager: 'oggi', projectmanager: 'progetti' }[tab] || tab;
    try { if (window.top !== window) { window.top.location.hash = '#/' + tab; return; } } catch (e) {}
    location.href = '../#/' + tab;
    return;
  }
  if (key === 'scan') {
    nav('censimento');
    setTimeout(() => { try { openAssetScanner(); } catch (e) { toast('Scanner non disponibile'); } }, 250);
    return;
  }
  if (key === 'appt' || key === 'room' || key === 'car') {
    navigationEpoch++;
    currentView = 'agenda';
    setActiveNavigation('agenda');
    agendaView({ newType: key === 'appt' ? 'APPUNTAMENTO' : key === 'room' ? 'SALA' : 'AUTO' });
    return;
  }
  if (key === 'booking') {
    nav('new');
    setTimeout(() => {
      const cat = $('cat');
      if (cat) { cat.value = 'Prenotazione materiale'; cat.dispatchEvent(new Event('change')); }
    }, 60);
    return;
  }
  nav(key);
}

// ---------- CHAT ----------
let chatState = { contacts: [], messages: [], active: null, timer: null, ready: true, search: '' };

function chatStop() { if (chatState.timer) { clearInterval(chatState.timer); chatState.timer = null; } }

async function chatLoad() {
  const me = user.id;
  const [contacts, messages] = await Promise.all([
    chatState.contacts.length ? chatState.contacts : rpc('chat_contacts'),
    select('chat_messages', `select=*&or=(sender_id.eq.${me},recipient_id.eq.${me})&order=created_at.asc&limit=2000`)
  ]);
  chatState.contacts = (contacts || []).filter(c => c.id !== me);
  chatState.messages = messages || [];
}

function chatThreads() {
  const me = user.id;
  const byId = {};
  chatState.contacts.forEach(c => { byId[c.id] = { contact: c, last: null, unread: 0 }; });
  chatState.messages.forEach(m => {
    const other = m.sender_id === me ? m.recipient_id : m.sender_id;
    if (!byId[other]) byId[other] = { contact: { id: other, nome: 'Utente', ruolo: '' }, last: null, unread: 0 };
    byId[other].last = m;
    if (m.recipient_id === me && !m.read_at) byId[other].unread++;
  });
  return Object.values(byId).sort((a, b) => {
    if (a.last && b.last) return new Date(b.last.created_at) - new Date(a.last.created_at);
    if (a.last) return -1;
    if (b.last) return 1;
    return String(a.contact.nome).localeCompare(String(b.contact.nome), 'it');
  });
}

function chatInitials(name) {
  return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('');
}
function chatTime(d) {
  const x = new Date(d), now = new Date();
  return x.toDateString() === now.toDateString()
    ? x.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : x.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}

function chatRender() {
  const me = user.id;
  const threads = chatThreads();
  const q = normSearch(chatState.search);
  const list = threads.filter(t => !q || normSearch(t.contact.nome).includes(q));
  const active = threads.find(t => t.contact.id === chatState.active);
  const conv = active ? chatState.messages.filter(m => (m.sender_id === me && m.recipient_id === active.contact.id) || (m.sender_id === active.contact.id && m.recipient_id === me)) : [];

  $('content').innerHTML = `
    <div class="chat-shell ${active ? 'has-active' : ''}">
      <aside class="chat-list">
        <input id="chatSearch" placeholder="Cerca un collega…" value="${esc(chatState.search)}">
        <div class="chat-contacts">
          ${list.length ? list.map(t => `
            <button class="chat-contact ${t.contact.id === chatState.active ? 'active' : ''}" data-chat="${esc(t.contact.id)}">
              <span class="chat-avatar">${esc(chatInitials(t.contact.nome))}</span>
              <span class="chat-contact-text">
                <b>${esc(t.contact.nome)}</b>
                <small>${t.last ? esc((t.last.sender_id === me ? 'Tu: ' : '') + t.last.body) : esc(t.contact.ruolo || 'Nessun messaggio')}</small>
              </span>
              <span class="chat-meta">${t.last ? `<small>${chatTime(t.last.created_at)}</small>` : ''}${t.unread ? `<em>${t.unread}</em>` : ''}</span>
            </button>`).join('') : '<p class="empty">Nessun collega trovato.</p>'}
        </div>
      </aside>
      <section class="chat-thread">
        ${active ? `
          <header class="chat-head">
            <button id="chatBack" class="chat-back" type="button" aria-label="Torna ai contatti">←</button>
            <span class="chat-avatar">${esc(chatInitials(active.contact.nome))}</span>
            <div><b>${esc(active.contact.nome)}</b><small>${esc(active.contact.ruolo || '')}</small></div>
          </header>
          <div id="chatMessages" class="chat-messages">
            ${conv.length ? conv.map(m => `<div class="chat-bubble ${m.sender_id === me ? 'mine' : 'theirs'}"><p>${esc(m.body)}</p><small>${chatTime(m.created_at)}${m.sender_id === me && m.read_at ? ' · letto' : ''}</small></div>`).join('') : '<p class="empty">Scrivi il primo messaggio.</p>'}
          </div>
          <form id="chatForm" class="chat-compose">
            <textarea id="chatText" rows="1" placeholder="Scrivi un messaggio…" maxlength="4000" required></textarea>
            <button class="primary" type="submit">Invia</button>
          </form>` : `<div class="chat-placeholder"><b>Chat ARCHEA</b><p>Scegli un collega a sinistra per iniziare.</p></div>`}
      </section>
    </div>`;

  $('chatSearch').oninput = e => {
    chatState.search = e.target.value;
    const pos = e.target.selectionStart;
    chatRender();
    const s = $('chatSearch'); s.focus(); s.setSelectionRange(pos, pos);
  };
  document.querySelectorAll('[data-chat]').forEach(b => b.onclick = () => chatOpen(b.dataset.chat));
  if ($('chatBack')) $('chatBack').onclick = () => { chatState.active = null; chatRender(); };
  const box = $('chatMessages');
  if (box) box.scrollTop = box.scrollHeight;
  if ($('chatForm')) {
    const ta = $('chatText');
    ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chatForm').requestSubmit(); } };
    $('chatForm').onsubmit = chatSend;
  }
}

async function chatMarkRead(otherId) {
  const me = user.id;
  if (!chatState.messages.some(m => m.sender_id === otherId && m.recipient_id === me && !m.read_at)) return;
  try {
    await update('chat_messages', `recipient_id=eq.${me}&sender_id=eq.${otherId}&read_at=is.null`, { read_at: new Date().toISOString() });
    chatState.messages.forEach(m => { if (m.sender_id === otherId && m.recipient_id === me && !m.read_at) m.read_at = new Date().toISOString(); });
  } catch (e) { console.warn('Lettura non segnata:', e.message); }
}

async function chatOpen(otherId) {
  chatState.active = otherId;
  chatRender();
  await chatMarkRead(otherId);
  if (chatState.active === otherId) chatRender();
  setTimeout(() => $('chatText')?.focus(), 30);
}

async function chatSend(e) {
  e.preventDefault();
  const ta = $('chatText');
  const body = ta.value.trim();
  if (!body || !chatState.active) return;
  ta.value = '';
  try {
    const rows = await insert('chat_messages', { sender_id: user.id, recipient_id: chatState.active, body });
    chatState.messages.push(...(rows || []));
    chatRender();
  } catch (err) {
    ta.value = body;
    toast('Messaggio non inviato: ' + err.message);
  }
}

async function chatPoll() {
  if (currentView !== 'chat' || document.hidden) return;
  const typing = $('chatText') && document.activeElement === $('chatText') ? $('chatText').value : null;
  const sig = () => chatState.messages.length + ':' + chatState.messages.filter(m => m.read_at).length;
  const before = sig();
  try { await chatLoad(); } catch (e) { return; }
  if (chatState.active) await chatMarkRead(chatState.active);
  if (sig() !== before) {
    if (currentView !== 'chat') return;
    chatRender();
    if (typing != null && $('chatText')) { $('chatText').value = typing; $('chatText').focus(); }
  }
}

async function chatView(openWith) {
  const epoch = navigationEpoch;
  page('Chat', 'Messaggi tra colleghi');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  chatStop();
  try {
    await chatLoad();
  } catch (err) {
    if (epoch !== navigationEpoch) return;
    $('content').innerHTML = `<div class="panel"><h3>Chat non ancora attivata</h3>
      <p>Il database non ha ancora la tabella dei messaggi. Va eseguito una sola volta lo script
      <code>supabase/migrations/20261106_chat.sql</code> nel SQL Editor di Supabase.</p>
      <p class="muted-line">Dettaglio: ${esc(err.message)}</p></div>`;
    return;
  }
  if (epoch !== navigationEpoch) return;
  if (openWith) chatState.active = openWith;
  chatRender();
  if (chatState.active) chatMarkRead(chatState.active);
  chatState.timer = setInterval(chatPoll, 4000);
}
