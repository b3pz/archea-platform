// ARCHEA Platform · progetti, task, ore e note del Workspace salvati su Supabase (tabella ws_records)
// Le schermate di Francesco restano le stesse: questo modulo sostituisce il salvataggio nel browser.
(function () {
  var KEYS = { progetti: 'codice', task: 'id', ore: 'id', note: 'id', team: 'id', staff: 'id' };
  var S = {
    started: false, loaded: false, version: 0,
    data: { progetti: [], task: [], ore: [], note: [], team: [], staff: [] },
    server: { progetti: {}, task: {}, ore: {}, note: {}, team: {}, staff: {} },   // id -> JSON salvato
    perms: [], people: [], pmNames: [], listeners: new Set(), timer: 0, pending: 0, me: null
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
      var part = await api('/rest/v1/ws_records?select=collection,id,data&order=collection.asc,id.asc&offset=' + from + '&limit=1000');
      rows = rows.concat(part || []);
      if (!part || part.length < 1000) break;
      from += 1000;
    }
    var data = { progetti: [], task: [], ore: [], note: [], team: [], staff: [] }, server = { progetti: {}, task: {}, ore: {}, note: {}, team: {}, staff: {} };
    rows.forEach(function (r) { if (!data[r.collection]) return; data[r.collection].push(r.data); server[r.collection][r.id] = JSON.stringify(r.data); });
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
      return { id: p.id, nome: p.nome || 'Collega', ruolo: (p.ruolo === 'SUPER_IT' || pmIds.indexOf(p.id) >= 0) ? 'responsabile' : 'membro', inRiepiloghiOre: true };
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
    var srv = S.server[col], seen = {}, writes = [];
    next.forEach(function (row) {
      var id = keyOf(col, row); if (!id) return;
      seen[id] = 1;
      var js = JSON.stringify(row);
      if (srv[id] === undefined) writes.push(['POST', id, row, js]);
      else if (srv[id] !== js) writes.push(['PATCH', id, row, js]);
    });
    Object.keys(srv).forEach(function (id) { if (!seen[id]) writes.push(['DELETE', id]); });
    if (!writes.length) return;
    S.pending++;
    var failed = null;
    for (var i = 0; i < writes.length; i++) {
      var w = writes[i], q = '?collection=eq.' + col + '&id=eq.' + encodeURIComponent(w[1]);
      try {
        if (w[0] === 'POST') { await api('/rest/v1/ws_records', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { collection: col, id: w[1], data: w[2] } }); srv[w[1]] = w[3]; }
        else if (w[0] === 'PATCH') {
          var res = await api('/rest/v1/ws_records' + q, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: { data: w[2] } });
          if (!res || !res.length) throw new Error('permesso');
          srv[w[1]] = JSON.stringify(res[0].data || w[2]);
        } else {
          var del = await api('/rest/v1/ws_records' + q, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
          if (!del || !del.length) throw new Error('permesso');
          delete srv[w[1]];
        }
      } catch (e) { failed = e; }
    }
    S.pending--;
    if (failed) {
      toast(/permesso|row-level|policy|42501/i.test(failed.message)
        ? (col === 'task' || col === 'progetti' || col === 'team' ? 'Solo il PM può creare progetti, assegnare task o cambiarne titolo e scadenze.' : 'Non hai il permesso per questa modifica.')
        : 'Salvataggio non riuscito: ' + failed.message);
      loadAll().catch(function () {});
    }
  }
  function set(col, next) {
    if (!Array.isArray(next)) return;
    S.data[col] = next; emit();
    persist(col, next).catch(function (e) { toast('Salvataggio non riuscito: ' + e.message); });
  }

  window.ArcheaWsCloud = {
    start: start, stop: stop, set: set,
    get: function (col) { return S.data[col] || []; },
    loaded: function () { return S.loaded; },
    version: function () { return S.version; },
    isPM: function () { return S.perms.indexOf('gestione_progetti') >= 0; },
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
