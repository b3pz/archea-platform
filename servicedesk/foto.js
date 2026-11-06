/*
 * Service Desk V9.9 · Foto: archivio "Foto cantiere" e immagini per Off topic.
 * Le foto vanno nel bucket privato "foto" di Supabase Storage (vedi 20261106_foto.sql).
 * Se in cantiere manca la rete, la foto resta in coda sul telefono e parte da sola
 * appena torna la connessione.
 */

const FOTO_BUCKET = 'foto';
const FOTO_QUEUE_DB = 'archea-foto-coda';
let fotoSignCache = new Map();

// ---------- immagini: compressione ----------
function fotoCompress(file, max = 1800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k));
      c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? resolve(b) : reject(new Error('Foto non leggibile')), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Formato foto non supportato')); };
    img.src = url;
  });
}
function fotoUuid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); }
function fotoPath(folder) { return `${folder}/${new Date().getFullYear()}/${fotoUuid()}.jpg`; }

// ---------- caricamento e link temporanei ----------
async function fotoUpload(path, blob, retry = true) {
  if (DEMO) return window.SDDemo.storagePut(path, blob);
  const r = await fetch(`${BASE}/storage/v1/object/${FOTO_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'image/jpeg', 'x-upsert': 'false' },
    body: blob
  });
  if (r.status === 401 && retry) { await refreshSession(); return fotoUpload(path, blob, false); }
  if (!r.ok) {
    let msg = `HTTP ${r.status}`; try { const d = await r.json(); msg = d.message || d.error || msg; } catch {}
    if (/bucket not found/i.test(msg)) msg = 'Spazio foto non ancora attivato: va eseguito SETUP_COMPLETO.sql su Supabase.';
    throw new Error(msg);
  }
  return path;
}
async function fotoSign(paths) {
  const need = paths.filter(p => p && !(fotoSignCache.get(p) && fotoSignCache.get(p).exp > Date.now()));
  if (need.length) {
    let list;
    if (DEMO) list = await Promise.all(need.map(async p => ({ path: p, url: await window.SDDemo.storageGet(p) })));
    else {
      const res = await api(`/storage/v1/object/sign/${FOTO_BUCKET}`, { method: 'POST', body: { expiresIn: 3600, paths: need } });
      list = (res || []).map(x => ({ path: x.path, url: x.signedURL ? `${BASE}/storage/v1${x.signedURL}` : null }));
    }
    list.forEach(x => fotoSignCache.set(x.path, { url: x.url, exp: Date.now() + 50 * 60000 }));
  }
  const out = {}; paths.forEach(p => { out[p] = fotoSignCache.get(p)?.url || null; });
  return out;
}
async function fotoRemove(paths) {
  if (!paths.length) return;
  if (DEMO) return paths.forEach(p => window.SDDemo.storageDel(p));
  await api(`/storage/v1/object/${FOTO_BUCKET}`, { method: 'DELETE', body: { prefixes: paths } });
}

// griglia di miniature: <div class="foto-grid" data-fotos='[...]'> riempita dopo con i link firmati
function fotoGridHtml(paths, opts = {}) {
  if (!paths || !paths.length) return '';
  return `<div class="foto-grid${opts.small ? ' small' : ''}">${paths.map(p => `<button type="button" class="foto-thumb" data-foto="${esc(p)}" aria-label="Apri foto"><img alt="" loading="lazy"></button>`).join('')}</div>`;
}
async function fotoHydrate(root = document) {
  const btns = [...root.querySelectorAll('[data-foto]')];
  if (!btns.length) return;
  try {
    const urls = await fotoSign([...new Set(btns.map(b => b.dataset.foto))]);
    btns.forEach(b => { const u = urls[b.dataset.foto]; const img = b.querySelector('img'); if (u && img && !img.src) img.src = u; b.onclick = () => fotoLightbox(u, b.dataset.info || ''); });
  } catch (e) { console.warn('Foto non caricate:', e.message); }
}
function fotoLightbox(url, info) {
  if (!url) return;
  const box = document.createElement('div');
  box.className = 'foto-lightbox';
  box.innerHTML = `<button class="foto-close" aria-label="Chiudi">×</button><img src="${esc(url)}" alt="">${info ? `<div class="foto-info">${info}</div>` : ''}<a class="secondary compact foto-dl" href="${esc(url)}" target="_blank" rel="noopener" download>Apri originale</a>`;
  box.onclick = e => { if (e.target === box || e.target.classList.contains('foto-close')) box.remove(); };
  document.addEventListener('keydown', function esc1(e) { if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc1); } });
  document.body.appendChild(box);
}

// selettore di foto riutilizzabile (Off topic): restituisce le foto scelte e già compresse
function fotoPickerHtml(id, label = 'Aggiungi foto') {
  return `<div class="foto-picker" id="${id}">
    <label class="secondary compact foto-pick-btn">${esc(label)}<input type="file" accept="image/*" multiple hidden></label>
    <div class="foto-pick-preview"></div>
  </div>`;
}
function fotoPickerWire(id, max = 6) {
  const root = $(id); if (!root) return () => [];
  const files = [];
  const prev = root.querySelector('.foto-pick-preview');
  const draw = () => {
    prev.innerHTML = files.map((f, i) => `<span class="foto-pick-item"><img src="${f.url}" alt=""><button type="button" data-rm="${i}" aria-label="Togli foto">×</button></span>`).join('');
    prev.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { URL.revokeObjectURL(files[+b.dataset.rm].url); files.splice(+b.dataset.rm, 1); draw(); });
  };
  root.querySelector('input').onchange = async e => {
    for (const f of [...e.target.files].slice(0, max - files.length)) {
      try { const blob = await fotoCompress(f); files.push({ blob, url: URL.createObjectURL(blob) }); } catch (err) { toast(err.message); }
    }
    e.target.value = ''; draw();
    if (files.length >= max) toast(`Massimo ${max} foto`);
  };
  return () => files.map(f => f.blob);
}
async function fotoUploadMany(folder, blobs) {
  const out = [];
  for (const b of blobs) out.push(await fotoUpload(fotoPath(folder), b));
  return out;
}

// ---------- coda offline (IndexedDB) ----------
function fotoQueueDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FOTO_QUEUE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('coda', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function fotoQueue(op, value) {
  try {
    const db = await fotoQueueDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('coda', op === 'all' ? 'readonly' : 'readwrite');
      const st = tx.objectStore('coda');
      const req = op === 'add' ? st.put(value) : op === 'del' ? st.delete(value) : st.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return op === 'all' ? [] : null; }
}
let fotoFlushing = false;
async function fotoFlushQueue() {
  if (fotoFlushing || !user) return 0;
  fotoFlushing = true;
  let sent = 0;
  try {
    const items = (await fotoQueue('all')) || [];
    for (const it of items.filter(i => i.user_id === user.id)) {
      try {
        await fotoSaveSitePhoto(it);
        await fotoQueue('del', it.id);
        sent++;
      } catch (e) { if (!/Failed to fetch|NetworkError|network/i.test(e.message)) { console.warn('Foto in coda scartata:', e.message); } break; }
    }
  } finally { fotoFlushing = false; }
  if (sent) { toast(`${sent} foto in coda inviate`); if (currentView === 'cantiere') cantiereView(); }
  return sent;
}
window.addEventListener('online', () => fotoFlushQueue());

async function fotoSaveSitePhoto(it) {
  const path = it.path || fotoPath('cantiere');
  await fotoUpload(path, it.blob);
  await insert('site_photos', { cantiere: it.cantiere, path, nota: it.nota || null, taken_at: it.taken_at, lat: it.lat ?? null, lng: it.lng ?? null, author_id: user.id, author_nome: profile?.nome || user.email }, false);
}

// ---------- vista: Foto cantiere ----------
let ctState = { filtro: '', photos: [] };

async function cantiereView() {
  const epoch = navigationEpoch;
  page('Foto cantiere', 'Scatta in cantiere: le foto restano archiviate per commessa');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try {
    ctState.photos = await select('site_photos', 'select=*&order=taken_at.desc&limit=600');
  } catch (err) {
    if (epoch !== navigationEpoch) return;
    $('content').innerHTML = `<div class="panel"><h3>Foto cantiere non ancora attivate</h3><p>Va eseguito di nuovo <code>supabase/SETUP_COMPLETO.sql</code> nel SQL Editor di Supabase: ora crea anche lo spazio per le foto.</p><p class="muted-line">Dettaglio: ${esc(err.message)}</p></div>`;
    return;
  }
  if (epoch !== navigationEpoch) return;
  const queued = ((await fotoQueue('all')) || []).filter(i => i.user_id === user.id);
  ctRender(queued);
  if (queued.length && navigator.onLine) fotoFlushQueue();
}

function ctRender(queued = []) {
  let last = ''; try { last = localStorage.getItem('archea_ultimo_cantiere') || ''; } catch {}
  const cantieri = [...new Set(ctState.photos.map(p => p.cantiere))].sort((a, b) => a.localeCompare(b, 'it'));
  const list = ctState.photos.filter(p => !ctState.filtro || p.cantiere === ctState.filtro);
  const byDay = {};
  list.forEach(p => { const d = new Date(p.taken_at).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); (byDay[d] = byDay[d] || []).push(p); });
  $('content').innerHTML = `
    <section class="panel ct-shoot">
      <label class="full">Cantiere / commessa<input id="ctCantiere" list="ctCantieri" value="${esc(last)}" placeholder="Es. P51 · Via Cavour, Firenze" autocomplete="off"></label>
      <datalist id="ctCantieri">${cantieri.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <label class="full">Nota <span class="optional">(facoltativa)</span><input id="ctNota" placeholder="Es. getto solaio, fessura parete nord…"></label>
      <label class="ct-gps"><input type="checkbox" id="ctGps" style="width:auto"> Salva anche la posizione GPS</label>
      <div class="ct-buttons">
        <label class="primary ct-camera">📷 Scatta foto<input type="file" accept="image/*" capture="environment" multiple hidden id="ctCam"></label>
        <label class="secondary ct-gallery">Carica dalla galleria<input type="file" accept="image/*" multiple hidden id="ctGal"></label>
      </div>
      <p id="ctStatus" class="muted-line">${queued.length ? `<b>${queued.length} foto in attesa di connessione</b>: partono da sole appena torna la rete.` : 'Le foto vengono ridotte (circa 300–600 KB) e salvate nell\'archivio privato dello studio.'}</p>
    </section>
    <div class="ct-filter">
      <label>Mostra<select id="ctFiltro"><option value="">Tutti i cantieri (${ctState.photos.length})</option>${cantieri.map(c => `<option value="${esc(c)}" ${ctState.filtro === c ? 'selected' : ''}>${esc(c)} (${ctState.photos.filter(p => p.cantiere === c).length})</option>`).join('')}</select></label>
    </div>
    ${Object.keys(byDay).length ? Object.entries(byDay).map(([d, ps]) => `
      <section class="ct-day"><h4>${esc(d)}</h4>
        <div class="foto-grid">${ps.map(p => `<button type="button" class="foto-thumb" data-foto="${esc(p.path)}" data-info="${esc(`<b>${esc(p.cantiere)}</b> · ${new Date(p.taken_at).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })} · ${esc(p.author_nome || '')}${p.nota ? '<br>' + esc(p.nota) : ''}${p.lat != null ? `<br><a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">Apri posizione</a>` : ''}`)}"><img alt="" loading="lazy"><span class="ct-cap">${esc(p.cantiere)}${p.nota ? ' · ' + esc(p.nota) : ''}</span>${p.author_id === user.id || isITRole() ? `<span class="ct-del" data-ctdel="${p.id}" title="Elimina">×</span>` : ''}</button>`).join('')}</div>
      </section>`).join('') : '<div class="panel ot-empty"><b>Ancora nessuna foto.</b><p>Scrivi il cantiere e premi "Scatta foto".</p></div>'}`;

  const handle = async e => {
    const files = [...e.target.files]; e.target.value = '';
    const cantiere = $('ctCantiere').value.trim();
    if (cantiere.length < 2) { toast('Scrivi prima il cantiere'); $('ctCantiere').focus(); return; }
    try { localStorage.setItem('archea_ultimo_cantiere', cantiere); } catch {}
    const nota = $('ctNota').value.trim();
    let pos = null;
    if ($('ctGps').checked && navigator.geolocation) {
      pos = await new Promise(r => navigator.geolocation.getCurrentPosition(p => r(p.coords), () => r(null), { enableHighAccuracy: true, timeout: 8000 }));
    }
    let ok = 0, waiting = 0;
    for (const [i, f] of files.entries()) {
      $('ctStatus').textContent = `Invio ${i + 1} di ${files.length}…`;
      let blob;
      try { blob = await fotoCompress(f); } catch (err) { toast(err.message); continue; }
      const item = { id: fotoUuid(), user_id: user.id, blob, cantiere, nota, taken_at: new Date(f.lastModified || Date.now()).toISOString(), lat: pos?.latitude, lng: pos?.longitude, path: fotoPath('cantiere') };
      try { await fotoSaveSitePhoto(item); ok++; }
      catch (err) {
        if (!navigator.onLine || /Failed to fetch|NetworkError|network|Load failed/i.test(err.message)) { await fotoQueue('add', item); waiting++; }
        else { toast(err.message); }
      }
    }
    $('ctNota').value = '';
    toast(waiting ? `${ok} inviate · ${waiting} in coda (manca la rete)` : `${ok} foto salvate`);
    cantiereView();
  };
  $('ctCam').onchange = handle;
  $('ctGal').onchange = handle;
  $('ctFiltro').onchange = e => { ctState.filtro = e.target.value; ctRender(queued); };
  document.querySelectorAll('[data-ctdel]').forEach(x => x.onclick = ev => {
    ev.stopPropagation();
    if (x.dataset.confirm !== '1') { x.dataset.confirm = '1'; x.textContent = 'Elimina?'; x.classList.add('confirm'); return; }
    const p = ctState.photos.find(y => String(y.id) === x.dataset.ctdel);
    (async () => {
      try {
        await api(`/rest/v1/site_photos?id=eq.${p.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        try { await fotoRemove([p.path]); } catch (e) { console.warn(e.message); }
        toast('Foto eliminata'); cantiereView();
      } catch (err) { toast(err.message); }
    })();
  });
  fotoHydrate($('content'));
}
