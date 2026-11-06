/*
 * Service Desk V9.6 · Permessi, gruppi e gestione utenti dal sito
 * LIVE: richiede supabase/migrations/20261106_utenti_gruppi.sql e la Edge Function admin-users.
 */

const PERMS = {
  gestione_utenti: ['Gestire utenti e gruppi', 'Vede la lista degli utenti, li aggiunge, li modifica, li disattiva o li elimina, e gestisce i gruppi.'],
  moderazione_offtopic: ['Moderare Off topic', 'Mette in evidenza, chiude ed elimina argomenti e risposte di tutti.'],
  gestione_calendario: ['Gestire il calendario', 'Modifica e annulla le prenotazioni di tutti e gestisce sale e auto (anche chi può prenotarle).'],
  gestione_mappe: ['Disegnare le planimetrie', 'Crea e modifica le piante: muri, stanze, postazioni, WRKA, TV e accessori.']
};
const RUOLI_LABEL = {
  USER: ['Utente', 'Apre ticket e segue le sue task. Calendario, chat, foto e Off topic.'],
  HR: ['HR', 'In più: persone, ingressi in studio, uscite e spostamenti, planimetrie.'],
  IT: ['IT', 'In più: coda ticket, censimento, dashboard e creazione utenti (Utente e HR).'],
  SUPER_IT: ['Super admin', 'Tutto: anche gli account IT, i gruppi che gestiscono gli utenti e la console.']
};

let MY_PERMS = [];
let MY_GROUPS = [];

async function loadPerms() {
  try {
    MY_PERMS = (await rpc('my_permissions')) || [];
  } catch (e) {
    // migrazione non ancora eseguita: si mantiene il comportamento di prima (IT = tutto)
    MY_PERMS = isITRole() ? Object.keys(PERMS) : [];
  }
  try {
    MY_GROUPS = (await select('access_group_members', `select=group_id&user_id=eq.${user.id}`)).map(r => r.group_id);
  } catch (e) { MY_GROUPS = []; }
  applyPermNav();
}
function hasPerm(p) { return isSuperIT() || MY_PERMS.includes(p); }
function applyPermNav() {
  document.querySelectorAll('nav button[data-view="utenti"]').forEach(b => b.classList.toggle('hidden', !hasPerm('gestione_utenti')));
}

// ---------- chiamate al server ----------
// Prima la funzione nel database (admin_users, da SETUP_COMPLETO.sql): non serve altro.
// Se manca, si prova la Edge Function admin-users (necessaria solo per gli inviti via email).
let US_MODE = 'sql';
async function adminUsers(action, payload = {}) {
  if (US_MODE === 'sql') {
    try {
      const clean = JSON.parse(JSON.stringify(payload));
      return await api('/rest/v1/rpc/admin_users', { method: 'POST', body: { p_action: action, p: clean } });
    } catch (err) {
      if (!/admin_users|PGRST202|Could not find the function|404/i.test(String(err.message || err))) throw err;
      US_MODE = 'edge';
    }
  }
  const res = await api('/functions/v1/admin-users', { method: 'POST', body: { action, ...payload } });
  if (res && res.error) throw new Error(res.error);
  return res;
}
function usSetupMessage(err) {
  $('content').innerHTML = `<div class="panel"><h3>Gestione utenti non ancora attivata</h3>
    <p>Serve un solo passaggio, una volta sola: Supabase → <b>SQL Editor</b> → incolla tutto <code>supabase/SETUP_COMPLETO.sql</code> → <b>Run</b>.</p>
    <p>Poi ricarica questa pagina: vedrai l'elenco di <b>tutti gli account</b> che possono entrare nel portale e potrai aggiungerne di nuovi.</p>
    <p class="muted-line">Dettaglio tecnico: ${esc(err.message || err)}</p></div>`;
}

let usState = { tab: 'utenti', users: [], groups: [], search: '' };

async function usersView() {
  const epoch = navigationEpoch;
  if (!hasPerm('gestione_utenti')) return start();
  page('Utenti e gruppi', 'Chi può entrare e cosa può fare');
  $('content').innerHTML = '<p class="empty">Caricamento…</p>';
  try {
    const [list, groups] = await Promise.all([
      adminUsers('list'),
      select('access_groups', 'select=*&order=nome.asc')
    ]);
    usState.users = list.users || [];
    usState.groups = groups || [];
  } catch (err) { if (epoch === navigationEpoch) usSetupMessage(err); return; }
  if (epoch !== navigationEpoch) return;
  usRender();
}

