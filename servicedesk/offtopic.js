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
function otCanModerate() { return typeof hasPerm === 'function' ? hasPerm('moderazione_offtopic') : isITRole(); }
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
    try { otState.polls = (await select('forum_polls', 'select=topic_id')).map(p => p.topic_id); } catch (e) { otState.polls = []; }
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
            <span class="ot-topic-title">${(t.immagini || []).length ? `<em class="ot-poll-tag">📷 ${t.immagini.length}</em>` : ''}${(otState.polls || []).includes(t.id) ? '<em class="ot-poll-tag">Sondaggio</em>' : ''}${t.pinned ? '<em class="ot-pin">In evidenza</em>' : ''}${t.locked ? '<em class="ot-lock">Chiuso</em>' : ''}<b>${esc(t.titolo)}</b></span>
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
        <div class="full">${fotoPickerHtml('otPhotos', 'Aggiungi foto')}</div>
        <div class="full ot-poll-box">
          <label class="ot-poll-toggle"><input type="checkbox" id="otPollOn" style="width:auto"> <b>Aggiungi un sondaggio</b> <small>(es. "Che giorno facciamo la festa?")</small></label>
          <div id="otPollFields" class="hidden formgrid">
            <label class="full">Domanda del sondaggio<input id="otPollQ" maxlength="200" placeholder="Es. Che giorno preferite per la festa di Natale?"></label>
            <div class="full" id="otPollOpts"></div>
            <div class="full"><button type="button" class="secondary compact" id="otAddOpt">+ Aggiungi risposta</button></div>
            <label class="ot-check"><input type="checkbox" id="otPollMulti" style="width:auto"> Si possono scegliere più risposte</label>
            <label>Chiusura <span class="optional">(facoltativa)</span><input id="otPollClose" type="date"></label>
          </div>
        </div>
        <p class="full muted-line">Lo leggono tutti i colleghi. Niente dati personali o di lavoro riservati: per quelli usa la chat o i ticket.</p>
        <div class="full"><button class="primary" id="otSave">Pubblica</button> <span id="otResult" class="muted-line"></span></div>
      </form>
    </div>`;
  $('otBack').onclick = otRenderList;
  const getPhotos = fotoPickerWire('otPhotos');
  setTimeout(() => $('otTitle')?.focus(), 30);
  const addOpt = (val = '') => {
    const n = document.querySelectorAll('#otPollOpts .ot-opt').length + 1;
    const row = document.createElement('div');
    row.className = 'ot-opt';
    row.innerHTML = `<input class="otOptInput" maxlength="120" placeholder="Risposta ${n}" value="${esc(val)}"><button type="button" class="text-btn" aria-label="Togli risposta">×</button>`;
    row.querySelector('button').onclick = () => { if (document.querySelectorAll('#otPollOpts .ot-opt').length > 2) row.remove(); };
    $('otPollOpts').appendChild(row);
  };
  addOpt(); addOpt();
  $('otAddOpt').onclick = () => { if (document.querySelectorAll('#otPollOpts .ot-opt').length < 12) addOpt(); };
  $('otPollOn').onchange = () => $('otPollFields').classList.toggle('hidden', !$('otPollOn').checked);
  $('otForm').onsubmit = async e => {
    e.preventDefault();
    const pollOn = $('otPollOn').checked;
    const options = [...document.querySelectorAll('.otOptInput')].map(i => i.value.trim()).filter(Boolean);
    if (pollOn && ($('otPollQ').value.trim().length < 3 || options.length < 2)) {
      $('otResult').textContent = 'Per il sondaggio servono la domanda e almeno 2 risposte.';
      return;
    }
    $('otSave').disabled = true;
    try {
      const photos = getPhotos();
      if (photos.length) $('otResult').textContent = `Invio ${photos.length} foto…`;
      const immagini = photos.length ? await fotoUploadMany('offtopic', photos) : [];
      const rows = await insert('forum_topics', {
        immagini,
        categoria: $('otCat').value,
        titolo: $('otTitle').value.trim(),
        corpo: $('otBodyText').value.trim(),
        author_id: user.id,
        author_nome: profile?.nome || user.email
      });
      if (pollOn && rows && rows[0]) {
        const tid = rows[0].id;
        const close = $('otPollClose').value ? new Date(`${$('otPollClose').value}T23:59:00`).toISOString() : null;
        await insert('forum_polls', { topic_id: tid, domanda: $('otPollQ').value.trim(), multipla: $('otPollMulti').checked, chiude_at: close }, false);
        await insert('forum_poll_options', options.map((t, i) => ({ topic_id: tid, testo: t, ord: i })), false);
      }
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
  let poll = null, pollOpts = [], pollVotes = [];
  try {
    poll = (await select('forum_polls', `select=*&topic_id=eq.${topic.id}`))[0] || null;
    if (poll) {
      [pollOpts, pollVotes] = await Promise.all([
        select('forum_poll_options', `select=*&topic_id=eq.${topic.id}&order=ord.asc`),
        select('forum_poll_votes', `select=*&topic_id=eq.${topic.id}`)
      ]);
    }
  } catch (e) { poll = null; }
  if (epoch !== navigationEpoch) return;
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
        ${fotoGridHtml(topic.immagini)}
        ${poll ? otPollHtml(poll, pollOpts, pollVotes, topic) : ''}
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
          ${r.corpo && r.corpo !== '📷' ? `<div class="ot-text">${otBody(r.corpo)}</div>` : ''}
          ${fotoGridHtml(r.immagini, { small: true })}
        </article>`).join('')}
      ${canReply ? `<form id="otReplyForm" class="panel ot-reply">
          <label>Rispondi<textarea id="otReply" rows="3" maxlength="8000" placeholder="Scrivi una risposta…"></textarea></label>
          ${fotoPickerHtml('otReplyPhotos', 'Aggiungi foto')}
          <button class="primary" id="otReplySend">Invia risposta</button>
        </form>` : '<p class="muted-line">Questo argomento è chiuso: non si possono aggiungere risposte.</p>'}
    </div>`;

  $('otBackList').onclick = offtopicView;
  if (poll) otWirePoll(poll, pollOpts, pollVotes, topic);
  const getReplyPhotos = fotoPickerWire('otReplyPhotos');
  if ($('otReplyForm')) $('otReplyForm').onsubmit = async e => {
    e.preventDefault();
    const text = $('otReply').value.trim();
    const photos = getReplyPhotos();
    if (!text && !photos.length) return toast('Scrivi qualcosa o aggiungi una foto');
    $('otReplySend').disabled = true;
    try {
      const immagini = photos.length ? await fotoUploadMany('offtopic', photos) : [];
      await insert('forum_replies', { topic_id: topic.id, corpo: text || '📷', immagini, author_id: user.id, author_nome: profile?.nome || user.email }, false);
      otOpen(topic.id);
    } catch (err) { toast(err.message); $('otReplySend').disabled = false; }
  };
  fotoHydrate($('content'));
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


// ---------- sondaggi ----------
function otPollOpen(poll, topic) { return !topic.locked && (!poll.chiude_at || new Date(poll.chiude_at) > new Date()); }

function otPollHtml(poll, opts, votes, topic) {
  const open = otPollOpen(poll, topic);
  const voters = new Set(votes.map(v => v.user_id));
  const mine = votes.filter(v => v.user_id === user.id).map(v => String(v.option_id));
  const max = Math.max(1, ...opts.map(o => votes.filter(v => String(v.option_id) === String(o.id)).length));
  return `<section class="ot-poll">
    <div class="ot-poll-head"><b>${esc(poll.domanda)}</b>
      <small>${poll.multipla ? 'Più risposte possibili' : 'Una risposta'} · ${voters.size} ${voters.size === 1 ? 'voto' : 'voti'}${poll.chiude_at ? ` · ${open ? 'chiude il' : 'chiuso il'} ${new Date(poll.chiude_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}` : ''}${open ? '' : ' · <b>sondaggio chiuso</b>'}</small>
    </div>
    ${opts.map(o => {
      const vs = votes.filter(v => String(v.option_id) === String(o.id));
      const pct = voters.size ? Math.round(vs.length / voters.size * 100) : 0;
      const names = vs.map(v => v.user_nome || 'Collega');
      const chosen = mine.includes(String(o.id));
      return `<button class="ot-poll-opt${chosen ? ' chosen' : ''}" data-vote="${o.id}" ${open ? '' : 'disabled'} aria-pressed="${chosen}">
        <span class="ot-poll-bar" style="width:${Math.round(vs.length / max * 100)}%"></span>
        <span class="ot-poll-label"><i class="${poll.multipla ? 'sq' : 'rd'}"></i>${esc(o.testo)}</span>
        <span class="ot-poll-num"><b>${vs.length}</b> · ${pct}%</span>
        ${names.length ? `<small class="ot-poll-names">${esc(names.slice(0, 6).join(', '))}${names.length > 6 ? ` e altri ${names.length - 6}` : ''}</small>` : ''}
      </button>`;
    }).join('')}
    ${open ? `<p class="muted-line ot-poll-hint">${mine.length ? 'Tocca di nuovo una risposta per toglierla.' : 'Tocca una risposta per votare.'}</p>` : ''}
    ${open && topic.author_id === user.id ? '<button class="secondary compact" id="otPollClose">Chiudi il sondaggio adesso</button>' : ''}
  </section>`;
}

function otWirePoll(poll, opts, votes, topic) {
  document.querySelectorAll('[data-vote]').forEach(b => b.onclick = async () => {
    const oid = +b.dataset.vote;
    const already = votes.some(v => v.user_id === user.id && String(v.option_id) === String(oid));
    b.disabled = true;
    try {
      if (already) {
        await api(`/rest/v1/forum_poll_votes?option_id=eq.${oid}&user_id=eq.${user.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      } else {
        await insert('forum_poll_votes', { option_id: oid, topic_id: topic.id, user_id: user.id, user_nome: profile?.nome || user.email }, false);
      }
      otOpen(topic.id);
    } catch (err) { toast(err.message); b.disabled = false; }
  });
  if ($('otPollClose')) $('otPollClose').onclick = async () => {
    try { await update('forum_polls', `topic_id=eq.${topic.id}`, { chiude_at: new Date().toISOString() }); otOpen(topic.id); }
    catch (err) { toast(err.message); }
  };
}
