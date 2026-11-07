// ARCHEA Platform · Rubrica fornitori (IT e progetti) + licenze e programmi della persona
// Tabelle: suppliers, person_software (supabase/migrations/20261108_licenze_fornitori.sql)

const FORN_AMBITI = { IT: 'IT', PROGETTI: 'Progetti', ENTRAMBI: 'IT e progetti' };
const fornState = { list: [], q: '', ambito: '', progetto: '' };

// la rubrica la usano e la aggiornano tutti: resta scritto chi ha creato e chi ha modificato ogni fornitore
function fornCanSee() { return true; }
function fornCanEdit() { return true; }
function fornCanDelete(s) {
  const ambito = s.ambito;
  if (s.created_by === user.id || profile?.ruolo === 'SUPER_IT') return true;
  if (isITRole() && ambito !== 'PROGETTI') return true;
  return typeof hasPerm === 'function' && hasPerm('gestione_progetti') && ambito !== 'IT';
}
function fornDefaultAmbito() { return isITRole() ? 'IT' : 'PROGETTI'; }
function fornSetupMsg(err) {
  return /suppliers|person_software|PGRST|schema cache|does not exist/i.test(err.message)
    ? '<div class="empty"><b>Rubrica non ancora attiva.</b><br>Esegui SETUP_COMPLETO.sql su Supabase (supabase/setup.html).</div>'
    : `<div class="empty">${esc(err.message)}</div>`;
}

async function fornitoriView() {
  const epoch = navigationEpoch;
  if (!fornCanSee()) return userHome();
  page('Fornitori', 'Rubrica dei fornitori IT e di progetto');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try { fornState.list = await select('suppliers', 'select=*&order=nome.asc'); }
  catch (err) { if (epoch === navigationEpoch) $('content').innerHTML = fornSetupMsg(err); return; }
  if (epoch !== navigationEpoch) return;
  fornRender();
}