function usGroupName(id) { const g = usState.groups.find(x => String(x.id) === String(id)); return g ? g.nome : '—'; }
function usStatus(u) {
  if (u.disabled) return ['Disattivato', 'off'];
  if (!u.has_profile) return ['Senza profilo', 'warn'];
  if (u.invited) return ['Invito inviato', 'warn'];
  if (!u.confirmed) return ['Da confermare', 'warn'];
  return ['Attivo', 'ok'];
}

function usRender() {
  const tabs = `<div class="us-tabs">
    <button class="ag-view${usState.tab === 'utenti' ? ' on' : ''}" data-ust="utenti">Utenti (${usState.users.length})</button>
    <button class="ag-view${usState.tab === 'gruppi' ? ' on' : ''}" data-ust="gruppi">Gruppi e permessi (${usState.groups.length})</button>
  </div>`;
  if (usState.tab === 'gruppi') { $('content').innerHTML = tabs + usGroupsHtml(); usWireTabs(); usWireGroups(); return; }

  const q = normSearch(usState.search);
  const list = usState.users
    .filter(u => !q || normSearch(`${u.nome || ''} ${u.email} ${u.ruolo || ''}`).includes(q))
    .sort((a, b) => String(a.nome || a.email).localeCompare(String(b.nome || b.email), 'it'));
  $('content').innerHTML = tabs + `
    <p class="us-intro">Qui ci sono <b>tutti gli account che possono entrare nel portale</b>. Per far entrare una persona nuova: <b>+ Aggiungi utente</b>, scrivi nome, email e password, e comunicagliele.</p>
    <div class="ot-toolbar">
      <input id="usSearch" placeholder="Cerca per nome, email o ruolo…" value="${esc(usState.search)}">
      <button class="primary" id="usAdd">+ Aggiungi utente</button>
    </div>
    <div class="tablewrap"><table class="us-table">
      <thead><tr><th>Persona</th><th>Ruolo</th><th>Gruppi</th><th>Stato</th><th>Ultimo accesso</th><th></th></tr></thead>
      <tbody>${list.map(u => {
        const [st, cls] = usStatus(u);
        return `<tr>
          <td data-label="Persona"><b>${esc(u.nome || '—')}</b><br><small>${esc(u.email)}</small></td>
          <td data-label="Ruolo"><span class="badge">${esc((RUOLI_LABEL[u.ruolo] || ['—'])[0])}</span></td>
          <td data-label="Gruppi">${u.gruppi.length ? u.gruppi.map(g => `<span class="us-chip">${esc(usGroupName(g))}</span>`).join(' ') : '<small class="muted-line">nessuno</small>'}</td>
          <td data-label="Stato"><span class="us-status ${cls}">${st}</span></td>
          <td data-label="Ultimo accesso">${u.last_sign_in_at ? fmt(u.last_sign_in_at) : '<small class="muted-line">mai</small>'}</td>
          <td>${!isSuperIT() && ['IT', 'SUPER_IT'].includes(u.ruolo) && u.id !== user.id
            ? '<small class="muted-line">Solo super admin</small>'
            : `<button class="secondary compact" data-usedit="${esc(u.id)}">Modifica</button>`}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  usWireTabs();
  $('usSearch').oninput = e => { usState.search = e.target.value; const pos = e.target.selectionStart; usRender(); const s = $('usSearch'); s.focus(); s.setSelectionRange(pos, pos); };
  $('usAdd').onclick = () => usForm(null);
  document.querySelectorAll('[data-usedit]').forEach(b => b.onclick = () => usForm(usState.users.find(u => u.id === b.dataset.usedit)));
}
function usWireTabs() { document.querySelectorAll('[data-ust]').forEach(b => b.onclick = () => { usState.tab = b.dataset.ust; usRender(); }); }

function usRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const arr = new Uint32Array(12); crypto.getRandomValues(arr);
  return [...arr].map(n => chars[n % chars.length]).join('');
}

