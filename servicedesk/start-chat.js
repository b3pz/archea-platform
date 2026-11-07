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
  licenze:        ['Inventario licenze', 'Posti, assegnazioni, disponibilità e acquisti', 'licenze'],
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
  const it = isITRole(), hr = isHR(), pm = typeof hasPerm === 'function' && hasPerm('gestione_progetti');
  const admin = typeof hasPerm === 'function' && hasPerm('gestione_utenti');
  const g = [];
  // le foto di cantiere stanno con i progetti: nel lavoro di tutti, e nella cartella Progetti per i PM
  g.push(['lavoro', 'Il mio lavoro', 'Le tue task, i tuoi ticket, le foto di cantiere', 'mine', ['ws:taskmanager', 'new', 'mine', 'cantiere', 'ws:oggi']]);
  if (pm) g.push(['pm', 'Progetti e cantieri', 'Crea progetti, assegna task, foto di cantiere', 'cantiere', ['ws:projectmanager', 'ws:progetti', 'cantiere', 'ws:ore']]);
  if (it) g.push(['it', 'Reparto IT', 'Ticket da gestire, asset, censimento e licenze', 'it', ['it', 'home', 'scan', 'censimento', 'calendar', 'prenotazioni', 'eliminazioni', 'licenze']]);
  if (hr) g.push(['hr', hr && it ? 'HR · Persone' : 'HR · Persone', 'Ingressi, uscite, spostamenti e organico', 'persone', ['hr-new', 'persone', 'hr-history', 'hr-stats', 'ws:bio', 'planimetrie', 'mappa']]);
  if (it) g.push(['persone', 'Persone e spazi', 'Anagrafica, movimenti, planimetrie', 'persone', ['persone', 'movimenti', 'ws:bio', 'planimetrie', 'mappa']]);
  g.push(['calendario', 'Calendario e prenotazioni', 'Appuntamenti, sale, auto e materiale', 'agenda', ['appt', 'room', 'car', 'agenda', ...(it ? [] : ['booking'])]]);
  g.push(['comunicazione', 'Comunicazione', 'Chat con i colleghi e Off topic', 'chat', ['chat', 'offtopic']]);
  if (admin) g.push(['admin', 'Amministrazione', 'Utenti, gruppi e permessi', 'utenti', ['utenti']]);
  return g;
}
function startActionsForRole() { return startGroups().flatMap(g => g[4]); }
// per la barra laterale della piattaforma: gruppi e voci con le loro etichette
window.sdNavGroups = () => startGroups().map(([id, title, sub, ic, keys]) => ({
  id, title, icon: ic,
  items: keys.map(k => ({ key: k, label: (START_ACTIONS[k] || [k])[0], view: k.startsWith('ws:') ? null : (k === 'appt' || k === 'room' || k === 'car' ? 'agenda' : k === 'scan' ? 'censimento' : (START_ACTIONS[k] || [])[2] || k) }))
}));
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
  // Inizio in un colpo d'occhio: ogni gruppo con le sue funzioni già aperte (un clic e sei dentro)
  const renderHome = () => {
    document.documentElement.classList.add('sd-on-start');
    $('content').innerHTML = `
      <section class="start-hero">
        <h3>${greetingWord()}, ${esc(first)}!</h3>
        <p>Cosa facciamo?</p>
      </section>
      <div class="start-sections">
        ${groups.map(([id, title, sub, ic, keys]) => `<section class="start-sec" data-sec="${id}">
          <h4><span class="start-icon">${icon(ic)}</span>${esc(title)}${badgeFor(id)}</h4>
          ${id === 'it' ? itSummary : ''}
          <div class="start-sec-actions">${keys.filter(k => START_ACTIONS[k]).map(key => {
            const [t, s2, ic2] = START_ACTIONS[key];
            return `<button class="start-act" data-start="${key}" title="${esc(s2)}"><span class="start-icon">${icon(ic2)}</span><b>${esc(t)}</b></button>`;
          }).join('')}</div>
        </section>`).join('')}
      </div>
      ${userSummary}`;
    document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startAction(b.dataset.start));
    document.querySelectorAll('[data-open-ticket]').forEach(b => b.onclick = () => openSubView('ticket-detail', () => detail(+b.dataset.openTicket)));
    if (window.archeaPushBanner) window.archeaPushBanner();
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
let chatState = { contacts: [], messages: [], active: null, timer: null, ready: true, search: '',
  groups: [], members: [], gmessages: [], activeGroup: null, groupsOk: true };

