/*
 * Service Desk V9.7 · Planimetrie
 * - USO: piante con chi siede dove e quali dispositivi ci sono; assegni/sposti persone,
 *   sposti i dispositivi da una WRKA all'altra (con storico).
 * - MODIFICA: editor per disegnare muri, stanze, porte, finestre, scrivanie, postazioni,
 *   WRKA, TV/monitor e accessori delle sale meeting. Le postazioni si collegano a
 *   map_positions tramite il codice (es. CAP-T01).
 * LIVE: richiede supabase/migrations/20261106_planimetrie.sql.
 */

const PL_TYPES = {
  seat:       { label: 'Postazione persona', group: 'Postazioni', size: u => [u, u * 0.72], code: true },
  wrka:       { label: 'WRKA / dispositivi', group: 'Postazioni', size: u => [u * 0.8, u * 0.62], code: true },
  wall:       { label: 'Muro', group: 'Struttura', line: true },
  room:       { label: 'Stanza / zona', group: 'Struttura', size: u => [u * 5, u * 3.5], text: true },
  door:       { label: 'Porta', group: 'Struttura', size: u => [u * 0.9, u * 0.9] },
  window:     { label: 'Finestra', group: 'Struttura', size: u => [u * 1.6, u * 0.14] },
  desk:       { label: 'Scrivania', group: 'Arredi', size: u => [u * 1.6, u * 0.8] },
  meeting:    { label: 'Tavolo riunioni', group: 'Arredi', size: u => [u * 3.2, u * 1.4], text: true },
  roundtable: { label: 'Tavolo rotondo', group: 'Arredi', size: u => [u * 1.4, u * 1.4] },
  chair:      { label: 'Sedia', group: 'Arredi', size: u => [u * 0.4, u * 0.4] },
  sofa:       { label: 'Divano', group: 'Arredi', size: u => [u * 2, u * 0.8] },
  cabinet:    { label: 'Armadio / mobile', group: 'Arredi', size: u => [u * 1.2, u * 0.5], text: true },
  tv:         { label: 'TV / schermo', group: 'Sala meeting', size: u => [u * 1.4, u * 0.18] },
  monitor:    { label: 'Monitor', group: 'Sala meeting', size: u => [u * 0.6, u * 0.14] },
  projector:  { label: 'Proiettore', group: 'Sala meeting', size: u => [u * 0.5, u * 0.4] },
  camera:     { label: 'Videocamera', group: 'Sala meeting', size: u => [u * 0.45, u * 0.3] },
  speaker:    { label: 'Speaker / microfono', group: 'Sala meeting', size: u => [u * 0.35, u * 0.35] },
  whiteboard: { label: 'Lavagna', group: 'Sala meeting', size: u => [u * 1.6, u * 0.12] },
  printer:    { label: 'Stampante / plotter', group: 'Altro', size: u => [u * 0.9, u * 0.7] },
  rack:       { label: 'Rack / server', group: 'Altro', size: u => [u * 0.8, u * 0.8] },
  wifi:       { label: 'Access point Wi-Fi', group: 'Altro', size: u => [u * 0.35, u * 0.35] },
  plant:      { label: 'Pianta', group: 'Altro', size: u => [u * 0.45, u * 0.45] },
  label:      { label: 'Scritta', group: 'Altro', size: u => [u * 2.4, u * 0.5], text: true }
};
const PL_Z = { room: 0, window: 1, door: 1, wall: 2, desk: 3, meeting: 3, roundtable: 3, sofa: 3, cabinet: 3, chair: 4, whiteboard: 4, tv: 5, monitor: 5, projector: 5, camera: 5, speaker: 5, printer: 5, rack: 5, wifi: 5, plant: 5, seat: 6, wrka: 7, label: 8 };

let pl = {
  plans: [], plan: null, mode: 'uso', zoom: 1, sel: null, tool: null, undo: [], dirty: false,
  positions: [], people: [], assets: [], moving: null, search: '', showBg: true, bgOpacity: .35, showGrid: true
};