function usForm(u, prefill = null) {
  const isNew = !u;
  if (prefill) u = null;
  const roles = Object.keys(RUOLI_LABEL).filter(r => isSuperIT() || ['USER', 'HR'].includes(r) || (u && u.ruolo === r));
  const lockedTarget = !isNew && !isSuperIT() && ['IT', 'SUPER_IT'].includes(u.ruolo) && u.id !== user.id;
  const isSelf = u && u.id === user.id;
  $('content').innerHTML = `
    <div class="panel us-form">
      <div class="ag-form-head"><h3>${isNew ? 'Aggiungi utente' : esc(u.nome || u.email)}</h3><button class="secondary compact" id="usBack">← Elenco</button></div>
      <form id="usForm" class="formgrid">
        <label>Nome e cognome<input id="usNome" required minlength="2" value="${esc(u?.nome || prefill?.nome || '')}" placeholder="Es. Matteo Bianchi"></label>
        <label>Email aziendale<input id="usEmail" type="email" required ${isNew ? '' : 'readonly'} value="${esc(u?.email || prefill?.email || '')}" placeholder="nome.cognome@archea.it"></label>
        <div class="full"><b>Ruolo</b>
          <div class="us-roles">${roles.map(r => `<label class="us-role"><input type="radio" name="usRuolo" value="${r}" ${((u?.ruolo) || 'USER') === r ? 'checked' : ''} ${isSelf ? 'disabled' : ''}><span><b>${RUOLI_LABEL[r][0]}</b><small>${RUOLI_LABEL[r][1]}</small></span></label>`).join('')}</div>
          ${isSelf ? '<p class="muted-line">Non puoi cambiare il tuo ruolo.</p>' : ''}
        </div>
        <div class="full"><b>Gruppi</b> <span class="optional">(danno permessi in più)</span>
          <div class="us-groups">${usState.groups.length ? usState.groups.map(g => `<label class="us-role"><input type="checkbox" value="${g.id}" ${u?.gruppi?.includes(g.id) ? 'checked' : ''} ${!isSuperIT() && (g.permessi || []).includes('gestione_utenti') ? 'disabled title="Solo il super admin"' : ''}><span><b>${esc(g.nome)}</b><small>${(g.permessi || []).map(p => (PERMS[p] || [p])[0]).join(' · ') || 'Nessun permesso: serve per riservare sale o auto'}</small></span></label>`).join('') : '<p class="muted-line">Nessun gruppo. Creane uno nella scheda "Gruppi e permessi".</p>'}</div>
        </div>
        ${isNew ? `
          <div class="full"><b>Come entra la prima volta</b>
            <div class="us-roles">
              <label class="us-role"><input type="radio" name="usMode" value="password" checked><span><b>Password temporanea</b><small>La crei tu adesso e gliela comunichi.</small></span></label>
              ${US_MODE === 'edge' ? `<label class="us-role"><input type="radio" name="usMode" value="invite"><span><b>Invito per email</b><small>Riceve un'email da Supabase per scegliere la password.</small></span></label>` : ''}
            </div>
          </div>
          <div class="full us-pass" id="usPassRow"><label>Password temporanea<input id="usPass" minlength="8" value="${usRandomPassword()}"></label><button type="button" class="secondary" id="usGen">Genera</button></div>`
        : `<div class="full us-pass"><label>Nuova password <span class="optional">(solo se va reimpostata)</span><input id="usPass" minlength="8" placeholder="lascia vuoto per non cambiarla"></label><button type="button" class="secondary" id="usGen">Genera</button></div>`}
        <div class="full button-row">
          <button class="primary" id="usSave">${isNew ? 'Crea utente' : 'Salva modifiche'}</button>
          ${!isNew && !isSelf ? `<button type="button" class="secondary" id="usToggle">${u.disabled ? 'Riattiva accesso' : 'Disattiva accesso'}</button>
            <button type="button" class="secondary danger-outline" id="usDelete">Elimina utente</button>` : ''}
          <span id="usResult" class="muted-line"></span>
        </div>
      </form>
    </div>`;

  $('usBack').onclick = usRender;
  $('usGen').onclick = () => { $('usPass').value = usRandomPassword(); };
  document.querySelectorAll('input[name="usMode"]').forEach(r => r.onchange = () => { $('usPassRow').classList.toggle('hidden', r.value === 'invite' && r.checked); });
  const groupsChecked = () => [...document.querySelectorAll('.us-groups input:checked')].map(x => +x.value);
  const roleChecked = () => document.querySelector('input[name="usRuolo"]:checked')?.value;

  $('usForm').onsubmit = async e => {
    e.preventDefault();
    $('usSave').disabled = true;
    $('usResult').textContent = 'Salvataggio…';
    try {
      if (isNew) {
        const invite = document.querySelector('input[name="usMode"]:checked').value === 'invite';
        const pass = $('usPass').value;
        await adminUsers('create', {
          nome: $('usNome').value.trim(), email: $('usEmail').value.trim(), ruolo: roleChecked(),
          gruppi: groupsChecked(), invite, password: invite ? undefined : pass,
          redirectTo: location.origin + location.pathname.replace(/servicedesk\/.*$/, '')
        });
        toast(invite ? 'Invito inviato' : 'Utente creato');
        if (!invite) {
          $('content').innerHTML = `<div class="panel"><h3>Utente creato</h3>
            <p>Comunica a <b>${esc($('usNome')?.value || '')}</b> questi dati per il primo accesso:</p>
            <p class="us-cred">Indirizzo: <b>${esc(location.origin + location.pathname.replace(/servicedesk\/.*$/, ''))}</b><br>Email: <b>${esc($('usEmail').value)}</b><br>Password: <b>${esc(pass)}</b></p>
            <button class="primary" id="usDone">Torna all'elenco</button></div>`;
          $('usDone').onclick = usersView;
          return;
        }
      } else {
        await adminUsers('update', { id: u.id, nome: $('usNome').value.trim(), ruolo: isSelf ? undefined : roleChecked(), gruppi: groupsChecked(), password: $('usPass').value || undefined });
        toast('Modifiche salvate');
        if (isSelf) await loadPerms();
      }
      await usersView();
    } catch (err) {
      $('usResult').textContent = err.message;
      $('usSave').disabled = false;
    }
  };
  if ($('usToggle')) $('usToggle').onclick = async () => {
    try { await adminUsers(u.disabled ? 'enable' : 'disable', { id: u.id }); toast(u.disabled ? 'Accesso riattivato' : 'Accesso disattivato'); usersView(); }
    catch (err) { $('usResult').textContent = err.message; }
  };
  if ($('usDelete')) $('usDelete').onclick = () => {
    const b = $('usDelete');
    b.textContent = 'Conferma: elimina definitivamente';
    b.onclick = async () => {
      try { await adminUsers('delete', { id: u.id }); toast('Utente eliminato'); usersView(); }
      catch (err) { $('usResult').textContent = err.message; }
    };
  };
}

