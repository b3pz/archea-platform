/*
 * Service Desk V9.2 · Calendario comune
 * Appuntamenti con invito e notifica, prenotazione di sale meeting e auto.
 * LIVE: richiede supabase/migrations/20261106_calendario.sql.
 */

const AG_TYPES = {
  APPUNTAMENTO: { label: 'Appuntamento', short: 'Appunt.', cls: 'ag-app' },
  SALA: { label: 'Sala meeting', short: 'Sala', cls: 'ag-room' },
  AUTO: { label: 'Auto', short: 'Auto', cls: 'ag-car' },
  ATTREZZATURA: { label: 'Attrezzatura', short: 'Attrezz.', cls: 'ag-gear' }
};
const AG_HOURS = { from: 7, to: 21 };
// Riunioni online: la piattaforma crea la riunione, qui si salva il link per tutti.
const AG_ONLINE = {
  ZOOM: { label: 'Zoom', create: () => 'https://zoom.us/meeting/schedule' },
  MEET: { label: 'Google Meet', create: () => 'https://meet.google.com/new' },
  TEAMS: {
    label: 'Microsoft Teams',
    create: (title, s, e) => `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(title || 'Riunione ARCHEA')}` +
      (s ? `&startTime=${encodeURIComponent(s.toISOString())}` : '') + (e ? `&endTime=${encodeURIComponent(e.toISOString())}` : '')
  },
  WEBEX: { label: 'Webex', create: () => 'https://web.webex.com/meet' },
  ALTRO: { label: 'Altra piattaforma', create: null }
};
function agSafeUrl(u) { const x = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(x) ? x : ''; }

let agState = {
  view: (() => { try { return localStorage.getItem('archea_agenda_view') || 'settimana'; } catch { return 'settimana'; } })(),
  anchor: new Date(),
  filter: 'TUTTI',
  events: [], attendees: [], resources: [], contacts: [],
  selected: null
};