function plCanEdit() { return isITRole() || (typeof hasPerm === 'function' && hasPerm('gestione_mappe')); }
function plUnit(p = pl.plan) { return Math.max(40, Math.min(p.width, p.height) / 14); }
function plSnap(v) { const g = +pl.plan.griglia || 10; return Math.round(v / g) * g; }
function plUid() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function plName(p) { return p.display_name || [p.first_name, p.surname].filter(Boolean).join(' ') || 'Persona'; }
function plSlug(s) { return String(s || '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60); }

// ---------- collegamento a postazioni, persone, dispositivi ----------
function plPos(code) {
  if (!code) return null;
  const c = String(code).toUpperCase();
  const site = String(pl.plan?.sede || '').toUpperCase();
  const same = pl.positions.filter(p => String(p.position_code).toUpperCase() === c);
  return same.find(p => String(p.site).toUpperCase() === site) || same[0] || null;
}
function plOccupant(code) {
  const pos = plPos(code);
  return pos ? pl.people.find(p => p.current_status !== 'USCITO' && String(p.map_position_id) === String(pos.id)) : null;
}
function plDevices(code) {
  const pos = plPos(code);
  const c = String(code || '').toUpperCase();
  return pl.assets.filter(a => !a.is_label_only && !['DISMESSO', 'VENDUTO'].includes(a.status) &&
    ((pos && String(a.map_position_id) === String(pos.id)) || (String(a.position || '').toUpperCase() === c)));
}

// ---------- disegno SVG ----------
function plElSvg(e, opts) {
  const T = PL_TYPES[e.t] || {};
  const sel = opts.edit && pl.sel === e.id ? ' sel' : '';
  if (e.t === 'wall') {
    const th = e.th || plUnit() * 0.14;
    return `<g class="pl-el pl-wall${sel}" data-el="${e.id}"><line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke-width="${th}" stroke-linecap="square"/>${sel ? `<circle class="pl-h" data-h="p1" cx="${e.x1}" cy="${e.y1}" r="${th * .9 + 4}"/><circle class="pl-h" data-h="p2" cx="${e.x2}" cy="${e.y2}" r="${th * .9 + 4}"/>` : ''}</g>`;
  }
  const { x, y, w, h } = e, cx = x + w / 2, cy = y + h / 2, r = e.r || 0;
  const fs = Math.max(6, Math.min(h * .42, w * .22));
  const txt = (t, size = fs, cls = '') => `<text x="${cx}" y="${cy + size * .35}" font-size="${size}" text-anchor="middle" class="${cls}">${esc(t)}</text>`;
  let inner = '';
  switch (e.t) {
    case 'room':
      inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-room"/>${e.label ? `<text x="${x + 10}" y="${y + Math.max(12, Math.min(h * .08, 40))}" font-size="${Math.max(10, Math.min(h * .07, 34))}" class="pl-room-label">${esc(e.label)}</text>` : ''}`; break;
    case 'door':
      inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-hit"/><path d="M${x} ${y + h} L${x} ${y} A${w} ${h} 0 0 1 ${x + w} ${y + h}" class="pl-door"/><line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" class="pl-door-gap"/>`; break;
    case 'window': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-window"/>`; break;
    case 'desk': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) * .08}" class="pl-desk"/>`; break;
    case 'meeting': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) * .45}" class="pl-desk"/>${e.label ? txt(e.label, Math.min(fs, 22), 'pl-dim') : ''}`; break;
    case 'roundtable': inner = `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" class="pl-desk"/>`; break;
    case 'chair': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) * .3}" class="pl-chair"/>`; break;
    case 'sofa': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * .3}" class="pl-sofa"/>`; break;
    case 'cabinet': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-cab"/>${e.label ? txt(e.label, Math.min(fs, 16), 'pl-dim') : ''}`; break;
    case 'tv': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="pl-av"/>${w > 40 ? `<text x="${cx}" y="${y - 4}" font-size="${Math.max(8, Math.min(w * .12, 16))}" text-anchor="middle" class="pl-dim">${esc(e.label || 'TV')}</text>` : ''}`; break;
    case 'monitor': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="pl-av"/>`; break;
    case 'whiteboard': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-board"/>`; break;
    case 'projector': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="pl-av"/><circle cx="${x + w * .7}" cy="${cy}" r="${Math.min(w, h) * .25}" class="pl-lens"/>`; break;
    case 'camera': inner = `<rect x="${x}" y="${y}" width="${w * .7}" height="${h}" rx="3" class="pl-av"/><path d="M${x + w * .7} ${cy} L${x + w} ${y} L${x + w} ${y + h} Z" class="pl-av"/>`; break;
    case 'speaker': inner = `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) / 2}" class="pl-av"/><circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) / 5}" class="pl-lens"/>`; break;
    case 'printer': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="pl-dev"/>${txt('STAMP.', Math.min(fs, 14), 'pl-dev-t')}`; break;
    case 'rack': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="pl-av"/>${txt('RACK', Math.min(fs, 14), 'pl-av-t')}`; break;
    case 'wifi': inner = `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) / 2}" class="pl-wifi"/>${txt('Wi-Fi', Math.min(w, h) * .28, 'pl-av-t')}`; break;
    case 'plant': inner = `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) / 2}" class="pl-plant"/>`; break;
    case 'label': inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-hit"/>${txt(e.label || 'Scritta', h * .62, 'pl-label')}`; break;
    case 'seat': {
      const occ = opts.edit ? null : plOccupant(e.code);
      const found = pl.search && occ && normSearch(plName(occ)).includes(normSearch(pl.search));
      const nm = occ ? plName(occ) : (opts.edit ? 'POSTAZIONE' : 'Libera');
      const short = nm.length > 12 && w < 160 ? nm.split(/\s+/)[0] + ' ' + (nm.split(/\s+/)[1] || '').slice(0, 1) + '.' : nm;
      inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) * .16}" class="pl-seat${occ ? ' occ' : ''}${found ? ' found' : ''}${pl.moving && !opts.edit ? ' target' : ''}"/>
        <text x="${x + w * .08}" y="${y + h * .3}" font-size="${Math.max(6, Math.min(h * .21, w * .14))}" class="pl-code">${esc(e.code || '—')}</text>
        <text x="${x + w * .08}" y="${y + h * .72}" font-size="${Math.max(7, Math.min(h * .32, w * 1.6 / Math.max(6, short.length)))}" class="pl-name">${esc(short)}</text>`;
      break;
    }
    case 'wrka': {
      const n = opts.edit ? 0 : plDevices(e.code).length;
      inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) * .2}" class="pl-wrka${pl.moving && !opts.edit ? ' target' : ''}"/>
        <text x="${cx}" y="${cy + (n ? -h * .02 : h * .12)}" font-size="${Math.max(6, Math.min(h * .32, w * .22))}" text-anchor="middle" class="pl-wrka-t">WRKA</text>
        ${n ? `<text x="${cx}" y="${cy + h * .3}" font-size="${Math.max(5, h * .22)}" text-anchor="middle" class="pl-wrka-n">${n} disp.</text>` : ''}`;
      break;
    }
    default: inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-desk"/>`;
  }
  const handle = sel ? `<rect class="pl-h" data-h="br" x="${x + w - 7}" y="${y + h - 7}" width="14" height="14"/>` : '';
  return `<g class="pl-el pl-${e.t}${sel}" data-el="${e.id}"${r ? ` transform="rotate(${r} ${cx} ${cy})"` : ''}>${inner}${sel ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-sel-box"/>` : ''}${handle}</g>`;
}

function plSvg(opts) {
  const p = pl.plan;
  const els = [...p.elements].sort((a, b) => (PL_Z[a.t] ?? 5) - (PL_Z[b.t] ?? 5));
  const g = +p.griglia || 10;
  return `<svg id="plSvg" class="pl-svg${opts.edit ? ' editing' : ''}${pl.tool ? ' placing' : ''}" viewBox="0 0 ${p.width} ${p.height}" style="width:${Math.round(pl.zoom * 100)}%" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="plGrid" width="${g * 5}" height="${g * 5}" patternUnits="userSpaceOnUse"><path d="M ${g * 5} 0 L 0 0 0 ${g * 5}" fill="none" stroke="#e3e6e3" stroke-width="1"/></pattern></defs>
    <rect width="${p.width}" height="${p.height}" fill="#fbfbf9"/>
    ${p.sfondo && pl.showBg ? `<image href="${esc(p.sfondo)}" x="0" y="0" width="${p.width}" height="${p.height}" opacity="${opts.edit ? pl.bgOpacity : Math.min(.7, pl.bgOpacity + .25)}" preserveAspectRatio="xMinYMin meet"/>` : ''}
    ${opts.edit && pl.showGrid ? `<rect width="${p.width}" height="${p.height}" fill="url(#plGrid)" pointer-events="none"/>` : ''}
    ${els.map(e => plElSvg(e, opts)).join('')}
  </svg>`;
}

// ---------- caricamento ----------
async function plLoadData() {
  const [plans, positions, people, assets] = await Promise.all([
    select('floor_plans', 'select=*&order=sede.asc,ordine.asc,nome.asc'),
    select('map_positions', 'select=*&is_active=eq.true').catch(() => []),
    select('people', 'select=id,display_name,first_name,surname,site,department,current_status,map_position_id&order=display_name.asc').catch(() => []),
    select('assets', 'select=id,asset_code,category,brand,model,status,site,position,map_position_id,assigned_person_id,assigned_user_name,is_label_only&is_label_only=eq.false&limit=5000').catch(() => [])
  ]);
  pl.plans = plans || []; pl.positions = positions || []; pl.people = people || []; pl.assets = assets || [];
}

async function planimetrieView() {
  const epoch = navigationEpoch;
  if (!isITRole() && !isHR()) return start();
  page('Planimetrie', 'Chi siede dove, dispositivi e spostamenti');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try { await plLoadData(); } catch (err) {
    if (epoch !== navigationEpoch) return;
    $('content').innerHTML = `<div class="panel"><h3>Planimetrie non ancora attivate</h3><p>Esegui di nuovo <code>supabase/SETUP_COMPLETO.sql</code> nel SQL Editor di Supabase: ora contiene anche le planimetrie.</p><p class="muted-line">Dettaglio: ${esc(err.message)}</p></div>`;
    return;
  }
  if (epoch !== navigationEpoch) return;
  pl.mode = 'uso'; pl.sel = null; pl.tool = null; pl.moving = null;
  // sul telefono la pianta parte ingrandita: nomi leggibili, si scorre col dito
  if (!pl.zoomSet) { pl.zoom = window.matchMedia('(max-width: 700px)').matches ? 2.4 : 1; pl.zoomSet = true; }
  if (!pl.plans.length) return plEmpty();
  const keep = pl.plan && pl.plans.find(p => p.id === pl.plan.id);
  pl.plan = structuredClone(keep || pl.plans[0]);
  plRender();
}

function plEmpty() {
  $('content').innerHTML = `<div class="panel pl-empty"><h3>Nessuna planimetria</h3>
    <p>Puoi partire dalle 18 piante già preparate (Firenze, Genova, Milano, Roma, Parigi, Shanghai) e rifinirle con l'editor, oppure disegnarne una nuova da zero.</p>
    ${plCanEdit() ? `<div class="button-row"><button class="primary" id="plImportAll">Importa le 18 piante</button><button class="secondary" id="plNewBlank">Nuova pianta vuota</button></div>` : '<p class="muted-line">Chiedi al reparto IT di crearle.</p>'}</div>`;
  if ($('plImportAll')) $('plImportAll').onclick = plImportAll;
  if ($('plNewBlank')) $('plNewBlank').onclick = () => plNewPlan(null);
}

async function plTemplates() {
  const r = await fetch('planimetrie/modelli.json');
  if (!r.ok) throw new Error('Modelli non disponibili');
  return r.json();
}
async function plImportAll() {
  try {
    const list = await plTemplates();
    const existing = new Set(pl.plans.map(p => p.id));
    const rows = list.filter(t => !existing.has(t.id)).map((t, i) => ({ ...t, ordine: i, updated_by_nome: profile?.nome || user.email }));
    if (rows.length) await insert('floor_plans', rows, false);
    await plEnsurePositions(rows);
    toast(`${rows.length} piante importate`);
    planimetrieView();
  } catch (err) { toast(err.message); }
}

// crea in map_positions le postazioni che mancano (stesso codice della pianta)
async function plEnsurePositions(plans) {
  const fresh = await select('map_positions', 'select=id,site,position_code&is_active=eq.true').catch(() => pl.positions);
  const have = new Set(fresh.map(p => `${String(p.site).toUpperCase()}|${String(p.position_code).toUpperCase()}`));
  const rows = [];
  for (const p of plans) {
    for (const e of p.elements.filter(e => e.t === 'seat' && e.code)) {
      const key = `${String(p.sede).toUpperCase()}|${String(e.code).toUpperCase()}`;
      if (have.has(key)) continue;
      have.add(key);
      rows.push({ site: String(p.sede).toUpperCase(), position_type: 'POSTAZIONE', zone_code: p.nome, position_code: String(e.code).toUpperCase(), label: p.nome, created_by: user.id, created_by_name: profile?.nome || user.email });
    }
  }
  for (let i = 0; i < rows.length; i += 200) await insert('map_positions', rows.slice(i, i + 200), false);
  return rows.length;
}

// ---------- vista ----------
function plRender() {
  const p = pl.plan, edit = pl.mode === 'modifica';
  const sedi = [...new Set(pl.plans.map(x => x.sede))];
  const seats = p.elements.filter(e => e.t === 'seat');
  const occ = edit ? 0 : seats.filter(s => plOccupant(s.code)).length;
  $('content').innerHTML = `
    <div class="pl-top">
      <label class="pl-plan-pick">Pianta<select id="plPick">${sedi.map(s => `<optgroup label="${esc(s)}">${pl.plans.filter(x => x.sede === s).map(x => `<option value="${esc(x.id)}" ${x.id === p.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      ${edit ? '' : `<input id="plSearch" placeholder="Trova una persona…" value="${esc(pl.search)}">`}
      <div class="pl-zoom"><button class="secondary compact" id="plZoomOut" aria-label="Riduci">−</button><span>${Math.round(pl.zoom * 100)}%</span><button class="secondary compact" id="plZoomIn" aria-label="Ingrandisci">+</button></div>
      ${p.sfondo ? `<label class="pl-check"><input type="checkbox" id="plBg" ${pl.showBg ? 'checked' : ''}> Sfondo originale</label>` : ''}
      <div class="pl-top-actions">
        ${edit ? `<button class="secondary" id="plSettings">Impostazioni pianta</button><button class="secondary" id="plCancelEdit">Esci senza salvare</button><button class="primary" id="plSave">${pl.dirty ? 'Salva modifiche •' : 'Salva'}</button>`
          : (plCanEdit() ? `<button class="secondary" id="plNew">+ Nuova pianta</button><button class="primary" id="plEdit">Modifica pianta</button>` : '')}
      </div>
    </div>
    ${pl.moving ? `<div class="pl-banner">Sposta <b>${esc(pl.moving.asset_code)}</b>: tocca la postazione o la WRKA di destinazione. <button class="secondary compact" id="plMoveCancel">Annulla</button></div>` : ''}
    ${edit ? `<p class="pl-hint">${plHintText()}</p>` : `<p class="muted-line pl-stats">${esc(p.sede)} · ${occ} occupate su ${seats.length} postazioni<span class="pl-stats-hint"> · tocca una postazione per assegnare una persona, una WRKA per i dispositivi.</span></p>`}
    <div class="pl-body${edit ? ' edit' : ''}">
      ${edit ? plToolbarHtml() : ''}
      <div class="pl-canvas" id="plCanvas">${plSvg({ edit })}</div>
      <aside class="pl-side" id="plSide">${edit ? plPropsHtml() : '<p class="muted-line">Seleziona una postazione o una WRKA.</p>'}</aside>
    </div>`;
  plWire();
}

function plToolbarHtml() {
  const groups = {};
  Object.entries(PL_TYPES).forEach(([k, v]) => { (groups[v.group] = groups[v.group] || []).push([k, v]); });
  return `<div class="pl-tools">
    <button class="pl-tool${!pl.tool ? ' on' : ''}" data-tool="">↖ Seleziona</button>
    ${Object.entries(groups).map(([g, items]) => `<div class="pl-tool-group"><small>${esc(g)}</small>${items.map(([k, v]) => `<button class="pl-tool${pl.tool === k ? ' on' : ''}" data-tool="${k}" title="${esc(v.label)}">${esc(v.label)}</button>`).join('')}</div>`).join('')}
    <div class="pl-tool-group"><small>Azioni</small>
      <button class="pl-tool" id="plRot" ${pl.sel ? '' : 'disabled'}>Ruota 90°</button>
      <button class="pl-tool" id="plDup" ${pl.sel ? '' : 'disabled'}>Duplica</button>
      <button class="pl-tool" id="plDel" ${pl.sel ? '' : 'disabled'}>Elimina</button>
      <button class="pl-tool" id="plUndo" ${pl.undo.length ? '' : 'disabled'}>Annulla</button>
      <label class="pl-check"><input type="checkbox" id="plGridOn" ${pl.showGrid ? 'checked' : ''}> Griglia</label>
    </div>
  </div>`;
}
function plHintText() {
  return pl.tool === 'wall' ? 'Muro: premi e trascina da un punto all\'altro. Resta dritto da solo; tieni premuto Alt per un muro obliquo.'
    : pl.tool ? `Tocca la pianta per mettere: ${esc(PL_TYPES[pl.tool].label)}. Resta attivo per metterne altri; "Seleziona" per smettere.`
    : 'Trascina per spostare, il quadratino blu in basso a destra per ridimensionare. Tasti: Canc elimina, Ctrl+Z annulla, Ctrl+D duplica, R ruota, frecce per spostare.';
}

function plPropsHtml() {
  const e = pl.plan.elements.find(x => x.id === pl.sel);
  if (!e) return `<h4>Pianta: ${esc(pl.plan.nome)}</h4><p class="muted-line">Scegli un elemento dalla barra e tocca la pianta, oppure seleziona un elemento per cambiarne le proprietà.</p>
    <p class="muted-line">${pl.plan.elements.filter(x => x.t === 'seat').length} postazioni · ${pl.plan.elements.filter(x => x.t === 'wrka').length} WRKA · ${pl.plan.elements.length} elementi</p>
    <button class="secondary compact" id="plAutoCodes">Numera le postazioni senza codice</button>`;
  const T = PL_TYPES[e.t];
  return `<h4>${esc(T.label)}</h4>
    <div class="pl-props">
      ${T.code ? `<label>Codice postazione<input id="ppCode" value="${esc(e.code || '')}" placeholder="${esc(pl.plan.prefisso || '')}01"></label><p class="muted-line">Persone e dispositivi si collegano tramite questo codice. Postazione e WRKA della stessa scrivania hanno lo stesso codice.</p>` : ''}
      ${T.text || ['tv'].includes(e.t) ? `<label>Testo<input id="ppLabel" value="${esc(e.label || '')}"></label>` : ''}
      ${T.line ? `<label>Spessore<input id="ppTh" type="number" min="2" value="${Math.round(e.th || plUnit() * .14)}"></label>` : `
        <label>Larghezza<input id="ppW" type="number" min="4" value="${Math.round(e.w)}"></label>
        <label>Altezza<input id="ppH" type="number" min="2" value="${Math.round(e.h)}"></label>
        <label>Rotazione°<input id="ppR" type="number" step="15" value="${Math.round(e.r || 0)}"></label>`}
    </div>`;
}

function plWire() {
  const edit = pl.mode === 'modifica';
  $('plPick').onchange = () => {
    if (edit && pl.dirty) { toast('Salva o esci dalla modifica prima di cambiare pianta'); $('plPick').value = pl.plan.id; return; }
    pl.plan = structuredClone(pl.plans.find(x => x.id === $('plPick').value)); pl.sel = null; pl.undo = []; plRender();
  };
  $('plZoomIn').onclick = () => { pl.zoom = Math.min(4, pl.zoom * 1.25); plRender(); };
  $('plZoomOut').onclick = () => { pl.zoom = Math.max(.4, pl.zoom / 1.25); plRender(); };
  if ($('plBg')) $('plBg').onchange = e => { pl.showBg = e.target.checked; plRender(); };
  if ($('plSearch')) $('plSearch').oninput = e => {
    pl.search = e.target.value; const pos = e.target.selectionStart; plRender();
    const s = $('plSearch'); s.focus(); s.setSelectionRange(pos, pos);
    const hit = document.querySelector('.pl-seat.found'); if (hit) hit.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  };
  if ($('plMoveCancel')) $('plMoveCancel').onclick = () => { pl.moving = null; plRender(); };
  if ($('plEdit')) $('plEdit').onclick = () => { pl.mode = 'modifica'; pl.sel = null; pl.tool = null; pl.undo = []; pl.dirty = false; plRender(); };
  if ($('plNew')) $('plNew').onclick = () => plNewPlan(null);
  if (edit) plWireEditor(); else plWireUse();
}

// ---------- uso: persone e dispositivi ----------
function plWireUse() {
  document.querySelectorAll('#plSvg .pl-el').forEach(g => g.onclick = () => {
    const e = pl.plan.elements.find(x => x.id === g.dataset.el);
    if (!e || !['seat', 'wrka'].includes(e.t)) return;
    if (pl.moving) return plMoveTo(e);
    e.t === 'seat' ? plSeatPanel(e) : plWrkaPanel(e);
  });
}

function plSeatPanel(e) {
  const pos = plPos(e.code), occ = plOccupant(e.code);
  const site = String(pl.plan.sede).toUpperCase();
  const people = pl.people.filter(p => p.current_status !== 'USCITO').sort((a, b) => (String(a.site).toUpperCase() === site ? -1 : 0) - (String(b.site).toUpperCase() === site ? -1 : 0) || plName(a).localeCompare(plName(b), 'it'));
  const devs = plDevices(e.code);
  $('plSide').innerHTML = `
    <span class="badge">${esc(pl.plan.sede)} · ${esc(pl.plan.nome)}</span>
    <h3>${esc(e.code || 'Postazione senza codice')}</h3>
    ${!pos ? `<p class="ag-busy">Questa postazione non esiste ancora nell'elenco postazioni.</p>${plCanEdit() ? '<button class="secondary" id="plCreatePos">Crea la postazione</button>' : ''}` : `
      <p class="pl-occ">${occ ? `<b>${esc(plName(occ))}</b><br><small>${esc([occ.department, occ.site].filter(Boolean).join(' · '))}</small>` : 'Postazione libera'}</p>
      <label>${occ ? 'Metti qui un\'altra persona' : 'Assegna una persona'}<select id="plPerson"><option value="">Scegli…</option>${people.map(p => `<option value="${esc(p.id)}">${esc(plName(p))}${p.map_position_id ? ' · ha già un posto' : ''}${String(p.site).toUpperCase() !== site && p.site ? ' · ' + esc(p.site) : ''}</option>`).join('')}</select></label>
      <div class="button-row"><button class="primary" id="plAssign">Assegna</button>${occ ? '<button class="secondary" id="plFree">Libera postazione</button>' : ''}</div>
      <p class="muted-line">Chi ha già un posto viene spostato qui; l'occupante attuale resta senza postazione. Ogni cambio finisce nello storico della persona.</p>`}
    <h4>Dispositivi qui (${devs.length})</h4>${plDevList(devs)}`;
  if ($('plCreatePos')) $('plCreatePos').onclick = async () => { await plEnsurePositions([pl.plan]); await plLoadData(); pl.plan = structuredClone(pl.plans.find(x => x.id === pl.plan.id)); plRender(); plSeatPanel(e); };
  if ($('plAssign')) $('plAssign').onclick = async () => {
    const pid = $('plPerson').value; if (!pid) return toast('Scegli una persona');
    try {
      if (occ && String(occ.id) !== pid) await plSetSeat(occ, null);
      await plSetSeat(pl.people.find(p => String(p.id) === pid), pos);
      toast('Postazione assegnata'); await plLoadData(); plRender();
    } catch (err) { toast(err.message); }
  };
  if ($('plFree')) $('plFree').onclick = async () => { try { await plSetSeat(occ, null); toast('Postazione liberata'); await plLoadData(); plRender(); } catch (err) { toast(err.message); } };
  plWireDevButtons();
}

async function plSetSeat(person, pos) {
  if (!person) return;
  await update('people', `id=eq.${person.id}`, { map_position_id: pos ? pos.id : null, updated_at: new Date().toISOString() });
  try {
    await insert('person_events', {
      person_id: person.id, event_type: 'POSIZIONE_MAPPA', event_date: new Date().toISOString().slice(0, 10), source_type: 'PORTALE',
      note: pos ? `Postazione assegnata da planimetria: ${pos.position_code} (${pl.plan.nome})` : 'Postazione liberata da planimetria',
      new_data: { map_position_id: pos ? pos.id : null, position_code: pos ? pos.position_code : null },
      created_by: user.id, created_by_name: profile?.nome || user.email
    }, false);
  } catch (e) { console.warn('Storico persona non salvato:', e.message); }
}

function plDevList(devs) {
  return devs.length ? devs.map(a => `<div class="pl-dev-row"><b>${esc(a.asset_code)}</b> <small>${esc([a.category, a.brand, a.model].filter(Boolean).join(' · '))}</small><br><small>${esc(a.status || '')}${a.assigned_user_name ? ' · ' + esc(a.assigned_user_name) : ''}</small>${isITRole() ? `<button class="secondary compact" data-move="${esc(a.id)}">Sposta</button>` : ''}</div>`).join('') : '<p class="muted-line">Nessun dispositivo collegato.</p>';
}
function plWireDevButtons() {
  document.querySelectorAll('[data-move]').forEach(b => b.onclick = () => {
    pl.moving = pl.assets.find(a => String(a.id) === b.dataset.move);
    plRender();
    $('plSide').innerHTML = `<h3>Sposta ${esc(pl.moving.asset_code)}</h3><p>Tocca sulla pianta la postazione o la WRKA di destinazione. Puoi anche cambiare pianta dal menu in alto.</p>`;
  });
}
function plWrkaPanel(e) {
  const devs = plDevices(e.code);
  $('plSide').innerHTML = `<span class="badge">WRKA · ${esc(pl.plan.nome)}</span><h3>${esc(e.code || 'WRKA senza codice')}</h3>
    <p class="muted-line">${plOccupant(e.code) ? 'Postazione di ' + esc(plName(plOccupant(e.code))) : 'Nessuna persona su questa postazione'}</p>
    <h4>Dispositivi (${devs.length})</h4>${plDevList(devs)}
    ${isITRole() ? `<label>Porta qui un dispositivo<input id="plFindDev" placeholder="Codice, modello…"></label><div id="plFindRes"></div>` : ''}`;
  plWireDevButtons();
  if ($('plFindDev')) $('plFindDev').oninput = ev => {
    const q = normSearch(ev.target.value);
    const res = q ? pl.assets.filter(a => normSearch([a.asset_code, a.category, a.brand, a.model, a.assigned_user_name].join(' ')).includes(q)).slice(0, 12) : [];
    $('plFindRes').innerHTML = res.map(a => `<div class="pl-dev-row"><b>${esc(a.asset_code)}</b> <small>${esc([a.category, a.model].filter(Boolean).join(' · '))} · ${esc(a.position || 'senza posizione')}</small><button class="secondary compact" data-here="${esc(a.id)}">Porta qui</button></div>`).join('');
    document.querySelectorAll('[data-here]').forEach(b => b.onclick = () => { pl.moving = pl.assets.find(a => String(a.id) === b.dataset.here); plMoveTo(e); });
  };
}

async function plMoveTo(target) {
  const a = pl.moving; if (!a) return;
  const pos = plPos(target.code);
  if (!pos) { toast('La destinazione non è ancora una postazione: creala prima'); return; }
  const next = { map_position_id: pos.id, position: pos.position_code, site: pos.site };
  const changed = Object.keys(next).filter(k => String(a[k] ?? '') !== String(next[k] ?? ''));
  if (!changed.length) { toast('Il dispositivo è già lì'); pl.moving = null; plRender(); return; }
  try {
    await update('assets', `id=eq.${a.id}`, { ...next, updated_at: new Date().toISOString() });
    for (const k of changed) {
      try {
        await insert('asset_history', { asset_id: a.id, event_type: 'MOVIMENTO_ASSET', field_name: k, old_value: a[k] == null ? null : String(a[k]), new_value: String(next[k]), changed_by: profile?.nome || user.email, changed_by_id: user.id }, false);
      } catch (e) { console.warn('Storico asset non salvato:', e.message); }
    }
    toast(`${a.asset_code} spostato in ${pos.position_code}`);
    pl.moving = null; await plLoadData(); plRender(); plWrkaPanel(target);
  } catch (err) { toast(err.message); }
}

// ---------- editor ----------
function plPush() { pl.undo.push(JSON.stringify(pl.plan.elements)); if (pl.undo.length > 60) pl.undo.shift(); pl.dirty = true; }
function plPoint(ev) {
  const svg = $('plSvg'); const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function plNextCode() {
  const pre = pl.plan.prefisso || '';
  const used = new Set(pl.plan.elements.filter(e => e.code).map(e => e.code));
  for (let i = 1; i < 2000; i++) { const c = pre + String(i).padStart(2, '0'); if (!used.has(c)) return c; }
  return pre + Date.now();
}
function plRefreshCanvas() {
  $('plCanvas').innerHTML = plSvg({ edit: true });
  $('plSide').innerHTML = plPropsHtml();
  const save = $('plSave'); if (save) save.textContent = pl.dirty ? 'Salva modifiche •' : 'Salva';
  ['plRot', 'plDup', 'plDel'].forEach(id => { if ($(id)) $(id).disabled = !pl.sel; });
  if ($('plUndo')) $('plUndo').disabled = !pl.undo.length;
  plWireCanvas(); plWireProps();
}

function plWireEditor() {
  document.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { pl.tool = b.dataset.tool || null; pl.sel = null; plRender(); });
  $('plRot').onclick = () => plRotate();
  $('plDup').onclick = () => plDuplicate();
  $('plDel').onclick = () => plDelete();
  $('plUndo').onclick = () => plUndoNow();
  $('plGridOn').onchange = e => { pl.showGrid = e.target.checked; plRefreshCanvas(); };
  $('plCancelEdit').onclick = () => { pl.mode = 'uso'; pl.plan = structuredClone(pl.plans.find(x => x.id === pl.plan.id) || pl.plan); pl.dirty = false; plRender(); };
  $('plSave').onclick = plSavePlan;
  $('plSettings').onclick = () => plNewPlan(pl.plan);
  plWireCanvas(); plWireProps();
}

function plWireProps() {
  const e = pl.plan.elements.find(x => x.id === pl.sel);
  if ($('plAutoCodes')) $('plAutoCodes').onclick = () => {
    plPush();
    pl.plan.elements.filter(x => x.t === 'seat' && !x.code).forEach(x => { x.code = plNextCode(); });
    plRefreshCanvas(); toast('Postazioni numerate');
  };
  if (!e) return;
  const bind = (id, fn) => { if ($(id)) $(id).onchange = ev => { plPush(); fn(ev.target.value); plRefreshCanvas(); }; };
  bind('ppCode', v => { e.code = v.trim().toUpperCase(); });
  bind('ppLabel', v => { e.label = v; });
  bind('ppW', v => { e.w = Math.max(4, +v || e.w); });
  bind('ppH', v => { e.h = Math.max(2, +v || e.h); });
  bind('ppR', v => { e.r = ((+v || 0) % 360 + 360) % 360; });
  bind('ppTh', v => { e.th = Math.max(2, +v || e.th); });
}

// il trascinamento vive fuori dall'SVG, che viene ridisegnato durante la modifica
let plDrag = null;
function plWireCanvas() {
  const svg = $('plSvg');
  svg.onpointerdown = ev => {
    let drag = null;
    if (ev.button !== 0) return;
    const p = plPoint(ev);
    const hEl = ev.target.closest('.pl-h');
    const gEl = ev.target.closest('.pl-el');
    if (pl.tool) {
      plPush();
      if (pl.tool === 'wall') {
        const x = plSnap(p.x), y = plSnap(p.y);
        const w = { id: plUid(), t: 'wall', x1: x, y1: y, x2: x, y2: y, th: Math.round(plUnit() * .14) };
        pl.plan.elements.push(w); pl.sel = w.id;
        drag = { kind: 'p2', el: w, start: p };
      } else {
        const [w, h] = PL_TYPES[pl.tool].size(plUnit());
        const e = { id: plUid(), t: pl.tool, x: plSnap(p.x - w / 2), y: plSnap(p.y - h / 2), w: Math.round(w), h: Math.round(h), r: 0 };
        if (PL_TYPES[pl.tool].code) {
          // la WRKA eredita il codice della postazione più vicina
          if (pl.tool === 'wrka') {
            const near = pl.plan.elements.filter(x => x.t === 'seat').sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
            e.code = near && Math.hypot(near.x - e.x, near.y - e.y) < plUnit() * 2.5 ? near.code : plNextCode();
          } else e.code = plNextCode();
        }
        if (pl.tool === 'room') e.label = 'Nuova stanza';
        if (pl.tool === 'meeting') e.label = 'Sala riunioni';
        if (pl.tool === 'label') e.label = 'Scritta';
        pl.plan.elements.push(e); pl.sel = e.id;
      }
      plDrag = drag;
      plRefreshCanvas();
      return;
    }
    if (hEl && gEl) {
      const el = pl.plan.elements.find(x => x.id === gEl.dataset.el);
      plPush(); drag = { kind: hEl.dataset.h, el, start: p, orig: { ...el } };
    } else if (gEl) {
      const el = pl.plan.elements.find(x => x.id === gEl.dataset.el);
      pl.sel = el.id; // la selezione non è una modifica: lo storico parte solo se si sposta
      drag = { kind: 'move', el, start: p, orig: { ...el }, moved: false };
      plDrag = drag;
      plRefreshCanvas();
      return;
    } else { pl.sel = null; plRefreshCanvas(); return; }
    plDrag = drag;
  };
}
window.addEventListener('pointermove', ev => {
    if (!plDrag || !$('plSvg')) return;
    const p = plPoint(ev), d = plDrag, e = d.el;
    const dx = p.x - d.start.x, dy = p.y - d.start.y;
    if (d.kind === 'move') {
      if (!d.moved && Math.hypot(dx, dy) < 3) return;
      if (!d.moved) { plPush(); d.moved = true; }
      if (e.t === 'wall') { const sx = plSnap(d.orig.x1 + dx) - d.orig.x1, sy = plSnap(d.orig.y1 + dy) - d.orig.y1; e.x1 = d.orig.x1 + sx; e.y1 = d.orig.y1 + sy; e.x2 = d.orig.x2 + sx; e.y2 = d.orig.y2 + sy; }
      else { e.x = plSnap(d.orig.x + dx); e.y = plSnap(d.orig.y + dy); }
    } else if (d.kind === 'br') {
      e.w = Math.max(4, plSnap(d.orig.w + dx)); e.h = Math.max(2, plSnap(d.orig.h + dy));
    } else if (d.kind === 'p1' || d.kind === 'p2') {
      let x = plSnap(p.x), y = plSnap(p.y);
      const ox = d.kind === 'p1' ? e.x2 : e.x1, oy = d.kind === 'p1' ? e.y2 : e.y1;
      if (!ev.altKey) { if (Math.abs(x - ox) < Math.abs(y - oy) * .25) x = ox; else if (Math.abs(y - oy) < Math.abs(x - ox) * .25) y = oy; }
      if (d.kind === 'p1') { e.x1 = x; e.y1 = y; } else { e.x2 = x; e.y2 = y; }
    }
    const g = document.querySelector(`#plSvg [data-el="${e.id}"]`);
    if (g) g.outerHTML = plElSvg(e, { edit: true });
});
window.addEventListener('pointerup', () => {
    if (!plDrag) return;
    const e = plDrag.el;
    if (e.t === 'wall' && e.x1 === e.x2 && e.y1 === e.y2) { pl.plan.elements = pl.plan.elements.filter(x => x !== e); pl.sel = null; }
    plDrag = null;
    if ($('plSvg')) plRefreshCanvas();
});

function plRotate() { const e = pl.plan.elements.find(x => x.id === pl.sel); if (!e) return; plPush(); if (e.t === 'wall') { const cx = (e.x1 + e.x2) / 2, cy = (e.y1 + e.y2) / 2; [e.x1, e.y1, e.x2, e.y2] = [cx - (e.y1 - cy), cy + (e.x1 - cx), cx - (e.y2 - cy), cy + (e.x2 - cx)]; } else e.r = ((e.r || 0) + 90) % 360; plRefreshCanvas(); }
function plDuplicate() {
  const e = pl.plan.elements.find(x => x.id === pl.sel); if (!e) return; plPush();
  const off = +pl.plan.griglia * 2 || 20;
  const c = { ...structuredClone(e), id: plUid() };
  if (c.t === 'wall') { c.x1 += off; c.x2 += off; c.y1 += off; c.y2 += off; } else { c.x += off; c.y += off; }
  if (c.t === 'seat') c.code = plNextCode();
  pl.plan.elements.push(c); pl.sel = c.id; plRefreshCanvas();
}
function plDelete() { if (!pl.sel) return; plPush(); pl.plan.elements = pl.plan.elements.filter(x => x.id !== pl.sel); pl.sel = null; plRefreshCanvas(); }
function plUndoNow() { if (!pl.undo.length) return; pl.plan.elements = JSON.parse(pl.undo.pop()); pl.sel = null; pl.dirty = true; plRefreshCanvas(); }

document.addEventListener('keydown', ev => {
  if (currentView !== 'planimetrie' || pl.mode !== 'modifica') return;
  if (ev.target.closest && ev.target.closest('input,select,textarea')) return;
  const e = pl.plan?.elements.find(x => x.id === pl.sel);
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.preventDefault(); return plUndoNow(); }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'd') { ev.preventDefault(); return plDuplicate(); }
  if (ev.key === 'Escape') { pl.tool = null; pl.sel = null; return plRender(); }
  if (!e) return;
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); return plDelete(); }
  if (ev.key.toLowerCase() === 'r') return plRotate();
  const step = (+pl.plan.griglia || 10) * (ev.shiftKey ? 5 : 1);
  const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
  if (mv) { ev.preventDefault(); plPush(); if (e.t === 'wall') { e.x1 += mv[0]; e.x2 += mv[0]; e.y1 += mv[1]; e.y2 += mv[1]; } else { e.x += mv[0]; e.y += mv[1]; } plRefreshCanvas(); }
});

