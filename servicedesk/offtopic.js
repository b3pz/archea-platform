/*
 * Service Desk V9.5 · Off topic
 * Bacheca libera: ogni utente apre argomenti e risponde; IT modera (fissa, chiude, elimina).
 * LIVE: richiede supabase/migrations/20261106_offtopic.sql.
 */

const OT_CATS = {
  GENERALE: { label: 'Generale', cls: 'ot-gen' },
  EVENTI: { label: 'Eventi e uscite', cls: 'ot-ev' },
  CONSIGLI: { label: 'Consigli e domande', cls: 'ot-tip' },
  MERCATINO: { label: 'Mercatino', cls: 'ot-mkt' },
  SVAGO: { label: 'Svago', cls: 'ot-fun' }
};
let otState = { cat: '', search: '', topics: [] };

function otWhen(d) {
  const x = new Date(d), diff = (Date.now() - x.getTime()) / 1000;
  if (diff < 60) return 'adesso';
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h fa`;
  return x.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}
function otCanModerate() { return isITRole(); }
function otMine(row) { return row.author_id === user.id; }
function otSetupMessage(err) {
  $('content').innerHTML = `<div class="panel"><h3>Off topic non ancora attivato</h3>
    <p>Va eseguito una sola volta lo script <code>supabase/migrations/20261106_offtopic.sql</code>
    nel SQL Editor di Supabase (dopo quello del calendario).</p>
    <p class="muted-line">Dettaglio: ${esc(err.message || err)}</p></div>`;
}
function otBody(text) {
  // testo semplice: a capo e link https cliccabili, tutto il resto viene "escapato"
  return esc(text).replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g, '<br>');
}

async function offtopicView() {
  const epoch = navigationEpoch;
  page('Off topic', 'Due chiacchiere tra colleghi: eventi, consigli, mercatino…');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try {
    otState.topics = await select('forum_topics', 'select=*&order=pinned.desc,last_activity_at.desc&limit=300');
  } catch (err) { if (epoch === navigationEpoch) otSetupMessage(err); return; }
  if (epoch !== navigationEpoch) return;
  otRenderList();
}

function otRenderList() {
  const q = normSearch(otState.search);
  const list = otState.topics.filter(t => (!otState.cat || t.categoria === otState.cat) &&
    (!q || normSearch(`${t.titolo} ${t.corpo} ${t.author_nome || ''}`).includes(q)));
  $('content').innerHTML = `
    <div class="ot-toolbar">
      <input id="otSearch" placeholder="Cerca negli argomenti…" value="${esc(otState.search)}">
      <button class="primary" id="otNew">+ Nuovo argomento</button>
    </div>
    <div class="ot-cats">
      <button class="ag-filter${!otState.cat ? ' on' : ''}" data-otc="">Tutti</button>
      ${Object.entries(OT_CATS).map(([k, c]) => `<button class="ag-filter${otState.cat === k ? ' on' : ''}" data-otc="${k}">${c.label}</button>`).join('')}
    </div>
    <div class="ot-list">
      ${list.length ? list.map(t => {
        const c = OT_CATS[t.categoria] || OT_CATS.GENERALE;
        return `<button class="ot-topic" data-ot="${t.id}">
          <span class="chat-avatar">${esc(chatInitials(t.author_nome))}</span>
          <span class="ot-topic-main">
            <span class="ot-topic-title">${t.pinned ? '<em class="ot-pin">In evidenza</em>' : ''}${t.locked ? '<em class="ot-lock">Chiuso</em>' : ''}<b>${esc(t.titolo)}</b></span>
            <small><span class="ot-cat ${c.cls}">${c.label}</span> · ${esc(t.author_nome || 'Collega')} · ${otWhen(t.created_at)}</small>
          </span>
          <span class="ot-count"><b>${t.replies_count || 0}</b><small>risposte</small><small>${otWhen(t.last_activity_at || t.created_at)}</small></span>
        </button>`;
      }).join('') : `<div class="panel ot-empty"><b>Ancora nessun argomento${otState.cat || q ? ' con questi filtri' : ''}.</b><p>Rompi il ghiaccio: apri il primo!</p></div>`}
    </div>`;
  $('otSearch').oninput = e => {
    otState.search = e.target.value;
    const pos = e.target.selectionStart;
    otRenderList();
    const s = $('otSearch'); s.focus(); s.setSelectionRange(pos, pos);
  };
  $('otNew').onclick = otForm;
  document.querySelectorAll('[data-otc]').forEach(b => b.onclick = () => { otState.cat = b.dataset.otc; otRenderList(); });
  document.querySelectorAll('[data-ot]').forEach(b => b.onclick = () => otOpen(b.dataset.ot));
}

function otForm() {
  $('content').innerHTML = `
    <div class="panel">
      <div class="ag-form-head"><h3>Nuovo argomento</h3><button class="secondary compact" id="otBack">Annulla</button></div>
      <form id="otForm" class="formgrid">
        <label>Categoria<select id="otCat">${Object.entries(OT_CATS).map(([k, c]) => `<option value="${k}" ${otState.cat === k ? 'selected' : ''}>${c.label}</option>`).join('')}</select></label>
        <label class="full">Titolo<input id="otTitle" required minlength="3" maxlength="160" placeholder="Es. Calcetto giovedì sera, chi c'è?"></label>
        <label class="full">Messaggio<textarea id="otBodyText" rows="6" required maxlength="8000" placeholder="Scrivi qui…"></textarea></label>
        <p class="full muted-line">Lo leggono tutti i colleghi. Niente dati personali o di lavoro riservati: per quelli usa la chat o i ticket.</p>
        <div class="full"><button class="primary" id="otSave">Pubblica</button> <span id="otResult" class="muted-line"></span></div>
      </form>
    </div>`;
  $('otBack').onclick = otRenderList;
  setTimeout(() => $('otTitle')?.focus(), 30);
  $('otForm').onsubmit = async e => {
    e.preventDefault();
    $('otSave').disabled = true;
    try {
      const rows = await insert('forum_topics', {
        categoria: $('otCat').value,
        titolo: $('otTitle').value.trim(),
        corpo: $('otBodyText').value.trim(),
        author_id: user.id,
        author_nome: profile?.nome || user.email
      });
      toast('Argomento pubblicato');
      await offtopicView();
      if (rows && rows[0]) otOpen(rows[0].id);
    } catch (err) {
      $('otResult').textContent = err.message;
      $('otSave').disabled = false;
    }
  };
}

async function otOpen(id) {
  const epoch = navigationEpoch;
  let topic, replies;
  try {
    [topic, replies] = await Promise.all([
      select('forum_topics', `select=*&id=eq.${+id}`).then(r => r[0]),
      select('forum_replies', `select=*&topic_id=eq.${+id}&order=created_at.asc&limit=1000`)
    ]);
  } catch (err) { toast(err.message); return; }
  if (epoch !== navigationEpoch) return;
  if (!topic) { toast('Argomento non trovato'); return offtopicView(); }
  const c = OT_CATS[topic.categoria] || OT_CATS.GENERALE;
  const canMod = otCanModerate();
  const canReply = !topic.locked || canMod;
  $('content').innerHTML = `
    <div class="ot-thread">
      <button class="secondary compact" id="otBackList">← Tutti gli argomenti</button>
      <article class="panel ot-post first">
        <div class="ot-post-head">
          <span class="chat-avatar">${esc(chatInitials(topic.author_nome))}</span>
          <div><b>${esc(topic.author_nome || 'Collega')}</b><small>${new Date(topic.created_at).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}</small></div>
          <span class="ot-cat ${c.cls}">${c.label}</span>
        </div>
        <h3>${topic.pinned ? '<em class="ot-pin">In evidenza</em>' : ''}${topic.locked ? '<em class="ot-lock">Chiuso</em>' : ''}${esc(topic.titolo)}</h3>
        <div class="ot-text">${otBody(topic.corpo)}</div>
        <div class="button-row ot-actions">
          ${canMod ? `<button class="secondary compact" id="otPin">${topic.pinned ? 'Togli evidenza' : 'Metti in evidenza'}</button>
                      <button class="secondary compact" id="otLock">${topic.locked ? 'Riapri' : 'Chiudi alle risposte'}</button>` : ''}
          ${canMod || otMine(topic) ? '<button class="secondary compact danger-outline" id="otDelTopic">Elimina argomento</button>' : ''}
        </div>
      </article>
      ${replies.map(r => `
        <article class="panel ot-post">
          <div class="ot-post-head">
            <span class="chat-avatar">${esc(chatInitials(r.author_nome))}</span>
            <div><b>${esc(r.author_nome || 'Collega')}</b><small>${otWhen(r.created_at)}</small></div>
            ${canMod || otMine(r) ? `<button class="text-btn ot-del" data-otdel="${r.id}">Elimina</button>` : ''}
          </div>
          <div class="ot-text">${otBody(r.corpo)}</div>
        </article>`).join('')}
      ${canReply ? `<form id="otReplyForm" class="panel ot-reply">
          <label>Rispondi<textarea id="otReply" rows="3" required maxlength="8000" placeholder="Scrivi una risposta…"></textarea></label>
          <button class="primary">Invia risposta</button>
        </form>` : '<p class="muted-line">Questo argomento è chiuso: non si possono aggiungere risposte.</p>'}
    </div>`;

  $('otBackList').onclick = offtopicView;
  if ($('otReplyForm')) $('otReplyForm').onsubmit = async e => {
    e.preventDefault();
    const text = $('otReply').value.trim();
    if (!text) return;
    try {
      await insert('forum_replies', { topic_id: topic.id, corpo: text, author_id: user.id, author_nome: profile?.nome || user.email }, false);
      otOpen(topic.id);
    } catch (err) { toast(err.message); }
  };
  if ($('otPin')) $('otPin').onclick = async () => { await update('forum_topics', `id=eq.${topic.id}`, { pinned: !topic.pinned }); otOpen(topic.id); };
  if ($('otLock')) $('otLock').onclick = async () => { await update('forum_topics', `id=eq.${topic.id}`, { locked: !topic.locked }); otOpen(topic.id); };
  if ($('otDelTopic')) $('otDelTopic').onclick = () => {
    const b = $('otDelTopic');
    b.textContent = 'Conferma eliminazione';
    b.onclick = async () => {
      try { await api(`/rest/v1/forum_topics?id=eq.${topic.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); toast('Argomento eliminato'); offtopicView(); }
      catch (err) { toast(err.message); }
    };
  };
  document.querySelectorAll('[data-otdel]').forEach(b => b.onclick = () => {
    b.textContent = 'Conferma';
    b.onclick = async () => {
      try { await api(`/rest/v1/forum_replies?id=eq.${+b.dataset.otdel}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); otOpen(topic.id); }
      catch (err) { toast(err.message); }
    };
  });
}