function fornRender() {
  const q = normSearch(fornState.q);
  const projects = [...new Set(fornState.list.flatMap(s => s.progetti || []))].sort();
  const rows = fornState.list.filter(s =>
    (!fornState.ambito || s.ambito === fornState.ambito || s.ambito === 'ENTRAMBI') &&
    (!fornState.progetto || (s.progetti || []).includes(fornState.progetto)) &&
    (!q || normSearch([s.nome, s.categoria, s.referente, s.email, s.telefono, (s.progetti || []).join(' ')].join(' ')).includes(q)));
  $('content').innerHTML = `
    <div class="panel">
      <div class="forn-toolbar">
        <input id="fQ" placeholder="Cerca nome, categoria, referente, commessa…" value="${esc(fornState.q)}">
        <select id="fAmb"><option value="">Tutti</option>${Object.entries(FORN_AMBITI).filter(([k]) => k !== 'ENTRAMBI').map(([k, v]) => `<option value="${k}" ${fornState.ambito === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        ${projects.length ? `<select id="fPrj"><option value="">Tutte le commesse</option>${projects.map(p => `<option ${fornState.progetto === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>` : ''}
        <button class="primary" id="fAdd">+ Aggiungi fornitore</button>
      </div>
      <p class="muted-line">${rows.length} fornitori</p>
      <div class="forn-grid">${rows.map(s => `
        <button class="forn-card" data-forn="${s.id}">
          <span class="forn-top"><b>${esc(s.nome)}</b><span class="badge">${esc(FORN_AMBITI[s.ambito] || s.ambito)}</span></span>
          ${s.categoria ? `<small>${esc(s.categoria)}</small>` : ''}
          ${s.referente ? `<span>👤 ${esc(s.referente)}</span>` : ''}
          ${s.telefono ? `<span>📞 ${esc(s.telefono)}</span>` : ''}
          ${s.email ? `<span>✉️ ${esc(s.email)}</span>` : ''}
          ${(s.progetti || []).length ? `<span class="forn-prj">${s.progetti.map(p => `<em>${esc(p)}</em>`).join('')}</span>` : ''}
          ${s.updated_by_name ? `<small class="forn-who">Modificato da ${esc(s.updated_by_name)}</small>` : ''}
        </button>`).join('') || '<div class="empty">Nessun fornitore. Aggiungi il primo con «+ Aggiungi fornitore».</div>'}</div>
    </div>`;
  $('fQ').oninput = e => { fornState.q = e.target.value; const pos = e.target.selectionStart; fornRender(); $('fQ').focus(); $('fQ').setSelectionRange(pos, pos); };
  $('fAmb').onchange = e => { fornState.ambito = e.target.value; fornRender(); };
  if ($('fPrj')) $('fPrj').onchange = e => { fornState.progetto = e.target.value; fornRender(); };
  $('fAdd').onclick = () => fornForm(null);
  document.querySelectorAll('[data-forn]').forEach(b => b.onclick = () => fornForm(fornState.list.find(s => String(s.id) === b.dataset.forn)));
}

function fornForm(s) {
  const isNew = !s;
  const amb = s?.ambito || fornDefaultAmbito();
  const can = fornCanEdit();
  const ro = can ? '' : 'readonly disabled';
  const prj = (() => { try { return (window.top.ArcheaWsCloud?.get('progetti') || []).map(p => p.codice).filter(Boolean); } catch (e) { return []; } })();
  $('content').innerHTML = `
    <div class="panel">
      <div class="ag-form-head"><h3>${isNew ? 'Nuovo fornitore' : esc(s.nome)}</h3><button class="secondary compact" id="fBack">← Rubrica</button></div>
      <form id="fForm" class="formgrid">
        <label>Nome / ragione sociale<input id="fNome" required minlength="2" value="${esc(s?.nome || '')}" ${ro}></label>
        <label>Categoria<input id="fCat" value="${esc(s?.categoria || '')}" placeholder="Es. Hardware, Software, Impresa edile, Strutturista" ${ro}></label>
        <label>Rubrica<select id="fAmbito" ${ro}>${Object.entries(FORN_AMBITI).map(([k, v]) => `<option value="${k}" ${amb === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>Referente<input id="fRef" value="${esc(s?.referente || '')}" ${ro}></label>
        <label>Telefono<input id="fTel" type="tel" value="${esc(s?.telefono || '')}" ${ro}></label>
        <label>Email<input id="fMail" type="email" value="${esc(s?.email || '')}" ${ro}></label>
        <label>Sito web<input id="fWeb" value="${esc(s?.sito || '')}" placeholder="https://…" ${ro}></label>
        <label>Partita IVA<input id="fPiva" value="${esc(s?.partita_iva || '')}" ${ro}></label>
        <label class="full">Indirizzo<input id="fAddr" value="${esc(s?.indirizzo || '')}" ${ro}></label>
        <label class="full">Commesse collegate <span class="optional">(codici separati da virgola)</span><input id="fPrjIn" list="fPrjList" value="${esc((s?.progetti || []).join(', '))}" placeholder="Es. P51, P62" ${ro}></label>
        <datalist id="fPrjList">${prj.map(p => `<option value="${esc(p)}">`).join('')}</datalist>
        <label class="full">Note<textarea id="fNote" rows="3" ${ro}>${esc(s?.note || '')}</textarea></label>
        ${!isNew ? `<p class="full muted-line forn-who">Aggiunto da <b>${esc(s.created_by_name || '—')}</b> il ${fmt(s.created_at)}${s.updated_by_name ? ` · ultima modifica di <b>${esc(s.updated_by_name)}</b> il ${fmt(s.updated_at)}` : ''}</p>` : ''}
        <div class="full button-row">
          ${can ? `<button class="primary" id="fSave">${isNew ? 'Salva fornitore' : 'Salva modifiche'}</button>` : '<span class="muted-line">Puoi solo consultarlo: lo modifica chi gestisce questa rubrica.</span>'}
          ${!isNew && fornCanDelete(s) ? '<button type="button" class="secondary danger-outline" id="fDel">Elimina</button>' : ''}
          ${s?.email ? `<a class="secondary btnlink" href="mailto:${esc(s.email)}">Scrivi email</a>` : ''}
          ${s?.telefono ? `<a class="secondary btnlink" href="tel:${esc(s.telefono.replace(/\s+/g, ''))}">Chiama</a>` : ''}
          <span id="fRes" class="muted-line"></span>
        </div>
      </form>
    </div>`;
  $('fBack').onclick = fornitoriView;
  if (!can) return;
  $('fForm').onsubmit = async e => {
    e.preventDefault();
    const row = {
      nome: $('fNome').value.trim(), categoria: $('fCat').value.trim() || null, ambito: $('fAmbito').value,
      referente: $('fRef').value.trim() || null, telefono: $('fTel').value.trim() || null, email: $('fMail').value.trim() || null,
      sito: $('fWeb').value.trim() || null, partita_iva: $('fPiva').value.trim() || null, indirizzo: $('fAddr').value.trim() || null,
      progetti: [...new Set($('fPrjIn').value.split(/[,;\s]+/).map(x => x.trim().toUpperCase()).filter(Boolean))],
      note: $('fNote').value.trim() || null
    };
    try {
      if (isNew) await insert('suppliers', row, false); else await update('suppliers', `id=eq.${s.id}`, row);
      toast('Fornitore salvato'); fornitoriView();
    } catch (err) { $('fRes').textContent = err.message; }
  };
  if ($('fDel')) $('fDel').onclick = async () => {
    if (!window.confirm(`Eliminare ${s.nome} dalla rubrica?`)) return;
    try { await api(`/rest/v1/suppliers?id=eq.${s.id}`, { method: 'DELETE' }); toast('Fornitore eliminato'); fornitoriView(); } catch (err) { $('fRes').textContent = err.message; }
  };
}

// ---------- Scheda persona (lato IT): licenze, programmi, account ----------
const SW_TIPI = { LICENZA: 'Licenza', PROGRAMMA: 'Programma', ACCOUNT: 'Account' };
async function personSoftwarePanel(personId, personAssets) {
  const box = $('personSoftware'); if (!box || !isITRole()) return;
  let rows = [], sups = [];
  try {
    [rows, sups] = await Promise.all([
      select('person_software', `select=*,suppliers(nome),assets(asset_code)&person_id=eq.${personId}&order=stato.asc,nome.asc`),
      select('suppliers', 'select=id,nome&order=nome.asc')
    ]);
  } catch (err) { box.innerHTML = `<h3>Licenze e programmi</h3>${fornSetupMsg(err)}`; return; }
  const today = new Date().toISOString().slice(0, 10), soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const scad = r => !r.scadenza ? '' : r.scadenza < today ? `<span class="badge danger">scaduta ${dateOnly(r.scadenza)}</span>` : r.scadenza <= soon ? `<span class="badge warn">scade ${dateOnly(r.scadenza)}</span>` : `<small>scade ${dateOnly(r.scadenza)}</small>`;
  const assetOpts = cur => `<option value="">—</option>${personAssets.map(a => `<option value="${a.id}" ${String(cur) === String(a.id) ? 'selected' : ''}>${esc(a.asset_code)} · ${esc([a.brand, a.model].filter(Boolean).join(' ') || a.category || '')}</option>`).join('')}`;
  const supOpts = cur => `<option value="">—</option>${sups.map(s => `<option value="${s.id}" ${String(cur) === String(s.id) ? 'selected' : ''}>${esc(s.nome)}</option>`).join('')}`;
  box.innerHTML = `
    <div class="panel-head-row"><div><h3>Licenze, programmi e account</h3><p class="muted-line">Cosa usa questa persona e dove è installato. Non inserire le chiavi di licenza.</p></div><button class="secondary" id="swAdd">+ Aggiungi</button></div>
    <div id="swForm"></div>
    <div class="sw-list">${rows.map(r => `
      <div class="sw-row ${r.stato !== 'ATTIVA' ? 'off' : ''}">
        <div><b>${esc(r.nome)}</b>${r.versione ? ` <small>${esc(r.versione)}</small>` : ''} <span class="badge">${SW_TIPI[r.tipo] || r.tipo}</span>${r.stato !== 'ATTIVA' ? ` <span class="badge">${esc(r.stato)}</span>` : ''}</div>
        <small>${[r.suppliers?.nome && 'Fornitore: ' + r.suppliers.nome, r.assets?.asset_code && 'Installato su ' + r.assets.asset_code, r.riferimento && 'Rif. ' + r.riferimento].filter(Boolean).map(esc).join(' · ') || '—'}</small>
        <span>${scad(r)}</span>
        <button class="secondary compact" data-sw="${r.id}">Modifica</button>
      </div>`).join('') || '<div class="empty">Nessuna licenza o programma registrato.</div>'}</div>`;
  const form = r => {
    $('swForm').innerHTML = `<form id="swF" class="formgrid sw-form">
      <label>Tipo<select id="swTipo">${Object.entries(SW_TIPI).map(([k, v]) => `<option value="${k}" ${(r?.tipo || 'LICENZA') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label>Nome<input id="swNome" required value="${esc(r?.nome || '')}" placeholder="Es. AutoCAD, Revit, Microsoft 365"></label>
      <label>Versione / piano<input id="swVer" value="${esc(r?.versione || '')}"></label>
      <label>Fornitore<select id="swSup">${supOpts(r?.supplier_id)}</select></label>
      <label>Installato su<select id="swAsset">${assetOpts(r?.asset_id)}</select></label>
      <label>Riferimento <span class="optional">(contratto, ordine, utente)</span><input id="swRif" value="${esc(r?.riferimento || '')}"></label>
      <label>Dal<input id="swDal" type="date" value="${esc(r?.data_inizio || '')}"></label>
      <label>Scadenza<input id="swScad" type="date" value="${esc(r?.scadenza || '')}"></label>
      <label>Stato<select id="swStato">${['ATTIVA', 'SCADUTA', 'DISMESSA'].map(k => `<option ${(r?.stato || 'ATTIVA') === k ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <label class="full">Note<input id="swNote" value="${esc(r?.note || '')}"></label>
      <div class="full button-row"><button class="primary">${r ? 'Salva' : 'Aggiungi'}</button><button type="button" class="secondary" id="swCancel">Annulla</button>${r ? '<button type="button" class="secondary danger-outline" id="swDel">Elimina</button>' : ''}<span id="swRes" class="muted-line"></span></div>
    </form>`;
    $('swCancel').onclick = () => { $('swForm').innerHTML = ''; };
    $('swF').onsubmit = async e => {
      e.preventDefault();
      const row = { person_id: personId, tipo: $('swTipo').value, nome: $('swNome').value.trim(), versione: $('swVer').value.trim() || null,
        supplier_id: +$('swSup').value || null, asset_id: +$('swAsset').value || null, riferimento: $('swRif').value.trim() || null,
        data_inizio: $('swDal').value || null, scadenza: $('swScad').value || null, stato: $('swStato').value, note: $('swNote').value.trim() || null, updated_at: new Date().toISOString() };
      try { if (r) await update('person_software', `id=eq.${r.id}`, row); else await insert('person_software', row, false); toast('Salvato'); personSoftwarePanel(personId, personAssets); }
      catch (err) { $('swRes').textContent = err.message; }
    };
    if ($('swDel')) $('swDel').onclick = async () => {
      if (!window.confirm(`Eliminare ${r.nome}?`)) return;
      try { await api(`/rest/v1/person_software?id=eq.${r.id}`, { method: 'DELETE' }); personSoftwarePanel(personId, personAssets); } catch (err) { $('swRes').textContent = err.message; }
    };
  };
  $('swAdd').onclick = () => form(null);
  box.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => form(rows.find(x => String(x.id) === b.dataset.sw)));
}