function chatStop() { if (chatState.timer) { clearInterval(chatState.timer); chatState.timer = null; } }

async function chatLoad() {
  const me = user.id;
  const [contacts, messages] = await Promise.all([
    chatState.contacts.length ? chatState.contacts : rpc('chat_contacts'),
    select('chat_messages', `select=*&or=(sender_id.eq.${me},recipient_id.eq.${me})&order=created_at.asc&limit=2000`)
  ]);
  chatState.contacts = (contacts || []).filter(c => c.id !== me);
  chatState.messages = messages || [];
  // gruppi e chat di progetto (se lo script SQL è già stato eseguito)
  try {
    const [groups, members, gm] = await Promise.all([
      select('chat_groups', 'select=*&order=created_at.asc'),
      select('chat_group_members', 'select=group_id,user_id,last_read_at'),
      select('chat_group_messages', 'select=*&order=created_at.asc&limit=4000')
    ]);
    chatState.groups = groups || []; chatState.members = members || []; chatState.gmessages = gm || []; chatState.groupsOk = true;
  } catch (e) { chatState.groups = []; chatState.members = []; chatState.gmessages = []; chatState.groupsOk = false; }
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
function chatGroupThreads() {
  const me = user.id;
  return chatState.groups.map(g => {
    const mine = chatState.members.find(m => m.group_id === g.id && m.user_id === me);
    const msgs = chatState.gmessages.filter(m => m.group_id === g.id);
    const last = msgs[msgs.length - 1] || null;
    const unread = mine ? msgs.filter(m => m.sender_id !== me && new Date(m.created_at) > new Date(mine.last_read_at)).length : 0;
    const count = chatState.members.filter(m => m.group_id === g.id).length;
    return { group: g, last, unread, count, member: !!mine };
  }).filter(t => t.member).sort((a, b) => new Date(b.last?.created_at || b.group.created_at) - new Date(a.last?.created_at || a.group.created_at));
}
function chatName(id) {
  if (id === user.id) return profile?.nome || 'Tu';
  return (chatState.contacts.find(c => c.id === id) || {}).nome || 'Collega';
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
  const gthreads = chatGroupThreads();
  const q = normSearch(chatState.search);
  const list = threads.filter(t => !q || normSearch(t.contact.nome).includes(q));
  const glist = gthreads.filter(t => !q || normSearch(t.group.nome).includes(q));
  const projects = glist.filter(t => t.group.tipo === 'PROGETTO'), groups = glist.filter(t => t.group.tipo === 'GRUPPO');
  // sottochat: sotto il loro progetto; chi è stato invitato senza far parte della squadra le vede da sole
  const subs = glist.filter(t => t.group.tipo === 'SOTTOGRUPPO');
  const subsOf = id => subs.filter(t => t.group.parent_id === id);
  const orphanSubs = subs.filter(t => !projects.some(p => p.group.id === t.group.parent_id));
  const active = threads.find(t => t.contact.id === chatState.active);
  const ag = gthreads.find(t => t.group.id === chatState.activeGroup);
  const conv = active ? chatState.messages.filter(m => (m.sender_id === me && m.recipient_id === active.contact.id) || (m.sender_id === active.contact.id && m.recipient_id === me)) : [];
  const gconv = ag ? chatState.gmessages.filter(m => m.group_id === ag.group.id) : [];
  const gItem = t => `
    <button class="chat-contact ${t.group.id === chatState.activeGroup ? 'active' : ''}${t.group.tipo === 'SOTTOGRUPPO' ? ' sub' : ''}" data-chatg="${t.group.id}">
      <span class="chat-avatar ${t.group.tipo === 'PROGETTO' ? 'proj' : 'grp'}">${t.group.tipo === 'PROGETTO' ? '▦' : t.group.tipo === 'SOTTOGRUPPO' ? '↳' : esc(chatInitials(t.group.nome))}</span>
      <span class="chat-contact-text"><b>${esc(t.group.nome)}</b>
        <small>${t.last ? esc((t.last.sender_id === me ? 'Tu' : chatName(t.last.sender_id).split(' ')[0]) + ': ' + t.last.body) : `${t.count} persone`}</small></span>
      <span class="chat-meta">${t.last ? `<small>${chatTime(t.last.created_at)}</small>` : ''}${t.unread ? `<em>${t.unread}</em>` : ''}</span>
    </button>`;
  const head = (title, extra = '') => `<div class="chat-section"><span>${title}</span>${extra}</div>`;
  const hasActive = active || ag;

  $('content').innerHTML = `
    <div class="chat-shell ${hasActive ? 'has-active' : ''}">
      <aside class="chat-list">
        <input id="chatSearch" placeholder="Cerca un collega, un gruppo o un progetto…" value="${esc(chatState.search)}">
        <div class="chat-contacts">
          ${projects.length || orphanSubs.length ? head('Progetti') + projects.map(t => gItem(t) + subsOf(t.group.id).map(gItem).join('')).join('') + orphanSubs.map(gItem).join('') : ''}
          ${chatState.groupsOk ? head('Gruppi', '<button class="text-btn" id="chatNewGroup" type="button">+ Nuovo gruppo</button>') + (groups.length ? groups.map(gItem).join('') : '<p class="chat-hint">Crea un gruppo per scrivere a più colleghi insieme.</p>') : ''}
          ${head('Colleghi')}
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
          </form>` : ag ? `
          <header class="chat-head">
            <button id="chatBack" class="chat-back" type="button" aria-label="Torna alle chat">←</button>
            <span class="chat-avatar ${ag.group.tipo === 'PROGETTO' ? 'proj' : 'grp'}">${ag.group.tipo === 'PROGETTO' ? '▦' : esc(chatInitials(ag.group.nome))}</span>
            <div><b>${esc(ag.group.nome)}</b><small>${ag.group.tipo === 'PROGETTO' ? 'Chat del progetto · ' : ag.group.tipo === 'SOTTOGRUPPO' ? 'Sottochat del progetto · ' : ''}${ag.count} persone</small></div>
            ${ag.group.tipo === 'PROGETTO' ? '<button class="secondary compact chat-head-btn" id="chatSub" type="button" title="Collaborazione con altri colleghi, senza cambiare la chat del progetto">+ Sottochat</button>' : ''}
            <button class="secondary compact chat-head-btn" id="chatMembers" type="button">Persone</button>
          </header>
          <div id="chatMessages" class="chat-messages">
            ${gconv.length ? gconv.map(m => `<div class="chat-bubble ${m.sender_id === me ? 'mine' : 'theirs'}">${m.sender_id === me ? '' : `<b class="chat-who">${esc(chatName(m.sender_id))}</b>`}<p>${esc(m.body)}</p><small>${chatTime(m.created_at)}</small></div>`).join('') : `<p class="empty">${ag.group.tipo === 'PROGETTO' ? 'Qui scrive solo la squadra del progetto.' : 'Scrivi il primo messaggio al gruppo.'}</p>`}
          </div>
          <form id="chatForm" class="chat-compose">
            <textarea id="chatText" rows="1" placeholder="Scrivi al gruppo…" maxlength="4000" required></textarea>
            <button class="primary" type="submit">Invia</button>
          </form>` : `<div class="chat-placeholder"><b>Chat ARCHEA</b><p>Scegli un collega, un gruppo o un progetto a sinistra.</p></div>`}
      </section>
    </div>`;

  $('chatSearch').oninput = e => {
    chatState.search = e.target.value;
    const pos = e.target.selectionStart;
    chatRender();
    const s = $('chatSearch'); s.focus(); s.setSelectionRange(pos, pos);
  };
  document.querySelectorAll('[data-chat]').forEach(b => b.onclick = () => chatOpen(b.dataset.chat));
  document.querySelectorAll('[data-chatg]').forEach(b => b.onclick = () => chatOpenGroup(+b.dataset.chatg));
  if ($('chatNewGroup')) $('chatNewGroup').onclick = () => chatGroupForm(null);
  if ($('chatMembers')) $('chatMembers').onclick = () => chatGroupForm(ag);
  if ($('chatSub')) $('chatSub').onclick = () => chatGroupForm(null, ag.group);
  if ($('chatBack')) $('chatBack').onclick = () => { chatState.active = null; chatState.activeGroup = null; chatRender(); };
  const box = $('chatMessages');
  if (box) box.scrollTop = box.scrollHeight;
  if ($('chatForm')) {
    const ta = $('chatText');
    ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chatForm').requestSubmit(); } };
    $('chatForm').onsubmit = chatSend;
  }
}

// Nuovo gruppo / persone del gruppo
function chatGroupForm(t, parent) {
  const me = user.id;
  const g = t && t.group;
  const isSub = (g && g.tipo === 'SOTTOGRUPPO') || !!parent;
  const isProject = g && g.tipo === 'PROGETTO';
  const canEdit = !g || (!isProject && g.created_by === me);
  const current = g ? chatState.members.filter(m => m.group_id === g.id).map(m => m.user_id) : [me];
  const people = [{ id: me, nome: (profile?.nome || 'Tu') + ' (tu)' }, ...chatState.contacts].sort((a, b) => a.id === me ? -1 : b.id === me ? 1 : String(a.nome).localeCompare(String(b.nome), 'it'));
  const ov = document.createElement('div');
  ov.className = 'scanner-overlay chat-modal';
  ov.innerHTML = `<div class="scanner-card">
    <div class="scanner-head"><div><span class="eyebrow">${isSub ? 'SOTTOCHAT DI PROGETTO' : 'CHAT'}</span><h3>${g ? esc(g.nome) : parent ? 'Nuova sottochat' : 'Nuovo gruppo'}</h3></div><button class="ghost compact" id="cgClose">Chiudi</button></div>
    ${parent ? `<p class="muted-line">Per collaborare su una parte di <b>${esc(parent.nome)}</b> anche con colleghi che non sono nella squadra. La chat del progetto resta com'è.</p>` : ''}
    ${isProject ? '<p class="muted-line">Le persone di questa chat sono quelle della squadra del progetto: le sceglie il PM in "Project Manager".</p>' : ''}
    ${canEdit ? `<label>Nome del gruppo<input id="cgName" maxlength="80" value="${esc(g ? g.nome : parent ? (parent.progetto_codice || parent.nome.split(' ·')[0]) + ' · ' : '')}" placeholder="${parent ? 'Es. P51 · Facciate con lo strutturista' : 'Es. Ufficio Firenze, Pausa pranzo…'}"></label>` : ''}
    <input id="cgSearch" placeholder="Cerca un collega…">
    <div class="cg-people">${people.map(p => `<label class="cg-person"><input type="checkbox" value="${esc(p.id)}" ${current.includes(p.id) ? 'checked' : ''} ${!canEdit || p.id === me ? 'disabled' : ''}><span class="chat-avatar">${esc(chatInitials(p.nome))}</span><span>${esc(p.nome)}</span></label>`).join('')}</div>
    <div class="button-row">
      ${canEdit ? `<button class="primary" id="cgSave">${g ? 'Salva' : parent ? 'Crea sottochat' : 'Crea gruppo'}</button>` : ''}
      ${g && !isProject && g.created_by !== me ? `<button class="secondary danger-outline" id="cgLeave">Esci ${isSub ? 'dalla sottochat' : 'dal gruppo'}</button>` : ''}
      ${g && !isProject && g.created_by === me ? `<button class="secondary danger-outline" id="cgDelete">Elimina ${isSub ? 'sottochat' : 'gruppo'}</button>` : ''}
      <span id="cgMsg" class="muted-line"></span>
    </div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.querySelector('#cgClose').onclick = close;
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#cgSearch').oninput = e => { const q = normSearch(e.target.value); ov.querySelectorAll('.cg-person').forEach(l => l.classList.toggle('hidden', !!q && !normSearch(l.textContent).includes(q))); };
  if (ov.querySelector('#cgSave')) ov.querySelector('#cgSave').onclick = async () => {
    const nome = ov.querySelector('#cgName').value.trim();
    const chosen = [...ov.querySelectorAll('.cg-person input:checked')].map(x => x.value).filter(id => id !== me);
    if (nome.length < 2) { ov.querySelector('#cgMsg').textContent = 'Scrivi il nome del gruppo'; return; }
    if (!g && !chosen.length) { ov.querySelector('#cgMsg').textContent = 'Scegli almeno un collega'; return; }
    try {
      let gid = g && g.id;
      if (!g) { const rows = await insert('chat_groups', parent ? { nome, tipo: 'SOTTOGRUPPO', parent_id: parent.id, created_by: me } : { nome, tipo: 'GRUPPO', created_by: me }); gid = rows[0].id; }
      else if (nome !== g.nome) await update('chat_groups', `id=eq.${gid}`, { nome });
      const before = g ? current.filter(id => id !== me) : [];
      const add = chosen.filter(id => !before.includes(id)), remove = before.filter(id => !chosen.includes(id));
      if (add.length) await insert('chat_group_members', add.map(id => ({ group_id: gid, user_id: id })), false);
      for (const id of remove) await api(`/rest/v1/chat_group_members?group_id=eq.${gid}&user_id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      close(); await chatLoad(); chatOpenGroup(gid);
    } catch (err) { ov.querySelector('#cgMsg').textContent = err.message; }
  };
  if (ov.querySelector('#cgLeave')) ov.querySelector('#cgLeave').onclick = async () => {
    try { await api(`/rest/v1/chat_group_members?group_id=eq.${g.id}&user_id=eq.${me}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); close(); chatState.activeGroup = null; await chatLoad(); chatRender(); }
    catch (err) { ov.querySelector('#cgMsg').textContent = err.message; }
  };
  if (ov.querySelector('#cgDelete')) ov.querySelector('#cgDelete').onclick = async e => {
    const b = e.target; if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Conferma: elimina gruppo e messaggi'; return; }
    try { await api(`/rest/v1/chat_groups?id=eq.${g.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); close(); chatState.activeGroup = null; await chatLoad(); chatRender(); }
    catch (err) { ov.querySelector('#cgMsg').textContent = err.message; }
  };
}

async function chatMarkRead(otherId) {
  const me = user.id;
  if (!chatState.messages.some(m => m.sender_id === otherId && m.recipient_id === me && !m.read_at)) return;
  try {
    await update('chat_messages', `recipient_id=eq.${me}&sender_id=eq.${otherId}&read_at=is.null`, { read_at: new Date().toISOString() });
    chatState.messages.forEach(m => { if (m.sender_id === otherId && m.recipient_id === me && !m.read_at) m.read_at = new Date().toISOString(); });
  } catch (e) { console.warn('Lettura non segnata:', e.message); }
}
async function chatMarkGroupRead(gid) {
  const me = user.id, mine = chatState.members.find(m => m.group_id === gid && m.user_id === me);
  if (!mine) return;
  const last = chatState.gmessages.filter(m => m.group_id === gid).pop();
  if (!last || new Date(last.created_at) <= new Date(mine.last_read_at)) return;
  const now = new Date().toISOString();
  try { await update('chat_group_members', `group_id=eq.${gid}&user_id=eq.${me}`, { last_read_at: now }); mine.last_read_at = now; } catch (e) {}
}

async function chatOpen(otherId) {
  chatState.active = otherId; chatState.activeGroup = null;
  chatRender();
  await chatMarkRead(otherId);
  if (chatState.active === otherId) chatRender();
  setTimeout(() => $('chatText')?.focus(), 30);
}
async function chatOpenGroup(gid) {
  chatState.activeGroup = gid; chatState.active = null;
  chatRender();
  await chatMarkGroupRead(gid);
  if (chatState.activeGroup === gid) chatRender();
  setTimeout(() => $('chatText')?.focus(), 30);
}

async function chatSend(e) {
  e.preventDefault();
  const ta = $('chatText');
  const body = ta.value.trim();
  if (!body || (!chatState.active && !chatState.activeGroup)) return;
  ta.value = '';
  try {
    if (chatState.activeGroup) {
      const rows = await insert('chat_group_messages', { group_id: chatState.activeGroup, sender_id: user.id, body });
      chatState.gmessages.push(...(rows || []));
      await chatMarkGroupRead(chatState.activeGroup);
    } else {
      const rows = await insert('chat_messages', { sender_id: user.id, recipient_id: chatState.active, body });
      chatState.messages.push(...(rows || []));
    }
    chatRender();
  } catch (err) {
    ta.value = body;
    toast('Messaggio non inviato: ' + err.message);
  }
}

async function chatPoll() {
  if (currentView !== 'chat' || document.hidden) return;
  if (document.querySelector('.chat-modal')) return;
  const typing = $('chatText') && document.activeElement === $('chatText') ? $('chatText').value : null;
  const sig = () => chatState.messages.length + ':' + chatState.messages.filter(m => m.read_at).length + ':' + chatState.gmessages.length + ':' + chatState.groups.length + ':' + chatState.members.length;
  const before = sig();
  try { await chatLoad(); } catch (e) { return; }
  if (chatState.active) await chatMarkRead(chatState.active);
  if (chatState.activeGroup) await chatMarkGroupRead(chatState.activeGroup);
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