function agMonday(d) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow);
  return x;
}
function agAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function agYmd(d) { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }
function agHm(d) { return new Date(d).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); }
function agDayLabel(d, long) {
  return new Date(d).toLocaleDateString('it-IT', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric' });
}
function agSameDay(a, b) { return agYmd(a) === agYmd(b); }
function agCanBook(r) {
  if (!r || r.gruppo_id == null) return true;
  if (typeof hasPerm === 'function' && hasPerm('gestione_calendario')) return true;
  return typeof MY_GROUPS !== 'undefined' && MY_GROUPS.some(g => String(g) === String(r.gruppo_id));
}
function agGroupName(id) { const g = (agState.groups || []).find(x => String(x.id) === String(id)); return g ? g.nome : 'gruppo riservato'; }
function agResource(id) { return agState.resources.find(r => String(r.id) === String(id)); }
function agAttendeesOf(ev) { return agState.attendees.filter(a => String(a.event_id) === String(ev.id)); }
function agContactName(id) {
  if (id === user.id) return profile?.nome || 'Tu';
  const c = agState.contacts.find(x => x.id === id);
  return c ? c.nome : 'Collega';
}
function agFriendlyError(err) {
  const m = String(err && err.message || err);
  if (/no_overlap|exclusion|conflicting key/i.test(m)) return 'Risorsa già prenotata in quell\'orario: scegli un altro orario o un\'altra risorsa.';
  if (/end_at|check constraint/i.test(m)) return 'L\'orario di fine deve essere dopo quello di inizio.';
  return m;
}

async function agLoad() {
  const [fromD, toD] = agRange();
  const from = fromD.toISOString();
  const to = toD.toISOString();
  const [events, resources, contacts] = await Promise.all([
    select('calendar_events', `select=*&start_at=lt.${encodeURIComponent(to)}&end_at=gt.${encodeURIComponent(from)}&stato=neq.ANNULLATO&order=start_at.asc`),
    agState.resources.length ? agState.resources : select('calendar_resources', 'select=*&attivo=eq.true&order=tipo.desc,nome.asc'),
    agState.contacts.length ? agState.contacts : rpc('chat_contacts').catch(() => [])
  ]);
  agState.events = events || [];
  try { agState.groups = agState.groups || await select('access_groups', 'select=id,nome&order=nome.asc'); } catch (e) { agState.groups = []; }
  agState.resources = resources || [];
  agState.contacts = (contacts || []).filter(c => c.id !== user.id);
  agState.attendees = agState.events.length
    ? await select('calendar_attendees', `select=*&event_id=in.(${agState.events.map(e => e.id).join(',')})`)
    : [];
}

function agVisible() {
  return agState.events.filter(e => agState.filter === 'TUTTI' || e.tipo === agState.filter ||
    (agState.filter === 'MIEI' && (e.organizer_id === user.id || agAttendeesOf(e).some(a => a.user_id === user.id))));
}

function agEventChip(e, compact) {
  const t = AG_TYPES[e.tipo] || AG_TYPES.APPUNTAMENTO;
  const r = agResource(e.resource_id);
  const mine = e.organizer_id === user.id || agAttendeesOf(e).some(a => a.user_id === user.id);
  return `<button class="ag-event ${t.cls}${mine ? ' mine' : ''}" data-ev="${e.id}">
    <b>${agHm(e.start_at)}–${agHm(e.end_at)}</b>
    <span>${e.meeting_provider ? '● ' : ''}${esc(e.titolo)}</span>
    ${!compact && (r || e.meeting_provider) ? `<small>${esc(r ? r.nome : (AG_ONLINE[e.meeting_provider] || {}).label || 'Online')}</small>` : ''}
  </button>`;
}

// Intervallo visibile per la vista scelta (giorno, settimana, mese)
function agRange() {
  const a = new Date(agState.anchor); a.setHours(0, 0, 0, 0);
  if (agState.view === 'giorno') return [a, agAddDays(a, 1)];
  if (agState.view === 'mese') {
    const first = new Date(a.getFullYear(), a.getMonth(), 1);
    const gridStart = agMonday(first);
    return [gridStart, agAddDays(gridStart, 42)];
  }
  const m = agMonday(a);
  return [m, agAddDays(m, 7)];
}
function agShift(dir) {
  const a = new Date(agState.anchor);
  if (agState.view === 'giorno') a.setDate(a.getDate() + dir);
  else if (agState.view === 'mese') { a.setDate(1); a.setMonth(a.getMonth() + dir); }
  else a.setDate(a.getDate() + 7 * dir);
  agState.anchor = a;
}
function agRangeLabel() {
  const [from, to] = agRange();
  const a = new Date(agState.anchor);
  if (agState.view === 'giorno') return agDayLabel(a, true) + ' ' + a.getFullYear();
  if (agState.view === 'mese') return a.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const end = agAddDays(from, 6);
  return `${from.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
function agDaysOfRange() {
  const [from, to] = agRange();
  const out = []; for (let d = new Date(from); d < to; d = agAddDays(d, 1)) out.push(new Date(d));
  return out;
}
function agEventsOn(d, evs) {
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = agAddDays(start, 1);
  return evs.filter(e => new Date(e.start_at) < end && new Date(e.end_at) > start);
}

// Griglia oraria (giorno = 1 colonna, settimana = 7 colonne)
function agRenderTimeGrid(days) {
  const evs = agVisible();
  const today = new Date();
  const span = (AG_HOURS.to - AG_HOURS.from) * 60;
  const cols = `56px repeat(${days.length}, minmax(0, 1fr))`;
  return `
    <div class="ag-week${days.length === 1 ? ' ag-single' : ''}">
      <div class="ag-week-head" style="grid-template-columns:${cols}"><span></span>${days.map(d => `<div class="${agSameDay(d, today) ? 'today' : ''}">${esc(agDayLabel(d, days.length === 1))}</div>`).join('')}</div>
      <div class="ag-week-body" style="--ag-rows:${AG_HOURS.to - AG_HOURS.from};grid-template-columns:${cols}">
        <div class="ag-hours">${[...Array(AG_HOURS.to - AG_HOURS.from)].map((_, i) => `<span>${String(AG_HOURS.from + i).padStart(2, '0')}:00</span>`).join('')}</div>
        ${days.map(d => {
          const dayEvs = agEventsOn(d, evs);
          return `<div class="ag-day${agSameDay(d, today) ? ' today' : ''}" data-day="${agYmd(d)}">
            ${dayEvs.map(e => {
              const s = new Date(e.start_at), en = new Date(e.end_at);
              const startMin = agSameDay(s, d) ? s.getHours() * 60 + s.getMinutes() : AG_HOURS.from * 60;
              const endMin = agSameDay(en, d) ? en.getHours() * 60 + en.getMinutes() : AG_HOURS.to * 60;
              const top = Math.max(0, startMin - AG_HOURS.from * 60) / span * 100;
              const h = Math.max(3, (Math.min(endMin, AG_HOURS.to * 60) - Math.max(startMin, AG_HOURS.from * 60)) / span * 100);
              return `<div class="ag-slot" style="top:${top}%;height:${h}%">${agEventChip(e, days.length > 1)}</div>`;
            }).join('')}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

// Vista mese: 6 settimane, al massimo 3 eventi per giorno + "altri N"
function agRenderMonth(compact) {
  const days = agDaysOfRange();
  const evs = agVisible();
  const month = new Date(agState.anchor).getMonth();
  const today = new Date();
  const names = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  return `
    <div class="ag-month${compact ? ' compact' : ''}">
      <div class="ag-month-head">${names.map(n => `<span>${n}</span>`).join('')}</div>
      <div class="ag-month-grid">
        ${days.map(d => {
          const dayEvs = agEventsOn(d, evs);
          const cls = ['ag-mday', d.getMonth() !== month ? 'out' : '', agSameDay(d, today) ? 'today' : '', compact && agSameDay(d, agState.anchor) ? 'sel' : '', dayEvs.length ? 'busy' : ''].filter(Boolean).join(' ');
          if (compact) {
            return `<button class="${cls}" data-goday="${agYmd(d)}" aria-label="${esc(agDayLabel(d, true))}: ${dayEvs.length} eventi">
              <b>${d.getDate()}</b>
              <span class="ag-dots">${dayEvs.slice(0, 4).map(e => `<i class="${(AG_TYPES[e.tipo] || AG_TYPES.APPUNTAMENTO).cls}"></i>`).join('')}</span>
            </button>`;
          }
          return `<div class="${cls}" data-day="${agYmd(d)}">
            <button class="ag-mday-num" data-goday="${agYmd(d)}" title="Apri il giorno">${d.getDate()}</button>
            ${dayEvs.slice(0, 3).map(e => agEventChip(e, true)).join('')}
            ${dayEvs.length > 3 ? `<button class="ag-more" data-goday="${agYmd(d)}">+ altri ${dayEvs.length - 3}</button>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function agRenderList(days) {
  const evs = agVisible();
  return `<div class="ag-list">${days.map(d => {
    const dayEvs = agEventsOn(d, evs);
    return `<section class="ag-list-day${agSameDay(d, new Date()) ? ' today' : ''}">
      <h4>${esc(agDayLabel(d, true))}</h4>
      ${dayEvs.length ? dayEvs.map(e => agEventChip(e, false)).join('') : '<p class="ag-empty">Libero</p>'}
    </section>`;
  }).join('')}</div>`;
}

function agRender() {
  const filters = [['TUTTI', 'Tutto'], ['MIEI', 'I miei'], ['APPUNTAMENTO', 'Appuntamenti'], ['SALA', 'Sale'], ['AUTO', 'Auto']];
  const views = [['giorno', 'Giorno'], ['settimana', 'Settimana'], ['mese', 'Mese']];
  const days = agDaysOfRange();
  let desktop, mobile;
  if (agState.view === 'mese') {
    desktop = agRenderMonth(false);
    const sel = agState.anchor;
    mobile = agRenderMonth(true) + agRenderList([new Date(sel)]);
  } else {
    desktop = agRenderTimeGrid(days);
    mobile = agRenderList(days);
  }
  $('content').innerHTML = `
    <div class="ag-toolbar">
      <div class="ag-nav">
        <button class="secondary compact" id="agPrev" aria-label="Indietro">‹</button>
        <button class="secondary compact" id="agToday">Oggi</button>
        <button class="secondary compact" id="agNext" aria-label="Avanti">›</button>
        <b class="ag-range">${esc(agRangeLabel())}</b>
      </div>
      <div class="ag-views" role="tablist">${views.map(([k, l]) => `<button role="tab" class="ag-view${agState.view === k ? ' on' : ''}" aria-selected="${agState.view === k}" data-agv="${k}">${l}</button>`).join('')}</div>
      <div class="ag-actions">
        ${typeof hasPerm === 'function' && hasPerm('gestione_calendario') ? '<button class="secondary" id="agManage">Sale e auto</button>' : ''}
        <button class="secondary" data-agnew="SALA">Prenota sala</button>
        <button class="secondary" data-agnew="AUTO">Prenota auto</button>
        <button class="primary" data-agnew="APPUNTAMENTO">+ Appuntamento</button>
      </div>
    </div>
    <div class="ag-subbar">
      <div class="ag-filters">${filters.map(([k, l]) => `<button class="ag-filter${agState.filter === k ? ' on' : ''}" data-agf="${k}">${l}</button>`).join('')}</div>
      <div class="ag-legend">${Object.entries(AG_TYPES).filter(([k]) => k !== 'ATTREZZATURA').map(([, t]) => `<span class="${t.cls}"><i></i>${t.label}</span>`).join('')}</div>
    </div>
    <div class="ag-desktop">${desktop}</div>
    <div class="ag-mobile">${mobile}</div>`;

  if ($('agManage')) $('agManage').onclick = agResourcesAdmin;
  $('agPrev').onclick = () => { agShift(-1); agRefresh(); };
  $('agNext').onclick = () => { agShift(1); agRefresh(); };
  $('agToday').onclick = () => { agState.anchor = new Date(); agRefresh(); };
  document.querySelectorAll('[data-agv]').forEach(b => b.onclick = () => {
    agState.view = b.dataset.agv;
    try { localStorage.setItem('archea_agenda_view', agState.view); } catch {}
    agRefresh();
  });
  document.querySelectorAll('[data-goday]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    agState.anchor = new Date(`${b.dataset.goday}T12:00:00`);
    // sul telefono nel mese si resta sul mese e si mostra l'elenco del giorno toccato
    if (!(agState.view === 'mese' && window.matchMedia('(max-width: 900px)').matches)) agState.view = 'giorno';
    agRefresh();
  });
  document.querySelectorAll('[data-agf]').forEach(b => b.onclick = () => { agState.filter = b.dataset.agf; agRender(); });
  document.querySelectorAll('[data-agnew]').forEach(b => b.onclick = () => agForm(b.dataset.agnew, agState.view === 'giorno' ? { date: agYmd(agState.anchor) } : {}));
  document.querySelectorAll('[data-ev]').forEach(b => b.onclick = e => { e.stopPropagation(); agDetail(b.dataset.ev); });
  document.querySelectorAll('.ag-day[data-day]').forEach(col => col.ondblclick = e => {
    const rect = col.getBoundingClientRect();
    const minutes = AG_HOURS.from * 60 + Math.round(((e.clientY - rect.top) / rect.height) * (AG_HOURS.to - AG_HOURS.from) * 60 / 30) * 30;
    agForm('APPUNTAMENTO', { date: col.dataset.day, start: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` });
  });
  document.querySelectorAll('.ag-mday[data-day]').forEach(cell => cell.ondblclick = () => agForm('APPUNTAMENTO', { date: cell.dataset.day }));
}

async function agRefresh() {
  const epoch = navigationEpoch;
  try { await agLoad(); } catch (err) { if (epoch === navigationEpoch) agSetupMessage(err); return; }
  if (epoch === navigationEpoch && currentView === 'agenda') agRender();
}

function agSetupMessage(err) {
  $('content').innerHTML = `<div class="panel"><h3>Calendario comune non ancora attivato</h3>
    <p>Va eseguito una sola volta lo script <code>supabase/migrations/20261106_calendario.sql</code>
    nel SQL Editor di Supabase (dopo quello della chat).</p>
    <p class="muted-line">Dettaglio: ${esc(err.message || err)}</p></div>`;
}

async function agendaView(opts = {}) {
  const epoch = navigationEpoch;
  page('Calendario comune', 'Appuntamenti, sale meeting e auto');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try { await agLoad(); } catch (err) { if (epoch === navigationEpoch) agSetupMessage(err); return; }
  if (epoch !== navigationEpoch) return;
  agRender();
  window.scrollTo(0, 0);
  if (opts.newType) agForm(opts.newType);
}

// Gestione sale e auto (permesso "gestione_calendario")
async function agResourcesAdmin() {
  let all;
  try { all = await select('calendar_resources', 'select=*&order=tipo.desc,nome.asc'); } catch (err) { toast(err.message); return; }
  const groups = agState.groups || [];
  const row = r => `<tr data-rid="${r ? r.id : 'new'}">
      <td data-label="Tipo"><select class="rTipo">${['SALA', 'AUTO', 'ATTREZZATURA'].map(t => `<option value="${t}" ${r && r.tipo === t ? 'selected' : ''}>${AG_TYPES[t].label}</option>`).join('')}</select></td>
      <td data-label="Nome"><input class="rNome" value="${esc(r?.nome || '')}" placeholder="Es. Sala meeting grande"></td>
      <td data-label="Sede"><input class="rSede" value="${esc(r?.sede || '')}" placeholder="FIRENZE"></td>
      <td data-label="Dettagli"><input class="rDett" value="${esc(r?.dettagli || '')}" placeholder="Posti, targa, note"></td>
      <td data-label="Chi può prenotare"><select class="rGruppo"><option value="">Tutti</option>${groups.map(g => `<option value="${g.id}" ${r && String(r.gruppo_id) === String(g.id) ? 'selected' : ''}>Solo gruppo ${esc(g.nome)}</option>`).join('')}</select></td>
      <td data-label="Attiva"><input type="checkbox" class="rAttivo" ${!r || r.attivo ? 'checked' : ''} style="width:auto"></td>
      <td><button class="secondary compact rSave">${r ? 'Salva' : 'Aggiungi'}</button></td>
    </tr>`;
  $('content').innerHTML = `
    <div class="panel">
      <div class="ag-form-head"><h3>Sale e auto</h3><button class="secondary compact" id="agResBack">← Calendario</button></div>
      <p class="muted-line">"Chi può prenotare": <b>Tutti</b>, oppure solo le persone di un gruppo (i gruppi si creano in Utenti e gruppi). Una risorsa non attiva sparisce dalle prenotazioni.</p>
      <div class="tablewrap"><table class="us-table ag-res-table">
        <thead><tr><th>Tipo</th><th>Nome</th><th>Sede</th><th>Dettagli</th><th>Chi può prenotare</th><th>Attiva</th><th></th></tr></thead>
        <tbody>${all.map(row).join('')}${row(null)}</tbody>
      </table></div>
    </div>`;
  $('agResBack').onclick = () => { agState.resources = []; agRefresh(); };
  document.querySelectorAll('.ag-res-table tr[data-rid]').forEach(tr => {
    tr.querySelector('.rSave').onclick = async () => {
      const data = {
        tipo: tr.querySelector('.rTipo').value,
        nome: tr.querySelector('.rNome').value.trim(),
        sede: tr.querySelector('.rSede').value.trim() || null,
        dettagli: tr.querySelector('.rDett').value.trim() || null,
        gruppo_id: tr.querySelector('.rGruppo').value ? +tr.querySelector('.rGruppo').value : null,
        attivo: tr.querySelector('.rAttivo').checked
      };
      if (!data.nome) { toast('Scrivi il nome'); return; }
      try {
        if (tr.dataset.rid === 'new') await insert('calendar_resources', data);
        else await update('calendar_resources', `id=eq.${tr.dataset.rid}`, data);
        toast('Salvato');
        agState.resources = [];
        agResourcesAdmin();
      } catch (err) { toast(err.message); }
    };
  });
}

function agDefaultSlot() {
  const d = new Date(); d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  if (d.getHours() < AG_HOURS.from) d.setHours(9, 0);
  return { date: agYmd(d), start: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
}

function agForm(tipo = 'APPUNTAMENTO', preset = {}) {
  const slot = { ...agDefaultSlot(), ...preset };
  const [h, m] = slot.start.split(':').map(Number);
  const endDefault = `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  $('content').innerHTML = `
    <div class="panel ag-form-panel">
      <div class="ag-form-head"><h3>Nuova prenotazione</h3><button class="secondary compact" id="agCancel">Annulla</button></div>
      <form id="agForm" class="formgrid">
        <div class="full ag-type-switch">${['APPUNTAMENTO', 'SALA', 'AUTO'].map(k => `<label class="${AG_TYPES[k].cls}"><input type="radio" name="agTipo" value="${k}" ${k === tipo ? 'checked' : ''}><span>${AG_TYPES[k].label}</span></label>`).join('')}</div>
        <label class="full">Titolo<input id="agTitle" required maxlength="200" placeholder="${tipo === 'AUTO' ? 'Es. Sopralluogo cantiere P51' : tipo === 'SALA' ? 'Es. Riunione di commessa' : 'Es. Revisione tavole con il cliente'}"></label>
        <label>Data<input id="agDate" type="date" required value="${slot.date}"></label>
        <label>Dalle<input id="agStart" type="time" required step="900" value="${slot.start}"></label>
        <label>Alle<input id="agEnd" type="time" required step="900" value="${endDefault}"></label>
        <label id="agResWrap">Risorsa<select id="agRes"></select></label>
        <label id="agPlaceWrap">Luogo <span class="optional">(facoltativo)</span><input id="agPlace" placeholder="Studio, cantiere, indirizzo…"></label>
        <label id="agOnlineWrap">Riunione online<select id="agOnline"><option value="">Nessuna (in presenza)</option>${Object.entries(AG_ONLINE).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <div class="full ag-online-row hidden" id="agLinkRow">
          <label>Link della riunione<input id="agLink" type="url" inputmode="url" placeholder="https://…"></label>
          <button type="button" class="secondary" id="agCreateMeeting">Crea su <span id="agProviderName"></span></button>
        </div>
        <div class="full" id="agAvail"></div>
        <div class="full ag-people">
          <b>Invita colleghi</b> <span class="optional">(ricevono una notifica)</span>
          <input id="agPeopleSearch" placeholder="Cerca un collega…">
          <div id="agPeople" class="ag-people-list">${agState.contacts.map(c => `<label data-name="${esc(normSearch(c.nome))}"><input type="checkbox" value="${esc(c.id)}"> ${esc(c.nome)} <small>${esc(c.ruolo || '')}</small></label>`).join('') || '<p class="muted-line">Nessun collega disponibile.</p>'}</div>
        </div>
        <label class="full">Note <span class="optional">(facoltative)</span><textarea id="agNotes" rows="2"></textarea></label>
        <div class="full"><button class="primary" id="agSave">Salva nel calendario</button> <span id="agResult" class="muted-line"></span></div>
      </form>
    </div>`;

  const currentType = () => document.querySelector('input[name="agTipo"]:checked').value;
  const fillResources = () => {
    const t = currentType();
    const list = agState.resources.filter(r => r.tipo === t);
    $('agResWrap').classList.toggle('hidden', t === 'APPUNTAMENTO');
    $('agRes').required = t !== 'APPUNTAMENTO';
    const bookable = list.filter(agCanBook);
    $('agRes').innerHTML = list.length
      ? list.map(r => `<option value="${r.id}" ${agCanBook(r) ? '' : 'disabled'}>${esc(r.nome)}${r.sede ? ` · ${esc(r.sede)}` : ''}${r.dettagli ? ` · ${esc(r.dettagli)}` : ''}${agCanBook(r) ? '' : ` · riservata a ${esc(agGroupName(r.gruppo_id))}`}</option>`).join('')
      : '<option value="">Nessuna risorsa configurata</option>';
    if (bookable.length) $('agRes').value = bookable[0].id;
    checkAvailability();
  };
  const range = () => {
    const s = new Date(`${$('agDate').value}T${$('agStart').value}`);
    const e = new Date(`${$('agDate').value}T${$('agEnd').value}`);
    return [s, e];
  };
  const checkAvailability = async () => {
    const box = $('agAvail'); if (!box) return;
    const t = currentType();
    const rid = $('agRes').value;
    if (t === 'APPUNTAMENTO' || !rid) { box.innerHTML = ''; return; }
    const [s, e] = range();
    if (!(e > s)) { box.innerHTML = '<span class="ag-busy">L\'orario di fine deve essere dopo l\'inizio.</span>'; return; }
    try {
      const busy = await select('calendar_events', `select=id,titolo,start_at,end_at,organizer_nome&resource_id=eq.${rid}&stato=neq.ANNULLATO&start_at=lt.${encodeURIComponent(e.toISOString())}&end_at=gt.${encodeURIComponent(s.toISOString())}`);
      box.innerHTML = busy.length
        ? `<span class="ag-busy">Occupata: ${busy.map(b => `${agHm(b.start_at)}–${agHm(b.end_at)} ${esc(b.titolo)}${b.organizer_nome ? ` (${esc(b.organizer_nome)})` : ''}`).join(' · ')}</span>`
        : '<span class="ag-free">Disponibile in questo orario</span>';
    } catch (err) { box.innerHTML = ''; }
  };

  document.querySelectorAll('input[name="agTipo"]').forEach(r => r.onchange = fillResources);
  ['agDate', 'agStart', 'agEnd'].forEach(id => $(id).onchange = checkAvailability);
  $('agRes').onchange = checkAvailability;
  $('agPeopleSearch').oninput = e => {
    const q = normSearch(e.target.value);
    document.querySelectorAll('#agPeople label[data-name]').forEach(l => l.classList.toggle('hidden', !!q && !l.dataset.name.includes(q)));
  };
  $('agCancel').onclick = () => agRender();
  const syncOnline = () => {
    const prov = AG_ONLINE[$('agOnline').value];
    $('agLinkRow').classList.toggle('hidden', !prov);
    $('agCreateMeeting').classList.toggle('hidden', !prov || !prov.create);
    if (prov) $('agProviderName').textContent = prov.label;
  };
  $('agOnline').onchange = syncOnline;
  $('agCreateMeeting').onclick = () => {
    const prov = AG_ONLINE[$('agOnline').value];
    if (!prov || !prov.create) return;
    const [s, e] = range();
    window.open(prov.create($('agTitle').value.trim(), isNaN(s) ? null : s, isNaN(e) ? null : e), '_blank', 'noopener');
    toast('Crea la riunione, copia il link e incollalo qui');
    setTimeout(() => $('agLink')?.focus(), 200);
  };
  syncOnline();
  fillResources();
  setTimeout(() => $('agTitle')?.focus(), 30);

  $('agForm').onsubmit = async ev => {
    ev.preventDefault();
    const t = currentType();
    const [s, e] = range();
    $('agResult').textContent = '';
    if (!(e > s)) { $('agResult').textContent = 'L\'orario di fine deve essere dopo l\'inizio.'; return; }
    if (t !== 'APPUNTAMENTO' && !$('agRes').value) { $('agResult').textContent = 'Scegli la risorsa da prenotare.'; return; }
    const invited = [...document.querySelectorAll('#agPeople input:checked')].map(x => x.value);
    const provider = $('agOnline').value || null;
    const link = agSafeUrl($('agLink').value);
    if (provider && $('agLink').value.trim() && !link) { $('agResult').textContent = 'Il link deve iniziare con https://'; return; }
    $('agSave').disabled = true;
    try {
      const rows = await insert('calendar_events', {
        tipo: t,
        titolo: $('agTitle').value.trim(),
        descrizione: $('agNotes').value.trim() || null,
        luogo: $('agPlace').value.trim() || null,
        resource_id: t === 'APPUNTAMENTO' ? null : +$('agRes').value,
        meeting_provider: provider,
        meeting_url: link || null,
        start_at: s.toISOString(),
        end_at: e.toISOString(),
        organizer_id: user.id,
        organizer_nome: profile?.nome || user.email
      });
      const created = rows && rows[0];
      if (created && invited.length) {
        await insert('calendar_attendees', invited.map(uid => ({ event_id: created.id, user_id: uid })), false);
      }
      toast(invited.length ? `Salvato · ${invited.length} invit${invited.length === 1 ? 'o' : 'i'} inviat${invited.length === 1 ? 'o' : 'i'}` : 'Salvato nel calendario');
      agState.anchor = s;
      await agRefresh();
      window.scrollTo(0, 0);
    } catch (err) {
      $('agResult').textContent = agFriendlyError(err);
      $('agSave').disabled = false;
    }
  };
}

function agDetail(id) {
  const e = agState.events.find(x => String(x.id) === String(id));
  if (!e) return;
  const t = AG_TYPES[e.tipo] || AG_TYPES.APPUNTAMENTO;
  const r = agResource(e.resource_id);
  const att = agAttendeesOf(e);
  const meAtt = att.find(a => a.user_id === user.id);
  const canEdit = e.organizer_id === user.id || (typeof hasPerm === 'function' ? hasPerm('gestione_calendario') : isITRole());
  const sameDay = agSameDay(e.start_at, e.end_at);
  $('content').innerHTML = `
    <div class="panel ag-detail ${t.cls}">
      <div class="ag-form-head"><span class="badge">${t.label}</span><button class="secondary compact" id="agBack">← Calendario</button></div>
      <h3>${esc(e.titolo)}</h3>
      <p class="ag-when">${esc(agDayLabel(e.start_at, true))} · ${agHm(e.start_at)}–${sameDay ? agHm(e.end_at) : `${esc(agDayLabel(e.end_at, true))} ${agHm(e.end_at)}`}</p>
      ${r ? `<p><b>${esc(r.nome)}</b>${r.sede ? ` · ${esc(r.sede)}` : ''}${r.dettagli ? `<br><small>${esc(r.dettagli)}</small>` : ''}</p>` : ''}
      ${e.luogo ? `<p>Luogo: ${esc(e.luogo)}</p>` : ''}
      ${e.meeting_provider ? `<div class="ag-online"><span>Riunione online · <b>${esc((AG_ONLINE[e.meeting_provider] || {}).label || e.meeting_provider)}</b></span>${agSafeUrl(e.meeting_url) ? `<a class="primary ag-join" href="${esc(agSafeUrl(e.meeting_url))}" target="_blank" rel="noopener">Partecipa alla riunione</a><button class="secondary compact" id="agCopyLink">Copia link</button>` : '<small class="muted-line">Link non ancora inserito</small>'}</div>` : ''}
      ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ''}
      <p class="muted-line">Organizzato da ${esc(e.organizer_nome || agContactName(e.organizer_id))}</p>
      ${att.length ? `<div class="ag-att"><b>Partecipanti</b>${att.map(a => `<span class="ag-att-row"><span>${esc(agContactName(a.user_id))}</span><em class="ag-ans ${a.risposta === 'ACCETTATO' ? 'yes' : a.risposta === 'RIFIUTATO' ? 'no' : ''}">${esc(a.risposta)}</em></span>`).join('')}</div>` : ''}
      <div class="button-row">
        ${meAtt && meAtt.risposta !== 'ACCETTATO' ? '<button class="primary" data-agans="ACCETTATO">Partecipo</button>' : ''}
        ${meAtt && meAtt.risposta !== 'RIFIUTATO' ? '<button class="secondary" data-agans="RIFIUTATO">Non partecipo</button>' : ''}
        ${canEdit ? '<button class="secondary danger-outline" id="agCancelEvent">Annulla prenotazione</button>' : ''}
      </div>
    </div>`;
  $('agBack').onclick = () => agRender();
  if ($('agCopyLink')) $('agCopyLink').onclick = () => { navigator.clipboard?.writeText(agSafeUrl(e.meeting_url)).then(() => toast('Link copiato'), () => toast(agSafeUrl(e.meeting_url))); };
  document.querySelectorAll('[data-agans]').forEach(b => b.onclick = async () => {
    try {
      await update('calendar_attendees', `event_id=eq.${e.id}&user_id=eq.${user.id}`, { risposta: b.dataset.agans });
      toast('Risposta inviata');
      await agLoad(); agDetail(e.id);
    } catch (err) { toast(agFriendlyError(err)); }
  });
  // Doppio clic di conferma (niente finestre di dialogo del browser)
  if ($('agCancelEvent')) $('agCancelEvent').onclick = () => {
    $('agCancelEvent').textContent = 'Conferma annullamento';
    $('agCancelEvent').onclick = async () => {
      try {
        await update('calendar_events', `id=eq.${e.id}`, { stato: 'ANNULLATO' });
        toast('Prenotazione annullata');
        await agRefresh();
      } catch (err) { toast(agFriendlyError(err)); }
    };
  };
}
