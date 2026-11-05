/*
 * Service Desk · backend dimostrativo
 * -----------------------------------
 * Emula in memoria il sottoinsieme di Supabase (PostgREST + Auth + Edge Functions)
 * usato da app.js, così il Service Desk si può mostrare senza toccare dati reali.
 *
 * - I dati sono FINTI: persone, asset e ticket inventati.
 * - Le modifiche restano solo in questo browser (localStorage) e si azzerano
 *   con SDDemo.reset().
 * - Nessuna richiesta di rete: niente Telegram, niente import.
 */
(function () {
  'use strict';

  var DB_KEY = 'archea_sd_demo_db_v1';

  // ---------- utilità ----------
  function iso(daysAgo, hour) {
    var d = new Date();
    d.setDate(d.getDate() - (daysAgo || 0));
    d.setHours(hour == null ? 9 : hour, (daysAgo * 7) % 60, 0, 0);
    var limit = Date.now() - 20 * 60000; // mai date nel futuro
    if (d.getTime() > limit) d = new Date(limit - (hour || 0) * 60000);
    return d.toISOString();
  }
  function day(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function norm(s) { return String(s || '').normalize('NFKD').replace(/[^a-zA-Z]/g, '').toLowerCase(); }
  function tkt(id) { return 'TKT-' + new Date().getFullYear() + '-' + String(id).padStart(5, '0'); }

  // ---------- dati dimostrativi ----------
  function seed(me) {
    var IT1 = { id: 'demo-it-1', nome: 'Giulia Ferri', email: 'giulia.ferri@demo.archea.it', ruolo: 'SUPER_IT' };
    var IT2 = { id: 'demo-it-2', nome: 'Davide Conti', email: 'davide.conti@demo.archea.it', ruolo: 'IT' };
    var HR1 = { id: 'demo-hr-1', nome: 'Sara Galli', email: 'sara.galli@demo.archea.it', ruolo: 'HR' };
    // Profili degli account di prova del Workspace che hanno un ruolo nel Service Desk
    var profiles = [
      { id: 'demo-itdesk', nome: 'Reparto IT', email: 'it@archea.it', ruolo: 'SUPER_IT' },
      IT1, IT2, HR1,
      { id: 'demo-epietrelli', nome: 'Elisabetta Pietrelli', email: 'elisabetta.pietrelli@archea.it', ruolo: 'HR' }
    ];
    if (!profiles.some(function (p) { return p.email === me.email; })) {
      profiles.unshift({ id: me.id, nome: me.nome, email: me.email, ruolo: me.ruolo });
    }

    var sites = ['FIRENZE', 'MILANO', 'ROMA'];
    var depts = ['ARCHITETTURA', 'INTERIOR', 'VISUAL', 'CONCEPT', 'AMMINISTRAZIONE', 'IT'];

    var peopleSrc = [
      ['Chiara', 'Moretti', 'FIRENZE', 'ARCHITETTURA', 'Architect'],
      ['Luca', 'Ricci', 'FIRENZE', 'INTERIOR', 'Senior Architect'],
      ['Elena', 'Bruno', 'MILANO', 'VISUAL', 'Visual Artist'],
      ['Paolo', 'Marino', 'MILANO', 'ARCHITETTURA', 'Architect'],
      ['Martina', 'Greco', 'ROMA', 'CONCEPT', 'Architect'],
      ['Andrea', 'Lombardi', 'FIRENZE', 'AMMINISTRAZIONE', 'Amministrazione'],
      ['Federica', 'Costa', 'FIRENZE', 'ARCHITETTURA', 'Partner Architect'],
      ['Matteo', 'Fontana', 'MILANO', 'INTERIOR', 'Architect'],
      ['Sofia', 'Rinaldi', 'ROMA', 'ARCHITETTURA', 'Architect'],
      ['Tommaso', 'Caruso', 'FIRENZE', 'VISUAL', 'Visual Artist'],
      ['Giulia', 'Ferri', 'FIRENZE', 'IT', 'IT Specialist'],
      ['Davide', 'Conti', 'FIRENZE', 'IT', 'IT Specialist']
    ];

    var map_positions = [];
    var mp = 1;
    ['FIRENZE', 'MILANO'].forEach(function (site) {
      ['A', 'B'].forEach(function (zone) {
        for (var i = 1; i <= 4; i++) {
          map_positions.push({
            id: mp++, site: site, position_type: 'POSTAZIONE', zone_code: zone,
            position_code: (site === 'FIRENZE' ? 'FI-' : 'MI-') + zone + i,
            label: 'Postazione ' + zone + i, is_active: true, x_pct: null, y_pct: null,
            created_at: iso(120)
          });
        }
      });
    });
    ['M-A1', 'M-A2', 'M-B1'].forEach(function (code) {
      map_positions.push({ id: mp++, site: 'FIRENZE', position_type: 'MAGAZZINO', zone_code: 'M', position_code: code, label: 'Magazzino IT ' + code.slice(2), is_active: true, created_at: iso(120) });
    });

    var people = peopleSrc.map(function (p, i) {
      var posForSite = map_positions.filter(function (m) { return m.site === p[2] && m.position_type === 'POSTAZIONE'; });
      var pos = i < 9 ? posForSite[i % posForSite.length] : null;
      return {
        id: i + 1,
        first_name: p[0], surname: p[1], display_name: p[0] + ' ' + p[1],
        normalized_name_key: norm(p[0] + p[1]),
        corporate_email: (p[0] + '.' + p[1]).toLowerCase() + '@demo.archea.it',
        site: p[2], department: p[3], profile: p[4], company: 'ARCHEA ASSOCIATI',
        current_status: i === 11 ? 'PREVISTO' : 'ATTIVO',
        verification_status: i % 4 === 3 ? 'DA VERIFICARE' : 'VERIFICATO',
        map_position_id: pos ? pos.id : null,
        current_desk: pos ? pos.position_code : null,
        hire_date: day(-400 + i * 25), exit_date: null,
        notes: null, created_at: iso(200 - i), updated_at: iso(10 + i)
      };
    });
    people.push({
      id: 13, first_name: 'Roberto', surname: 'Villa', display_name: 'Roberto Villa', normalized_name_key: 'robertovilla',
      corporate_email: 'roberto.villa@demo.archea.it', site: 'ROMA', department: 'ARCHITETTURA', profile: 'Architect',
      company: 'ARCHEA ASSOCIATI', current_status: 'USCITO', verification_status: 'VERIFICATO', map_position_id: null,
      exit_date: day(-30), created_at: iso(500), updated_at: iso(30)
    });

    var catalog = [
      ['LAPTOP', 'Dell', 'Precision 5680'], ['LAPTOP', 'Apple', 'MacBook Pro 14'], ['MONITOR', 'Dell', 'U2723QE'],
      ['MONITOR', 'LG', '27UP850'], ['WORKSTATION', 'HP', 'Z4 G5'], ['TABLET', 'Apple', 'iPad Pro 12.9'],
      ['SMARTPHONE', 'Apple', 'iPhone 15'], ['CAMERA 3D', 'Matterport', 'Pro3'], ['STAMPANTE', 'Canon', 'imagePROGRAF TM-300'],
      ['DOCKING', 'Dell', 'WD22TB4']
    ];
    var assets = [];
    for (var a = 0; a < 26; a++) {
      var c = catalog[a % catalog.length];
      var owner = a < 16 ? people[a % 11] : null;
      var status = owner ? 'ASSEGNATO' : (a === 18 ? 'IN PRESTITO' : a === 20 ? 'DA VERIFICARE' : a === 22 ? 'PRENOTATO' : 'DISPONIBILE');
      var store = map_positions.filter(function (m) { return m.position_type === 'MAGAZZINO'; })[a % 3];
      assets.push({
        id: a + 1,
        asset_code: 'A' + (4001 + a * 3),
        category: c[0], brand: c[1], model: c[2], asset_model: c[2],
        serial_number: 'SN' + (839201 + a * 7919).toString(36).toUpperCase(),
        status: status,
        site: owner ? owner.site : 'FIRENZE',
        position: owner ? owner.current_desk : store.position_code,
        assigned_person_id: owner ? owner.id : null,
        assigned_user_name: owner ? owner.display_name : null,
        assigned_user_email: owner ? owner.corporate_email : null,
        verification_status: a % 5 === 4 ? 'DA VERIFICARE' : 'VERIFICATO',
        verified_by: a % 5 === 4 ? null : IT1.nome,
        verified_at: a % 5 === 4 ? null : iso(20 + a),
        is_label_only: false, source_sheet: 'Device', source_row: a + 3,
        notes: null, created_at: iso(300 - a), updated_at: iso(a)
      });
    }
    assets.push({ id: 27, asset_code: 'A4090', category: 'ETICHETTA', status: 'ETICHETTA LIBERA', is_label_only: true, site: 'FIRENZE', verification_status: 'DA VERIFICARE', source_sheet: 'Device', created_at: iso(90), updated_at: iso(90) });

    var asset_assignments = assets.filter(function (x) { return x.assigned_person_id; }).map(function (x, i) {
      return { id: i + 1, asset_id: x.id, person_id: x.assigned_person_id, assignment_status: 'ATTIVA', assigned_from: day(-200 + i * 5), assigned_to: null, created_at: iso(200 - i * 5) };
    });
    var asset_history = assets.slice(0, 10).map(function (x, i) {
      return { id: i + 1, asset_id: x.id, action: 'ASSEGNAZIONE', evento: 'Assegnato a ' + (x.assigned_user_name || '—'), details: 'Consegna con verbale', autore: IT1.nome, created_at: iso(150 - i) };
    });

    var T = [
      ['Supporto IT', 'Revit si chiude all\'apertura del modello centrale', 'Da stamattina Revit 2025 crasha quando apro il centrale del progetto P51.', 'IN LAVORAZIONE', 'ALTA', 1, IT1, 0],
      ['Rete / Wi-Fi', 'Wi-Fi lento in sala riunioni 2', 'Durante le call la connessione cade spesso.', 'APERTO', 'NORMALE', 2, null, 1],
      ['Hardware', 'Monitor con riga verticale', 'Il secondo monitor mostra una riga verde a metà schermo.', 'APERTO', 'BASSA', 4, null, 3],
      ['Accessi', 'Accesso cartella server commessa P48', 'Mi serve l\'accesso in scrittura alla cartella P48 sul server.', 'CHIUSO', 'NORMALE', 0, IT2, 6],
      ['Installazioni', 'Installazione Enscape 4', 'Per le viste del concorso serve Enscape sulla workstation.', 'IN ATTESA', 'NORMALE', 9, IT2, 2],
      ['Prenotazione materiale', 'Matterport per rilievo cantiere', 'Rilievo del cantiere di via Cavour.', 'APERTO', 'NORMALE', 3, null, 0],
      ['Movimento persona', 'Nuovo ingresso · Giulia Ferri', 'Preparare postazione, account e laptop.', 'IN LAVORAZIONE', 'ALTA', 10, IT1, 4],
      ['Supporto IT', 'Stampante plotter non risponde', 'Il plotter del 2° piano risulta offline.', 'APERTO', 'URGENTE', 5, null, 0],
      ['Manutenzioni', 'Aggiornamento macOS', 'Il MacBook chiede un aggiornamento importante.', 'CHIUSO', 'BASSA', 7, IT1, 12],
      ['Altro', 'Richiesta secondo monitor', 'Per lavorare sulle tavole servirebbe un secondo schermo.', 'APERTO', 'NORMALE', 8, null, 5]
    ];
    var tickets = T.map(function (t, i) {
      var requester = t[5] === 0 || i === 1 ? { nome: me.nome, email: me.email } : { nome: people[t[5]].display_name, email: people[t[5]].corporate_email };
      return {
        id: i + 1, numero_ticket: tkt(i + 1),
        categoria: t[0], oggetto: t[1], descrizione: t[2], stato: t[3], priorita: t[4],
        richiedente_nome: requester.nome, richiedente_email: requester.email,
        created_by: null, created_by_name: requester.nome,
        origine: i % 3 === 0 ? 'Telefono' : 'Portale', sede: i % 2 ? 'FIRENZE' : 'MILANO',
        assigned_to: t[6] ? t[6].id : null, assegnato_a: t[6] ? t[6].nome : null,
        outcome: t[3] === 'CHIUSO' ? 'RISOLTO' : null,
        resolution_note: t[3] === 'CHIUSO' ? 'Risolto in assistenza remota.' : null,
        closed_at: t[3] === 'CHIUSO' ? iso(t[7] - 1) : null,
        created_at: iso(t[7] + 1, 9 + i), updated_at: iso(t[7], 11 + i)
      };
    });

    return {
      _meta: { owner: me.email, createdAt: new Date().toISOString() },
      profiles: profiles,
      people: people,
      map_positions: map_positions,
      assets: assets,
      asset_assignments: asset_assignments,
      asset_history: asset_history,
      tickets: tickets,
      comments: [
        { id: 1, ticket_id: 1, autore: IT1.nome, autore_email: IT1.email, testo: 'Sto controllando i log del server Revit.', nota_interna: false, created_at: iso(0, 10) },
        { id: 2, ticket_id: 1, autore: IT1.nome, autore_email: IT1.email, testo: 'Probabile file locale corrotto: ricreare la copia.', nota_interna: true, created_at: iso(0, 11) },
        { id: 3, ticket_id: 4, autore: IT2.nome, autore_email: IT2.email, testo: 'Accesso concesso, verifica pure.', nota_interna: false, created_at: iso(6, 15) }
      ],
      checklist_items: [
        { id: 1, ticket_id: 7, testo: 'Creare account Microsoft 365', completato: true, completed_at: iso(3) },
        { id: 2, ticket_id: 7, testo: 'Preparare laptop A4031', completato: false },
        { id: 3, ticket_id: 7, testo: 'Assegnare postazione FI-B3', completato: false }
      ],
      appointments: [
        { id: 1, ticket_id: 1, start_at: new Date(Date.now() + 86400000).toISOString(), durata_minuti: 30, modalita: 'Alla postazione utente', note: null, status: 'PROPOSTO', created_at: iso(0) },
        { id: 2, ticket_id: 5, start_at: new Date(Date.now() + 2 * 86400000).toISOString(), durata_minuti: 45, modalita: 'Remoto', note: 'Installazione da remoto', status: 'CONFERMATO', created_at: iso(1) }
      ],
      material_bookings: [
        { id: 1, ticket_id: 6, requester_name: tickets[5].richiedente_nome, requester_email: tickets[5].richiedente_email, material_type: 'Matterport', quantity: 1, pickup_date: day(2), planned_return_date: day(4), site: 'FIRENZE', reason: 'Rilievo cantiere', requested_accessories: 'Treppiede', requester_notes: null, status: 'RICHIESTA', created_at: iso(0) }
      ],
      ticket_collaborators: [{ id: 1, ticket_id: 7, user_id: IT2.id, created_at: iso(3) }],
      ticket_history: [],
      hr_movements: [
        { id: 1, ticket_id: 7, movement_type: 'NUOVO INGRESSO', movement_date: day(7), status: 'DA VERIFICARE', person_id: 12, person_name: 'Davide', person_surname: 'Conti', person_email: 'davide.conti@demo.archea.it', current_site: null, new_site: 'FIRENZE', current_desk: null, new_desk: 'FI-B4', notes: 'Laptop e monitor', created_by_name: HR1.nome, created_at: iso(4) },
        { id: 2, ticket_id: null, movement_type: 'CAMBIO POSTAZIONE', movement_date: day(-5), status: 'CONFERMATO', person_id: 4, person_name: 'Paolo', person_surname: 'Marino', person_email: 'paolo.marino@demo.archea.it', current_site: 'MILANO', new_site: 'MILANO', current_desk: 'MI-A3', new_desk: 'MI-B1', created_by_name: HR1.nome, created_at: iso(9) },
        { id: 3, ticket_id: null, movement_type: 'USCITA', movement_date: day(-30), status: 'CONFERMATO', person_id: 13, person_name: 'Roberto', person_surname: 'Villa', person_email: 'roberto.villa@demo.archea.it', current_site: 'ROMA', new_site: null, created_by_name: HR1.nome, created_at: iso(35) }
      ],
      person_events: [],
      people_source_records: people.slice(0, 6).map(function (p, i) {
        return { id: i + 1, person_id: p.id, source_type: 'HR', name_raw: p.display_name.toUpperCase(), normalized_name_key: p.normalized_name_key, source_row: i + 2, source_page: 1, site_raw: p.site, match_status: 'MATCH' };
      }),
      reference_values: [].concat(
        sites.map(function (v) { return ['SITE', v]; }),
        depts.map(function (v) { return ['DEPARTMENT', v]; }),
        [['COMPANY', 'ARCHEA ASSOCIATI'], ['COMPANY', 'ARCHEA PROPERTY']],
        ['Architect', 'Senior Architect', 'Partner Architect', 'Visual Artist', 'IT Specialist', 'Amministrazione'].map(function (v) { return ['PROFILE', v]; }),
        ['LAPTOP', 'MONITOR', 'WORKSTATION', 'TABLET', 'SMARTPHONE', 'CAMERA 3D', 'STAMPANTE', 'DOCKING'].map(function (v) { return ['CATEGORY', v]; })
      ).map(function (r, i) { return { id: i + 1, value_type: r[0], value: r[1], normalized_key: norm(r[1]), is_approved: true, created_at: iso(100) }; }),
      data_conflicts: [
        { id: 1, source_type: 'DEVICE', conflict_type: 'ASSEGNATARIO DIVERSO', conflict_key: 'A4016', status: 'APERTO', details: { excel: 'Luca Ricci', portale: 'Chiara Moretti' }, created_at: iso(8) }
      ],
      conflict_resolution_requests: [],
      deletion_requests: [],
      notifications: [
        { id: 1, user_id: me.id, ticket_id: 2, title: 'Stato aggiornato: APERTO', message: tkt(2) + ' · Wi-Fi lento in sala riunioni 2', is_read: false, created_at: iso(0, 11) },
        { id: 2, user_id: IT1.id, ticket_id: 5, title: 'Appuntamento confermato', message: 'Installazione Enscape · remoto', is_read: false, created_at: iso(1, 16) },
        { id: 3, user_id: me.id, ticket_id: 4, title: 'Ticket chiuso', message: 'Accesso cartella P48 concesso', is_read: true, created_at: iso(6, 17) }
      ]
    };
  }

  // ---------- stato ----------
  var me = null;
  var db = null;

  function persist() { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} }
  function loadDb() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      var stored = raw ? JSON.parse(raw) : null;
      if (stored && stored._meta && stored.tickets) return stored;
    } catch (e) {}
    return seed(me);
  }
  function rows(table) { if (!db[table]) db[table] = []; return db[table]; }
  function nextId(table) {
    return rows(table).reduce(function (m, r) { return typeof r.id === 'number' && r.id > m ? r.id : m; }, 0) + 1;
  }

  // ---------- PostgREST minimale ----------
  function splitTop(str) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function parseQuery(qs) {
    var q = { select: '*', order: [], limit: null, offset: 0, filters: [] };
    if (!qs) return q;
    qs.split('&').forEach(function (part) {
      if (!part) return;
      var eq = part.indexOf('=');
      var key = decodeURIComponent(part.slice(0, eq));
      var val = part.slice(eq + 1);
      if (key === 'select') q.select = decodeURIComponent(val);
      else if (key === 'order') q.order = decodeURIComponent(val).split(',');
      else if (key === 'limit') q.limit = +val;
      else if (key === 'offset') q.offset = +val;
      else q.filters.push({ col: key, expr: val });
    });
    return q;
  }

  function cmpVal(v) { return v === null || v === undefined ? null : v; }

  function test(row, col, expr) {
    var neg = false;
    if (expr.indexOf('not.') === 0) { neg = true; expr = expr.slice(4); }
    var dot = expr.indexOf('.');
    var op = expr.slice(0, dot);
    var raw = expr.slice(dot + 1);
    var val;
    try { val = decodeURIComponent(raw); } catch (e) { val = raw; }
    var cell = cmpVal(row[col]);
    var s = cell == null ? null : String(cell);
    var res;
    switch (op) {
      case 'eq': res = s === val; break;
      case 'neq': res = s !== val; break;
      case 'gt': res = cell != null && (isNaN(+val) ? s > val : +cell > +val); break;
      case 'gte': res = cell != null && (isNaN(+val) ? s >= val : +cell >= +val); break;
      case 'lt': res = cell != null && (isNaN(+val) ? s < val : +cell < +val); break;
      case 'lte': res = cell != null && (isNaN(+val) ? s <= val : +cell <= +val); break;
      case 'is': res = val === 'null' ? cell == null : String(!!cell) === val; break;
      case 'in':
        var list = val.replace(/^\(|\)$/g, '').split(',').map(function (x) { return x.replace(/^"|"$/g, '').trim(); });
        res = s != null && list.indexOf(s) >= 0; break;
      case 'like':
      case 'ilike':
        var pattern = '^' + val.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[*%]/g, '.*') + '$';
        res = s != null && new RegExp(pattern, op === 'ilike' ? 'i' : '').test(s); break;
      default: res = true;
    }
    return neg ? !res : res;
  }

  var EMBED_FK = { tickets: 'ticket_id', profiles: 'user_id', people: 'person_id', assets: 'asset_id', map_positions: 'map_position_id' };

  function project(row, select) {
    var items = splitTop(select);
    var out = {};
    items.forEach(function (item) {
      var m = item.match(/^(?:(\w+):)?(\w+)(?:!(\w+))?\((.*)\)$/);
      if (m) {
        var alias = m[1] || m[2], table = m[2], fk = m[3] || EMBED_FK[table] || (table.replace(/s$/, '') + '_id');
        var target = rows(table).find(function (r) { return row[fk] != null && String(r.id) === String(row[fk]); });
        out[alias] = target ? project(target, m[4] || '*') : null;
      } else if (item === '*') {
        Object.keys(row).forEach(function (k) { out[k] = row[k]; });
      } else {
        out[item] = row[item] === undefined ? null : row[item];
      }
    });
    return out;
  }

  function sortRows(list, order) {
    if (!order.length) return list;
    var specs = order.map(function (o) {
      var p = o.split('.');
      return { col: p[0], desc: p.indexOf('desc') > 0, nullsLast: p.indexOf('nullslast') > 0 ? true : p.indexOf('nullsfirst') > 0 ? false : p.indexOf('desc') > 0 ? false : true };
    });
    return list.slice().sort(function (a, b) {
      for (var i = 0; i < specs.length; i++) {
        var sp = specs[i], x = a[sp.col], y = b[sp.col];
        if (x == null && y == null) continue;
        if (x == null) return sp.nullsLast ? 1 : -1;
        if (y == null) return sp.nullsLast ? -1 : 1;
        var c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'it', { numeric: true });
        if (c) return sp.desc ? -c : c;
      }
      return 0;
    });
  }

  function filtered(table, q) {
    return rows(table).filter(function (r) {
      return q.filters.every(function (f) { return test(r, f.col, f.expr); });
    });
  }

  function rest(method, table, qs, body, headers) {
    var q = parseQuery(qs);
    var now = new Date().toISOString();
    var wantRows = !headers || !headers.Prefer || headers.Prefer.indexOf('return=minimal') < 0;

    if (method === 'GET') {
      var list = sortRows(filtered(table, q), q.order);
      list = list.slice(q.offset, q.limit != null ? q.offset + q.limit : undefined);
      return list.map(function (r) { return project(r, q.select); });
    }
    if (method === 'POST') {
      var input = Array.isArray(body) ? body : [body];
      var created = input.map(function (b) {
        var r = Object.assign({ created_at: now }, clone(b));
        if (r.id == null) r.id = nextId(table);
        if (table === 'tickets') { r.updated_at = now; r.created_by = r.created_by || me.id; }
        if (table === 'map_positions' && r.is_active == null) r.is_active = true;
        if (table === 'people') { r.normalized_name_key = r.normalized_name_key || norm((r.first_name || '') + (r.surname || '')); }
        rows(table).push(r);
        touchTicket(r.ticket_id, table);
        onInsert(table, r);
        return r;
      });
      persist();
      return wantRows ? clone(created) : null;
    }
    if (method === 'PATCH') {
      var hit = filtered(table, q);
      hit.forEach(function (r) {
        var before = clone(r);
        Object.assign(r, clone(body));
        onUpdate(table, before, r);
        if (table === 'tickets') {
          r.updated_at = now;
          if (body && body.stato === 'CHIUSO' && !r.closed_at) r.closed_at = now;
        }
      });
      persist();
      return wantRows ? clone(hit) : null;
    }
    if (method === 'DELETE') {
      var keep = rows(table).filter(function (r) {
        return !q.filters.every(function (f) { return test(r, f.col, f.expr); });
      });
      db[table] = keep;
      persist();
      return null;
    }
    throw new Error('Metodo non supportato in demo: ' + method);
  }

  // ---------- notifiche (in produzione le crea il database) ----------
  function ticketById(id) { return rows('tickets').find(function (t) { return String(t.id) === String(id); }); }
  function profileIdByEmail(email) {
    var p = rows('profiles').find(function (x) { return x.email && email && x.email.toLowerCase() === String(email).toLowerCase(); });
    return p ? p.id : null;
  }
  function itIds() { return rows('profiles').filter(function (p) { return p.ruolo === 'IT' || p.ruolo === 'SUPER_IT'; }).map(function (p) { return p.id; }); }
  function teamOf(t) {
    var ids = rows('ticket_collaborators').filter(function (c) { return String(c.ticket_id) === String(t.id); }).map(function (c) { return c.user_id; });
    if (t.assigned_to) ids.unshift(t.assigned_to);
    return ids.length ? ids : itIds();
  }
  function notify(userIds, t, title, message) {
    var seen = {};
    userIds.forEach(function (uid) {
      if (!uid || seen[uid] || uid === me.id) return; // chi compie l'azione non riceve la notifica
      seen[uid] = true;
      rows('notifications').push({
        id: nextId('notifications'), user_id: uid, ticket_id: t ? t.id : null,
        title: title, message: message, is_read: false, created_at: new Date().toISOString()
      });
    });
  }
  function label(t) { return (t.numero_ticket || tkt(t.id)) + ' · ' + (t.oggetto || ''); }

  function onInsert(table, r) {
    if (table === 'tickets') {
      notify(itIds(), r, 'Nuovo ticket', (r.richiedente_nome || r.richiedente_email || '') + ' · ' + (r.oggetto || ''));
      return;
    }
    var t = r.ticket_id ? ticketById(r.ticket_id) : null;
    if (!t) return;
    var requester = profileIdByEmail(t.richiedente_email);
    if (table === 'comments') {
      if (r.nota_interna) return notify(teamOf(t), t, 'Nota interna IT', label(t));
      var fromRequester = r.autore_email && t.richiedente_email && r.autore_email.toLowerCase() === t.richiedente_email.toLowerCase();
      notify(fromRequester ? teamOf(t) : [requester], t, 'Nuovo commento', label(t));
    } else if (table === 'appointments') {
      notify([requester], t, 'Proposta di appuntamento', label(t) + ' · ' + (r.modalita || ''));
    } else if (table === 'ticket_collaborators') {
      notify([r.user_id], t, 'Sei stato aggiunto come collaboratore', label(t));
    }
  }

  function onUpdate(table, before, r) {
    if (table === 'tickets') {
      var requester = profileIdByEmail(r.richiedente_email);
      if (r.assigned_to && r.assigned_to !== before.assigned_to) {
        notify([requester], r, 'Ticket preso in carico', label(r) + ' · ' + (r.assegnato_a || 'IT'));
        notify([r.assigned_to], r, 'Ticket assegnato a te', label(r));
      }
      if (r.stato && r.stato !== before.stato) {
        notify([requester], r, r.stato === 'CHIUSO' ? 'Ticket chiuso' : 'Stato aggiornato: ' + r.stato, label(r));
      }
    } else if (table === 'appointments' && r.status !== before.status && /CONFERMATO|RIFIUTATO/.test(r.status || '')) {
      var t = ticketById(r.ticket_id);
      if (t) notify([r.created_by].concat(teamOf(t)), t, 'Appuntamento ' + r.status.toLowerCase(), label(t));
    }
  }

  function touchTicket(ticketId, table) {
    if (!ticketId || table === 'tickets') return;
    var t = rows('tickets').find(function (x) { return x.id === ticketId; });
    if (t) t.updated_at = new Date().toISOString();
  }

  // ---------- API pubblica ----------
  async function api(path, opts) {
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    var body = opts.body ? clone(opts.body) : null;
    await new Promise(function (r) { setTimeout(r, 60); }); // latenza simulata

    if (path.indexOf('/auth/v1/user') === 0) return { id: me.id, email: me.email };
    if (path.indexOf('/auth/v1/') === 0) throw new Error('In modalità demo l\'accesso avviene dal Workspace.');

    if (path.indexOf('/functions/v1/') === 0) {
      var fn = path.slice('/functions/v1/'.length);
      if (fn.indexOf('telegram') === 0) return { ok: true, demo: true };
      throw new Error('Import non disponibile in modalità demo: nessun file viene caricato.');
    }

    var m = path.match(/^\/rest\/v1\/([^?]+)\??(.*)$/);
    if (!m) throw new Error('Percorso non gestito in demo: ' + path);
    if (m[1].indexOf('rpc/') === 0) return null;
    return clone(rest(method, m[1], m[2], body, opts.headers));
  }

  window.SDDemo = {
    start: function (account) {
      me = {
        id: account.id ? 'demo-' + account.id : 'demo-user',
        email: account.email || 'demo@demo.archea.it',
        nome: account.nome || 'Utente demo',
        ruolo: account.ruolo || 'USER'
      };
      db = loadDb();
      // Il profilo dell'utente demo segue sempre il ruolo scelto nel Workspace.
      var p = rows('profiles').find(function (x) { return x.email === me.email; });
      if (p) { p.ruolo = me.ruolo; p.nome = me.nome; me.id = p.id; }
      else rows('profiles').unshift({ id: me.id, nome: me.nome, email: me.email, ruolo: me.ruolo });
      // Database condiviso tra gli account demo: un ticket aperto da un architetto
      // si vede poi entrando come Reparto IT. Ogni nuovo account riceve un esempio.
      if (!rows('tickets').some(function (t) { return t.richiedente_email === me.email; })) {
        var id = nextId('tickets');
        rows('tickets').push({
          id: id, numero_ticket: tkt(id), categoria: 'Accessi', oggetto: 'Reset password VPN',
          descrizione: 'La VPN non accetta più la password dopo il cambio.', stato: 'CHIUSO', priorita: 'NORMALE',
          richiedente_nome: me.nome, richiedente_email: me.email, created_by: me.id, created_by_name: me.nome,
          origine: 'Portale', sede: 'FIRENZE', assigned_to: 'demo-it-2', assegnato_a: 'Davide Conti',
          outcome: 'RISOLTO', resolution_note: 'Password reimpostata.', closed_at: iso(2, 15),
          created_at: iso(3, 10), updated_at: iso(2, 15)
        });
        rows('notifications').push({ id: nextId('notifications'), user_id: me.id, ticket_id: id, title: 'Ticket chiuso', message: 'Reset password VPN · risolto', is_read: false, created_at: iso(2, 15) });
      }
      persist();
      return { access_token: 'demo', user: { id: me.id, email: me.email } };
    },
    api: api,
    reset: function () { try { localStorage.removeItem(DB_KEY); } catch (e) {} }
  };
})();