async function plSavePlan() {
  const p = pl.plan;
  const dup = Object.entries(p.elements.filter(e => e.t === 'seat' && e.code).reduce((m, e) => (m[e.code] = (m[e.code] || 0) + 1, m), {})).filter(([, n]) => n > 1).map(([c]) => c);
  if (dup.length) return toast('Codici postazione ripetuti: ' + dup.slice(0, 5).join(', '));
  try {
    const row = { id: p.id, nome: p.nome, sede: p.sede, prefisso: p.prefisso || null, width: p.width, height: p.height, griglia: p.griglia || 10, sfondo: p.sfondo || null, elements: p.elements, ordine: p.ordine || 0, updated_at: new Date().toISOString(), updated_by_nome: profile?.nome || user.email };
    const exists = pl.plans.some(x => x.id === p.id);
    if (exists) await update('floor_plans', `id=eq.${encodeURIComponent(p.id)}`, row);
    else await insert('floor_plans', row, false);
    const created = await plEnsurePositions([p]);
    toast(created ? `Pianta salvata · ${created} postazioni nuove` : 'Pianta salvata');
    pl.dirty = false; pl.mode = 'uso';
    await plLoadData(); pl.plan = structuredClone(pl.plans.find(x => x.id === p.id) || p); plRender();
  } catch (err) { toast(err.message); }
}