// ---------- gruppi ----------
function usGroupsHtml() {
  return `
    <div class="ot-toolbar"><p class="muted-line" style="flex:1;margin:0">Metti le persone nei gruppi: chi è nel gruppo riceve i suoi permessi. Un gruppo senza permessi serve per riservare una sala o un'auto solo ai suoi membri.</p>
      <button class="primary" id="usNewGroup">+ Nuovo gruppo</button></div>
    <div class="us-group-grid">${usState.groups.map(g => {
      const members = usState.users.filter(u => u.gruppi.includes(g.id));
      return `<article class="panel us-group">
        <div class="ag-form-head"><h3>${esc(g.nome)}</h3><button class="secondary compact" data-gedit="${g.id}">Modifica</button></div>
        ${g.descrizione ? `<p class="muted-line">${esc(g.descrizione)}</p>` : ''}
        <div>${(g.permessi || []).length ? g.permessi.map(p => `<span class="us-chip perm">${esc((PERMS[p] || [p])[0])}</span>`).join(' ') : '<small class="muted-line">Nessun permesso</small>'}</div>
        <p class="us-members"><b>${members.length}</b> ${members.length === 1 ? 'persona' : 'persone'}${members.length ? ': ' + members.map(m => esc(m.nome || m.email)).join(', ') : ''}</p>
      </article>`;
    }).join('')}</div>`;
}
function usWireGroups() {
  $('usNewGroup').onclick = () => usGroupForm(null);
  document.querySelectorAll('[data-gedit]').forEach(b => b.onclick = () => usGroupForm(usState.groups.find(g => String(g.id) === b.dataset.gedit)));
}
function usGroupForm(g) {
  const isNew = !g;
  const members = g ? usState.users.filter(u => u.gruppi.includes(g.id)).map(u => u.id) : [];
  $('content').innerHTML = `
    <div class="panel us-form">
      <div class="ag-form-head"><h3>${isNew ? 'Nuovo gruppo' : esc(g.nome)}</h3><button class="secondary compact" id="ugBack">← Gruppi</button></div>
      <form id="ugForm" class="formgrid">
        <label>Nome del gruppo<input id="ugNome" required minlength="2" maxlength="60" value="${esc(g?.nome || '')}" placeholder="Es. Segreteria"></label>
        <label>Descrizione <span class="optional">(facoltativa)</span><input id="ugDesc" value="${esc(g?.descrizione || '')}" placeholder="A cosa serve questo gruppo"></label>
        <div class="full"><b>Permessi del gruppo</b>
          <div class="us-roles">${Object.entries(PERMS).map(([k, [l, d]]) => `<label class="us-role"><input type="checkbox" name="ugPerm" value="${k}" ${g?.permessi?.includes(k) ? 'checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div>
        </div>
        <div class="full ag-people"><b>Persone nel gruppo</b>
          <input id="ugSearch" placeholder="Cerca una persona…">
          <div class="ag-people-list" id="ugMembers">${usState.users.filter(u => !u.disabled).map(u => `<label data-name="${esc(normSearch((u.nome || '') + ' ' + u.email))}"><input type="checkbox" value="${esc(u.id)}" ${members.includes(u.id) ? 'checked' : ''}> ${esc(u.nome || u.email)}</label>`).join('')}</div>
        </div>
        <div class="full button-row">
          <button class="primary" id="ugSave">${isNew ? 'Crea gruppo' : 'Salva gruppo'}</button>
          ${!isNew ? '<button type="button" class="secondary danger-outline" id="ugDelete">Elimina gruppo</button>' : ''}
          <span id="ugResult" class="muted-line"></span>
        </div>
      </form>
    </div>`;
  $('ugBack').onclick = () => { usState.tab = 'gruppi'; usRender(); };
  $('ugSearch').oninput = e => { const q = normSearch(e.target.value); document.querySelectorAll('#ugMembers label').forEach(l => l.classList.toggle('hidden', !!q && !l.dataset.name.includes(q))); };
  $('ugForm').onsubmit = async e => {
    e.preventDefault();
    $('ugSave').disabled = true;
    const data = { nome: $('ugNome').value.trim(), descrizione: $('ugDesc').value.trim() || null, permessi: [...document.querySelectorAll('input[name="ugPerm"]:checked')].map(x => x.value) };
    const chosen = [...document.querySelectorAll('#ugMembers input:checked')].map(x => x.value);
    try {
      let id = g?.id;
      if (isNew) { const rows = await insert('access_groups', data); id = rows[0].id; }
      else await update('access_groups', `id=eq.${id}`, data);
      const removed = members.filter(m => !chosen.includes(m));
      const added = chosen.filter(m => !members.includes(m));
      for (const uid of removed) await api(`/rest/v1/access_group_members?group_id=eq.${id}&user_id=eq.${uid}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      if (added.length) await insert('access_group_members', added.map(uid => ({ group_id: id, user_id: uid })), false);
      toast('Gruppo salvato');
      if (members.includes(user.id) || chosen.includes(user.id)) await loadPerms();
      usState.tab = 'gruppi';
      await usersView();
    } catch (err) {
      $('ugResult').textContent = /duplicate|unique/i.test(err.message) ? 'Esiste già un gruppo con questo nome' : err.message;
      $('ugSave').disabled = false;
    }
  };
  if ($('ugDelete')) $('ugDelete').onclick = () => {
    const b = $('ugDelete');
    b.textContent = 'Conferma eliminazione';
    b.onclick = async () => {
      try { await api(`/rest/v1/access_groups?id=eq.${g.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); toast('Gruppo eliminato'); usState.tab = 'gruppi'; usersView(); }
      catch (err) { $('ugResult').textContent = err.message; }
    };
  };
}

// Da altre schermate (es. Persone): apre "Aggiungi utente" già compilato
window.usAddAccount = async (nome, email) => {
  await usersView();
  const found = usState.users.find(u => String(u.email).toLowerCase() === String(email || '').toLowerCase());
  if (found) return usForm(found);
  usForm(null, { nome, email });
};
