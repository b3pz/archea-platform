// ARCHEA Platform · progetti, task, ore e note del Workspace salvati su Supabase (tabella ws_records)
// Le schermate di Francesco restano le stesse: questo modulo sostituisce il salvataggio nel browser.
(function () {
  var KEYS = { progetti: 'codice', task: 'id', ore: 'id', note: 'id', team: 'id', staff: 'id' };
  var S = {
    started: false, loaded: false, version: 0,
    data: { progetti: [], task: [], ore: [], note: [], team: [], staff: [] },
    server: { progetti: {}, task: {}, ore: {}, note: {}, team: {}, staff: {} },   // id -> JSON e revisione server
    perms: [], people: [], pmNames: [], listeners: new Set(), timer: 0, pending: 0, me: null, queues: {}
  };

  function cfg() { return window.ARCHEA_CONFIG || {}; }
  function token() {
    try { var s = JSON.parse(localStorage.getItem('archea_sd_session') || 'null'); return s && s.access_token; } catch (e) { return null; }
  }
  async function api(path, opt, retry) {
    opt = opt || {};
    var c = cfg();
    var h = Object.assign({ apikey: c.supabaseKey || c.SUPABASE_KEY || c.key, 'Content-Type': 'application/json' }, opt.headers || {});
    var t = token(); if (t) h.Authorization = 'Bearer ' + t;
    var base = c.supabaseUrl || c.SUPABASE_URL || c.url;
    var r = await fetch(base + path, { method: opt.method || 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : null });
    if (r.status === 401 && retry !== false && window.ArcheaAuth && window.ArcheaAuth.restore) {
      try { await window.ArcheaAuth.restore(); } catch (e) {}
      return api(path, opt, false);
    }
    var tx = await r.text(), d = null;
    try { d = tx ? JSON.parse(tx) : null; } catch (e) { d = tx; }
    if (!r.ok) throw new Error((d && (d.message || d.msg || d.error)) || ('HTTP ' + r.status));
    return d;
  }
  function emit() { S.version++; S.listeners.forEach(function (f) { try { f(S.version); } catch (e) {} }); }
  function toast(msg) { try { window.dispatchEvent(new CustomEvent('archea-ws-message', { detail: msg })); } catch (e) {} }
  function keyOf(col, row) { return String(row && row[KEYS[col]] != null ? row[KEYS[col]] : ''); }

  async function loadAll() {
    var rows = [], from = 0;
    for (var i = 0; i < 20; i++) {
      var part = await api('/rest/v1/ws_records?select=collection,id,data,revision&order=collection.asc,id.asc&offset=' + from + '&limit=1000');
      rows = rows.concat(part || []);
      if (!part || part.length < 1000) break;
      from += 1000;
    }
    var data = { progetti: [], task: [], ore: [], note: [], team: [], staff: [] }, server = { progetti: {}, task: {}, ore: {}, note: {}, team: {}, staff: {} };
    rows.forEach(function (r) { if (!data[r.collection]) return; data[r.collection].push(r.data); server[r.collection][r.id] = { json: JSON.stringify(r.data), revision: Number(r.revision || 1) }; });
    if (S.pending) return; // non sovrascrivere modifiche in corso
    S.data = data; S.server = server; S.loaded = true; emit();
  }
  async function loadPeople() {
    try { S.perms = (await api('/rest/v1/rpc/my_permissions', { method: 'POST', body: {} })) || []; } catch (e) { S.perms = []; }
    var list = [];
    try { list = (await api('/rest/v1/rpc/chat_contacts', { method: 'POST', body: {} })) || []; } catch (e) { list = []; }
    var pmIds = [];
    try {
      var g = await api('/rest/v1/access_groups?select=id,permessi');
      var pmGroups = (g || []).filter(function (x) { return (x.permessi || []).indexOf('gestione_progetti') >= 0; }).map(function (x) { return x.id; });
      if (pmGroups.length) {
        var m = await api('/rest/v1/access_group_members?select=user_id&group_id=in.(' + pmGroups.join(',') + ')');
        pmIds = (m || []).map(function (x) { return x.user_id; });
      }
    } catch (e) {}
    S.people = list.map(function (p) {
      return { id: p.id, nome: p.nome || 'Collega', ruolo: pmIds.indexOf(p.id) >= 0 ? 'responsabile' : 'membro', inRiepiloghiOre: true };
    });
  }

  // Organico: le persone vere dell'anagrafica HR del Service Desk (se l'account le può leggere)
  async function loadStaff() {
    try {
      var rows = await api('/rest/v1/people?select=id,display_name,site,department,company,current_status&order=display_name.asc&limit=2000');
      S.staff = (rows || []).filter(function (p) { return !p.current_status || /ATTIV/i.test(p.current_status); }).map(function (p) {
        return { id: 'hr-' + p.id, name: p.display_name || 'Persona', studio: String(p.site || '').toLowerCase(), years: null,
          role: p.department || p.company || 'Organico', contract: null, annualCompensation: null, expiresAt: null };
      });
      emit();
    } catch (e) { S.staff = []; }
  }
  async function start(me) {
    S.me = me || null;
    if (S.started) return;
    S.started = true;
    try { await loadPeople(); await loadAll(); loadStaff(); }
    catch (e) {
      S.loaded = true; S.error = e.message; emit();
      if (/ws_records|PGRST|does not exist|schema cache/i.test(e.message)) toast('Progetti e task condivisi da attivare: esegui SETUP_COMPLETO.sql su Supabase.');
    }
    clearInterval(S.timer);
    S.timer = setInterval(function () { if (document.visibilityState === 'visible') loadAll().catch(function () {}); }, 20000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') loadAll().catch(function () {}); });
  }
  function stop() { clearInterval(S.timer); S.started = false; S.loaded = false; S.data = { progetti: [], task: [], ore: [], note: [], team: [], staff: [] }; S.server = { progetti: {}, task: {}, ore: {}, note: {}, team: {}, staff: {} }; emit(); }

  async function persist(col, next) {
    var srv = S.server[col], seen = {}, upserts = [], deletes = [];
    next.forEach(function (row) {
      var id = keyOf(col, row); if (!id) return;
      seen[id] = 1;
      var js = JSON.stringify(row);
      if (srv[id] === undefined) upserts.push({ id: id, data: row, expected_revision: null });
      else if (srv[id].json !== js) upserts.push({ id: id, data: row, expected_revision: srv[id].revision });
    });
    Object.keys(srv).forEach(function (id) { if (!seen[id]) deletes.push({ id: id, expected_revision: srv[id].revision }); });
    if (!upserts.length && !deletes.length) return;
    // ARCHEA: una RPC transazionale evita salvataggi parziali e revisioni concorrenti perse.
    var result = await api('/rest/v1/rpc/ws_apply_changes', { method: 'POST', body: { p_collection: col, p_upserts: upserts, p_deletes: deletes } });
    ((result && result.upserts) || []).forEach(function (row) {
      srv[row.id] = { json: JSON.stringify(row.data), revision: Number(row.revision) };
    });
    ((result && result.deletes) || []).forEach(function (id) { delete srv[id]; });
  }
  function set(col, next) {
    if (!Array.isArray(next)) return;
    S.data[col] = next; S.pending++; emit();
    S.queues[col] = (S.queues[col] || Promise.resolve()).then(function () {
      return persist(col, S.data[col]);
    }).catch(function (e) {
      // ARCHEA: la transazione è annullata per intero; ricarica i dati e indica come riprovare.
      toast('Salvataggio non riuscito; nessuna modifica parziale è stata registrata. Riapri la scheda e reinserisci i dati. ' + e.message);
    }).finally(function () {
      S.pending = Math.max(0, S.pending - 1);
      if (!S.pending) loadAll().catch(function () {});
    });
  }

  window.ArcheaWsCloud = {
    start: start, stop: stop, set: set,
    get: function (col) { return S.data[col] || []; },
    loaded: function () { return S.loaded; },
    version: function () { return S.version; },
    isPM: function () { return S.perms.indexOf('gestione_progetti') >= 0; },
    isVice: function () { var id = S.me && S.me.id; return !!id && S.data.team.some(function (t) { return (t.viceIds || []).indexOf(id) >= 0; }); },
    // ARCHEA: il menu del Workspace usa gli stessi permessi cumulabili letti dal database.
    permissions: function () { return S.perms.slice(); },
    people: function () { return S.people; },
    staff: function () { return S.staff || []; },
    subscribe: function (f) { S.listeners.add(f); return function () { S.listeners.delete(f); }; }
  };

  // messaggi in basso (per gli errori di permesso)
  window.addEventListener('archea-ws-message', function (e) {
    var el = document.createElement('div');
    el.className = 'archea-ws-toast'; el.textContent = e.detail;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 4200);
    setTimeout(function () { el.remove(); }, 4800);
  });
})();