async function plNewPlan(existing) {
  let templates = [];
  if (!existing) { try { templates = await plTemplates(); } catch (e) { templates = []; } }
  const p = existing || { nome: '', sede: 'FIRENZE', prefisso: '', width: 1600, height: 1100, griglia: 10 };
  $('plSide').innerHTML = '';
  $('content').innerHTML = `
    <div class="panel">
      <div class="ag-form-head"><h3>${existing ? 'Impostazioni pianta' : 'Nuova pianta'}</h3><button class="secondary compact" id="plNewBack">← Planimetrie</button></div>
      <form id="plNewForm" class="formgrid">
        <label>Nome<input id="pnNome" required value="${esc(p.nome)}" placeholder="Es. Terzo piano"></label>
        <label>Sede<input id="pnSede" required value="${esc(p.sede)}" placeholder="FIRENZE"></label>
        <label>Prefisso codici postazione<input id="pnPre" value="${esc(p.prefisso || '')}" placeholder="Es. 3P-"></label>
        <label>Larghezza area<input id="pnW" type="number" min="200" max="20000" value="${Math.round(p.width)}"></label>
        <label>Altezza area<input id="pnH" type="number" min="200" max="20000" value="${Math.round(p.height)}"></label>
        <label>Passo griglia<input id="pnG" type="number" min="2" max="200" value="${Math.round(p.griglia || 10)}"></label>
        ${!existing && templates.length ? `<label class="full">Parti da<select id="pnTpl"><option value="">Pianta vuota</option>${templates.map(t => `<option value="${esc(t.id)}">${esc(t.sede)} · ${esc(t.nome)} (${t.elements.filter(e => e.t === 'seat').length} postazioni)</option>`).join('')}</select></label>` : ''}
        <div class="full"><button class="primary">${existing ? 'Applica' : 'Crea e apri l\'editor'}</button> <span id="pnRes" class="muted-line"></span></div>
      </form>
    </div>`;
  $('plNewBack').onclick = () => existing ? plRender() : planimetrieView();
  if ($('pnTpl')) $('pnTpl').onchange = () => {
    const t = templates.find(x => x.id === $('pnTpl').value); if (!t) return;
    $('pnNome').value = t.nome; $('pnSede').value = t.sede; $('pnPre').value = t.prefisso || ''; $('pnW').value = Math.round(t.width); $('pnH').value = Math.round(t.height); $('pnG').value = Math.round(t.griglia);
  };
  $('plNewForm').onsubmit = ev => {
    ev.preventDefault();
    const vals = { nome: $('pnNome').value.trim(), sede: $('pnSede').value.trim().toUpperCase(), prefisso: $('pnPre').value.trim().toUpperCase(), width: +$('pnW').value, height: +$('pnH').value, griglia: +$('pnG').value || 10 };
    if (existing) { Object.assign(pl.plan, vals); pl.dirty = true; return plRender(); }
    const tpl = templates.find(x => x.id === $('pnTpl')?.value);
    let id = plSlug(`${vals.sede}-${vals.nome}`) || 'pianta';
    if (pl.plans.some(x => x.id === id)) id = id.slice(0, 50) + '-' + Date.now().toString(36).slice(-4);
    pl.plan = { id, ...vals, sfondo: tpl ? tpl.sfondo : null, elements: tpl ? structuredClone(tpl.elements) : [], ordine: pl.plans.length };
    pl.mode = 'modifica'; pl.sel = null; pl.tool = tpl ? null : 'wall'; pl.undo = []; pl.dirty = true; pl.zoom = 1;
    plRender();
  };
}
