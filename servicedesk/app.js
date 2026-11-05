
const BASE='https://igfpkpcksllmofqfoxkf.supabase.co';
const KEY='sb_publishable_wuq5rwy4w6ca7nvJTbrXzA_izhCmrf9';
let session=null,user=null,profile=null;
let currentView=null;
let previousView=null;
let movementPrefill=null;
let navigationEpoch=0;

function applyTheme(theme){
  const chosen=theme==='dark'?'dark':'light';
  document.documentElement.dataset.theme=chosen;
  localStorage.setItem('archea_sd_theme',chosen);
  const label=$('themeLabel');
  if(label) label.textContent=chosen==='dark'?'Chiaro':'Scuro';
}
function initTheme(){
  const saved=localStorage.getItem('archea_sd_theme');
  const preferred=saved || (window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  applyTheme(preferred);
}
function updateBackButton(){
  const b=$('backBtn');
  if(!b)return;
  b.classList.toggle('hidden',!previousView);
}
function openSubView(kind,fn){
  navigationEpoch++;
  if(currentView!==kind){
    previousView=currentView || (isITRole()?'home':'mine');
    currentView=kind;
  }
  updateBackButton();
  return fn();
}
function goBack(){
  const target=previousView || (isITRole()?'home':'mine');
  previousView=null;
  currentView=null;
  nav(target);
}
const $=i=>document.getElementById(i);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));


// V8 — ordinamento tabelle + export Excel XML (.xls)
function xlsEsc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function safeFileName(v){return String(v||'export').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'export'}
function downloadXls(filename,sheets){
  const ws=sheets.map(sheet=>{
    const rows=(sheet.rows||[]).map(row=>`<Row>${row.map(cell=>`<Cell><Data ss:Type="String">${xlsEsc(cell)}</Data></Cell>`).join('')}</Row>`).join('');
    return `<Worksheet ss:Name="${xlsEsc((sheet.name||'Dati').slice(0,31))}"><Table>${rows}</Table></Worksheet>`;
  }).join('');
  const xml=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${ws}</Workbook>`;
  const blob=new Blob(['\ufeff',xml],{type:'application/vnd.ms-excel;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename.endsWith('.xls')?filename:`${filename}.xls`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function tableRowsForXls(table){
  return [...table.rows].map(r=>[...r.cells].map(c=>c.innerText.replace(/\s+/g,' ').trim()));
}
function inferSortValue(text){
  const t=String(text||'').replace(/\s+/g,' ').trim();
  const n=Number(t.replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,''));
  if(t && /^[-+]?\d[\d.,\s]*$/.test(t) && Number.isFinite(n))return {type:'number',value:n};
  const dm=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);if(dm){const y=+dm[3]<100?2000+(+dm[3]):+dm[3];return {type:'number',value:new Date(y,+dm[2]-1,+dm[1]).getTime()}}
  return {type:'text',value:t.toLocaleLowerCase('it')};
}
function enableTableTools(root=document){
  root.querySelectorAll('table').forEach(table=>{
    if(table.dataset.v8Tools==='1')return;table.dataset.v8Tools='1';
    const ths=[...table.querySelectorAll('thead th')];
    ths.forEach((th,idx)=>{
      th.classList.add('sortable-th');th.title='Ordina questa colonna';th.dataset.sortDir='';
      const marker=document.createElement('span');marker.className='sort-marker';marker.textContent='↕';th.appendChild(marker);
      th.addEventListener('click',e=>{
        if(e.target.closest('button,input,select,a'))return;
        const tbody=table.tBodies[0];if(!tbody)return;
        const dir=th.dataset.sortDir==='asc'?'desc':'asc';ths.forEach(x=>{x.dataset.sortDir='';x.querySelector('.sort-marker')&&(x.querySelector('.sort-marker').textContent='↕')});th.dataset.sortDir=dir;marker.textContent=dir==='asc'?'▲':'▼';
        const rows=[...tbody.rows];rows.sort((a,b)=>{const av=inferSortValue(a.cells[idx]?.innerText||'');const bv=inferSortValue(b.cells[idx]?.innerText||'');let cmp=0;if(av.type==='number'&&bv.type==='number')cmp=av.value-bv.value;else cmp=String(av.value).localeCompare(String(bv.value),'it',{numeric:true,sensitivity:'base'});return dir==='asc'?cmp:-cmp});rows.forEach(r=>tbody.appendChild(r));
      });
    });
    const wrap=table.closest('.tablewrap');
    if(wrap && !wrap.querySelector(':scope > .table-export-row')){
      const tools=document.createElement('div');tools.className='table-export-row';tools.innerHTML='<button type="button" class="ghost compact">Scarica XLS</button>';
      tools.querySelector('button').onclick=()=>downloadXls(`${safeFileName(document.title||'Archea')}_${safeFileName($('title')?.textContent||'tabella')}.xls`,[{name:'Tabella',rows:tableRowsForXls(table)}]);wrap.prepend(tools);
    }
  });
}
const tableObserver=new MutationObserver(()=>enableTableTools($('content')||document));
window.addEventListener('DOMContentLoaded',()=>{const c=$('content');if(c){tableObserver.observe(c,{childList:true,subtree:true});enableTableTools(c)}});
window.addEventListener('error',e=>{if(currentView==='censimento'&&$('content')?.querySelector('.census-loading-shell')){$('content').innerHTML=`<div class="panel error-panel"><h3>Errore durante il rendering del censimento</h3><p>${esc(e?.message||'Errore JavaScript')}</p><button id="retryCensus" class="primary">Riprova</button></div>`;setTimeout(()=>{if($('retryCensus'))$('retryCensus').onclick=()=>census()},0)}});

function warehouseCodeOk(code){return /^M-[A-Z]+\d*$/i.test(String(code||'').trim())}
function normalPositionCodeOk(code){return !!String(code||'').trim()&&!/^M-/i.test(String(code||'').trim())}

function enhanceSelect(id,{placeholder='Seleziona…',searchPlaceholder='Cerca…',searchThreshold=7}={}){
  const select=$(id);
  if(!select||select.dataset.smartSelect==='1')return;
  select.dataset.smartSelect='1';
  select.classList.add('native-select-hidden');

  const wrap=document.createElement('div');
  wrap.className='smart-select';
  select.parentNode.insertBefore(wrap,select);
  wrap.appendChild(select);

  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='smart-select-trigger';
  trigger.setAttribute('aria-haspopup','listbox');
  trigger.setAttribute('aria-expanded','false');
  wrap.appendChild(trigger);

  const menu=document.createElement('div');
  menu.className='smart-select-menu hidden';
  wrap.appendChild(menu);

  const options=[...select.options];
  let search=null;
  if(options.filter(o=>o.value).length>=searchThreshold){
    const searchWrap=document.createElement('div');
    searchWrap.className='smart-select-search-wrap';
    search=document.createElement('input');
    search.type='search';
    search.className='smart-select-search';
    search.placeholder=searchPlaceholder;
    search.autocomplete='off';
    searchWrap.appendChild(search);
    menu.appendChild(searchWrap);
  }

  const list=document.createElement('div');
  list.className='smart-select-list';
  list.setAttribute('role','listbox');
  menu.appendChild(list);

  const labelFor=o=>o.value?(o.textContent||o.value):'— Nessuna selezione';
  options.forEach(o=>{
    const item=document.createElement('button');
    item.type='button';
    item.className='smart-select-option';
    item.dataset.value=o.value;
    item.dataset.search=(o.textContent||'').toLowerCase();
    item.setAttribute('role','option');
    item.innerHTML=`<span>${esc(labelFor(o))}</span><span class="smart-select-check">✓</span>`;
    item.onclick=()=>{
      select.value=o.value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      sync();close();
    };
    list.appendChild(item);
  });

  const sync=()=>{
    const selected=select.options[select.selectedIndex];
    const hasValue=!!selected?.value;
    trigger.innerHTML=`<span class="smart-select-value ${hasValue?'':'is-placeholder'}">${esc(hasValue?(selected.textContent||selected.value):placeholder)}</span><span class="smart-select-chevron">⌄</span>`;
    [...list.children].forEach(el=>{
      const active=el.dataset.value===select.value;
      el.classList.toggle('selected',active);
      el.setAttribute('aria-selected',active?'true':'false');
    });
  };
  const close=()=>{menu.classList.add('hidden');trigger.setAttribute('aria-expanded','false');wrap.classList.remove('open')};
  const open=()=>{
    document.querySelectorAll('.smart-select.open').forEach(x=>{if(x!==wrap)x.querySelector('.smart-select-menu')?.classList.add('hidden');x.classList.remove('open');x.querySelector('.smart-select-trigger')?.setAttribute('aria-expanded','false')});
    menu.classList.remove('hidden');trigger.setAttribute('aria-expanded','true');wrap.classList.add('open');
    if(search){search.value='';[...list.children].forEach(el=>el.classList.remove('filtered-out'));setTimeout(()=>search.focus(),0)}
  };
  trigger.onclick=()=>wrap.classList.contains('open')?close():open();
  select.addEventListener('change',sync);
  if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();[...list.children].forEach(el=>el.classList.toggle('filtered-out',q&&!el.dataset.search.includes(q)))};
  wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){close();trigger.focus()}});
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
  sync();
}
const fmt=d=>d?new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(new Date(d)):'—';
const num=id=>`TKT-${new Date().getFullYear()}-${String(id).padStart(5,'0')}`;
const badge=s=>`<span class="badge ${s==='APERTO'?'open':s==='IN LAVORAZIONE'?'working':s==='CHIUSO'?'closed':''}">${esc(s)}</span>`;
const priorityBadge=p=>{
  p=p||'NORMALE';
  const c=p==='URGENTE'?'prio-urgent':p==='ALTA'?'prio-high':p==='BASSA'?'prio-low':'prio-normal';
  return `<span class="badge ${c}">${esc(p)}</span>`;
};
function toast(t){$('toast').textContent=t;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2200)}
function page(t,s=''){$('title').textContent=t;$('subtitle').textContent=s}
function save(s){
  session=s;
  localStorage.setItem('archea_sd_session',JSON.stringify(s));
}
function clear(){
  session=user=profile=null;
  localStorage.removeItem('archea_sd_session');
}

let refreshPromise=null;

async function refreshSession(){
  if(refreshPromise) return refreshPromise;

  refreshPromise=(async()=>{
    try{
      if(!session?.refresh_token) throw new Error('Refresh token mancante');

      const r=await fetch(BASE+'/auth/v1/token?grant_type=refresh_token',{
        method:'POST',
        headers:{
          'apikey':KEY,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({refresh_token:session.refresh_token})
      });

      const tx=await r.text();
      let d=null;
      try{d=tx?JSON.parse(tx):null}catch{d=tx}

      if(!r.ok || !d?.access_token){
        throw new Error((d&&(d.msg||d.message||d.error_description||d.error))||`Refresh HTTP ${r.status}`);
      }

      save(d);
      user=d.user||user;
      return d;
    }catch(err){
      clear();
      throw err;
    }finally{
      refreshPromise=null;
    }
  })();

  return refreshPromise;
}

function showSessionExpired(){
  const login=$('login'), appEl=$('app');
  if(appEl) appEl.classList.add('hidden');
  if(login) login.classList.remove('hidden');
  if($('loginErr')){
    $('loginErr').textContent='La sessione è scaduta. Accedi di nuovo: il ticket che stavi compilando è stato conservato.';
  }
}

async function api(path,{method='GET',body=null,auth=true,headers={},_retry=true}={}){
  const h={'apikey':KEY,'Content-Type':'application/json',...headers};
  if(auth&&session?.access_token) h.Authorization='Bearer '+session.access_token;

  const r=await fetch(BASE+path,{
    method,
    headers:h,
    body:body?JSON.stringify(body):null
  });

  const tx=await r.text();
  let d=null;
  try{d=tx?JSON.parse(tx):null}catch{d=tx}

  const msg=typeof d==='object'&&d
    ? String(d.msg||d.message||d.error_description||d.error||'')
    : String(d||'');

  const authExpired=r.status===401 || /jwt expired|token.*expired|invalid jwt/i.test(msg);

  if(auth && _retry && authExpired && session?.refresh_token){
    try{
      await refreshSession();
      return api(path,{method,body,auth,headers,_retry:false});
    }catch(refreshErr){
      showSessionExpired();
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
  }

  if(!r.ok){
    throw new Error((d&&(d.msg||d.message||d.error_description||d.error))||`HTTP ${r.status}`);
  }

  return d;
}

async function select(t,q=''){return api(`/rest/v1/${t}?${q}`)}
async function selectAll(t,q='',pageSize=1000){
  const out=[];let offset=0;
  while(true){
    const join=q?'&':'';
    const page=await select(t,`${q}${join}limit=${pageSize}&offset=${offset}`);
    out.push(...page);
    if(page.length<pageSize)break;
    offset+=pageSize;
    if(offset>50000)throw new Error(`Troppi record durante il caricamento di ${t}`);
  }
  return out;
}
async function insert(t,b,ret=true){return api(`/rest/v1/${t}`,{method:'POST',body:b,headers:{Prefer:ret?'return=representation':'return=minimal'}})}
async function update(t,f,b){return api(`/rest/v1/${t}?${f}`,{method:'PATCH',body:b,headers:{Prefer:'return=representation'}})}
async function rpc(fn,b={}){return api(`/rest/v1/rpc/${fn}`,{method:'POST',body:b})}
async function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
async function notify(){ /* V1.6: notifiche generate lato database */ }
async function profileByEmail(){ return null; }
async function allIT(){ return []; }

async function refreshNotifications(){
  const d=await select('notifications',`select=*&user_id=eq.${user.id}&order=created_at.desc&limit=30`);
  const unread=d.filter(n=>!n.is_read).length;
  $('bellCount').textContent=unread;$('bellCount').classList.toggle('hidden',unread===0);
  $('notificationList').innerHTML=d.length?d.map(n=>`<div class="notification-item ${n.is_read?'':'unread'}" data-nid="${n.id}" data-tid="${n.ticket_id||''}">
    <b>${esc(n.title)}</b><div>${esc(n.message)}</div><small>${fmt(n.created_at)}</small></div>`).join(''):'<div class="empty">Nessuna notifica</div>';
  document.querySelectorAll('[data-nid]').forEach(x=>x.onclick=async()=>{await update('notifications',`id=eq.${x.dataset.nid}`,{is_read:true});$('notificationPanel').classList.add('hidden');if(x.dataset.tid)detail(+x.dataset.tid);refreshNotifications()});
}
$('bellBtn').onclick=()=>{$('notificationPanel').classList.toggle('hidden');if(!$('notificationPanel').classList.contains('hidden'))refreshNotifications()}
$('markAllRead').onclick=async()=>{await update('notifications',`user_id=eq.${user.id}&is_read=eq.false`,{is_read:true});refreshNotifications()}

function table(rows,it=false,quick=false){
  if(!rows.length)return'<p class="empty-state">Nessun ticket.</p>';
  return `<div class="tablewrap ticket-table-wrap"><table class="ticket-table ${it?'ticket-table-it':'ticket-table-client'}">
    <thead><tr>
      <th>Ticket</th>
      ${it?'<th>Assegnato a</th><th>Priorità</th>':''}
      ${it?'<th>Richiedente</th>':''}
      <th>Categoria</th>
      <th>Oggetto</th>
      <th>Stato</th>
      <th>Data apertura</th>
      ${it&&quick?'<th aria-label="Azioni"></th>':''}
    </tr></thead>
    <tbody>${rows.map(x=>`<tr class="${quick?'':'click'}" ${quick?'':`data-id="${x.id}"`}>
      <td data-label="Ticket" class="ticket-number"><b class="ticket-link" data-open="${x.id}">${x.numero_ticket||num(x.id)}</b></td>
      ${it?`<td data-label="Assegnato a" class="ticket-assignee">${x.assegnato_a?`<span class="assignee">${esc(x.assegnato_a)}</span>`:'<span class="unassigned">NON ASSEGNATO</span>'}</td>
      <td data-label="Priorità" class="ticket-priority">${priorityBadge(x.priorita)}</td>`:''}
      ${it?`<td data-label="Richiedente" class="ticket-requester">${esc(x.richiedente_nome||x.richiedente_email)}</td>`:''}
      <td data-label="Categoria" class="ticket-category">${esc(x.categoria)}</td>
      <td data-label="Oggetto" class="ticket-subject">${esc(x.oggetto)}</td>
      <td data-label="Stato" class="ticket-status">${badge(x.stato)}</td>
      <td data-label="Data apertura" class="ticket-date">${fmt(x.created_at)}</td>
      ${it&&quick?`<td data-label="Azioni" class="row-actions">${!x.assegnato_a&&x.stato!=='CHIUSO'?`<button class="secondary compact take-row" data-take="${x.id}">Prendi in carico</button>`:''}</td>`:''}
    </tr>`).join('')}</tbody>
  </table></div>`;
}
function wire(){
  document.querySelectorAll('[data-id]').forEach(r=>r.onclick=()=>openSubView('ticket-detail',()=>detail(+r.dataset.id)));
  document.querySelectorAll('[data-open]').forEach(r=>r.onclick=e=>{e.stopPropagation();openSubView('ticket-detail',()=>detail(+r.dataset.open))});
}
function dateOnly(d){return d?new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'}).format(new Date(d+'T12:00:00')):'—'}
function bookingStatusBadge(s){
  const cls={
    'RICHIESTA':'book-request',
    'DA VERIFICARE':'book-check',
    'CONFERMATA':'book-confirmed',
    'CONSEGNATA':'book-delivered',
    'RESTITUITA':'book-returned'
  }[s]||'';
  return `<span class="badge ${cls}">${esc(s||'RICHIESTA')}</span>`;
}
function currentITName(){return profile?.nome||user?.email||'IT'}
function isITRole(){return profile?.ruolo==='IT'||profile?.ruolo==='SUPER_IT'}
function isSuperIT(){return profile?.ruolo==='SUPER_IT'}
function isHR(){return profile?.ruolo==='HR'}
function isHROrIT(){return isHR()||isITRole()}
function canImportHR(){return isHR()||isSuperIT()}
function canManageHRValues(){return isHR()||isSuperIT()}
function canApproveHR(){return isHR()||isSuperIT()}
function canRequestConflictResolution(){return isITRole()}
function canConfirmConflictResolution(){return isSuperIT()}
function assetStatusBadge(s){
  const cls={
    'DISPONIBILE':'asset-available',
    'ASSEGNATO':'asset-assigned',
    'PRENOTATO':'asset-booked',
    'IN PRESTITO':'asset-loan',
    'IN MANUTENZIONE':'asset-maint',
    'GUASTO':'asset-broken',
    'DISMESSO':'asset-retired',
    'VENDUTO':'asset-sold',
    'DA VERIFICARE':'asset-check'
  }[s]||'asset-check';
  return `<span class="badge ${cls}">${esc(s||'DA VERIFICARE')}</span>`;
}
function verifyBadge(s){
  const cls={
    'VERIFICATO':'verify-ok',
    'DA VERIFICARE':'verify-warn',
    'DUBBIO':'verify-doubt',
    'NON TROVATO':'verify-missing',
    'ASSEGNAZIONE DA CONFERMARE':'verify-warn'
  }[s]||'verify-warn';
  return `<span class="badge ${cls}">${esc(s||'DA VERIFICARE')}</span>`;
}

function assetTypeBadge(a){
  return a?.is_label_only
    ? '<span class="badge asset-label-free">ETICHETTA LIBERA</span>'
    : assetStatusBadge(a?.status);
}
function normSearch(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}
function assetSearchNeedles(q){
  const n=normSearch(q);
  const aliases={
    'laptop':['laptop','portatile','notebook','macbook'],
    'portatile':['laptop','portatile','notebook','macbook'],
    'notebook':['laptop','portatile','notebook','macbook'],
    'pc':['pc fisso','workstation','desktop'],
    'desktop':['pc fisso','workstation','desktop'],
    'telefono':['telefono','smartphone','iphone','android'],
    'tablet':['tablet','ipad'],
    'schermo':['monitor','display','schermo']
  };
  return aliases[n]||[n];
}
function matchesAssetSearch(a,q){
  if(!q)return true;
  const hay=normSearch(`${a.asset_code||''} ${a.category||''} ${a.category_raw||''} ${a.brand||''} ${a.model||''} ${a.serial_number||''} ${a.site||''} ${a.position||''} ${a.assigned_user_name||''} ${a.assigned_user_email||''} ${a.current_person_name||''}`);
  return assetSearchNeedles(q).some(n=>hay.includes(n));
}

function relTime(d){
  if(!d)return '—';
  const s=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/1000));
  if(s<60)return 'adesso';
  if(s<3600)return `${Math.floor(s/60)} min fa`;
  if(s<86400)return `${Math.floor(s/3600)} h fa`;
  return `${Math.floor(s/86400)} gg fa`;
}
function ageClass(d){
  const h=(Date.now()-new Date(d).getTime())/3600000;
  return h>=72?'age-old':h>=24?'age-mid':'';
}



async function userHome(){const epoch=navigationEpoch;page('Service Desk','Apri una richiesta o controlla i tuoi ticket');const d=await select('tickets',`select=*&richiedente_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=5`);if(epoch!==navigationEpoch)return;$('content').innerHTML=`<div class="userhero"><h3>Come possiamo aiutarti?</h3><p>Puoi aprire ticket e vedere solo le tue richieste.</p><button id="openNow" class="primary">Apri un ticket</button></div><div class="panel"><h3>Le tue richieste recenti</h3>${table(d)}</div>`;$('openNow').onclick=()=>nav('new');wire()}
async function home(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page(isSuperIT()?'Dashboard SUPER IT':'Dashboard','Panoramica operativa del Service Desk');

  const d=await select('tickets','select=*&order=updated_at.desc.nullslast,created_at.desc');
  if(epoch!==navigationEpoch)return;

  if(!isSuperIT()){
    $('content').innerHTML=`
      <div class="metrics">
        <div class="metric"><span>Da prendere in carico</span><b>${d.filter(x=>!x.assigned_to&&x.stato!=='CHIUSO').length}</b></div>
        <div class="metric"><span>In lavorazione</span><b>${d.filter(x=>x.stato==='IN LAVORAZIONE').length}</b></div>
        <div class="metric"><span>Urgenti</span><b>${d.filter(x=>x.priorita==='URGENTE'&&x.stato!=='CHIUSO').length}</b></div>
        <div class="metric"><span>Aperti visibili</span><b>${d.filter(x=>x.stato!=='CHIUSO').length}</b></div>
      </div>
      <div class="panel"><h3>Ticket recenti</h3>${table(d.slice(0,10),true)}</div>`;
    wire();
    return;
  }

  const its=await select('profiles','select=id,nome,email,ruolo&ruolo=in.(IT,SUPER_IT)&order=nome.asc');
  if(epoch!==navigationEpoch)return;
  const workload=its.map(itp=>({
    nome:itp.nome||itp.email,
    n:d.filter(t=>t.assigned_to===itp.id&&t.stato!=='CHIUSO').length
  }));

  $('content').innerHTML=`
    <div class="metrics">
      <div class="metric"><span>Non assegnati</span><b>${d.filter(x=>!x.assigned_to&&x.stato!=='CHIUSO').length}</b></div>
      <div class="metric"><span>In lavorazione</span><b>${d.filter(x=>x.stato==='IN LAVORAZIONE').length}</b></div>
      <div class="metric"><span>Urgenti</span><b>${d.filter(x=>x.priorita==='URGENTE'&&x.stato!=='CHIUSO').length}</b></div>
      <div class="metric"><span>Senza attività &gt;48h</span><b>${d.filter(x=>x.stato!=='CHIUSO'&&((Date.now()-new Date(x.updated_at||x.created_at))/3600000)>48).length}</b></div>
    </div>
    <div class="dashboard-grid">
      <div class="panel">
        <h3>Carico team IT</h3>
        ${workload.map(w=>`<div class="workload-row"><span>${esc(w.nome)}</span><b>${w.n}</b></div>`).join('')}
      </div>
      <div class="panel">
        <h3>Ticket più vecchi ancora aperti</h3>
        ${table([...d].filter(x=>x.stato!=='CHIUSO').sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).slice(0,6),true)}
      </div>
    </div>`;
  wire();
}
function newTicket(){
  page('Nuovo ticket','Apri una richiesta al team IT');

  $('content').innerHTML=`<div class="panel">
    <form id="ticketForm" class="formgrid">

      ${isITRole()?`<label>Richiedente
        <select id="requesterMode">
          <option value="ME">Me stesso</option>
          <option value="OTHER">Altro utente</option>
        </select>
      </label>
      <label id="requesterEmailWrap" class="hidden">Email richiedente
        <input id="requesterEmail" type="email" placeholder="nome.cognome@archea.it">
      </label>
      <label>Origine
        <select id="origin">
          <option>Portale</option>
          <option>Telefono</option>
          <option>Presenza in IT</option>
          <option>Email</option>
          <option>Altro</option>
        </select>
      </label>
      <label>Sede<input id="ticketSite" placeholder="Firenze, Milano, Roma..."></label>`:''}

      <label>Categoria<select id="cat" required>
        <option value="">Seleziona...</option>
        <option>Supporto IT</option>
        <option>Installazioni</option>
        <option>Manutenzioni</option>
        <option>Hardware</option>
        <option>Accessi</option>
        <option>Rete / Wi-Fi</option>
        <option>Movimento persona</option>
        <option>Prenotazione materiale</option>
        <option>Altro</option>
      </select></label>
      <label>Oggetto<input id="sub" required></label>

      <div id="bookingFields" class="full booking-fields hidden">
        <div class="section-title">
          <h3>Richiesta materiale</h3>
          <p>La disponibilità verrà verificata dal reparto IT.</p>
        </div>
        <div class="formgrid">
          <label>Materiale<select id="matType">
            <option value="">Seleziona...</option>
            <option>Matterport</option>
            <option>iPad</option>
            <option>Laptop Dell</option>
            <option>MacBook</option>
            <option>Altro</option>
          </select></label>
          <label>Quantità<input id="matQty" type="number" min="1" value="1"></label>
          <label>Data ritiro<input id="pickupDate" type="date"></label>
          <label>Restituzione prevista<input id="returnDate" type="date"></label>
          <label>Sede<input id="bookSite"></label>
          <label>Motivo / progetto<input id="bookReason"></label>
          <label class="full">Accessori richiesti<input id="bookAccessories"></label>
          <label class="full">Note materiale <span class="optional">(facoltative)</span>
            <textarea id="bookNotes" rows="3"></textarea>
          </label>
        </div>
      </div>

      <label class="full">Descrizione<textarea id="desc" rows="7" required></textarea></label>
      <div class="full"><button class="primary">Invia ticket</button></div>
    </form>
    <p id="result"></p>
  </div>`;

  if(isITRole()){
    $('requesterMode').onchange=()=>{
      const other=$('requesterMode').value==='OTHER';
      $('requesterEmailWrap').classList.toggle('hidden',!other);
      $('requesterEmail').required=other;
    };
  }

  const bookingIds=['matType','matQty','pickupDate','returnDate','bookSite','bookReason','bookAccessories','bookNotes'];
  const toggleBooking=()=>{
    const on=$('cat').value==='Prenotazione materiale';
    $('bookingFields').classList.toggle('hidden',!on);
    bookingIds.forEach(id=>{
      if($(id))$(id).required=on&&['matType','pickupDate','returnDate','bookSite','bookReason'].includes(id);
    });
  };
  $('cat').onchange=toggleBooking;
  toggleBooking();

  $('ticketForm').onsubmit=async e=>{
    e.preventDefault();
    $('result').textContent='';

    try{
      const isBooking=$('cat').value==='Prenotazione materiale';
      if(isBooking&&$('returnDate').value<$('pickupDate').value)
        throw new Error('La restituzione non può essere precedente al ritiro.');

      let requesterEmail=user.email;
      let requesterName=profile.nome;

      if(isITRole()&&$('requesterMode').value==='OTHER'){
        requesterEmail=$('requesterEmail').value.trim().toLowerCase();
        if(!requesterEmail.endsWith('@archea.it'))
          throw new Error('Inserisci una mail aziendale @archea.it.');
        const p=await select('profiles',`select=*&email=eq.${encodeURIComponent(requesterEmail)}`);
        requesterName=p[0]?.nome||requesterEmail;
      }

      const rows=await insert('tickets',{
        categoria:$('cat').value,
        oggetto:$('sub').value.trim(),
        descrizione:$('desc').value.trim(),
        stato:'APERTO',
        priorita:'NORMALE',
        richiedente_nome:requesterName,
        richiedente_email:requesterEmail,
        created_by:user.id,
        created_by_name:profile.nome,
        origine:isITRole()?$('origin').value:'Portale',
        sede:isITRole()?($('ticketSite').value.trim()||null):null
      });

      const d=rows[0],n=num(d.id);
      await update('tickets',`id=eq.${d.id}`,{numero_ticket:n});

      if(isBooking){
        await insert('material_bookings',{
          ticket_id:d.id,
          requester_name:requesterName,
          requester_email:requesterEmail,
          material_type:$('matType').value,
          quantity:+$('matQty').value||1,
          pickup_date:$('pickupDate').value,
          planned_return_date:$('returnDate').value,
          site:$('bookSite').value.trim(),
          reason:$('bookReason').value.trim(),
          requested_accessories:$('bookAccessories').value.trim()||null,
          requester_notes:$('bookNotes').value.trim()||null,
          status:'RICHIESTA'
        },false);
      }

      try{
        await api('/functions/v1/telegram-new-ticket',{method:'POST',body:{ticket_id:d.id}});
      }catch(e){console.warn('Telegram non inviato:',e.message)}

      await insert('ticket_history',{
        ticket_id:d.id,
        evento:isITRole()&&requesterEmail!==user.email
          ?`Ticket creato da ${profile.nome} per conto di ${requesterEmail}`
          :'Ticket creato',
        autore:profile.nome
      },false);

      e.target.reset();
      toggleBooking();
      $('result').textContent=`Ticket ${n} creato.`;
      toast('Ticket creato');
      refreshNotifications();
    }catch(err){
      $('result').textContent=err.message;
    }
  };
}
async function mine(){const epoch=navigationEpoch;page('I miei ticket','Storico delle tue richieste');const d=await select('tickets',`select=*&richiedente_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc`);if(epoch!==navigationEpoch)return;$('content').innerHTML=`<div class="panel">${table(d)}</div>`;wire()}
async function it(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page('Gestione IT','Coda operativa del reparto');

  const d=await select('tickets','select=*&order=updated_at.desc.nullslast,created_at.desc');
  const its=await select('profiles','select=id,nome,email,ruolo&ruolo=in.(IT,SUPER_IT)&order=nome.asc');
  if(epoch!==navigationEpoch)return;

  let filter='OPEN',search='',category='',assignee='',order='old';

  const categories=[...new Set(d.map(x=>x.categoria).filter(Boolean))].sort();

  $('content').innerHTML=`
    <div class="queue-stats">
      <button class="queue-card active" data-filter="OPEN"><span>Aperti</span><b>${d.filter(x=>x.stato!=='CHIUSO').length}</b></button>
      <button class="queue-card" data-filter="UNASSIGNED"><span>Non assegnati</span><b>${d.filter(x=>!x.assigned_to&&x.stato!=='CHIUSO').length}</b></button>
      <button class="queue-card" data-filter="MINE"><span>I miei</span><b>${d.filter(x=>x.assigned_to===user.id&&x.stato!=='CHIUSO').length}</b></button>
      <button class="queue-card" data-filter="URGENT"><span>Urgenti</span><b>${d.filter(x=>x.priorita==='URGENTE'&&x.stato!=='CHIUSO').length}</b></button>
      <button class="queue-card" data-filter="STALE"><span>Fermi &gt;48h</span><b>${d.filter(x=>x.stato!=='CHIUSO'&&((Date.now()-new Date(x.updated_at||x.created_at))/3600000)>48).length}</b></button>
    </div>

    <div class="panel">
      <div class="queue-toolbar advanced">
        <input id="queueSearch" placeholder="Cerca ticket, nome, email, oggetto...">
        <select id="queueCategory"><option value="">Tutte le categorie</option>${categories.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
        ${isSuperIT()?`<select id="queueAssignee"><option value="">Tutti gli IT</option><option value="UNASSIGNED">Non assegnati</option>${its.map(i=>`<option value="${i.id}">${esc(i.nome||i.email)}</option>`).join('')}</select>`:''}
        <select id="queueOrder">
          <option value="old">Più vecchi prima</option>
          <option value="new">Più recenti prima</option>
          <option value="priority">Priorità</option>
          <option value="activity">Ultima attività</option>
        </select>
      </div>
      <div id="queueTable"></div>
    </div>`;

  const rank={URGENTE:4,ALTA:3,NORMALE:2,BASSA:1};

  const render=()=>{
    let rows=d.filter(x=>{
      if(filter==='OPEN'&&x.stato==='CHIUSO')return false;
      if(filter==='UNASSIGNED'&&(x.assigned_to||x.stato==='CHIUSO'))return false;
      if(filter==='MINE'&&(x.assigned_to!==user.id||x.stato==='CHIUSO'))return false;
      if(filter==='URGENT'&&(x.priorita!=='URGENTE'||x.stato==='CHIUSO'))return false;
      if(filter==='STALE'&&(x.stato==='CHIUSO'||((Date.now()-new Date(x.updated_at||x.created_at))/3600000)<=48))return false;
      if(category&&x.categoria!==category)return false;
      if(assignee==='UNASSIGNED'&&x.assigned_to)return false;
      if(assignee&&assignee!=='UNASSIGNED'&&x.assigned_to!==assignee)return false;
      if(search){
        const h=`${x.numero_ticket||''} ${x.richiedente_nome||''} ${x.richiedente_email||''} ${x.oggetto||''} ${x.categoria||''} ${x.sede||''}`.toLowerCase();
        if(!h.includes(search.toLowerCase()))return false;
      }
      return true;
    });

    rows=[...rows].sort((a,b)=>{
      if(order==='priority')return (rank[b.priorita||'NORMALE']-rank[a.priorita||'NORMALE'])||new Date(a.created_at)-new Date(b.created_at);
      if(order==='new')return new Date(b.created_at)-new Date(a.created_at);
      if(order==='activity')return new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at);
      return new Date(a.created_at)-new Date(b.created_at);
    });

    $('queueTable').innerHTML=`
      <div class="tablewrap"><table>
        <thead><tr><th>Ticket</th><th>Assegnato</th><th>Priorità</th><th>Richiedente</th><th>Categoria</th><th>Stato</th><th>Ultima attività</th><th></th></tr></thead>
        <tbody>${rows.map(x=>`<tr class="${ageClass(x.updated_at||x.created_at)}">
          <td><b class="ticket-link" data-open="${x.id}">${x.numero_ticket||num(x.id)}</b><small class="subline">${esc(x.sede||'')}</small></td>
          <td>${x.assegnato_a?esc(x.assegnato_a):'<span class="unassigned">NON ASSEGNATO</span>'}</td>
          <td>${priorityBadge(x.priorita)}</td>
          <td>${esc(x.richiedente_nome||x.richiedente_email)}</td>
          <td>${esc(x.categoria)}</td>
          <td>${badge(x.stato)}</td>
          <td>${relTime(x.updated_at||x.created_at)}</td>
          <td>${!x.assigned_to&&x.stato!=='CHIUSO'?`<button class="secondary compact take-row" data-take="${x.id}">Prendi</button>`:''}</td>
        </tr>`).join('')}</tbody>
      </table></div>`;

    document.querySelectorAll('[data-open]').forEach(x=>x.onclick=()=>openSubView('ticket-detail',()=>detail(+x.dataset.open)));
    document.querySelectorAll('[data-take]').forEach(btn=>btn.onclick=async()=>{
      const id=+btn.dataset.take;
      await update('tickets',`id=eq.${id}`,{
        assigned_to:user.id,
        assegnato_a:currentITName(),
        stato:'IN LAVORAZIONE'
      });
      await insert('ticket_history',{ticket_id:id,evento:`Preso in carico da ${currentITName()}`,autore:currentITName()},false);
      toast('Ticket preso in carico');
      it();
    });
  };

  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{
    filter=b.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');render();
  });
  $('queueSearch').oninput=e=>{search=e.target.value;render()};
  $('queueCategory').onchange=e=>{category=e.target.value;render()};
  if($('queueAssignee'))$('queueAssignee').onchange=e=>{assignee=e.target.value;render()};
  $('queueOrder').onchange=e=>{order=e.target.value;render()};
  render();
}
async function calendar(){const epoch=navigationEpoch;if(!isITRole())return userHome();page('Calendario','Appuntamenti collegati ai ticket');const d=await select('appointments','select=*,tickets(numero_ticket,oggetto,richiedente_nome)&order=start_at.asc');if(epoch!==navigationEpoch)return;$('content').innerHTML=`<div class="panel"><h3>Appuntamenti</h3>${d.length?d.map(a=>`<div class="appointment"><b>${fmt(a.start_at)} • ${esc(a.modalita)}</b><div>${esc(a.tickets?.numero_ticket||'')} — ${esc(a.tickets?.oggetto||'')}</div><small>${esc(a.tickets?.richiedente_nome||'')} • ${a.durata_minuti} min</small></div>`).join(''):'<p>Nessun appuntamento.</p>'}</div>`}
async function bookings(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page('Prenotazioni','Richieste materiale e verbali di consegna');

  const rows=await select('material_bookings',
    'select=*,tickets(numero_ticket,oggetto,stato,priorita)&order=created_at.desc');

  if(epoch!==navigationEpoch)return;
  const counts={
    request:rows.filter(x=>x.status==='RICHIESTA').length,
    check:rows.filter(x=>x.status==='DA VERIFICARE').length,
    confirmed:rows.filter(x=>x.status==='CONFERMATA').length,
    delivered:rows.filter(x=>x.status==='CONSEGNATA').length
  };

  $('content').innerHTML=`
    <div class="metrics booking-metrics">
      <div class="metric"><span>Richieste</span><b>${counts.request}</b></div>
      <div class="metric"><span>Da verificare</span><b>${counts.check}</b></div>
      <div class="metric"><span>Confermate</span><b>${counts.confirmed}</b></div>
      <div class="metric"><span>Consegnate</span><b>${counts.delivered}</b></div>
    </div>
    <div class="panel">
      <div class="queue-toolbar">
        <input id="bookingSearch" placeholder="Cerca persona, ticket, materiale, asset...">
        <select id="bookingStatusFilter">
          <option value="">Tutti gli stati</option>
          <option>RICHIESTA</option>
          <option>DA VERIFICARE</option>
          <option>CONFERMATA</option>
          <option>CONSEGNATA</option>
          <option>RESTITUITA</option>
        </select>
      </div>
      <div id="bookingsList"></div>
    </div>`;

  const render=()=>{
    const q=$('bookingSearch').value.toLowerCase().trim();
    const st=$('bookingStatusFilter').value;
    const filtered=rows.filter(x=>{
      if(st&&x.status!==st)return false;
      if(q){
        const h=`${x.requester_name||''} ${x.requester_email||''} ${x.material_type||''} ${x.asset_code||''} ${x.asset_model||''} ${x.tickets?.numero_ticket||''}`.toLowerCase();
        if(!h.includes(q))return false;
      }
      return true;
    });

    $('bookingsList').innerHTML=filtered.length?filtered.map(b=>`
      <div class="booking-card" data-booking="${b.id}">
        <div>
          <div class="booking-card-title">
            <b>${esc(b.material_type)} × ${b.quantity}</b>
            ${bookingStatusBadge(b.status)}
          </div>
          <div class="booking-meta">
            <span>${esc(b.requester_name||b.requester_email)}</span>
            <span>${esc(b.tickets?.numero_ticket||'')}</span>
            <span>${dateOnly(b.pickup_date)} → ${dateOnly(b.planned_return_date)}</span>
            <span>${esc(b.site)}</span>
          </div>
          ${b.asset_code?`<div class="assigned-asset">Asset assegnato: <b>${esc(b.asset_code)}</b>${b.asset_model?` — ${esc(b.asset_model)}`:''}</div>`:''}
        </div>
        <button class="secondary">Gestisci</button>
      </div>`).join(''):'<div class="empty">Nessuna prenotazione.</div>';

    document.querySelectorAll('[data-booking]').forEach(x=>x.onclick=()=>openSubView('booking-detail',()=>bookingDetail(+x.dataset.booking)));
  };

  $('bookingSearch').oninput=render;
  $('bookingStatusFilter').onchange=render;
  render();
}

async function bookingDetail(id){
  if(!isITRole())return userHome();
  const rows=await select('material_bookings',`select=*,tickets(numero_ticket,oggetto,stato,priorita,richiedente_nome,richiedente_email)&id=eq.${id}`);
  if(!rows.length)return;
  const b=rows[0];

  const assets=await select('assets','select=id,asset_code,category,brand,model,serial_number,status,site,verification_status,is_label_only&is_label_only=eq.false&status=in.(DISPONIBILE,PRENOTATO,IN PRESTITO,DA VERIFICARE)&order=asset_code.asc');
  const currentAsset=b.asset_id?assets.find(a=>a.id===b.asset_id):null;

  page('Prenotazione materiale',b.tickets?.numero_ticket||'');

  $('content').innerHTML=`
    <div class="panel booking-summary">
      <div class="it-management-head">
        <div><h3>${esc(b.material_type)} × ${b.quantity}</h3><p class="muted-line">${esc(b.requester_name||b.requester_email)} • ${esc(b.site)}</p></div>
        ${bookingStatusBadge(b.status)}
      </div>
      <div class="booking-grid">
        <div><span>Ritiro</span><b>${dateOnly(b.pickup_date)}</b></div>
        <div><span>Restituzione prevista</span><b>${dateOnly(b.planned_return_date)}</b></div>
        <div><span>Motivo / progetto</span><b>${esc(b.reason)}</b></div>
        <div><span>Accessori richiesti</span><b>${esc(b.requested_accessories||'—')}</b></div>
      </div>
      ${b.requester_notes?`<div class="info-box"><b>Note utente:</b> ${esc(b.requester_notes)}</div>`:''}
      <button id="openBookingTicket" class="ghost">Apri ticket collegato</button>
    </div>

    <div class="panel">
      <h3>Gestione IT materiale</h3>
      <div class="formgrid">
        <label>Stato prenotazione<select id="bookStatus">
          <option>RICHIESTA</option><option>DA VERIFICARE</option><option>CONFERMATA</option><option>PRONTA</option><option>CONSEGNATA</option><option>RESTITUITA</option>
        </select></label>

        <label>Asset dal censimento<select id="bookingAsset">
          <option value="">Seleziona asset...</option>
          ${assets.map(a=>`<option value="${a.id}">${esc(a.asset_code)} — ${esc([a.brand,a.model].filter(Boolean).join(' ')||a.category||'')} — ${esc(a.status)}</option>`).join('')}
        </select></label>

        <label>Codice asset<input id="assetCode" value="${esc(b.asset_code||'')}" readonly></label>
        <label>Descrizione / modello<input id="assetModel" value="${esc(b.asset_model||'')}" readonly></label>
        <label>Seriale<input id="assetSerial" value="${esc(b.asset_serial||'')}" readonly></label>
        <label class="full">Accessori consegnati<input id="deliveredAccessories" value="${esc(b.delivered_accessories||'')}"></label>
        <label>Data restituzione effettiva<input id="actualReturn" type="date" value="${b.actual_return_date||''}"></label>
        <label>Stato al rientro<select id="returnCondition">
          <option value="">—</option><option>OK</option><option>DA VERIFICARE</option><option>DANNEGGIATO</option><option>ACCESSORIO MANCANTE</option>
        </select></label>
        <label class="full">Note rientro<textarea id="returnNotes" rows="2">${esc(b.return_notes||'')}</textarea></label>
        <label class="full">Note IT <span class="optional">(facoltative)</span><textarea id="bookItNotes" rows="3">${esc(b.it_notes||'')}</textarea></label>
      </div>
      <div class="button-row">
        <button id="saveBooking" class="primary">Salva prenotazione</button>
        <button id="printDelivery" class="secondary">Genera verbale / PDF</button>
      </div>
      <p class="muted-line">L'asset viene scelto dal censimento e il suo stato viene aggiornato automaticamente in base alla prenotazione.</p>
    </div>`;

  $('bookStatus').value=b.status||'RICHIESTA';
  $('returnCondition').value=b.return_condition||'';
  $('bookingAsset').value=b.asset_id||'';
  $('openBookingTicket').onclick=()=>detail(b.ticket_id);

  $('bookingAsset').onchange=()=>{
    const a=assets.find(x=>String(x.id)===$('bookingAsset').value);
    $('assetCode').value=a?.asset_code||'';
    $('assetModel').value=[a?.brand,a?.model].filter(Boolean).join(' ')||a?.category||'';
    $('assetSerial').value=a?.serial_number||'';
  };

  const syncAssetStatus=async(oldAssetId,newAssetId,newBookingStatus,returnCondition)=>{
    // Libera il vecchio asset se viene cambiato.
    if(oldAssetId&&String(oldAssetId)!==String(newAssetId||'')){
      const oldRows=await select('assets',`select=*&id=eq.${oldAssetId}`);
      if(oldRows[0]){
        await update('assets',`id=eq.${oldAssetId}`,{
          status:'DISPONIBILE',
          assigned_user_name:null,
          assigned_user_email:null,
          assigned_person_id:null,
          updated_at:new Date().toISOString()
        });
        await insert('asset_history',{
          asset_id:oldAssetId,event_type:'PRENOTAZIONE',
          field_name:'status',old_value:oldRows[0].status,new_value:'DISPONIBILE',
          changed_by:currentITName(),changed_by_id:user.id
        },false);
      }
    }

    if(!newAssetId)return;
    const ar=await select('assets',`select=*&id=eq.${newAssetId}`);
    const a=ar[0];
    if(!a)return;

    let next=a.status;
    let assigneeName=a.assigned_user_name;
    let assigneeEmail=a.assigned_user_email;
    let assigneePersonId=a.assigned_person_id||null;

    if(['CONFERMATA','PRONTA'].includes(newBookingStatus))next='PRENOTATO';
    else if(newBookingStatus==='CONSEGNATA'){
      next='IN PRESTITO';
      assigneeName=b.requester_name||b.requester_email;
      assigneeEmail=b.requester_email;
      if(assigneeEmail){
        const pp=await select('people',`select=id&corporate_email=ilike.${encodeURIComponent(assigneeEmail)}&current_status=neq.USCITO&limit=2`);
        assigneePersonId=pp.length===1?pp[0].id:null;
      }
    }else if(newBookingStatus==='RESTITUITA'){
      next=returnCondition==='DANNEGGIATO'?'GUASTO':returnCondition==='OK'?'DISPONIBILE':'DA VERIFICARE';
      // Il materiale è rientrato in IT: non deve restare assegnato all'utente, anche se danneggiato.
      assigneeName=null; assigneeEmail=null; assigneePersonId=null;
    }

    if(next!==a.status || assigneeEmail!==a.assigned_user_email || assigneePersonId!==a.assigned_person_id){
      await update('assets',`id=eq.${newAssetId}`,{
        status:next,
        assigned_user_name:assigneeName,
        assigned_user_email:assigneeEmail,
        assigned_person_id:assigneePersonId,
        verification_status:newBookingStatus==='RESTITUITA'&&returnCondition!=='OK'?'DA VERIFICARE':a.verification_status,
        updated_at:new Date().toISOString()
      });
      await insert('asset_history',{
        asset_id:newAssetId,event_type:'PRENOTAZIONE',
        field_name:'status',old_value:a.status,new_value:next,
        changed_by:currentITName(),changed_by_id:user.id
      },false);
    }
  };

  $('saveBooking').onclick=async()=>{
    const newAssetId=$('bookingAsset').value?+$('bookingAsset').value:null;
    const selected=assets.find(x=>x.id===newAssetId);
    const newStatus=$('bookStatus').value;
    const retCond=$('returnCondition').value||null;

    if(['CONFERMATA','PRONTA','CONSEGNATA'].includes(newStatus)&&!newAssetId){
      return toast('Seleziona prima un asset dal censimento');
    }

    await update('material_bookings',`id=eq.${id}`,{
      status:newStatus,
      asset_id:newAssetId,
      asset_code:selected?.asset_code||null,
      asset_model:selected?([selected.brand,selected.model].filter(Boolean).join(' ')||selected.category||null):null,
      asset_serial:selected?.serial_number||null,
      delivered_accessories:$('deliveredAccessories').value.trim()||null,
      actual_return_date:$('actualReturn').value||null,
      return_condition:retCond,
      return_notes:$('returnNotes').value.trim()||null,
      it_notes:$('bookItNotes').value.trim()||null,
      prepared_by:currentITName(),
      updated_at:new Date().toISOString()
    });

    await syncAssetStatus(b.asset_id,newAssetId,newStatus,retCond);
    toast('Prenotazione aggiornata');
    bookingDetail(id);
  };

  $('printDelivery').onclick=()=>{
    const selected=assets.find(x=>String(x.id)===$('bookingAsset').value);
    const live={...b,
      status:$('bookStatus').value,
      asset_id:selected?.id||null,
      asset_code:selected?.asset_code||$('assetCode').value.trim(),
      asset_model:selected?([selected.brand,selected.model].filter(Boolean).join(' ')||selected.category):$('assetModel').value.trim(),
      asset_serial:selected?.serial_number||$('assetSerial').value.trim(),
      delivered_accessories:$('deliveredAccessories').value.trim(),
      actual_return_date:$('actualReturn').value,
      return_condition:$('returnCondition').value,
      return_notes:$('returnNotes').value.trim(),
      it_notes:$('bookItNotes').value.trim(),
      prepared_by:currentITName()
    };
    if(!live.asset_code)return toast('Seleziona prima un asset');
    printDeliverySheet(live);
  };
}

function printDeliverySheet(b){
  const w=window.open('','_blank','width=900,height=1000');
  if(!w)return toast('Il browser ha bloccato la finestra di stampa');

  const ticket=b.tickets?.numero_ticket||'';
  const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Verbale ${esc(ticket)}</title>
  <style>
    @page{size:A4;margin:16mm}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;font-size:11px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}
    .logo{width:180px}.title{text-align:right}.title h1{font-size:17px;margin:0 0 5px}
    .section{margin:16px 0}.section h2{font-size:12px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #bbb;padding-bottom:5px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}.field span{display:block;color:#666;font-size:9px;text-transform:uppercase;margin-bottom:3px}
    .box{border:1px solid #bbb;padding:9px;min-height:34px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:42px;margin-top:42px}
    .signature{border-top:1px solid #111;padding-top:6px;text-align:center}.return{margin-top:28px;border-top:2px solid #111;padding-top:14px}
    footer{position:fixed;bottom:0;left:0;right:0;font-size:8px;color:#777;text-align:center}.no-print{margin-bottom:12px;padding:8px;background:#f1f1f1;text-align:center}
    @media print{.no-print{display:none}}
  </style></head><body>
    <div class="no-print">Stampa il documento oppure scegli “Salva come PDF”. Il file non viene caricato nel Service Desk.</div>
    <div class="head"><img class="logo" src="${location.href.replace(/[^/]*$/,'')}logo_archea.png"><div class="title"><h1>VERBALE CONSEGNA / RESTITUZIONE</h1><div>${esc(ticket)}</div></div></div>

    <div class="section"><h2>Consegna</h2><div class="grid">
      <div class="field"><span>Assegnatario</span><b>${esc(b.requester_name||b.requester_email)}</b></div>
      <div class="field"><span>Sede</span><b>${esc(b.site)}</b></div>
      <div class="field"><span>Data consegna</span><b>${dateOnly(b.pickup_date)}</b></div>
      <div class="field"><span>Restituzione prevista</span><b>${dateOnly(b.planned_return_date)}</b></div>
      <div class="field"><span>Motivo / progetto</span><b>${esc(b.reason)}</b></div>
      <div class="field"><span>Preparato da IT</span><b>${esc(b.prepared_by||'')}</b></div>
    </div></div>

    <div class="section"><h2>Materiale</h2><div class="grid">
      <div class="field"><span>Tipologia</span><b>${esc(b.material_type)} × ${b.quantity}</b></div>
      <div class="field"><span>Codice asset</span><b>${esc(b.asset_code||'—')}</b></div>
      <div class="field"><span>Modello</span><b>${esc(b.asset_model||'—')}</b></div>
      <div class="field"><span>Seriale</span><b>${esc(b.asset_serial||'—')}</b></div>
    </div></div>

    <div class="section"><h2>Accessori</h2><div class="box">${esc(b.delivered_accessories||b.requested_accessories||'Nessun accessorio indicato')}</div></div>
    <div class="section"><h2>Note consegna</h2><div class="box">${esc(b.it_notes||b.requester_notes||'')}</div></div>

    <div class="signatures"><div class="signature">Firma assegnatario alla consegna</div><div class="signature">Firma IT alla consegna</div></div>

    <div class="return">
      <div class="section"><h2>Restituzione</h2><div class="grid">
        <div class="field"><span>Data restituzione effettiva</span><b>${b.actual_return_date?dateOnly(b.actual_return_date):'________________'}</b></div>
        <div class="field"><span>Stato materiale al rientro</span><b>${esc(b.return_condition||'________________')}</b></div>
      </div></div>
      <div class="section"><h2>Note rientro</h2><div class="box">${esc(b.return_notes||'')}</div></div>
      <div class="signatures"><div class="signature">Firma assegnatario alla restituzione</div><div class="signature">Firma IT al ritiro</div></div>
    </div>

    <footer>Archea Associati — Archea Service Desk — Dipartimento IT</footer>
    <script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script>
  </body></html>`;
  w.document.open();w.document.write(html);w.document.close();
}


async function hrNewMovement(){
  const epoch=navigationEpoch;
  if(!isHR()&&!isITRole())return userHome();
  page('Nuovo movimento','Ingressi, uscite e spostamenti con impatto operativo sul reparto IT');

  let siteOptions=['Firenze','Milano','Roma','Genova','Tirana','Parigi','Dubai','San Paolo','Pechino','Shanghai'];
  try{const rv=await select('reference_values','select=value&value_type=eq.SITE&is_approved=eq.true&order=value.asc');if(rv.length)siteOptions=rv.map(x=>x.value)}catch{}
  if(epoch!==navigationEpoch)return;

  $('content').innerHTML=`
    <div class="panel hr-movement-panel">
      <div class="hr-movement-intro">
        <div>
          <span class="eyebrow">MOVIMENTO PERSONA</span>
          <h3>Registra un evento HR</h3>
          <p>Il sistema crea il ticket IT, applica i controlli anti-duplicazione e prepara una checklist operativa specifica.</p>
        </div>
        <div id="moveImpact" class="movement-impact">
          <b>Seleziona il tipo di movimento</b>
          <span>Vedrai qui le attività IT previste.</span>
        </div>
      </div>

      <form id="hrMoveForm" class="formgrid">
        <label>Tipo movimento
          <select id="moveType" required>
            <option value="">Seleziona...</option>
            <option value="NUOVO INGRESSO">Nuovo ingresso</option>
            <option value="USCITA">Uscita</option>
            <option value="CAMBIO POSTAZIONE">Cambio postazione</option>
            <option value="CAMBIO SEDE">Cambio sede</option>
          </select>
        </label>

        <label>Data movimento
          <input id="moveDate" type="date" required>
        </label>

        <label>Nome
          <input id="personName" required autocomplete="off">
        </label>

        <label>Cognome
          <input id="personSurname" required autocomplete="off">
        </label>

        <label class="full">Email aziendale
          <input id="personEmail" type="email" placeholder="nome.cognome@archea.it" autocomplete="off">
          <span class="field-help">Consigliata: è il dato più affidabile per riconoscere la persona ed evitare duplicati.</span>
        </label>

        <div id="currentBlock" class="full movement-block hidden">
          <div class="movement-block-title">Situazione attuale</div>
          <div class="formgrid">
            <label id="currentSiteLabel">Sede attuale
              <input id="currentSite" list="siteList" autocomplete="off">
            </label>
            <label id="currentDeskLabel">Postazione attuale
              <input id="currentDesk" autocomplete="off" placeholder="Es. P2-14">
            </label>
          </div>
        </div>

        <div id="newBlock" class="full movement-block hidden">
          <div class="movement-block-title">Nuova situazione</div>
          <div class="formgrid">
            <label id="newSiteLabel">Nuova sede
              <input id="newSite" list="siteList" autocomplete="off">
            </label>
            <label id="newDeskLabel">Nuova postazione
              <input id="newDesk" autocomplete="off" placeholder="Es. P3-08">
            </label>
          </div>
        </div>

        <datalist id="siteList">
          ${siteOptions.map(s=>`<option value="${esc(s)}"></option>`).join('')}
        </datalist>

        <label class="full">Note <span class="optional">(facoltative)</span>
          <textarea id="moveNotes" rows="4" placeholder="Informazioni utili per il reparto IT"></textarea>
        </label>

        <div id="movementValidation" class="full movement-validation hidden"></div>

        <div class="full movement-explain">
          <div><b>1</b><span>Controllo persona e duplicati</span></div>
          <div><b>2</b><span>Creazione ticket IT</span></div>
          <div><b>3</b><span>Checklist dedicata</span></div>
          <div><b>4</b><span>Storico movimento</span></div>
        </div>

        <div class="full button-row">
          <button class="primary">Registra movimento</button>
          <button type="button" id="clearMovement" class="ghost">Pulisci</button>
        </div>
      </form>

      <p id="hrMoveResult"></p>
    </div>`;

  $('moveDate').value=new Date().toISOString().slice(0,10);
  if(movementPrefill){
    const pf=movementPrefill;movementPrefill=null;
    if(pf.type)$('moveType').value=pf.type;
    if(pf.date)$('moveDate').value=pf.date;
    if(pf.first)$('personName').value=pf.first;
    if(pf.surname)$('personSurname').value=pf.surname;
    if(pf.email)$('personEmail').value=pf.email;
    if(pf.currentSite)$('currentSite').value=pf.currentSite;
    if(pf.newSite)$('newSite').value=pf.newSite;
    if(pf.currentDesk)$('currentDesk').value=pf.currentDesk;
    if(pf.newDesk)$('newDesk').value=pf.newDesk;
    if(pf.notes)$('moveNotes').value=pf.notes;
  }

  const impactCopy={
    'NUOVO INGRESSO':{
      title:'Nuovo ingresso',
      text:'Account e accessi · preparazione postazione · hardware · software/licenze · verifica finale'
    },
    'USCITA':{
      title:'Uscita',
      text:'Recupero hardware · disabilitazione accessi · revoca licenze · aggiornamento censimento'
    },
    'CAMBIO POSTAZIONE':{
      title:'Cambio postazione',
      text:'Verifica postazione · monitor/periferiche · rete · aggiornamento posizione degli asset'
    },
    'CAMBIO SEDE':{
      title:'Cambio sede',
      text:'Verifica hardware assegnato · accessi della nuova sede · rete/VDI · aggiornamento sede degli asset'
    }
  };

  const setRequired=(id,on)=>{
    const el=$(id);
    if(el)el.required=!!on;
  };

  const configureForm=()=>{
    const type=$('moveType').value;
    const current=$('currentBlock'), next=$('newBlock');
    current.classList.add('hidden');
    next.classList.add('hidden');

    ['currentSite','currentDesk','newSite','newDesk'].forEach(id=>setRequired(id,false));

    if(type==='NUOVO INGRESSO'){
      next.classList.remove('hidden');
      $('newSiteLabel').classList.remove('hidden');
      $('newDeskLabel').classList.remove('hidden');
      setRequired('newSite',true);
    }else if(type==='USCITA'){
      current.classList.remove('hidden');
      $('currentSiteLabel').classList.remove('hidden');
      $('currentDeskLabel').classList.remove('hidden');
      setRequired('currentSite',true);
    }else if(type==='CAMBIO POSTAZIONE'){
      current.classList.remove('hidden');
      next.classList.remove('hidden');
      $('currentSiteLabel').classList.remove('hidden');
      $('currentDeskLabel').classList.remove('hidden');
      $('newSiteLabel').classList.add('hidden');
      $('newDeskLabel').classList.remove('hidden');
      setRequired('currentSite',true);
      setRequired('currentDesk',true);
      setRequired('newDesk',true);
    }else if(type==='CAMBIO SEDE'){
      current.classList.remove('hidden');
      next.classList.remove('hidden');
      $('currentSiteLabel').classList.remove('hidden');
      $('currentDeskLabel').classList.remove('hidden');
      $('newSiteLabel').classList.remove('hidden');
      $('newDeskLabel').classList.remove('hidden');
      setRequired('currentSite',true);
      setRequired('newSite',true);
    }

    if(!type){
      $('moveImpact').innerHTML=`<b>Seleziona il tipo di movimento</b><span>Vedrai qui le attività IT previste.</span>`;
    }else{
      const c=impactCopy[type];
      $('moveImpact').innerHTML=`<b>${esc(c.title)}</b><span>${esc(c.text)}</span>`;
    }
    $('movementValidation').classList.add('hidden');
  };

  const personHistory=async(email,name,surname)=>{
    let rows=[];
    if(email){
      rows=await select('hr_movements',
        `select=id,movement_type,movement_date,status,person_email,person_name,person_surname&person_email=eq.${encodeURIComponent(email)}&status=neq.ANNULLATO&order=movement_date.desc,id.desc`
      );
    }else{
      rows=await select('hr_movements',
        `select=id,movement_type,movement_date,status,person_email,person_name,person_surname&person_name=ilike.${encodeURIComponent(name)}&person_surname=ilike.${encodeURIComponent(surname)}&status=neq.ANNULLATO&order=movement_date.desc,id.desc`
      );
    }
    return rows;
  };

  const resolveMasterPerson=async(email,name,surname)=>{
    if(email){
      const byEmail=await select('people',`select=id,current_status,display_name&corporate_email=ilike.${encodeURIComponent(email)}&limit=2`);
      if(byEmail.length===1)return byEmail[0];
    }
    const key=normSearch(`${name} ${surname}`);
    if(key){
      const byName=await select('people',`select=id,current_status,display_name&normalized_name_key=eq.${encodeURIComponent(key)}&limit=2`);
      if(byName.length===1)return byName[0];
    }
    return null;
  };

  const derivePersonState=(history,date)=>{
    const relevant=history
      .filter(x=>!date || !x.movement_date || x.movement_date<=date)
      .filter(x=>x.movement_type==='NUOVO INGRESSO'||x.movement_type==='USCITA')
      .sort((a,b)=>(b.movement_date||'').localeCompare(a.movement_date||'') || b.id-a.id);
    if(!relevant.length)return 'SCONOSCIUTO';
    return relevant[0].movement_type==='NUOVO INGRESSO'?'ATTIVO':'USCITO';
  };

  const validateMovement=async()=>{
    const type=$('moveType').value;
    const date=$('moveDate').value;
    const email=$('personEmail').value.trim().toLowerCase();
    const name=$('personName').value.trim();
    const surname=$('personSurname').value.trim();
    const currentSite=$('currentSite')?.value.trim()||'';
    const newSite=$('newSite')?.value.trim()||'';
    const currentDesk=$('currentDesk')?.value.trim()||'';
    const newDesk=$('newDesk')?.value.trim()||'';

    if(!type||!date||!name||!surname)throw new Error('Completa tipo, data, nome e cognome.');
    if(email&&!email.endsWith('@archea.it'))throw new Error('Se inserita, la mail deve essere aziendale @archea.it.');

    if(type==='NUOVO INGRESSO'&&!newSite)throw new Error('Per un nuovo ingresso indica la sede di ingresso.');
    if(type==='USCITA'&&!currentSite)throw new Error('Per un’uscita indica la sede attuale.');
    if(type==='CAMBIO POSTAZIONE'){
      if(!currentSite||!currentDesk||!newDesk)throw new Error('Per il cambio postazione indica sede, postazione attuale e nuova postazione.');
      if(currentDesk.toLowerCase()===newDesk.toLowerCase())throw new Error('La nuova postazione deve essere diversa da quella attuale.');
    }
    if(type==='CAMBIO SEDE'){
      if(!currentSite||!newSite)throw new Error('Per il cambio sede indica sede attuale e nuova sede.');
      if(currentSite.toLowerCase()===newSite.toLowerCase())throw new Error('La nuova sede deve essere diversa da quella attuale.');
    }

    const history=await personHistory(email,name,surname);
    const masterPerson=await resolveMasterPerson(email,name,surname);
    const historicalState=derivePersonState(history,date);
    const state=masterPerson&&masterPerson.current_status&&masterPerson.current_status!=='SCONOSCIUTO'?masterPerson.current_status:historicalState;

    const exactDuplicate=history.some(x=>
      x.movement_type===type &&
      x.movement_date===date
    );
    if(exactDuplicate)throw new Error('Questo movimento risulta già registrato per la stessa persona e la stessa data.');

    if(type==='NUOVO INGRESSO'&&state==='ATTIVO'){
      throw new Error('La persona risulta già attiva nello storico. Verifica prima di creare un secondo ingresso.');
    }
    if(type==='USCITA'&&state==='USCITO'){
      throw new Error('La persona risulta già uscita. Verifica lo storico prima di registrare una nuova uscita.');
    }
    if((type==='CAMBIO SEDE'||type==='CAMBIO POSTAZIONE')&&state==='USCITO'){
      throw new Error('La persona risulta uscita. Non è possibile registrare uno spostamento senza un nuovo ingresso.');
    }

    const needsManualCheck=state==='SCONOSCIUTO' && type!=='NUOVO INGRESSO';

    return {history,state,needsManualCheck,masterPerson};
  };

  $('moveType').onchange=configureForm;
  $('clearMovement').onclick=()=>{
    $('hrMoveForm').reset();
    $('moveDate').value=new Date().toISOString().slice(0,10);
    $('hrMoveResult').textContent='';
    configureForm();
  };

  ['personEmail','personName','personSurname','moveDate'].forEach(id=>{
    $(id).addEventListener('change',async()=>{
      const type=$('moveType').value;
      if(!type||!$('personName').value.trim()||!$('personSurname').value.trim())return;
      try{
        const result=await validateMovement();
        const box=$('movementValidation');
        box.classList.remove('hidden','warning','ok');
        if(result.needsManualCheck){
          box.classList.add('warning');
          box.innerHTML=`<b>Storico precedente non trovato</b><span>Il movimento potrà essere creato, ma resterà DA VERIFICARE per il controllo IT.</span>`;
        }else{
          box.classList.add('ok');
          box.innerHTML=`<b>Controllo preliminare OK</b><span>Stato precedente rilevato: ${esc(result.state)}.</span>`;
        }
      }catch(err){
        const box=$('movementValidation');
        box.classList.remove('hidden','ok');
        box.classList.add('warning');
        box.innerHTML=`<b>Controllo</b><span>${esc(err.message)}</span>`;
      }
    });
  });

  $('hrMoveForm').onsubmit=async e=>{
    e.preventDefault();
    $('hrMoveResult').textContent='';

    try{
      const validation=await validateMovement();

      const type=$('moveType').value;
      const email=$('personEmail').value.trim().toLowerCase();
      const name=$('personName').value.trim();
      const surname=$('personSurname').value.trim();

      const currentSite=$('currentSite')?.value.trim()||'';
      const newSite=$('newSite')?.value.trim()||'';
      const currentDesk=$('currentDesk')?.value.trim()||'';
      const newDesk=$('newDesk')?.value.trim()||'';

      const payload={
        movement_type:type,
        movement_date:$('moveDate').value,
        person_name:name,
        person_surname:surname,
        person_email:email||null,
        current_site:currentSite||null,
        new_site:newSite||null,
        current_desk:currentDesk||null,
        new_desk:newDesk||null,
        notes:$('moveNotes').value.trim()||null,
        created_by:user.id,
        created_by_email:user.email,
        created_by_name:profile.nome,
        status:'DA VERIFICARE',
        person_state_before:validation.state,
        needs_manual_check:validation.needsManualCheck,
        person_id:validation.masterPerson?.id||null
      };

      const ticketDesc=[
        `Movimento: ${type}`,
        `Persona: ${name} ${surname}`,
        email?`Email: ${email}`:'',
        currentSite?`Sede attuale: ${currentSite}`:'',
        newSite?`Nuova sede: ${newSite}`:'',
        currentDesk?`Postazione attuale: ${currentDesk}`:'',
        newDesk?`Nuova postazione: ${newDesk}`:'',
        `Stato precedente rilevato: ${validation.state}`,
        validation.needsManualCheck?'ATTENZIONE: storico precedente non disponibile, verifica manuale richiesta.':'',
        $('moveNotes').value?`Note: ${$('moveNotes').value.trim()}`:''
      ].filter(Boolean).join('\n');

      const trows=await insert('tickets',{
        categoria:'Movimento persona',
        oggetto:`${type} - ${name} ${surname}`,
        descrizione:ticketDesc,
        stato:'APERTO',
        priorita:type==='USCITA'?'ALTA':'NORMALE',
        richiedente_nome:profile.nome,
        richiedente_email:user.email,
        created_by:user.id,
        created_by_name:profile.nome,
        origine:'HR',
        sede:newSite||currentSite||null
      });

      const ticket=trows[0];
      const ticketNo=`MOV-${new Date().getFullYear()}-${String(ticket.id).padStart(5,'0')}`;
      await update('tickets',`id=eq.${ticket.id}`,{numero_ticket:ticketNo});

      await insert('hr_movements',{...payload,ticket_id:ticket.id},true);

      await insert('ticket_history',{
        ticket_id:ticket.id,
        evento:`Movimento HR creato: ${type}`,
        autore:profile.nome
      },false);

      try{
        await api('/functions/v1/telegram-new-ticket',{method:'POST',body:{ticket_id:ticket.id}});
      }catch(e){console.warn('Telegram non inviato:',e.message)}

      $('hrMoveForm').reset();
      $('moveDate').value=new Date().toISOString().slice(0,10);
      configureForm();

      $('hrMoveResult').innerHTML=`
        <div class="movement-success">
          <b>Movimento registrato</b>
          <span>Ticket ${esc(ticketNo)} · Stato HR: DA VERIFICARE</span>
          ${validation.needsManualCheck?'<small>Richiede controllo manuale dello storico precedente.</small>':''}
        </div>`;
      toast('Movimento HR creato');
    }catch(err){
      $('hrMoveResult').innerHTML=`<div class="movement-error">${esc(err.message)}</div>`;
    }
  };

  configureForm();
}

function hrMovementKind(v){
  const n=normSearch(v);
  if(n.includes('ingresso'))return 'INGRESSO';
  if(n.includes('uscita'))return 'USCITA';
  if(n.includes('spostamento')||n.includes('cambio sede')||n.includes('cambio postazione'))return 'SPOSTAMENTO';
  if(n.includes('smart working'))return 'SMART WORKING';
  return 'ALTRO';
}
function hrRawStatusActive(v){return normSearch(v)!=='annullato'}

async function loadUnifiedHrMovements(){
  const [portalRows,personEvents]=await Promise.all([
    selectAll('hr_movements','select=*,tickets(numero_ticket,stato)&order=movement_date.desc,created_at.desc'),
    selectAll('person_events','select=id,person_id,event_type,event_date,date_is_approximate,source_type,note,new_data,raw_payload,created_at,people(display_name,corporate_email)&source_type=in.(HR_MOVIMENTI,PORTALE)&order=event_date.desc,created_at.desc')
  ]);

  const portal=portalRows.map(x=>({
    ...x,
    _source:'PORTALE',
    _kind:hrMovementKind(x.movement_type),
    _typeLabel:x.movement_type,
    _status:x.status,
    _person:`${x.person_name||''} ${x.person_surname||''}`.trim(),
    _email:x.person_email||'',
    _siteFrom:x.current_site||'',
    _siteTo:x.new_site||'',
    _deskFrom:x.current_desk||'',
    _deskTo:x.new_desk||'',
    _editable:true
  }));

  const legacy=personEvents.filter(e=>e.source_type==='HR_MOVIMENTI').map(e=>{
    const d=e.new_data||{};
    const rawType=d.movement_type_raw||e.event_type||'MOVIMENTO HR';
    return {
      id:`legacy-${e.id}`,
      _eventId:e.id,
      movement_date:e.event_date,
      created_at:e.created_at,
      _source:'HR EXCEL',
      _kind:hrMovementKind(rawType),
      _typeLabel:rawType,
      _status:d.movement_status_raw||e.note||'—',
      _person:e.people?.display_name||'Persona collegata',
      _email:e.people?.corporate_email||'',
      _siteFrom:d.site_raw||'',
      _siteTo:'',
      _deskFrom:d.desk_from_raw||'',
      _deskTo:d.desk_to_raw||'',
      _company:d.company_raw||'',
      _department:d.department_raw||'',
      _profile:d.profile_raw||'',
      _raw:e.raw_payload||{},
      _editable:false,
      tickets:null,
      ticket_id:null
    };
  });

  // Uscite registrate direttamente dalla scheda persona.
  // Sono sempre USCITA: il fatto che la data sia passata non crea un tipo diverso.
  const directExits=personEvents.filter(e=>e.source_type==='PORTALE'&&e.event_type==='USCITA').map(e=>{
    const d=e.new_data||{};
    return {
      id:`person-exit-${e.id}`,
      _eventId:e.id,
      movement_date:e.event_date,
      created_at:e.created_at,
      _source:'PORTALE',
      _kind:'USCITA',
      _typeLabel:'USCITA',
      _status:'VERIFICATO',
      status:'VERIFICATO',
      _person:e.people?.display_name||'Persona collegata',
      _email:e.people?.corporate_email||'',
      _siteFrom:d.site_at_exit||'',
      _siteTo:'',
      _deskFrom:'',
      _deskTo:'',
      _company:'',
      _department:'',
      _profile:'',
      _raw:e.raw_payload||{},
      _editable:false,
      tickets:null,
      ticket_id:null,
      _dateApproximate:!!e.date_is_approximate
    };
  });

  return [...portal,...legacy,...directExits].sort((a,b)=>String(b.movement_date||'').localeCompare(String(a.movement_date||''))||String(b.created_at||'').localeCompare(String(a.created_at||'')));
}

async function hrHistory(){
  const epoch=navigationEpoch;
  if(!isHR()&&!isITRole())return userHome();
  page('Storico movimenti','Ingressi, uscite e spostamenti · portale + storico HR importato');

  const rows=await loadUnifiedHrMovements();
  let q='',type='',site='',status='',showMovementList=false;

  const approvedSiteRows=await select('reference_values','select=value&value_type=eq.SITE&is_approved=eq.true&order=value.asc');
  if(epoch!==navigationEpoch)return;
  const sites=approvedSiteRows.map(x=>x.value).filter(Boolean);
  const statuses=['DA VERIFICARE','VERIFICATO','PREVISTO','CONFERMATO','EFFETTUATO','ANNULLATO'];
  const types=['INGRESSO','USCITA','SPOSTAMENTO','SMART WORKING','ALTRO'];

  const now=new Date();const ym=now.toISOString().slice(0,7),year=String(now.getFullYear());
  const monthRows=rows.filter(x=>String(x.movement_date||'').startsWith(ym));
  const yearRows=rows.filter(x=>String(x.movement_date||'').startsWith(year));
  const kindCount=(arr,k)=>arr.filter(x=>x._kind===k||(k==='SPOSTAMENTO'&&String(x._kind||'').startsWith('SPOSTAMENTO'))).length;
  $('content').innerHTML=`
    <section class="overview-hero movement-overview">
      <div class="overview-number"><span>MOVIMENTI · ${now.toLocaleString('it-IT',{month:'long'}).toUpperCase()}</span><b>${monthRows.length}</b><small>movimenti registrati</small></div>
      <div class="movement-bars">
        ${[['INGRESSO','Ingressi'],['USCITA','Uscite'],['SPOSTAMENTO','Spostamenti']].map(([k,l])=>{const n=kindCount(yearRows,k);const max=Math.max(1,...['INGRESSO','USCITA','SPOSTAMENTO'].map(x=>kindCount(yearRows,x)));return `<div class="bar-row"><span>${l}</span><div><i style="width:${Math.round(n/max*100)}%"></i></div><b>${n}</b></div>`}).join('')}
      </div>
      <div class="overview-stats"><div><span>Ingressi mese</span><b>${kindCount(monthRows,'INGRESSO')}</b></div><div><span>Uscite mese</span><b>${kindCount(monthRows,'USCITA')}</b></div><div><span>Spostamenti mese</span><b>${kindCount(monthRows,'SPOSTAMENTO')}</b></div><div><span>Anno ${year}</span><b>${yearRows.length}</b></div></div>
    </section>
    <div class="search-stage">
      <div class="queue-toolbar advanced">
        <input id="hrSearch" placeholder="Cerca persona, email, ticket, sede...">
        <select id="hrType"><option value="">Tutti i movimenti</option>${types.map(t=>`<option>${esc(t)}</option>`).join('')}</select>
        <select id="hrSite"><option value="">Tutte le sedi</option>${sites.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
        <select id="hrStatus"><option value="">Tutti gli stati</option>${statuses.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
      </div>
      <div class="info-box compact-info">${rows.some(x=>x._source==='HR EXCEL')?"Lo storico importato dall'Excel HR conserva il valore originale. I movimenti del portale restano separati e modificabili secondo i permessi.":"<b>Storico HR non ancora importato.</b> In questo momento la sezione mostra solo eventuali movimenti creati dal portale. Dopo l’import di HR_Collaboratori.xlsx comparirà anche lo storico Excel."}</div>
      <div class="explore-head"><button id="toggleMovementList" class="ghost">⌕ Esplora movimenti</button><span>L’elenco completo resta nascosto finché non serve.</span></div><div id="hrHistoryTable"></div>
    </div>`;

  const render=()=>{
    const filtered=rows.filter(x=>{
      if(type&&x._kind!==type)return false;
      if(site&&x._siteFrom!==site&&x._siteTo!==site)return false;
      if(status&&x._status!==status)return false;
      if(q){
        const h=`${x._person||''} ${x._email||''} ${x.tickets?.numero_ticket||''} ${x._siteFrom||''} ${x._siteTo||''} ${x._typeLabel||''} ${x._company||''} ${x._department||''} ${x._profile||''}`.toLowerCase();
        if(!h.includes(q.toLowerCase()))return false;
      }
      return true;
    });

    const shouldShow=showMovementList||!!q||!!type||!!site||!!status;
    $('hrHistoryTable').innerHTML=shouldShow&&filtered.length?`
      <div class="tablewrap"><table>
        <thead><tr><th>Data</th><th>Tipo</th><th>Persona</th><th>Sede</th><th>Postazione</th><th>Fonte</th><th>Ticket</th><th>Stato</th><th></th></tr></thead>
        <tbody>${filtered.map(x=>`<tr>
          <td>${dateOnly(x.movement_date)}</td>
          <td><b>${esc(x._typeLabel||x._kind)}</b></td>
          <td>${esc(x._person||'—')}<small class="subline">${esc(x._email||'')}</small></td>
          <td>${esc(x._siteFrom||'—')} ${x._siteTo?`→ ${esc(x._siteTo)}`:''}</td>
          <td>${esc(x._deskFrom||'—')} ${x._deskTo?`→ ${esc(x._deskTo)}`:''}</td>
          <td><span class="badge ${x._source==='HR EXCEL'?'source-hr_movimenti':''}">${esc(x._source)}</span></td>
          <td>${x.ticket_id?`<b class="ticket-link" data-open="${x.ticket_id}">${esc(x.tickets?.numero_ticket||'')}</b>`:'—'}</td>
          <td>${x._editable&&canApproveHR()?`<select data-hr-status="${x.id}">
            <option ${x.status==='DA VERIFICARE'?'selected':''}>DA VERIFICARE</option>
            <option ${x.status==='VERIFICATO'?'selected':''}>VERIFICATO</option>
            <option ${x.status==='ANNULLATO'?'selected':''}>ANNULLATO</option>
          </select>`:`<span class="badge">${esc(x._status||'—')}</span>`}</td>
          <td>${x._editable&&canApproveHR()?`<button class="ghost compact" data-delete-hr-movement="${x.id}">Elimina test</button>`:''}</td>
        </tr>`).join('')}</tbody>
      </table></div>`:shouldShow?'<div class="empty">Nessun movimento.</div>':'';

    document.querySelectorAll('[data-open]').forEach(x=>x.onclick=()=>detail(+x.dataset.open));
    if(canApproveHR()){
      document.querySelectorAll('[data-hr-status]').forEach(el=>el.onchange=async()=>{
        try{
          await update('hr_movements',`id=eq.${el.dataset.hrStatus}`,{
            status:el.value,
            verified_by:el.value==='VERIFICATO'?currentITName():null,
            verified_at:el.value==='VERIFICATO'?new Date().toISOString():null
          });
          toast('Stato HR aggiornato');
          hrHistory();
        }catch(err){toast(err.message)}
      });
    }
    if(canApproveHR()){
      document.querySelectorAll('[data-delete-hr-movement]').forEach(b=>b.onclick=async()=>{
        const reason=window.prompt('Motivo eliminazione record HR di prova/errore:','Record di test / errore di compilazione');
        if(reason===null)return;
        try{await rpc('v82_delete_hr_movement',{p_movement_id:+b.dataset.deleteHrMovement,p_reason:reason});toast('Record HR rimosso dalla vista operativa');hrHistory()}catch(err){toast(err.message)}
      });
    }
  };

  $('hrSearch').oninput=e=>{q=e.target.value;showMovementList=!!q||showMovementList;render()};
  $('hrType').onchange=e=>{type=e.target.value;showMovementList=!!type||showMovementList;render()};
  $('hrSite').onchange=e=>{site=e.target.value;showMovementList=!!site||showMovementList;render()};
  $('hrStatus').onchange=e=>{status=e.target.value;showMovementList=!!status||showMovementList;render()};
  if($('toggleMovementList'))$('toggleMovementList').onclick=()=>{showMovementList=!showMovementList;$('toggleMovementList').textContent=showMovementList?'× Nascondi elenco':'⌕ Esplora movimenti';render()};
  render();
}

async function hrStats(){
  const epoch=navigationEpoch;
  if(!isHR()&&!isITRole())return userHome();
  page('Statistiche HR','Movimenti portale + storico HR importato');

  const allRows=await loadUnifiedHrMovements();
  if(epoch!==navigationEpoch)return;
  const today=new Date().toISOString().slice(0,10);
  const nonCancelled=allRows.filter(x=>x._source==='PORTALE'?x.status!=='ANNULLATO':hrRawStatusActive(x._status));
  // Numeri ufficiali: movimenti con data trascorsa/odierna e stato consolidato.
  // HR Excel: Confermato/Effettuato. Portale: VERIFICATO.
  const rows=nonCancelled.filter(x=>{
    if(!x.movement_date||x.movement_date>today)return false;
    if(x._source==='PORTALE')return x.status==='VERIFICATO';
    return ['confermato','effettuato'].includes(normSearch(x._status));
  });
  const planned=nonCancelled.filter(x=>{
    if(x._source==='PORTALE')return (x.movement_date||'')>today;
    return normSearch(x._status)==='previsto'||(x.movement_date||'')>today;
  }).length;

  const totalIn=rows.filter(x=>x._kind==='INGRESSO').length;
  const totalOut=rows.filter(x=>x._kind==='USCITA').length;
  const moves=rows.filter(x=>x._kind==='SPOSTAMENTO').length;
  const other=rows.filter(x=>!['INGRESSO','USCITA','SPOSTAMENTO'].includes(x._kind)).length;
  const pending=nonCancelled.filter(x=>x._source==='PORTALE'&&x.status==='DA VERIFICARE').length;

  const monthMap={};
  rows.forEach(x=>{
    const key=(x.movement_date||'').slice(0,7);
    if(!key)return;
    monthMap[key]??={in:0,out:0,move:0,other:0};
    if(x._kind==='INGRESSO')monthMap[key].in++;
    else if(x._kind==='USCITA')monthMap[key].out++;
    else if(x._kind==='SPOSTAMENTO')monthMap[key].move++;
    else monthMap[key].other++;
  });

  const siteMap={};
  rows.forEach(x=>{
    const s=x._siteTo||x._siteFrom||'Non specificata';
    siteMap[s]??={in:0,out:0,move:0,other:0};
    if(x._kind==='INGRESSO')siteMap[s].in++;
    else if(x._kind==='USCITA')siteMap[s].out++;
    else if(x._kind==='SPOSTAMENTO')siteMap[s].move++;
    else siteMap[s].other++;
  });

  $('content').innerHTML=`
    <div class="metrics">
      <div class="metric"><span>Ingressi</span><b>${totalIn}</b></div>
      <div class="metric"><span>Uscite</span><b>${totalOut}</b></div>
      <div class="metric"><span>Spostamenti</span><b>${moves}</b></div>
      <div class="metric"><span>Previsti / futuri</span><b>${planned}</b></div>
      <div class="metric"><span>Da verificare portale</span><b>${pending}</b></div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <h3>Per mese</h3>
        <div class="tablewrap"><table>
          <thead><tr><th>Mese</th><th>Ingressi</th><th>Uscite</th><th>Spostamenti</th>${other?'<th>Altri</th>':''}</tr></thead>
          <tbody>${Object.entries(monthMap).sort((a,b)=>b[0].localeCompare(a[0])).map(([m,v])=>`<tr><td>${esc(m)}</td><td>${v.in}</td><td>${v.out}</td><td>${v.move}</td>${other?`<td>${v.other}</td>`:''}</tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="panel">
        <h3>Per sede</h3>
        <div class="tablewrap"><table>
          <thead><tr><th>Sede</th><th>Ingressi</th><th>Uscite</th><th>Spostamenti</th>${other?'<th>Altri</th>':''}</tr></thead>
          <tbody>${Object.entries(siteMap).sort((a,b)=>a[0].localeCompare(b[0],'it')).map(([site,v])=>`<tr><td>${esc(site)}</td><td>${v.in}</td><td>${v.out}</td><td>${v.move}</td>${other?`<td>${v.other}</td>`:''}</tr>`).join('')}</tbody>
        </table></div>
      </div>
    </div>

    <div class="panel">
      <div class="info-box">
        I conteggi ufficiali includono solo movimenti già consolidati e con data non futura: <b>Confermato/Effettuato</b> per lo storico HR importato e <b>VERIFICATO</b> per il portale. Previsti, futuri e righe da verificare restano visibili ma non gonfiano ingressi/uscite effettivi. I valori originali dell'Excel restano conservati nella fonte raw.
      </div>
    </div>`;
}

function personStatusBadge(s){
  const cls={ATTIVO:'person-active',USCITO:'person-exited',PREVISTO:'person-planned',SCONOSCIUTO:'person-unknown'}[s]||'person-unknown';
  return `<span class="badge ${cls}">${esc(s||'SCONOSCIUTO')}</span>`;
}
function personVerifyBadge(s){
  const cls={VERIFICATO:'verify-ok','DA VERIFICARE':'verify-warn',DUBBIO:'verify-doubt'}[s]||'verify-warn';
  return `<span class="badge ${cls}">${esc(s||'DA VERIFICARE')}</span>`;
}
function sourceBadge(s){
  const label={PDF_CHI_SIAMO:'PDF Chi Siamo',HR_MOVIMENTI:'HR',DEVICE:'Device',MANUALE:'Manuale'}[s]||s;
  return `<span class="source-chip source-${String(s||'').toLowerCase()}">${esc(label)}</span>`;
}
function sameText(a,b){return normSearch(a)===normSearch(b)}

async function people(){
  const epoch=navigationEpoch;
  if(!isHROrIT())return userHome();
  page('Persone','Anagrafica master, fonti e verifica fisica');

  const [persons,assets,sources,conflicts,approvedSites]=await Promise.all([
    select('people','select=*&order=display_name.asc'),
    isITRole()?selectAll('assets','select=id,asset_code,assigned_person_id,assigned_user_name,status,verification_status,is_label_only&is_label_only=eq.false&order=asset_code.asc'):Promise.resolve([]),
    selectAll('people_source_records','select=id,person_id,source_type,name_raw,normalized_name_key,source_row,source_page,site_raw,match_status&order=id.asc'),
    isITRole()?select('data_conflicts','select=id,source_type,conflict_type,conflict_key,status&status=eq.APERTO&order=created_at.desc&limit=500'):Promise.resolve([]),
    select('reference_values','select=value&value_type=eq.SITE&is_approved=eq.true&order=value.asc')
  ]);
  if(epoch!==navigationEpoch)return;

  const sourceMap=new Map();
  for(const s of sources){
    if(!s.person_id)continue;
    if(!sourceMap.has(s.person_id))sourceMap.set(s.person_id,new Set());
    sourceMap.get(s.person_id).add(s.source_type);
  }
  // V6.1: il contatore Persone deve includere sia asset confermati sia legacy da confermare.
  const assetStats=new Map();
  const personDeviceNames=new Map();
  for(const s of sources){
    if(s.person_id&&s.source_type==='DEVICE'&&s.name_raw){
      if(!personDeviceNames.has(s.person_id))personDeviceNames.set(s.person_id,new Set());
      personDeviceNames.get(s.person_id).add(normSearch(s.name_raw));
    }
  }
  for(const p of persons){
    const keys=personDeviceNames.get(p.id)||new Set();
    const confirmed=assets.filter(a=>a.assigned_person_id===p.id);
    const candidates=assets.filter(a=>!a.assigned_person_id&&a.assigned_user_name&&keys.has(normSearch(a.assigned_user_name)));
    const unique=new Map([...confirmed,...candidates].map(a=>[a.id,a]));
    const all=[...unique.values()];
    assetStats.set(p.id,{
      total:all.length,
      verified:all.filter(a=>a.assigned_person_id===p.id&&a.verification_status==='VERIFICATO').length,
      pending:all.filter(a=>a.assigned_person_id!==p.id||a.verification_status!=='VERIFICATO').length
    });
  }

  const legacyGroups=new Map();
  for(const s of sources.filter(x=>x.source_type==='DEVICE'&&!x.person_id&&x.name_raw)){
    const key=normSearch(s.name_raw);
    if(!legacyGroups.has(key))legacyGroups.set(key,{name:s.name_raw,count:0,rows:[],sites:new Set()});
    const g=legacyGroups.get(key);g.count++;if(s.source_row)g.rows.push(s.source_row);if(s.site_raw)g.sites.add(s.site_raw);
  }

  let peopleSort='name',peopleSortDir='asc';
  const sites=(approvedSites||[]).map(x=>x.value).filter(Boolean);
  $('content').innerHTML=`
    <div class="metrics people-metrics">
      <div class="metric"><span>Persone master</span><b>${persons.length}</b></div>
      <div class="metric"><span>Attive</span><b>${persons.filter(x=>x.current_status==='ATTIVO').length}</b></div>
      <div class="metric"><span>Da verificare</span><b>${persons.filter(x=>x.verification_status!=='VERIFICATO').length}</b></div>
      <div class="metric"><span>Uscite</span><b>${persons.filter(x=>x.current_status==='USCITO').length}</b></div>
      <div class="metric"><span>Legacy Device non collegati</span><b>${legacyGroups.size}</b></div>
      <div class="metric"><span>Conflitti aperti</span><b>${conflicts.length}</b></div>
    </div>

    <div class="panel">
      <div class="people-toolbar">
        <input id="peopleSearch" placeholder="Cerca persona, sede, dipartimento, profilo...">
        <select id="peopleSite"><option value="">Tutte le sedi</option>${sites.map(x=>`<option>${esc(x)}</option>`).join('')}</select>
        <select id="peopleStatus"><option value="">Tutti gli stati</option><option>ATTIVO</option><option>USCITO</option><option>PREVISTO</option><option>SCONOSCIUTO</option></select>
        <select id="peopleVerify"><option value="">Tutte le verifiche</option><option>VERIFICATO</option><option>DA VERIFICARE</option><option>DUBBIO</option></select>
        <select id="peopleSort"><option value="name">Ordina: Nome</option><option value="site">Ordina: Sede</option><option value="department">Ordina: Dipartimento</option><option value="assets">Ordina: Asset</option><option value="status">Ordina: Stato</option></select>
        <select id="peopleSortDir"><option value="asc">A→Z / crescente</option><option value="desc">Z→A / decrescente</option></select>
      </div>
      <div class="button-row">
        <button id="exportPeopleXls" class="ghost">Scarica Persone XLS</button>
        <button id="addPersonBtn" class="primary">+ Aggiungi persona</button><button id="newMovementBtn" class="secondary">+ Nuovo movimento</button>${canImportHR()?'<button id="showHrImport" class="secondary">Importa HR Movimenti</button>':''}${canManageHRValues()?'<button id="manageReferenceValues" class="ghost">Gestisci valori controllati</button>':''}
      </div>
      <div id="peopleTable"></div>
      <div id="legacyPeopleResults"></div>
    </div>

    ${canImportHR()?`<div id="hrImportPanel" class="panel hidden">
      <h3>Importazione HR controllata</h3>
      <p class="muted-line">Viene letto esclusivamente il foglio <b>Movimenti</b>. I valori originali restano nelle fonti raw; i dati master già presenti dal PDF non vengono sovrascritti.</p>
      <label>File HR .xlsx<input id="hrPeopleFile" type="file" accept=".xlsx,.xls"></label>
      <div class="info-box">
        La riga test storica 439 viene esclusa solo se riconosciuta tramite la sequenza bb/bbb. I movimenti <b>Previsto</b> non rendono automaticamente attiva una persona. I match vengono collegati soltanto quando esiste una sola scheda master con la stessa chiave esatta.
      </div>
      <button id="runHrPeopleImport" class="primary">Importa HR</button>
      <p id="hrPeopleImportResult"></p>
    </div>`:''}`;

  $('exportPeopleXls').onclick=()=>{
    const exportRows=[['Persona','Email','Società','Sede','Dipartimento','Profilo','Stato','Verifica','Asset totali','Asset verificati','Asset da confermare','Fonti']];
    persons.forEach(p=>{const a=assetStats.get(p.id)||{total:0,verified:0,pending:0};exportRows.push([p.display_name||'',p.corporate_email||'',p.company||'',p.site||'',p.department||'',p.profile||'',p.current_status||'',p.verification_status||'',a.total,a.verified,a.pending,[...(sourceMap.get(p.id)||[])].join(', ')]);});
    downloadXls(`Archea_Persone_${new Date().toISOString().slice(0,10)}.xls`,[{name:'Persone',rows:exportRows}]);
  };

  const render=()=>{
    const q=normSearch($('peopleSearch').value);const site=$('peopleSite').value;const st=$('peopleStatus').value;const vf=$('peopleVerify').value;
    let filtered=persons.filter(p=>{
      if(site&&p.site!==site)return false;if(st&&p.current_status!==st)return false;if(vf&&p.verification_status!==vf)return false;
      if(q){const hay=normSearch(`${p.display_name||''} ${p.first_name||''} ${p.surname||''} ${p.corporate_email||''} ${p.company||''} ${p.site||''} ${p.department||''} ${p.profile||''}`);if(!hay.includes(q))return false}
      return true;
    });
    const personSortValue=p=>peopleSort==='site'?(p.site||''):peopleSort==='department'?(p.department||''):peopleSort==='assets'?(assetStats.get(p.id)?.total||0):peopleSort==='status'?(p.current_status||''):(p.display_name||'');
    filtered.sort((a,b)=>{const av=personSortValue(a),bv=personSortValue(b);const cmp=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'it',{numeric:true,sensitivity:'base'});return peopleSortDir==='asc'?cmp:-cmp});
    $('peopleTable').innerHTML=filtered.length?`<div class="tablewrap"><table class="people-table">
      <thead><tr><th>Persona</th><th>Sede</th><th>Dipartimento / Profilo</th><th>Fonti</th><th>Asset</th><th>Stato</th><th>Verifica</th></tr></thead>
      <tbody>${filtered.map(p=>`<tr class="click" data-person-id="${p.id}">
        <td><b>${esc(p.display_name)}</b>${p.corporate_email?`<small>${esc(p.corporate_email)}</small>`:''}</td>
        <td>${esc(p.site||'—')}</td>
        <td>${esc(p.department||'—')}${p.profile?`<small>${esc(p.profile)}</small>`:''}</td>
        <td><div class="source-chips">${[...(sourceMap.get(p.id)||[])].map(sourceBadge).join('')}</div></td>
        <td>${(()=>{const s=assetStats.get(p.id)||{total:0,verified:0,pending:0};return `<div class="people-asset-count"><b>${s.total}</b>${s.total?`<small>${s.verified} verificati · ${s.pending} da confermare</small>`:''}</div>`})()}</td>
        <td>${personStatusBadge(p.current_status)}</td><td>${personVerifyBadge(p.verification_status)}</td>
      </tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nessuna persona trovata.</div>';
    document.querySelectorAll('[data-person-id]').forEach(x=>x.onclick=()=>openSubView('person-detail',()=>personDetail(+x.dataset.personId)));

    if(q.length>=2){
      const legacy=[...legacyGroups.values()].filter(g=>normSearch(g.name).includes(q)).slice(0,50);
      $('legacyPeopleResults').innerHTML=legacy.length?`<div class="legacy-people-box"><h3>Riferimenti legacy Device non ancora collegati</h3><p class="muted-line">Questi valori provengono dal vecchio censimento. Non vengono trasformati automaticamente in persone.</p>
        ${legacy.map(g=>`<div class="legacy-person-row"><div><b>${esc(g.name)}</b><span>${g.count} riferiment${g.count===1?'o':'i'} Device${g.sites.size?` · ${esc([...g.sites].join(', '))}`:''}</span></div><button class="secondary compact" data-create-legacy="${esc(g.name)}">Crea scheda storica</button></div>`).join('')}</div>`:'';
      document.querySelectorAll('[data-create-legacy]').forEach(b=>b.onclick=()=>openSubView('person-create-legacy',()=>legacyPersonCreate(b.dataset.createLegacy)));
    }else $('legacyPeopleResults').innerHTML='<p class="muted-line legacy-hint">Cerca un nominativo per visualizzare anche i riferimenti legacy non collegati del Device.</p>';
  };

  ['peopleSearch','peopleSite','peopleStatus','peopleVerify'].forEach(id=>{$(id).oninput=render;$(id).onchange=render});
  $('peopleSort').onchange=e=>{peopleSort=e.target.value;render()};
  $('peopleSortDir').onchange=e=>{peopleSortDir=e.target.value;render()};
  if($('addPersonBtn'))$('addPersonBtn').onclick=()=>openSubView('person-new',()=>personCreate());
  if($('newMovementBtn'))$('newMovementBtn').onclick=()=>nav('hr-new');
  if($('showHrImport'))$('showHrImport').onclick=()=>{
    const panel=$('hrImportPanel');
    if(!panel)return;
    const opening=panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if(opening){
      const row=$('showHrImport').closest('.button-row');
      if(row)row.after(panel);
      requestAnimationFrame(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}));
    }
  };
  if($('manageReferenceValues'))$('manageReferenceValues').onclick=()=>openSubView('reference-values',()=>referenceValues());
  if($('runHrPeopleImport'))$('runHrPeopleImport').onclick=async()=>{
    const file=$('hrPeopleFile').files?.[0];if(!file)return toast('Seleziona il file HR');
    $('hrPeopleImportResult').textContent='Importazione e confronto HR in corso...';
    try{
      const b64=await fileToBase64(file);
      const res=await api('/functions/v1/import-hr',{method:'POST',body:{file_name:file.name,file_base64:b64}});
      $('hrPeopleImportResult').innerHTML=`<b>Import HR completato.</b><br>Righe valide: <b>${res.rows_valid||0}</b> · persone uniche: <b>${res.unique_people||0}</b> · create: <b>${res.people_created||0}</b> · collegate a schede esistenti: <b>${res.linked_existing||0}</b> · eventi storici acquisiti: <b>${res.historical_events_added||0}</b> · ambigue: <b>${res.ambiguous_people||0}</b> · riga test esclusa: <b>${res.excluded_test_rows||0}</b>.`;
      toast('HR importato');setTimeout(()=>people(),1200);
    }catch(err){$('hrPeopleImportResult').innerHTML=`<span class="err">${esc(err.message)}</span>`}
  };
  render();
}


async function personCreate(){
  const epoch=navigationEpoch;
  if(!isHROrIT())return people();
  page('Aggiungi persona','Crea la scheda e registra automaticamente un NUOVO INGRESSO da confermare HR');
  const refs=await select('reference_values','select=value_type,value&is_approved=eq.true&value_type=in.(COMPANY,SITE,DEPARTMENT,PROFILE)&order=value_type.asc,value.asc');
  if(epoch!==navigationEpoch)return;
  const vals=t=>refs.filter(x=>x.value_type===t).map(x=>x.value);
  const opts=(t,placeholder)=>`<option value="">${placeholder}</option>${vals(t).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}`;
  $('content').innerHTML=`<div class="panel person-form-panel">
    <div class="info-box"><b>Nuova persona + ingresso.</b><br>La scheda viene creata come <b>PREVISTO</b> e il movimento come <b>DA VERIFICARE</b>. Solo HR può confermare il movimento e renderlo ufficiale.</div>
    <form id="newPersonForm" class="formgrid">
      <label>Nome<input id="npFirst" required autocomplete="off"></label>
      <label>Cognome<input id="npSurname" required autocomplete="off"></label>
      <label>Email aziendale<input id="npEmail" type="email" placeholder="nome.cognome@archea.it"></label>
      <label>Data ingresso<input id="npDate" type="date" required></label>
      <label>Società<select id="npCompany">${opts('COMPANY','Seleziona società...')}</select></label>
      <label>Sede<select id="npSite" required>${opts('SITE','Seleziona sede...')}</select></label>
      <label>Dipartimento<select id="npDepartment">${opts('DEPARTMENT','Seleziona dipartimento...')}</select></label>
      <label>Profilo<select id="npProfile">${opts('PROFILE','Seleziona profilo...')}</select></label>
      <label>Postazione<input id="npDesk" placeholder="Es. A-12"></label>
      <label class="full">Note<textarea id="npNotes" rows="3"></textarea></label>
      <div class="button-row full"><button class="primary">Crea persona + ingresso</button><button id="npCancel" type="button" class="ghost">Annulla</button></div>
    </form>
    <p id="npResult"></p>
  </div>`;
  $('npDate').value=new Date().toISOString().slice(0,10);
  ['npCompany','npSite','npDepartment','npProfile'].forEach(id=>enhanceSelect(id,{placeholder:'Seleziona...',searchPlaceholder:'Cerca…'}));
  $('npCancel').onclick=()=>people();
  $('newPersonForm').onsubmit=async e=>{
    e.preventDefault();
    try{
      const first=$('npFirst').value.trim(), surname=$('npSurname').value.trim();
      const display=`${first} ${surname}`.trim();
      const email=$('npEmail').value.trim().toLowerCase();
      if(email&&!email.endsWith('@archea.it'))throw new Error('La mail deve essere aziendale @archea.it');
      const key=normSearch(display);
      const existing=email?await select('people',`select=id,display_name&corporate_email=ilike.${encodeURIComponent(email)}&limit=2`):await select('people',`select=id,display_name&normalized_name_key=eq.${encodeURIComponent(key)}&limit=2`);
      if(existing.length)throw new Error(`Esiste già una scheda compatibile: ${existing.map(x=>x.display_name).join(', ')}`);
      const personRows=await insert('people',{
        display_name:display,first_name:first,surname,normalized_name_key:key,corporate_email:email||null,
        company:$('npCompany').value||null,site:$('npSite').value||null,department:$('npDepartment').value||null,profile:$('npProfile').value||null,
        current_status:'PREVISTO',verification_status:'DA VERIFICARE',primary_source:'MANUALE',notes:$('npNotes').value.trim()||null,
        created_by:user.id,created_by_name:currentITName(),updated_at:new Date().toISOString()
      });
      const person=personRows[0];
      const date=$('npDate').value;
      const desk=$('npDesk').value.trim();
      const ticketRows=await insert('tickets',{
        categoria:'Movimento persona',oggetto:`NUOVO INGRESSO - ${display}`,
        descrizione:[`Movimento: NUOVO INGRESSO`,`Persona: ${display}`,email?`Email: ${email}`:'',`Sede: ${$('npSite').value}`,desk?`Postazione: ${desk}`:'',$('npNotes').value.trim()?`Note: ${$('npNotes').value.trim()}`:''].filter(Boolean).join('\n'),
        stato:'APERTO',priorita:'NORMALE',richiedente_nome:profile.nome||user.email,richiedente_email:user.email,created_by:user.id,created_by_name:currentITName(),origine:'HR',sede:$('npSite').value||null
      });
      const ticket=ticketRows[0];
      const ticketNo=`MOV-${new Date().getFullYear()}-${String(ticket.id).padStart(5,'0')}`;
      await update('tickets',`id=eq.${ticket.id}`,{numero_ticket:ticketNo});
      await insert('hr_movements',{
        movement_type:'NUOVO INGRESSO',movement_date:date,person_name:first,person_surname:surname,person_email:email||null,
        current_site:null,new_site:$('npSite').value||null,current_desk:null,new_desk:desk||null,notes:$('npNotes').value.trim()||null,
        created_by:user.id,created_by_email:user.email,created_by_name:currentITName(),status:'DA VERIFICARE',person_state_before:'SCONOSCIUTO',needs_manual_check:false,person_id:person.id,ticket_id:ticket.id
      },true);
      await insert('person_events',{person_id:person.id,event_type:'INGRESSO_RICHIESTO',event_date:date,source_type:'PORTALE',note:'Nuovo ingresso creato dal portale; in attesa di conferma HR.',new_data:{site:$('npSite').value||null,desk:desk||null,status:'DA VERIFICARE'},created_by:user.id,created_by_name:currentITName()},false);
      await insert('ticket_history',{ticket_id:ticket.id,evento:'Nuovo ingresso creato; in attesa di conferma HR',autore:currentITName()},false);
      $('npResult').innerHTML=`<div class="movement-success"><b>Persona e ingresso creati</b><span>${esc(display)} · ${esc(ticketNo)} · DA VERIFICARE HR</span></div>`;
      toast('Nuovo ingresso creato');
      setTimeout(()=>personDetail(person.id),700);
    }catch(err){$('npResult').innerHTML=`<span class="err">${esc(err.message)}</span>`}
  };
}

async function referenceValues(){
  const epoch=navigationEpoch;
  if(!canManageHRValues())return people();
  page('Valori controllati','Dropdown approvati per anagrafiche e movimenti');
  const rows=await select('reference_values','select=*&order=value_type.asc,value.asc');
  if(epoch!==navigationEpoch)return;
  const types=isSuperIT()?['COMPANY','SITE','DEPARTMENT','PROFILE','CATEGORY']:['COMPANY','SITE','DEPARTMENT','PROFILE'];
  $('content').innerHTML=`<div class="panel">
    <div class="panel-head-row"><div><h3>Valori master</h3><p class="muted-line">I valori importati dall'HR entrano come candidati non approvati. HR può approvare i valori anagrafici del proprio ambito; SUPER_IT gestisce anche le categorie Asset.</p></div><button id="backReferenceValues" class="ghost">Torna alle persone</button></div>
    <form id="referenceValueForm" class="formgrid compact-grid">
      <label>Tipo<select id="refType">${types.map(x=>`<option>${x}</option>`).join('')}</select></label>
      <label>Nuovo valore<input id="refValue" required></label>
      <label class="check-inline"><input id="refApproved" type="checkbox" checked> Approvato</label>
      <div class="button-row full"><button class="primary">Aggiungi</button></div>
    </form>
  </div>
  <div class="panel"><div class="reference-groups">${types.map(t=>{
    const g=rows.filter(x=>x.value_type===t);
    return `<div class="reference-group"><h3>${esc(t)}</h3>${g.length?g.map(x=>`<div class="reference-row"><div><b>${esc(x.value)}</b><span>${x.is_approved?'APPROVATO':'CANDIDATO'}${x.source_type?` · ${esc(x.source_type)}`:''}</span></div><button class="${x.is_approved?'ghost':'secondary'} compact" data-ref-toggle="${x.id}" data-next="${x.is_approved?'false':'true'}">${x.is_approved?'Disattiva':'Approva'}</button></div>`).join(''):'<div class="empty">Nessun valore.</div>'}</div>`
  }).join('')}</div></div>`;
  $('backReferenceValues').onclick=()=>people();
  $('referenceValueForm').onsubmit=async e=>{e.preventDefault();try{
    let value=$('refValue').value.trim();if(!value)throw new Error('Inserisci un valore');
    if($('refType').value==='CATEGORY')value=value.toUpperCase();
    await insert('reference_values',{value_type:$('refType').value,value,normalized_value:normSearch(value),is_approved:$('refApproved').checked,source_type:'MANUALE',created_by:user.id,created_by_name:currentITName()},false);
    toast('Valore aggiunto');referenceValues();
  }catch(err){toast(err.message)}};
  document.querySelectorAll('[data-ref-toggle]').forEach(b=>b.onclick=async()=>{try{await update('reference_values',`id=eq.${b.dataset.refToggle}`,{is_approved:b.dataset.next==='true',updated_at:new Date().toISOString()});referenceValues()}catch(err){toast(err.message)}});
}


async function legacyPersonCreate(sourceName){
  if(!isITRole())return;
  page('Crea scheda storica','Da riferimento legacy Device');
  $('content').innerHTML=`<div class="panel person-form-panel">
    <div class="info-box"><b>Valore originale Device:</b> ${esc(sourceName)}<br>Il valore raw resterà invariato. Nome e cognome sotto vengono inseriti solo se li conosci con certezza.</div>
    <form id="legacyPersonForm" class="formgrid">
      <label>Nome<input id="legacyFirst" placeholder="Opzionale"></label>
      <label>Cognome<input id="legacySurname" placeholder="Opzionale"></label>
      <label class="full">Note<textarea id="legacyNote" rows="3" placeholder="Es. ex collaboratrice; dato ricostruito dal censimento"></textarea></label>
      <div class="button-row full"><button class="primary">Crea scheda</button><button id="legacyCancel" type="button" class="ghost">Annulla</button></div>
    </form>
  </div>`;
  $('legacyCancel').onclick=()=>people();
  $('legacyPersonForm').onsubmit=async e=>{e.preventDefault();try{
    const res=await rpc('v6_create_person_from_legacy',{p_source_name:sourceName,p_first_name:$('legacyFirst').value.trim()||null,p_surname:$('legacySurname').value.trim()||null,p_note:$('legacyNote').value.trim()||null});
    toast(`Scheda creata · ${res.source_records_linked||0} riferimenti collegati`);openSubView('person-detail',()=>personDetail(res.person_id));
  }catch(err){toast(err.message)}};
}

async function personDetail(id){
  if(!isHROrIT())return;
  const [pr,sources,events,assignments,allAssets,hrMoves]=await Promise.all([
    select('people',`select=*&id=eq.${id}`),
    select('people_source_records',`select=*&person_id=eq.${id}&order=source_type.asc,source_page.asc,source_row.asc&limit=500`),
    select('person_events',`select=*&person_id=eq.${id}&order=created_at.desc&limit=200`),
    select('asset_assignments',`select=*&person_id=eq.${id}&order=created_at.desc&limit=200`),
    selectAll('assets','select=id,asset_code,category,brand,model,serial_number,site,position,assigned_person_id,assigned_user_name,status,verification_status,is_label_only&is_label_only=eq.false&order=asset_code.asc'),
    select('hr_movements',`select=*&person_id=eq.${id}&order=movement_date.desc,created_at.desc&limit=200`)
  ]);
  if(!pr.length)return people();const p=pr[0];
  const deviceNames=new Set(sources.filter(s=>s.source_type==='DEVICE'&&s.name_raw).map(s=>normSearch(s.name_raw)));
  const pdfRoles=[...new Set(sources.filter(s=>s.source_type==='PDF_CHI_SIAMO'&&s.role_raw).map(s=>s.role_raw))];
  const pdfFunctions=[...new Set(sources.filter(s=>s.source_type==='PDF_CHI_SIAMO'&&['HEAD OF STUDIO','TECHNICAL DIRECTOR','PERSONAL ASSISTANTS'].includes(s.department_raw)).map(s=>s.department_raw))];
  const linked=allAssets.filter(a=>a.assigned_person_id===id);
  const candidates=allAssets.filter(a=>!a.assigned_person_id&&a.assigned_user_name&&deviceNames.has(normSearch(a.assigned_user_name)));
  const histAssignments=assignments.filter(a=>a.assignment_status==='CHIUSA');
  page(p.display_name,'Scheda persona e verifica fisica');

  $('content').innerHTML=`
    <div class="panel person-hero">
      <div class="person-head"><div><span class="eyebrow">PERSONA</span><h3>${esc(p.display_name)}</h3><div class="source-chips">${[...new Set(sources.map(x=>x.source_type))].map(sourceBadge).join('')}</div></div><div class="asset-badges">${personStatusBadge(p.current_status)} ${personVerifyBadge(p.verification_status)}</div></div>
      <div class="person-info-grid">
        <div><span>Società</span><b>${esc(p.company||'—')}</b></div><div><span>Sede</span><b>${esc(p.site||'—')}</b></div>
        <div><span>Dipartimento</span><b>${esc(p.department||'—')}</b></div><div><span>Profilo operativo</span><b>${esc(p.profile||'—')}</b></div>
        <div><span>Ruolo PDF</span><b>${esc(pdfRoles.join(' / ')||'—')}</b></div><div><span>Funzione / sezione PDF</span><b>${esc(pdfFunctions.join(' / ')||'—')}</b></div>
        <div><span>Email</span><b>${esc(p.corporate_email||'—')}</b></div><div><span>Uscita</span><b>${p.exit_date?dateOnly(p.exit_date):'—'}</b></div>
      </div>
      ${p.notes?`<div class="info-box"><b>Note:</b> ${esc(p.notes)}</div>`:''}
      ${p.verified_at?`<p class="verified-line">Scheda verificata da <b>${esc(p.verified_by||'IT')}</b> il ${fmt(p.verified_at)}</p>`:''}
      <div class="button-row">
        ${isITRole()&&p.verification_status!=='VERIFICATO'?'<button id="confirmPerson" class="primary">Conferma scheda persona</button>':''}
        <button id="editPerson" class="secondary">Correggi dati</button>
        <button id="personMovement" class="secondary">Registra movimento</button>
        ${p.current_status!=='USCITO'?'<button id="showPersonExit" class="danger-soft">Registra uscita</button>':''}
        ${isITRole()?'<button id="deletePersonRecord" class="danger-soft">Richiedi eliminazione</button>':''}
        <button id="backPeople" class="ghost">Torna alle persone</button>
      </div>
      ${p.current_status!=='USCITO'?`<div id="personExitForm" class="person-exit-form hidden"><div class="info-box"><b>Uscita = movimento HR.</b><br>La richiesta viene creata come DA VERIFICARE e diventa ufficiale solo dopo conferma HR.</div><div class="button-row"><button id="startExitMovement" type="button" class="danger-btn">Continua con USCITA</button><button id="cancelPersonExit" type="button" class="ghost">Annulla</button></div></div>`:''}
    </div>

    <div class="panel"><div class="panel-head-row"><div><h3>Asset attuali / da confermare</h3><p class="muted-line">Conferma solo dopo controllo fisico del dispositivo e dell'etichetta.</p></div>${candidates.length?`<button id="confirmAllCandidateAssets" class="secondary compact">Conferma tutti (${candidates.length})</button>`:''}</div>
      <div class="person-assets-list">
        ${linked.map(a=>assetPersonRow(a,true)).join('')}
        ${candidates.map(a=>assetPersonRow(a,false)).join('')}
        ${!linked.length&&!candidates.length?'<div class="empty"><b>Nessun asset collegato.</b><br><span>È normale finché il foglio Device non viene importato. Dopo l’import, qui compariranno gli asset legacy riconducibili alla persona e quelli già verificati.</span></div>':''}
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel"><h3>Fonti originali</h3>${sources.length?`<div class="source-records">${sources.map(s=>sourceRecordHtml(s)).join('')}</div>`:'<div class="empty">Nessuna fonte collegata.</div>'}</div>
      <div class="panel"><h3>Storico persona</h3>${personHistoryHtml(events,hrMoves,histAssignments)}</div>
    </div>`;

  function assetPersonRow(a,confirmed){return `<div class="person-asset-row"><div><b>${esc(a.asset_code)}</b><span>${esc([a.brand,a.model].filter(Boolean).join(' ')||a.category||'Asset')} · ${esc(a.site||'sede non indicata')} ${a.position?`· ${esc(a.position)}`:''}</span><small>${confirmed?'Collegato alla persona':'Legacy Device: '+esc(a.assigned_user_name||'')}</small></div><div class="person-asset-actions">${assetStatusBadge(a.status)} ${verifyBadge(a.verification_status)} ${!confirmed?`<button class="primary compact" data-confirm-person-asset="${a.id}">Conferma assegnazione</button>`:''}<button class="ghost compact" data-open-person-asset="${a.id}">Apri asset</button></div></div>`}
  function sourceRecordHtml(s){
    const details=s.source_type==='PDF_CHI_SIAMO'?`pagina ${s.source_page||'—'} · ${s.role_raw||s.profile_raw||''} ${s.department_raw?`· ${s.department_raw}`:''} ${s.site_raw?`· ${s.site_raw}`:''}`:
      s.source_type==='HR_MOVIMENTI'?`riga ${s.source_row||'—'} · ${s.movement_type_raw||''} ${s.movement_status_raw?`· ${s.movement_status_raw}`:''} ${s.movement_date_raw?`· ${s.movement_date_raw}`:''}`:
      `riga ${s.source_row||'—'} ${s.site_raw?`· ${s.site_raw}`:''}`;
    return `<div class="source-record"><div>${sourceBadge(s.source_type)} <b>${esc(s.name_raw||p.display_name)}</b></div><small>${esc(details.trim())}</small></div>`;
  }
  function personHistoryHtml(ev,hm,ha){
    const items=[];
    for(const x of ev)items.push({d:x.created_at||x.event_date,title:x.event_type,txt:x.note||'',src:x.source_type||'PORTALE'});
    for(const x of hm)items.push({d:x.movement_date,title:x.movement_type,txt:[x.current_site,x.new_site,x.notes].filter(Boolean).join(' · '),src:x.is_historical?'HR STORICO':'HR'});
    for(const x of ha)items.push({d:x.updated_at||x.created_at,title:'ASSET '+(x.assignment_status||''),txt:`Asset #${x.asset_id}${x.assigned_to?` · fino al ${x.assigned_to}`:''}`,src:x.source_type||'ASSET'});
    items.sort((a,b)=>new Date(b.d||0)-new Date(a.d||0));
    return items.length?`<div class="history-list">${items.slice(0,100).map(x=>`<div class="history-item"><div><b>${esc(x.title)}</b> <span class="source-mini">${esc(x.src)}</span></div><div>${esc(x.txt||'')}</div><small>${x.d?fmt(x.d):'Data non nota'}</small></div>`).join('')}</div>`:'<div class="empty">Nessuno storico disponibile.</div>';
  }

  $('backPeople').onclick=()=>people();
  $('editPerson').onclick=()=>openSubView('person-edit',()=>personEdit(id));
  $('personMovement').onclick=()=>{movementPrefill={first:p.first_name||'',surname:p.surname||'',email:p.corporate_email||'',currentSite:p.site||''};nav('hr-new')};
  if($('confirmPerson'))$('confirmPerson').onclick=async()=>{try{await rpc('v6_confirm_person',{p_person_id:id});toast('Scheda persona verificata');personDetail(id)}catch(err){toast(err.message)}};
  document.querySelectorAll('[data-open-person-asset]').forEach(b=>b.onclick=()=>openSubView('asset-detail',()=>assetDetail(+b.dataset.openPersonAsset)));
  document.querySelectorAll('[data-confirm-person-asset]').forEach(b=>b.onclick=async()=>{try{await rpc('v6_confirm_asset_assignment',{p_asset_id:+b.dataset.confirmPersonAsset,p_person_id:id});toast('Assegnazione verificata');personDetail(id)}catch(err){toast(err.message)}});
  if($('confirmAllCandidateAssets'))$('confirmAllCandidateAssets').onclick=async()=>{
    if(!window.confirm(`Confermare fisicamente tutti i ${candidates.length} asset legacy visualizzati per ${p.display_name}?`))return;
    try{for(const a of candidates)await rpc('v6_confirm_asset_assignment',{p_asset_id:a.id,p_person_id:id});toast(`${candidates.length} assegnazioni verificate`);personDetail(id)}catch(err){toast(err.message)}
  };
  if($('showPersonExit'))$('showPersonExit').onclick=()=>$('personExitForm').classList.remove('hidden');
  if($('cancelPersonExit'))$('cancelPersonExit').onclick=()=>$('personExitForm').classList.add('hidden');
  if($('startExitMovement'))$('startExitMovement').onclick=()=>{movementPrefill={type:'USCITA',first:p.first_name||'',surname:p.surname||'',email:p.corporate_email||'',currentSite:p.site||''};nav('hr-new')};
  if($('deletePersonRecord'))$('deletePersonRecord').onclick=async()=>{
    const reason=window.prompt(`Richiesta eliminazione per "${p.display_name}".\n\nIndica il motivo (es. record creato per errore, duplicato accidentale):`,'');
    if(reason===null)return;
    if(!reason.trim()){window.alert('Il motivo è obbligatorio.');return;}
    try{await rpc('v6_request_deletion',{p_entity_type:'PERSON',p_entity_id:id,p_reason:reason.trim()});toast('Richiesta inviata a SUPER_IT')}catch(err){window.alert(err.message)}
  };
}

async function personEdit(id){
  if(!isHROrIT())return people();
  const [r,refs]=await Promise.all([select('people',`select=*&id=eq.${id}`),select('reference_values','select=*&is_approved=eq.true&order=value_type.asc,value.asc')]);if(!r.length)return people();const p=r[0];
  const refOptions=(type,current)=>{const vals=refs.filter(x=>x.value_type===type).map(x=>x.value);if(current&&!vals.includes(current))vals.unshift(current);return `<option value="">—</option>${vals.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v)}${current===v&&!refs.some(x=>x.value_type===type&&x.value===v)?' · attuale':''}</option>`).join('')}`};
  page('Correggi dati persona',p.display_name);
  $('content').innerHTML=`<div class="panel person-form-panel"><form id="personEditForm" class="formgrid">
    <div class="full info-box"><b>Correzione dato</b><br>Usa questa schermata solo per correggere un dato compilato male. Non crea ingressi, uscite o spostamenti e non entra nelle statistiche HR. Per un cambiamento reale usa <b>Registra movimento</b>.</div>
    <label>Nome<input id="peFirst" value="${esc(p.first_name||'')}"></label><label>Cognome<input id="peSurname" value="${esc(p.surname||'')}"></label>
    <label>Nome visualizzato<input id="peDisplay" value="${esc(p.display_name||'')}" required></label><label>Email aziendale<input id="peEmail" type="email" value="${esc(p.corporate_email||'')}"></label>
    <label>Società<select id="peCompany">${refOptions('COMPANY',p.company)}</select></label><label>Sede<select id="peSite">${refOptions('SITE',p.site)}</select></label>
    <label>Dipartimento<select id="peDepartment">${refOptions('DEPARTMENT',p.department)}</select></label><label>Profilo operativo<select id="peProfile">${refOptions('PROFILE',p.profile)}</select></label>
    <label class="full">Note<textarea id="peNotes" rows="4">${esc(p.notes||'')}</textarea></label>
    <label class="full">Motivo della correzione<input id="peReason" required placeholder="Es. sede inserita erroneamente durante il censimento"></label>
    <div class="button-row full"><button class="primary">Salva correzione</button><button id="cancelPersonEdit" type="button" class="ghost">Annulla</button></div>
  </form></div>`;
  enhanceSelect('peCompany',{placeholder:'Seleziona società',searchPlaceholder:'Cerca società…'});
  enhanceSelect('peSite',{placeholder:'Seleziona sede',searchPlaceholder:'Cerca sede…'});
  enhanceSelect('peDepartment',{placeholder:'Seleziona dipartimento',searchPlaceholder:'Cerca dipartimento…'});
  enhanceSelect('peProfile',{placeholder:'Seleziona profilo',searchPlaceholder:'Cerca profilo…'});
  $('cancelPersonEdit').onclick=()=>personDetail(id);
  $('personEditForm').onsubmit=async e=>{e.preventDefault();try{
    const display=$('peDisplay').value.trim();if(!display)throw new Error('Nome visualizzato obbligatorio');
    const email=$('peEmail').value.trim().toLowerCase();if(email&&!email.endsWith('@archea.it'))throw new Error('La mail deve essere aziendale @archea.it');
    const reason=$('peReason').value.trim();if(!reason)throw new Error('Indica il motivo della correzione');
    const patch={display_name:display,first_name:$('peFirst').value.trim()||null,surname:$('peSurname').value.trim()||null,corporate_email:email||null,company:$('peCompany').value.trim()||null,site:$('peSite').value.trim()||null,department:$('peDepartment').value.trim()||null,profile:$('peProfile').value.trim()||null,notes:$('peNotes').value.trim()||null};
    await rpc('v6_correct_person_data',{p_person_id:id,p_patch:patch,p_reason:reason});
    toast('Correzione registrata');personDetail(id);
  }catch(err){toast(err.message)}};
}


async function census(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page('Censimento','Inventario IT, verifica asset e storico');

  // V8.2.2: render immediato. Non lasciare mai il corpo della pagina precedente
  // mentre il censimento (migliaia di righe) viene caricato da Supabase.
  $('content').innerHTML=`
    <section class="overview-hero census-loading-shell">
      <div class="overview-number"><span>PATRIMONIO IT</span><b>…</b><small>caricamento censimento</small></div>
      <div class="overview-stats">
        <div><span>Asset</span><b>—</b></div><div><span>Assegnati</span><b>—</b></div>
        <div><span>Da verificare</span><b>—</b></div><div><span>Conflitti</span><b>—</b></div>
      </div>
      <div class="info-box">Caricamento del censimento in corso…</div>
    </section>`;

  let rows,conflictRows,peopleRows,approvedSites;
  try{
    [rows,conflictRows,peopleRows,approvedSites]=await Promise.all([
      selectAll('assets','select=*&order=asset_code.asc'),
      select('data_conflicts','select=*&status=eq.APERTO&source_type=eq.DEVICE&order=created_at.desc&limit=200'),
      select('people','select=id,display_name'),
      select('reference_values','select=value&value_type=eq.SITE&is_approved=eq.true&order=value.asc')
    ]);
  }catch(err){
    if(epoch!==navigationEpoch)return;
    $('content').innerHTML=`<div class="panel error-panel"><h3>Impossibile caricare il censimento</h3><p>${esc(err?.message||'Errore sconosciuto')}</p><button id="retryCensus" class="primary">Riprova</button></div>`;
    if($('retryCensus'))$('retryCensus').onclick=()=>census();
    return;
  }
  if(epoch!==navigationEpoch)return;
  const peopleMap=new Map(peopleRows.map(p=>[p.id,p]));
  rows.forEach(a=>a.current_person_name=a.assigned_person_id?peopleMap.get(a.assigned_person_id)?.display_name||'':'');
  let q='',site='',status='',verification='',assetSort='code',assetSortDir='asc',showAssetList=false;

  const realAssets=rows.filter(x=>!x.is_label_only);
  const labelOnly=rows.filter(x=>x.is_label_only);
  const hasDeviceImport=rows.some(x=>normSearch(x.source_sheet)==='device');
  const sites=(approvedSites||[]).map(x=>x.value).filter(Boolean);

  $('content').innerHTML=`
    <section class="overview-hero">
      <div class="overview-number"><span>PATRIMONIO IT</span><b>${realAssets.length.toLocaleString('it-IT')}</b><small>asset censiti</small></div>
      <div class="overview-stats">
        <div><span>Assegnati</span><b>${realAssets.filter(x=>x.assigned_person_id||x.status==='ASSEGNATO'||x.status==='IN PRESTITO').length}</b></div>
        <div><span>Non assegnati</span><b>${realAssets.filter(x=>!x.assigned_person_id&&x.status!=='ASSEGNATO'&&x.status!=='IN PRESTITO').length}</b></div>
        <div><span>Da verificare</span><b>${realAssets.filter(x=>x.verification_status!=='VERIFICATO').length}</b></div>
        <div><span>Conflitti</span><b>${conflictRows.length}</b></div>
      </div>
      <div class="overview-chart"><div class="donut" style="--p:${realAssets.length?Math.round(100*realAssets.filter(x=>x.assigned_person_id||x.status==='ASSEGNATO'||x.status==='IN PRESTITO').length/realAssets.length):0}"></div><div><b>Assegnati / non assegnati</b><small>Le etichette libere (${labelOnly.length.toLocaleString('it-IT')}) sono conteggiate separatamente.</small></div></div>
    </section>

    <div class="search-stage">
      ${!hasDeviceImport?'<div class="info-box"><b>Foglio Device non ancora importato.</b><br>Il censimento non è vuoto per errore: al momento contiene solo eventuali record manuali/test. Usa <b>Importa foglio Device</b> per caricare il censimento reale.</div>':''}
      <div class="asset-toolbar">
        <input id="assetSearch" placeholder="Cerca: laptop, Dell, Milano, A0345, Mario Rossi...">
        <select id="assetSite"><option value="">Tutte le sedi</option>${sites.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
        <select id="assetStatus">
          <option value="">Tutti gli stati</option>
          <option value="ETICHETTA LIBERA">ETICHETTA LIBERA</option>
          <option>DISPONIBILE</option><option>ASSEGNATO</option><option>PRENOTATO</option><option>IN PRESTITO</option>
          <option>IN MANUTENZIONE</option><option>GUASTO</option><option>DISMESSO</option><option>VENDUTO</option><option>DA VERIFICARE</option>
        </select>
        <select id="assetVerification">
          <option value="">Tutte le verifiche</option>
          <option>VERIFICATO</option><option>DA VERIFICARE</option><option>DUBBIO</option><option>NON TROVATO</option><option>ASSEGNAZIONE DA CONFERMARE</option>
        </select>
        <select id="assetSort"><option value="code">Ordina: Codice</option><option value="category">Ordina: Categoria</option><option value="site">Ordina: Sede</option><option value="position">Ordina: Posizione</option><option value="assignee">Ordina: Assegnatario</option><option value="status">Ordina: Stato</option></select>
        <select id="assetSortDir"><option value="asc">A→Z / crescente</option><option value="desc">Z→A / decrescente</option></select>
      </div>

      <div class="asset-search-summary" id="assetSearchSummary"></div>

      <div class="button-row asset-actions">
        <button id="newAsset" class="primary">+ Associa etichetta a dispositivo</button>
        <button id="scanAsset" class="secondary">Fotocamera / Scansiona</button>
        <button id="exportCensusXls" class="ghost">Scarica Censimento XLS</button>
        ${isSuperIT()?'<button id="importAssets" class="secondary">Importa foglio Device</button>':''}
      </div>

      <div class="explore-head"><button id="toggleAssetList" class="ghost">⌕ Esplora censimento</button><span>La lista appare solo quando cerchi, filtri o scegli di esplorare.</span></div><div id="assetTable"></div>
    </div>

    ${conflictRows.length?`<section class="editorial-section conflict-section"><div class="section-kicker">CONTROLLO QUALITÀ</div><div class="section-title-row"><h3>Conflitti da verificare</h3><span class="section-count">${conflictRows.length}</span></div><div class="conflict-list">${conflictRows.map(c=>{const d=c.details||{};const codes=(d.codes||[]);const rr=(d.rows||[]);return `<article class="conflict-compare"><div class="conflict-main"><span class="conflict-type">${esc(c.conflict_type==='DUPLICATE_SERIAL'?'SERIALE DUPLICATO':c.conflict_type==='DUPLICATE_CODE'?'CODICE DUPLICATO':c.conflict_type)}</span><h4>${esc(c.conflict_key)}</h4><p>${esc(c.description||'Nessuna correzione automatica.')}</p>${codes.length?`<div class="compare-strip">${codes.map((code,i)=>`<button class="compare-device" data-conflict-code="${esc(code)}"><b>${esc(code)}</b><small>riga ${esc(rr[i]||'—')}</small></button>`).join('<span class="compare-vs">VS</span>')}</div>`:''}</div><div class="conflict-actions">${canConfirmConflictResolution()?`<button class="secondary compact" data-confirm-conflict="${c.id}">✓ Conferma risoluzione</button>`:`<button class="ghost compact" data-request-conflict="${c.id}">! Segnala risolto</button>`}</div></article>`}).join('')}</div></section>`:''}

    ${isSuperIT()?`<div id="importPanel" class="panel hidden">
      <h3>Importazione foglio Device</h3>
      <p class="muted-line">Viene letto esclusivamente il foglio <b>Device</b>. Tutti gli altri fogli Excel vengono ignorati.</p>
      <label>File censimento .xlsx<input id="assetFile" type="file" accept=".xlsx,.xls"></label>
      <div class="info-box">
        <b>Regola etichette:</b> se una riga contiene solo il codice e tutte le celle successive sono vuote, il codice viene registrato come <b>ETICHETTA LIBERA</b>. Se dopo il codice esiste già almeno un valore, il codice è considerato già associato a un dispositivo.<br><br>
        Password, PIN e PUK non vengono importati. Gli asset già <b>VERIFICATI</b> non vengono sovrascritti.
      </div>
      <button id="runAssetImport" class="primary">Importa Device</button>
      <p id="assetImportResult"></p>
    </div>`:''}`;

  const render=()=>{
    let filtered=rows.filter(x=>{
      if(site&&x.site!==site)return false;
      if(status==='ETICHETTA LIBERA'&&!x.is_label_only)return false;
      if(status&&status!=='ETICHETTA LIBERA'&&(x.is_label_only||x.status!==status))return false;
      if(verification&&x.verification_status!==verification)return false;
      if(q&&!matchesAssetSearch(x,q))return false;
      return true;
    });
    const assetSortValue=a=>assetSort==='category'?(a.category||''):assetSort==='site'?(a.site||''):assetSort==='position'?(a.position||''):assetSort==='assignee'?(a.current_person_name||a.assigned_user_name||a.assigned_user_email||''):assetSort==='status'?(a.status||''):(a.asset_code||'');
    filtered.sort((a,b)=>{const cmp=String(assetSortValue(a)).localeCompare(String(assetSortValue(b)),'it',{numeric:true,sensitivity:'base'});return assetSortDir==='asc'?cmp:-cmp});

    const visible=filtered.slice(0,500);
    const filteredAssets=filtered.filter(x=>!x.is_label_only);
    const assigned=filteredAssets.filter(x=>x.assigned_person_id||x.status==='ASSEGNATO'||x.status==='IN PRESTITO').length;
    const available=filteredAssets.filter(x=>x.status==='DISPONIBILE').length;
    const freeLabels=filtered.filter(x=>x.is_label_only).length;

    $('assetSearchSummary').innerHTML=`
      <div><span>Risultati</span><b>${filtered.length}</b></div>
      <div><span>Dispositivi</span><b>${filteredAssets.length}</b></div>
      <div><span>Assegnati</span><b>${assigned}</b></div>
      <div><span>Disponibili</span><b>${available}</b></div>
      <div><span>Etichette libere</span><b>${freeLabels}</b></div>`;

    const shouldShow=showAssetList||!!q||!!site||!!status||!!verification;
    $('assetTable').innerHTML=shouldShow&&filtered.length?`
      ${filtered.length>visible.length?`<div class="info-box compact-info">Risultati totali: <b>${filtered.length}</b>. Per mantenere il portale veloce sono visualizzate le prime <b>${visible.length}</b> righe: usa ricerca e filtri per restringere.</div>`:''}
      <div class="tablewrap"><table class="asset-table">
        <thead><tr><th>Codice</th><th>Categoria / Modello</th><th>Sede / Posizione</th><th>Assegnato a</th><th>Stato</th><th>Verifica</th><th>Ultima verifica</th></tr></thead>
        <tbody>${visible.map(a=>`<tr class="click ${a.is_label_only?'label-only-row':''}" data-asset="${a.id}">
          <td><b>${esc(a.asset_code)}</b><small class="subline">${a.is_label_only?'Codice predisposto':esc(a.serial_number||'')}</small></td>
          <td><b>${a.is_label_only?'—':esc(a.category||'—')}</b><small class="subline">${a.is_label_only?'Etichetta non ancora applicata':esc([a.brand,a.model].filter(Boolean).join(' ')||'')}</small></td>
          <td>${a.is_label_only?'—':esc(a.site||'—')}<small class="subline">${a.is_label_only?'':esc(a.position||'')}</small></td>
          <td>${a.is_label_only?'—':a.current_person_name?`<b>${esc(a.current_person_name)}</b>`:(a.assigned_user_name?`${a.status==='DA VERIFICARE'?'<small class="subline">LEGACY DA CONFERMARE</small>':''}${esc(a.assigned_user_name)}`:esc(a.assigned_user_email||'—'))}</td>
          <td>${assetTypeBadge(a)}</td>
          <td>${a.is_label_only?'—':verifyBadge(a.verification_status)}</td>
          <td>${a.is_label_only?'—':(a.verified_at?`${fmt(a.verified_at)}<small class="subline">${esc(a.verified_by||'')}</small>`:'—')}</td>
        </tr>`).join('')}</tbody>
      </table></div>`:shouldShow?'<div class="empty">Nessun risultato.</div>':'';

    document.querySelectorAll('[data-asset]').forEach(x=>x.onclick=()=>openSubView('asset-detail',()=>assetDetail(+x.dataset.asset)));
  };

  $('assetSearch').oninput=e=>{q=e.target.value;showAssetList=!!q||showAssetList;render()};
  $('assetSite').onchange=e=>{site=e.target.value;showAssetList=!!site||showAssetList;render()};
  $('assetStatus').onchange=e=>{status=e.target.value;showAssetList=!!status||showAssetList;render()};
  $('assetVerification').onchange=e=>{verification=e.target.value;showAssetList=!!verification||showAssetList;render()};
  $('assetSort').onchange=e=>{assetSort=e.target.value;render()};
  $('assetSortDir').onchange=e=>{assetSortDir=e.target.value;render()};
  $('newAsset').onclick=()=>openSubView('asset-edit',()=>assetEdit(null));
  $('scanAsset').onclick=()=>openAssetScanner(rows);
  $('exportCensusXls').onclick=()=>{
    const exportRows=[['Codice','Categoria','Marca','Modello','Seriale','Sede','Posizione','Assegnatario','Stato','Verifica','Etichetta libera','Fonte','Riga fonte']];
    rows.forEach(a=>exportRows.push([a.asset_code||'',a.category||'',a.brand||'',a.model||'',a.serial_number||'',a.site||'',a.position||'',a.current_person_name||a.assigned_user_name||a.assigned_user_email||'',a.is_label_only?'ETICHETTA LIBERA':(a.status||''),a.verification_status||'',a.is_label_only?'SI':'NO',a.source_sheet||'',a.source_row||'']));
    downloadXls(`Archea_Censimento_${new Date().toISOString().slice(0,10)}.xls`,[{name:'Censimento',rows:exportRows}]);
  };

  if($('importAssets'))$('importAssets').onclick=()=>{
    const panel=$('importPanel');
    if(!panel)return;
    const opening=panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if(opening){
      const row=$('importAssets').closest('.asset-actions')||$('importAssets').closest('.button-row');
      if(row)row.after(panel);
      requestAnimationFrame(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}));
    }
  };

  if($('runAssetImport'))$('runAssetImport').onclick=async()=>{
    const file=$('assetFile').files?.[0];
    if(!file)return toast('Seleziona il file Excel del censimento');

    const btn=$('runAssetImport');
    btn.disabled=true;
    const originalLabel=btn.textContent;
    btn.textContent='Importazione in corso...';
    $('assetImportResult').innerHTML='<b>Preparazione del foglio Device...</b>';

    try{
      const b64=await new Promise((resolve,reject)=>{
        const r=new FileReader();
        r.onload=()=>resolve(String(r.result).split(',')[1]);
        r.onerror=()=>reject(r.error);
        r.readAsDataURL(file);
      });

      const chunkSize=200;
      const importBatch=`device-ui-${Date.now()}`;
      let offset=0;
      let total=null;
      let chunksDone=0;
      const totals={
        inserted:0,updated:0,device_inserted:0,device_updated:0,
        label_only_inserted:0,label_only_existing:0,skipped_verified:0,
        skipped_invalid:0,occupied_conflicts:0,duplicate_existing_marked:0,
        device_source_records:0,unchanged:0
      };
      let duplicateCodeGroups=0;
      let duplicateSerialGroups=0;
      let lastRes=null;

      while(true){
        const pct=total?Math.min(100,Math.round((offset/total)*100)):0;
        $('assetImportResult').innerHTML=`
          <b>Importazione Device a blocchi</b><br>
          ${total?`Elaborati <b>${offset}</b> / <b>${total}</b> codici · <b>${pct}%</b>`:'Analisi del file in corso...'}
          <div style="margin-top:8px;height:8px;border-radius:4px;overflow:hidden;background:rgba(127,127,127,.18)">
            <div style="height:100%;width:${pct}%;background:currentColor;opacity:.55;transition:width .2s"></div>
          </div>
          <small class="subline">Blocco ${chunksDone+1} · non chiudere la pagina durante l'importazione.</small>`;

        const res=await api('/functions/v1/import-censimento',{
          method:'POST',
          body:{
            file_name:file.name,
            file_base64:b64,
            offset,
            limit:chunkSize,
            import_batch:importBatch
          }
        });
        lastRes=res;
        total=Number(res.rows_with_code||total||0);
        duplicateCodeGroups=Number(res.duplicate_code_groups||duplicateCodeGroups||0);
        duplicateSerialGroups=Number(res.duplicate_serial_groups||duplicateSerialGroups||0);
        for(const k of Object.keys(totals))totals[k]+=Number(res[k]||0);
        chunksDone++;

        const next=Number(res.next_offset);
        if(Number.isFinite(next) && next>offset)offset=next;
        else if(res.done)offset=total||offset;
        else throw new Error(`Importazione bloccata al codice ${offset}: il server non ha restituito il blocco successivo.`);

        if(res.done || (total && offset>=total))break;
        await new Promise(resolve=>setTimeout(resolve,120));
      }

      const pct=100;
      $('assetImportResult').innerHTML=`
        <b>Foglio ${esc(lastRes?.sheet||'Device')} importato completamente.</b><br>
        Codici letti: <b>${total||0}</b> ·
        nuovi asset: <b>${totals.inserted}</b> ·
        asset aggiornati: <b>${totals.updated}</b> ·
        nuove etichette libere: <b>${totals.label_only_inserted}</b> ·
        etichette libere già note: <b>${totals.label_only_existing}</b> ·
        verificati protetti: <b>${totals.skipped_verified}</b> ·
        conflitti protetti: <b>${totals.occupied_conflicts}</b> ·
        codici duplicati (gruppi): <b>${duplicateCodeGroups}</b> ·
        asset esistenti marcati DUBBIO: <b>${totals.duplicate_existing_marked}</b> ·
        seriali duplicati (gruppi): <b>${duplicateSerialGroups}</b> ·
        riferimenti persona Device acquisiti: <b>${totals.device_source_records}</b> ·
        righe ignorate: <b>${totals.skipped_invalid}</b>.
        <div style="margin-top:8px;height:8px;border-radius:4px;overflow:hidden;background:rgba(127,127,127,.18)">
          <div style="height:100%;width:${pct}%;background:currentColor;opacity:.55"></div>
        </div>`;
      toast('Foglio Device importato completamente');
      setTimeout(()=>census(),1200);
    }catch(err){
      $('assetImportResult').innerHTML=`<b>Importazione interrotta.</b><br>${esc(err.message||String(err))}<br><small class="subline">Puoi rilanciare lo stesso file: le righe già importate vengono riconosciute e non duplicate.</small>`;
    }finally{
      btn.disabled=false;
      btn.textContent=originalLabel;
    }
  };

  document.querySelectorAll('[data-conflict-code]').forEach(b=>b.onclick=()=>{const code=b.dataset.conflictCode;const a=rows.find(x=>String(x.asset_code).toUpperCase()===String(code).toUpperCase());if(a)openSubView('asset-detail',()=>assetDetail(a.id));else toast('Asset non trovato nel master')});
  document.querySelectorAll('[data-request-conflict]').forEach(b=>b.onclick=async()=>{const reason=window.prompt('Perché ritieni risolto il conflitto?','Verificato sul campo');if(reason===null)return;try{await rpc('v82_request_conflict_resolution',{p_conflict_id:+b.dataset.requestConflict,p_reason:reason});toast('Risoluzione segnalata a SUPER_IT')}catch(err){toast(err.message)}});
  document.querySelectorAll('[data-confirm-conflict]').forEach(b=>b.onclick=async()=>{try{let req=await select('conflict_resolution_requests',`select=id&conflict_id=eq.${b.dataset.confirmConflict}&status=eq.IN_ATTESA&limit=1`);if(!req.length){await rpc('v82_request_conflict_resolution',{p_conflict_id:+b.dataset.confirmConflict,p_reason:'Verifica SUPER_IT'});req=await select('conflict_resolution_requests',`select=id&conflict_id=eq.${b.dataset.confirmConflict}&status=eq.IN_ATTESA&limit=1`)}await rpc('v82_review_conflict_resolution',{p_request_id:req[0].id,p_approve:true,p_note:'Confermato da SUPER_IT'});toast('Conflitto risolto');census()}catch(err){toast(err.message)}});

  if($('toggleAssetList'))$('toggleAssetList').onclick=()=>{showAssetList=!showAssetList;$('toggleAssetList').textContent=showAssetList?'× Nascondi elenco':'⌕ Esplora censimento';render()};
  render();
}

async function assetEdit(id,changeMode='CORREZIONE'){
  if(!isITRole())return userHome();

  let a={
    asset_code:'',category:'',brand:'',model:'',serial_number:'',site:'',position:'',
    assigned_user_name:'',assigned_user_email:'',storage:'',gpu:'',ram:'',cpu:'',
    notes:'',status:'DA VERIFICARE',verification_status:'DA VERIFICARE',account_identifier:'',is_label_only:false
  };

  if(id){
    const rows=await select('assets',`select=*&id=eq.${id}`);
    if(!rows.length)return;
    a=rows[0];
  }

  const categoryRefs=await select('reference_values','select=value&value_type=eq.CATEGORY&is_approved=eq.true&order=value.asc');
  const categories=categoryRefs.map(x=>String(x.value||'').trim().toUpperCase()).filter(Boolean);
  const currentCategory=String(a.category||'').trim().toUpperCase();

  page(id?(a.is_label_only?'Associa etichetta':(changeMode==='MOVIMENTO'?'Registra movimento asset':'Correggi dati asset')):'Nuovo asset',id?a.asset_code:'Seleziona un codice libero dal Device');

  $('content').innerHTML=`
    <div class="panel">
      <form id="assetForm" class="formgrid">
        <label>Codice asset
          <input id="aCode" value="${esc(a.asset_code||'')}" required placeholder="A4689" ${id?'readonly':''} autocomplete="off">
          <small id="codeCheck" class="code-check ${id&&a.is_label_only?'ok':''}">${id&&a.is_label_only?'Etichetta libera: completa i dati del dispositivo.':id?'Il codice identificativo non può essere modificato.':'Inserisci il codice riportato sull’etichetta fisica.'}</small>
        </label>
        <label>Categoria operativa
          <input id="aCategory" list="assetCategoryList" value="${esc(currentCategory)}" autocomplete="off" autocapitalize="characters" placeholder="SCRIVI O SELEZIONA...">
          <datalist id="assetCategoryList">${categories.map(c=>`<option value="${esc(c)}"></option>`).join('')}</datalist>
          <small class="field-rule">Solo CAPS. Usa una categoria esistente quando possibile; se ne inserisci una nuova, scrivila esattamente come deve diventare la categoria operativa.</small>
          ${a.category_raw&&String(a.category_raw).trim().toUpperCase()!==currentCategory?`<small class="raw-hint">Originale Excel: ${esc(a.category_raw)}</small>`:''}
        </label>
        <label>Marca<input id="aBrand" value="${esc(a.brand||'')}"></label>
        <label>Modello<input id="aModel" value="${esc(a.model||'')}"></label>
        <label>Seriale<div class="inline-field-action"><input id="aSerial" value="${esc(a.serial_number||'')}"><button id="scanSerial" type="button" class="ghost compact">Scansiona SN</button></div></label>
        <label>Sede<input id="aSite" value="${esc(a.site||'')}"></label>
        <label>Posizione<input id="aPosition" value="${esc(a.position||'')}"></label>
        <label>Utente assegnato<input id="aUserName" value="${esc(a.assigned_user_name||'')}"></label>
        <label>Email utente<input id="aUserEmail" type="email" value="${esc(a.assigned_user_email||'')}"></label>
        <label>Account associato <span class="optional">(solo identificativo)</span><input id="aAccount" value="${esc(a.account_identifier||'')}"></label>
        <label>SSD / HDD<input id="aStorage" value="${esc(a.storage||'')}"></label>
        <label>Scheda video<input id="aGpu" value="${esc(a.gpu||'')}"></label>
        <label>RAM<input id="aRam" value="${esc(a.ram||'')}"></label>
        <label>CPU<input id="aCpu" value="${esc(a.cpu||'')}"></label>
        <label>Stato<select id="aStatus">
          <option>DISPONIBILE</option><option>ASSEGNATO</option><option>PRENOTATO</option><option>IN PRESTITO</option>
          <option>IN MANUTENZIONE</option><option>GUASTO</option><option>DISMESSO</option><option>VENDUTO</option><option>DA VERIFICARE</option>
        </select></label>
        <label>Stato verifica<select id="aVerify">
          <option>VERIFICATO</option><option>DA VERIFICARE</option><option>DUBBIO</option><option>NON TROVATO</option><option>ASSEGNAZIONE DA CONFERMARE</option>
        </select></label>
        ${id&&!a.is_label_only?`<div class="full info-box"><b>${changeMode==='MOVIMENTO'?'Movimento reale':'Correzione dato'}</b><br>${changeMode==='MOVIMENTO'?'Usa questa modalità quando il dispositivo viene realmente spostato, assegnato, restituito o cambia collocazione. Il cambiamento entra nello storico come movimento.':'Usa questa modalità solo per correggere un dato compilato male. Non rappresenta uno spostamento reale.'}</div>${changeMode==='MOVIMENTO'?'<label>Data effettiva movimento<input id="aEffectiveDate" type="date" required></label>':''}<label class="${changeMode==='MOVIMENTO'?'':'full'}">Motivo ${changeMode==='MOVIMENTO'?'movimento':'correzione'}<input id="aChangeReason" required placeholder="${changeMode==='MOVIMENTO'?'Es. restituito e riposto in magazzino':'Es. posizione digitata erroneamente'}"></label>`:''}
        <label class="full">Note <span class="optional">(facoltative)</span><textarea id="aNotes" rows="4">${esc(a.notes||'')}</textarea></label>
        <div class="full info-box">
          Il codice deve corrispondere all'etichetta fisica. Per un nuovo dispositivo il portale accetta solo un codice importato dal foglio <b>Device</b> e riconosciuto come <b>ETICHETTA LIBERA</b>. Se il codice contiene già dati, il salvataggio viene bloccato per evitare doppioni.
        </div>
        <div class="full button-row">
          <button id="assetSave" class="primary" ${!id?'disabled':''}>${id&&a.is_label_only?'Associa dispositivo':'Salva asset'}</button>
          ${id&&!a.is_label_only?'<button id="verifyAssetNow" type="button" class="secondary">Segna verificato ora</button>':''}
          <button id="backToCensus" type="button" class="ghost">Annulla</button>
        </div>
      </form>
    </div>`;

  $('aCategory').value=currentCategory||'';
  $('aCategory').addEventListener('input',e=>{const pos=e.target.selectionStart; e.target.value=e.target.value.toUpperCase(); try{e.target.setSelectionRange(pos,pos)}catch{}});
  $('aCategory').addEventListener('blur',e=>{e.target.value=e.target.value.trim().replace(/\s+/g,' ').toUpperCase();});
  $('aStatus').value=a.status||'DA VERIFICARE';
  $('aVerify').value=a.verification_status||'DA VERIFICARE';
  $('backToCensus').onclick=()=>census();
  if($('scanSerial'))$('scanSerial').onclick=()=>openSerialScanner($('aSerial'));

  let reservedRow=id&&a.is_label_only?a:null;
  let checkTimer=null;

  const checkNewCode=async()=>{
    if(id)return;
    const code=$('aCode').value.trim().toUpperCase();
    $('aCode').value=code;
    const msg=$('codeCheck');
    const saveBtn=$('assetSave');
    reservedRow=null;
    saveBtn.disabled=true;
    msg.className='code-check';

    if(!code){
      msg.textContent='Inserisci il codice riportato sull’etichetta fisica.';
      return;
    }

    msg.textContent='Controllo codice nel censimento...';
    try{
      const found=await select('assets',`select=*&asset_code=eq.${encodeURIComponent(code)}&limit=1`);
      if(!found.length){
        msg.className='code-check warn';
        msg.textContent=`${code} non risulta nel foglio Device importato. Aggiorna/importa il censimento prima di usarlo.`;
        return;
      }
      const x=found[0];
      if(!x.is_label_only){
        msg.className='code-check error';
        const desc=[x.category,x.brand,x.model,x.serial_number,x.site,x.assigned_user_name].filter(Boolean).join(' · ');
        msg.textContent=`${code} è già utilizzato${desc?`: ${desc}`:''}. Salvataggio bloccato per evitare un doppione.`;
        return;
      }
      reservedRow=x;
      msg.className='code-check ok';
      msg.textContent=`${code} è un'etichetta libera. Puoi compilare i dati del dispositivo.`;
      saveBtn.disabled=false;
    }catch(err){
      msg.className='code-check error';
      msg.textContent=err.message;
    }
  };

  if(!id){
    $('aCode').oninput=()=>{
      clearTimeout(checkTimer);
      checkTimer=setTimeout(checkNewCode,350);
    };
    $('aCode').onblur=checkNewCode;
  }

  if($('verifyAssetNow'))$('verifyAssetNow').onclick=async()=>{
    const before=a.verification_status;
    await update('assets',`id=eq.${id}`,{
      verification_status:'VERIFICATO',
      verified_by:currentITName(),
      verified_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    });
    await insert('asset_history',{
      asset_id:id,
      event_type:'VERIFICA',
      field_name:'verification_status',
      old_value:before||null,
      new_value:'VERIFICATO',
      changed_by:currentITName(),
      changed_by_id:user.id
    },false);
    toast('Asset verificato');
    assetDetail(id);
  };

  $('assetForm').onsubmit=async e=>{
    e.preventDefault();
    const changeReason=id&&!a.is_label_only?$('aChangeReason').value.trim():'';
    const effectiveDate=id&&!a.is_label_only&&changeMode==='MOVIMENTO'?$('aEffectiveDate').value:null;
    if(id&&!a.is_label_only&&!changeReason){toast('Indica il motivo della modifica');return;}
    if(id&&!a.is_label_only&&changeMode==='MOVIMENTO'&&!effectiveDate){toast('Indica la data effettiva del movimento');return;}

    const typedCategory=$('aCategory').value.trim().replace(/\s+/g,' ').toUpperCase();
    if(typedCategory && typedCategory!==$('aCategory').value.trim()){ $('aCategory').value=typedCategory; }
    if(typedCategory && !/^[A-Z0-9À-ÖØ-Þ /&+._-]+$/.test(typedCategory)){toast('La categoria deve essere scritta in CAPS e senza caratteri anomali');return;}
    const data={
      asset_code:$('aCode').value.trim().toUpperCase(),
      is_label_only:false,
      category:typedCategory||null,
      brand:$('aBrand').value.trim()||null,
      model:$('aModel').value.trim()||null,
      serial_number:$('aSerial').value.trim()||null,
      site:$('aSite').value.trim()||null,
      position:$('aPosition').value.trim()||null,
      assigned_user_name:$('aUserName').value.trim()||null,
      assigned_user_email:$('aUserEmail').value.trim().toLowerCase()||null,
      account_identifier:$('aAccount').value.trim()||null,
      storage:$('aStorage').value.trim()||null,
      gpu:$('aGpu').value.trim()||null,
      ram:$('aRam').value.trim()||null,
      cpu:$('aCpu').value.trim()||null,
      status:$('aStatus').value,
      verification_status:$('aVerify').value,
      notes:$('aNotes').value.trim()||null,
      updated_at:new Date().toISOString()
    };

    try{
      if(data.assigned_user_email&&!data.assigned_user_email.endsWith('@archea.it')){
        throw new Error('La mail assegnatario deve essere @archea.it.');
      }

      // V6: il collegamento persona è separato dal testo legacy. Se l'assegnatario
      // viene cambiato manualmente, manteniamo il link solo con una mail aziendale
      // che identifica in modo univoco una scheda persona; altrimenti va riconfermato.
      const assigneeChanged=String(a.assigned_user_name||'')!==String(data.assigned_user_name||'') || String(a.assigned_user_email||'')!==String(data.assigned_user_email||'');
      let resolvedPersonId=a.assigned_person_id||null;
      if(assigneeChanged){
        resolvedPersonId=null;
        if(data.assigned_user_email){
          const pp=await select('people',`select=id&corporate_email=ilike.${encodeURIComponent(data.assigned_user_email)}&current_status=neq.USCITO&limit=2`);
          if(pp.length===1)resolvedPersonId=pp[0].id;
        }
        if(data.status==='DISPONIBILE')resolvedPersonId=null;
        if(data.assigned_user_name&&!resolvedPersonId&&data.verification_status==='VERIFICATO')data.verification_status='ASSEGNAZIONE DA CONFERMARE';
      }
      data.assigned_person_id=resolvedPersonId;

      // Evita di trasformare un'etichetta in "asset" senza aver inserito alcun dato.
      const hasDeviceData=[data.category,data.brand,data.model,data.serial_number,data.site,data.position,data.assigned_user_name,data.assigned_user_email,data.storage,data.gpu,data.ram,data.cpu,data.notes].some(Boolean);
      if(!hasDeviceData)throw new Error('Compila almeno un dato del dispositivo oltre al codice.');

      if(id){
        const tracked=[
          ['status',a.status,data.status],
          ['verification_status',a.verification_status,data.verification_status],
          ['site',a.site,data.site],
          ['position',a.position,data.position],
          ['assigned_user_name',a.assigned_user_name,data.assigned_user_name],
          ['assigned_user_email',a.assigned_user_email,data.assigned_user_email],
          ['assigned_person_id',a.assigned_person_id,data.assigned_person_id],
          ['is_label_only',a.is_label_only,data.is_label_only]
        ];

        await update('assets',`id=eq.${id}`,data);

        // Un movimento reale mantiene coerente anche lo storico persona↔asset.
        // Una semplice correzione NON apre/chiude assegnazioni.
        if(changeMode==='MOVIMENTO' && String(a.assigned_person_id||'')!==String(data.assigned_person_id||'')){
          const activeAssignments=await select('asset_assignments',`select=*&asset_id=eq.${id}&assignment_status=eq.ATTIVA`);
          for(const aa of activeAssignments){
            await update('asset_assignments',`id=eq.${aa.id}`,{assignment_status:'CHIUSA',assigned_to:effectiveDate,updated_at:new Date().toISOString()});
          }
          if(data.assigned_person_id){
            await insert('asset_assignments',{
              asset_id:id,person_id:data.assigned_person_id,assigned_from:effectiveDate,assignment_status:'ATTIVA',
              verification_status:'VERIFICATA',source_type:'MOVIMENTO_PORTALE',note:changeReason,
              verified_by:currentITName(),verified_at:new Date().toISOString(),created_by:user.id,created_by_name:currentITName()
            },false);
            await insert('person_events',{
              person_id:data.assigned_person_id,event_type:'ASSET_ASSEGNATO',event_date:effectiveDate,source_type:'PORTALE',
              note:`${data.asset_code} · ${changeReason}`,new_data:{asset_id:id,asset_code:data.asset_code},created_by:user.id,created_by_name:currentITName()
            },false);
          }
          if(a.assigned_person_id){
            await insert('person_events',{
              person_id:a.assigned_person_id,event_type:'ASSET_RIMOSSO',event_date:effectiveDate,source_type:'PORTALE',
              note:`${data.asset_code} · ${changeReason}`,old_data:{asset_id:id,asset_code:data.asset_code},created_by:user.id,created_by_name:currentITName()
            },false);
          }
        }

        for(const [field,oldv,newv] of tracked){
          if(String(oldv??'')!==String(newv??'')){
            await insert('asset_history',{
              asset_id:id,event_type:a.is_label_only?'ETICHETTA_ASSOCIATA':(changeMode==='MOVIMENTO'?'MOVIMENTO_ASSET':'CORREZIONE_DATO'),field_name:field,
              old_value:oldv==null?null:String(oldv),
              new_value:newv==null?null:String(newv),
              change_kind:a.is_label_only?null:changeMode,
              effective_date:changeMode==='MOVIMENTO'?effectiveDate:null,
              reason:a.is_label_only?null:changeReason,
              changed_by:currentITName(),changed_by_id:user.id
            },false);
          }
        }

        if(data.verification_status==='VERIFICATO'&&a.verification_status!=='VERIFICATO'){
          await update('assets',`id=eq.${id}`,{verified_by:currentITName(),verified_at:new Date().toISOString()});
        }

        toast(a.is_label_only?'Etichetta associata al dispositivo':(changeMode==='MOVIMENTO'?'Movimento asset registrato':'Correzione asset registrata'));
        assetDetail(id);
      }else{
        // Ricontrollo immediatamente prima del salvataggio: il codice può essere
        // stato usato da un altro tecnico dopo il controllo iniziale.
        const live=await select('assets',`select=*&asset_code=eq.${encodeURIComponent(data.asset_code)}&limit=1`);
        if(!live.length)throw new Error('Codice non presente nel foglio Device importato.');
        if(!live[0].is_label_only)throw new Error(`Il codice ${data.asset_code} è già stato utilizzato.`);

        const target=live[0];
        await update('assets',`id=eq.${target.id}`,data);
        await insert('asset_history',{
          asset_id:target.id,
          event_type:'ETICHETTA_ASSOCIATA',
          old_value:'ETICHETTA LIBERA',
          new_value:[data.category,data.brand,data.model].filter(Boolean).join(' ')||'Dispositivo associato',
          changed_by:currentITName(),changed_by_id:user.id
        },false);
        toast('Etichetta associata al dispositivo');
        assetDetail(target.id);
      }
    }catch(err){
      toast(err.message);
    }
  };
}

async function assetDetail(id){
  if(!isITRole())return userHome();

  const rows=await select('assets',`select=*&id=eq.${id}`);
  if(!rows.length)return;
  const a=rows[0];
  const history=await select('asset_history',`select=*&asset_id=eq.${id}&order=created_at.desc&limit=100`);
  const linkedPerson=a.assigned_person_id?(await select('people',`select=id,display_name&id=eq.${a.assigned_person_id}` ))[0]:null;

  page('Dettaglio asset',a.asset_code);

  $('content').innerHTML=`
    <div class="panel">
      <div class="asset-detail-head">
        <div>
          <span class="asset-code-big">${esc(a.asset_code)}</span>
          <h3>${esc([a.brand,a.model].filter(Boolean).join(' ')||a.category||'Asset')}</h3>
          <p class="muted-line">${esc(a.category||'')} ${a.serial_number?`• S/N ${esc(a.serial_number)}`:''}</p>
        </div>
        <div class="asset-badges">${assetTypeBadge(a)} ${a.is_label_only?'':verifyBadge(a.verification_status)}</div>
      </div>

      <div class="asset-info-grid">
        <div><span>Sede</span><b>${esc(a.site||'—')}</b></div>
        <div><span>Posizione</span><b>${esc(a.position||'—')}</b></div>
        <div><span>Assegnato a</span><b>${linkedPerson?esc(linkedPerson.display_name):(a.assigned_user_name?esc((a.status==='DA VERIFICARE'?'Legacy: ':'')+a.assigned_user_name):esc(a.assigned_user_email||'—'))}</b></div>
        <div><span>Account associato</span><b>${esc(a.account_identifier||'—')}</b></div>
        <div><span>SSD / HDD</span><b>${esc(a.storage||'—')}</b></div>
        <div><span>GPU</span><b>${esc(a.gpu||'—')}</b></div>
        <div><span>RAM</span><b>${esc(a.ram||'—')}</b></div>
        <div><span>CPU</span><b>${esc(a.cpu||'—')}</b></div>
      </div>

      ${a.notes?`<div class="info-box"><b>Note:</b> ${esc(a.notes)}</div>`:''}
      ${a.source_sheet?`<p class="muted-line">Origine legacy: ${esc(a.source_sheet)}${a.source_row?` • riga ${a.source_row}`:''}</p>`:''}
      ${a.verified_at?`<p class="verified-line">Verificato da <b>${esc(a.verified_by||'IT')}</b> il ${fmt(a.verified_at)}</p>`:''}

      <div class="button-row">
        <button id="editAsset" class="primary">${a.is_label_only?'Associa dispositivo':'Correggi dati'}</button>
        ${!a.is_label_only?'<button id="moveAsset" class="secondary">Registra movimento</button>':''}
        ${linkedPerson?'<button id="openAssignedPerson" class="secondary">Apri persona</button>':''}
        ${!a.is_label_only&&a.verification_status!=='VERIFICATO'?'<button id="quickVerify" class="secondary">Verifica ora</button>':''}
        <button id="deleteAssetRecord" class="danger-soft">Richiedi eliminazione</button>
        <button id="backCensus" class="ghost">Torna al censimento</button>
      </div>
    </div>

    <div class="panel">
      <h3>Storico asset</h3>
      ${history.length?`<div class="history-list">${history.map(h=>`
        <div class="history-item">
          <div><b>${esc(h.event_type)}</b>${h.field_name?` • ${esc(h.field_name)}`:''}</div>
          <div>${h.old_value!=null?`<span class="history-old">${esc(h.old_value)}</span> → `:''}<span>${esc(h.new_value||'')}</span></div>
          ${h.reason?`<div class="history-reason">${esc(h.reason)}</div>`:''}
          <small>${h.effective_date?`Data effettiva: ${dateOnly(h.effective_date)} • `:''}${fmt(h.created_at)} • ${esc(h.changed_by||'Sistema')}${h.change_kind?` • ${esc(h.change_kind)}`:''}</small>
        </div>`).join('')}</div>`:'<div class="empty">Nessuno storico disponibile.</div>'}
    </div>`;

  $('editAsset').onclick=()=>assetEdit(id,'CORREZIONE');
  if($('moveAsset'))$('moveAsset').onclick=()=>assetEdit(id,'MOVIMENTO');
  if($('openAssignedPerson')&&linkedPerson)$('openAssignedPerson').onclick=()=>openSubView('person-detail',()=>personDetail(linkedPerson.id));
  $('backCensus').onclick=()=>census();

  if($('quickVerify'))$('quickVerify').onclick=async()=>{
    await update('assets',`id=eq.${id}`,{
      verification_status:'VERIFICATO',
      verified_by:currentITName(),
      verified_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    });
    await insert('asset_history',{
      asset_id:id,event_type:'VERIFICA',field_name:'verification_status',
      old_value:a.verification_status||null,new_value:'VERIFICATO',
      changed_by:currentITName(),changed_by_id:user.id
    },false);
    toast('Asset verificato');
    assetDetail(id);
  };
  if($('deleteAssetRecord'))$('deleteAssetRecord').onclick=async()=>{
    const reason=window.prompt(`Richiesta eliminazione per asset "${a.asset_code}".\n\nIndica il motivo (es. record creato per errore, duplicato accidentale):`,'');
    if(reason===null)return;
    if(!reason.trim()){window.alert('Il motivo è obbligatorio.');return;}
    try{await rpc('v6_request_deletion',{p_entity_type:'ASSET',p_entity_id:id,p_reason:reason.trim()});toast('Richiesta inviata a SUPER_IT')}catch(err){window.alert(err.message)}
  };
}


async function deletionRequests(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page('Eliminazioni','Richieste IT e approvazione SUPER_IT');
  const rows=await select('deletion_requests','select=*&order=requested_at.desc&limit=500');
  if(epoch!==navigationEpoch)return;
  const pending=rows.filter(x=>x.status==='IN_ATTESA');
  $('content').innerHTML=`
    <div class="panel">
      <div class="panel-head-row"><div><h3>${isSuperIT()?'Richieste di eliminazione':'Le mie richieste'}</h3><p class="muted-line">Un record viene eliminato solo dopo approvazione SUPER_IT e soltanto se supera i controlli di integrità.</p></div></div>
      ${isSuperIT()?`<div class="metrics"><div class="metric"><span>In attesa</span><b>${pending.length}</b></div><div class="metric"><span>Gestite</span><b>${rows.length-pending.length}</b></div></div>`:''}
      ${rows.length?`<div class="tablewrap"><table><thead><tr><th>Record</th><th>Richiedente</th><th>Motivo</th><th>Stato</th><th>Data</th>${isSuperIT()?'<th>Azioni</th>':''}</tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.entity_label||String(r.entity_id))}</b><small class="subline">${esc(r.entity_type)}</small></td><td>${esc(r.requested_by_name||'IT')}</td><td>${esc(r.reason||'')}</td><td>${esc(r.status)}</td><td>${fmt(r.requested_at)}</td>${isSuperIT()?`<td>${r.status==='IN_ATTESA'?`<div class="row-actions"><button class="primary compact" data-approve-delete="${r.id}">Approva</button><button class="ghost compact" data-reject-delete="${r.id}">Rifiuta</button></div>`:`<small>${r.reviewed_by_name?esc(r.reviewed_by_name):''}${r.review_note?` · ${esc(r.review_note)}`:''}</small>`}</td>`:''}</tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nessuna richiesta di eliminazione.</div>'}
    </div>`;

  if(isSuperIT()){
    document.querySelectorAll('[data-approve-delete]').forEach(b=>b.onclick=async()=>{
      if(!window.confirm('Approvare questa eliminazione definitiva? I controlli di integrità verranno eseguiti prima della cancellazione.'))return;
      try{await rpc('v6_review_deletion_request',{p_request_id:+b.dataset.approveDelete,p_approve:true,p_review_note:null});toast('Eliminazione approvata');deletionRequests()}catch(err){window.alert(err.message)}
    });
    document.querySelectorAll('[data-reject-delete]').forEach(b=>b.onclick=async()=>{
      const note=window.prompt('Motivo del rifiuto:','');if(note===null)return;if(!note.trim()){window.alert('Il motivo del rifiuto è obbligatorio.');return;}
      try{await rpc('v6_review_deletion_request',{p_request_id:+b.dataset.rejectDelete,p_approve:false,p_review_note:note.trim()});toast('Richiesta rifiutata');deletionRequests()}catch(err){window.alert(err.message)}
    });
  }
}

function placeholder(k){
  if(!isITRole())return userHome();
  const m={
    movimenti:['Movimenti','Ingressi, uscite, cambio postazione e sede.'],
    censimento:['Censimento','Inventario asset e storico.']
  };
  page(...m[k]);
  $('content').innerHTML=`<div class="panel"><h3>${m[k][0]}</h3><p>${m[k][1]}</p><span class="badge">Prossima fase</span></div>`;
}

async function detail(id){
  page('Dettaglio ticket','Conversazione e avanzamento');
  const rows=await select('tickets',`select=*&id=eq.${id}`);
  if(!rows.length)return;
  const t=rows[0];

  if(!isITRole()&&t.richiedente_email!==user.email)return toast('Non autorizzato');

  let ap=[],materialBooking=null,collabs=[];
  try{ap=await select('appointments',`select=*&ticket_id=eq.${id}&order=start_at.desc`)}catch{}
  if(t.categoria==='Prenotazione materiale'){
    try{const mb=await select('material_bookings',`select=*&ticket_id=eq.${id}`);materialBooking=mb[0]||null}catch{}
  }
  if(isITRole()){
    try{collabs=await select('ticket_collaborators',`select=*,profiles(nome,email)&ticket_id=eq.${id}`)}catch{}
  }

  const its=isITRole()?await select('profiles','select=id,nome,email,ruolo&ruolo=in.(IT,SUPER_IT)&order=nome.asc'):[];
  const apHtml=ap.length?`<div class="appointment"><b>Appuntamento</b>${ap.map(a=>`<div class="appointment-row"><strong>${fmt(a.start_at)} • ${esc(a.modalita)} • ${a.durata_minuti} min</strong><span class="appointment-status ${(a.status||'PROPOSTO').toLowerCase()}">${a.status||'PROPOSTO'}</span></div>`).join('')}</div>`:'';

  $('content').innerHTML=`
    <div class="panel">
      <span class="badge">${t.numero_ticket||num(t.id)}</span>
      <h3>${esc(t.oggetto)}</h3>
      <p>${esc(t.categoria)} • ${esc(t.richiedente_nome||t.richiedente_email)} • ${fmt(t.created_at)}</p>
      <div class="ticket-meta-line">${badge(t.stato)} ${priorityBadge(t.priorita)} ${t.origine?`<span class="badge">${esc(t.origine)}</span>`:''}</div>
      <p>${esc(t.descrizione)}</p>
      ${t.created_by_name&&t.created_by_name!==t.richiedente_nome?`<div class="info-box">Creato da <b>${esc(t.created_by_name)}</b> per conto di <b>${esc(t.richiedente_email)}</b></div>`:''}
      ${apHtml}
      ${materialBooking?`<div class="appointment"><b>Richiesta materiale</b><div>${esc(materialBooking.material_type)} × ${materialBooking.quantity} • ${bookingStatusBadge(materialBooking.status)}</div>${isITRole()?`<button id="manageMaterial" class="secondary compact">Gestisci materiale</button>`:''}</div>`:''}
    </div>

    ${isITRole()?`<div class="panel">
      <div class="it-management-head"><div><h3>Gestione IT</h3><p class="muted-line">Responsabile, collaboratori, priorità e stato.</p></div>${!t.assigned_to?'<button id="takeTicket" class="primary">Prendi in carico</button>':''}</div>
      <div class="formgrid">
        <label>Stato<select id="st"><option>APERTO</option><option>IN LAVORAZIONE</option><option>IN ATTESA</option><option>CHIUSO</option></select></label>
        <label>Priorità<select id="priority"><option>BASSA</option><option>NORMALE</option><option>ALTA</option><option>URGENTE</option></select></label>
        <label>Responsabile<select id="assigneeSelect"><option value="">NON ASSEGNATO</option>${its.map(i=>`<option value="${i.id}">${esc(i.nome||i.email)}</option>`).join('')}</select></label>
        <label>Sede<input id="ticketSiteEdit" value="${esc(t.sede||'')}"></label>
        <label>Esito chiusura<select id="outcome"><option value="">—</option><option>RISOLTO</option><option>RISOLTO CON WORKAROUND</option><option>NON RIPRODUCIBILE</option><option>RICHIESTA ANNULLATA</option><option>ALTRO</option></select></label>
        <label class="full">Nota risoluzione <span class="optional">(facoltativa)</span><textarea id="resolutionNote" rows="2">${esc(t.resolution_note||'')}</textarea></label>
      </div>

      <div class="collaborators-box">
        <b>Collaboratori IT</b>
        <div id="collabList">${collabs.length?collabs.map(c=>`<span class="collab-chip">${esc(c.profiles?.nome||c.profiles?.email||'IT')} <button data-remove-collab="${c.user_id}">×</button></span>`).join(''):'<span class="muted-line">Nessuno</span>'}</div>
        <div class="inline-controls"><select id="collabSelect"><option value="">Aggiungi collaboratore...</option>${its.filter(i=>i.id!==t.assigned_to&&!collabs.some(c=>c.user_id===i.id)).map(i=>`<option value="${i.id}">${esc(i.nome||i.email)}</option>`).join('')}</select><button id="addCollab" class="secondary">Aggiungi</button></div>
      </div>

      <div class="button-row"><button id="saveTicket" class="primary">Salva gestione</button>${t.stato==='CHIUSO'?'<button id="reopenTicket" class="secondary">Riapri ticket</button>':''}</div>
    </div>

    <div class="panel"><h3>Fissa appuntamento</h3>
      <form id="apptForm" class="formgrid">
        <label>Data e ora<input id="apptStart" type="datetime-local" required></label>
        <label>Durata<select id="apptDur"><option>15</option><option selected>30</option><option>45</option><option>60</option></select></label>
        <label>Modalità<select id="apptMode"><option>Presso IT</option><option>Alla postazione utente</option><option>Remoto</option><option>Sala / sede</option></select></label>
        <label>Note<input id="apptNote"></label>
        <div class="full"><button class="primary">Invia proposta appuntamento</button></div>
      </form>
    </div>`:''}

    <div class="panel"><h3>Commenti</h3><div id="comments"></div>
      <form id="commentForm"><label>Commento<textarea id="ct" rows="3" required></textarea></label>${isITRole()?'<label><input id="internal" type="checkbox" style="width:auto"> Nota interna IT</label>':''}<button class="primary">Invia commento</button></form>
    </div>

    ${isITRole()?`<div class="panel"><h3>Checklist IT</h3><div id="checks"></div><form id="checkForm"><label>Nuova attività<input id="checkText"></label><button class="secondary">Aggiungi</button></form></div>`:''}`;

  if(isITRole()){
    $('st').value=t.stato;
    $('priority').value=t.priorita||'NORMALE';
    $('assigneeSelect').value=t.assigned_to||'';
    $('outcome').value=t.outcome||'';
    if($('manageMaterial')&&materialBooking)$('manageMaterial').onclick=()=>openSubView('booking-detail',()=>bookingDetail(materialBooking.id));

    if($('takeTicket'))$('takeTicket').onclick=async()=>{
      await update('tickets',`id=eq.${id}`,{assigned_to:user.id,assegnato_a:currentITName(),stato:'IN LAVORAZIONE'});
      await insert('ticket_history',{ticket_id:id,evento:`Preso in carico da ${currentITName()}`,autore:currentITName()},false);
      toast('Ticket preso in carico');detail(id);
    };

    $('saveTicket').onclick=async()=>{
      const newAssignee=$('assigneeSelect').value||null;
      const assigneeProfile=its.find(i=>i.id===newAssignee);
      const oldName=t.assegnato_a||'NON ASSEGNATO';
      const newName=assigneeProfile?.nome||assigneeProfile?.email||null;

      await update('tickets',`id=eq.${id}`,{
        stato:$('st').value,
        priorita:$('priority').value,
        assigned_to:newAssignee,
        assegnato_a:newName,
        sede:$('ticketSiteEdit').value.trim()||null,
        outcome:$('outcome').value||null,
        resolution_note:$('resolutionNote').value.trim()||null,
        closed_at:$('st').value==='CHIUSO'?new Date().toISOString():null
      });

      if(oldName!==(newName||'NON ASSEGNATO')){
        await insert('ticket_history',{ticket_id:id,evento:`Riassegnato: ${oldName} → ${newName||'NON ASSEGNATO'}`,autore:currentITName()},false);
      }
      toast('Ticket aggiornato');detail(id);refreshNotifications();
    };

    if($('reopenTicket'))$('reopenTicket').onclick=async()=>{
      await update('tickets',`id=eq.${id}`,{stato:'IN LAVORAZIONE',closed_at:null,outcome:null});
      await insert('ticket_history',{ticket_id:id,evento:'Ticket riaperto',autore:currentITName()},false);
      toast('Ticket riaperto');detail(id);
    };

    $('addCollab').onclick=async()=>{
      const uid=$('collabSelect').value;
      if(!uid)return;
      await insert('ticket_collaborators',{ticket_id:id,user_id:uid,added_by:user.id},false);
      await insert('ticket_history',{ticket_id:id,evento:'Collaboratore IT aggiunto',autore:currentITName()},false);
      detail(id);
    };
    document.querySelectorAll('[data-remove-collab]').forEach(b=>b.onclick=async()=>{
      await api(`/rest/v1/ticket_collaborators?ticket_id=eq.${id}&user_id=eq.${b.dataset.removeCollab}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
      detail(id);
    });

    $('apptForm').onsubmit=async e=>{
      e.preventDefault();
      await insert('appointments',{ticket_id:id,start_at:new Date($('apptStart').value).toISOString(),durata_minuti:+$('apptDur').value,modalita:$('apptMode').value,note:$('apptNote').value.trim()||null,created_by:user.id,status:'PROPOSTO'},false);
      await update('tickets',`id=eq.${id}`,{stato:'IN ATTESA'});
      toast('Proposta appuntamento inviata');detail(id);
    };
  }

  document.querySelectorAll('.ap-confirm').forEach(b=>b.onclick=async()=>{await update('appointments',`id=eq.${+b.dataset.apid}`,{status:'CONFERMATO',confirmed_at:new Date().toISOString(),confirmed_by:user.id});toast('Appuntamento confermato');detail(id)});
  document.querySelectorAll('.ap-decline').forEach(b=>b.onclick=async()=>{await update('appointments',`id=eq.${+b.dataset.apid}`,{status:'RIFIUTATO',confirmed_at:new Date().toISOString(),confirmed_by:user.id});toast('Appuntamento da riprogrammare');detail(id)});

  async function comments(){
    const d=await select('comments',`select=*&ticket_id=eq.${id}&order=created_at.asc`);
    const v=isITRole()?d:d.filter(x=>!x.nota_interna);
    $('comments').innerHTML=v.length?v.map(x=>`<div class="comment ${x.nota_interna?'internal':''}"><b>${esc(x.autore)}${x.nota_interna?' • Nota interna':''}</b><small style="float:right">${fmt(x.created_at)}</small><p>${esc(x.testo)}</p></div>`).join(''):'<p>Nessun commento.</p>';
  }
  $('commentForm').onsubmit=async e=>{
    e.preventDefault();
    await insert('comments',{ticket_id:id,autore:profile.nome,autore_email:user.email,testo:$('ct').value.trim(),nota_interna:isITRole()&&$('internal').checked},false);
    $('ct').value='';comments();refreshNotifications();
  };

  if(isITRole()){
    async function checks(){
      const d=await select('checklist_items',`select=*&ticket_id=eq.${id}&order=id.asc`);
      $('checks').innerHTML=d.length?d.map(x=>`<label class="check"><input type="checkbox" data-c="${x.id}" ${x.completato?'checked':''}><span>${esc(x.testo)}</span><small>${x.completato?`${esc(x.completed_by||'')} • ${fmt(x.completed_at)}`:''}</small></label>`).join(''):'<p>Nessuna attività.</p>';
      document.querySelectorAll('[data-c]').forEach(c=>c.onchange=()=>update('checklist_items',`id=eq.${+c.dataset.c}`,{completato:c.checked,completed_at:c.checked?new Date().toISOString():null,completed_by:c.checked?profile.nome:null}));
    }
    $('checkForm').onsubmit=async e=>{e.preventDefault();if(!$('checkText').value.trim())return;await insert('checklist_items',{ticket_id:id,testo:$('checkText').value.trim()},false);$('checkText').value='';checks()};
    checks();
  }
  comments();
}


// ============================================================
// V8 — FOTOCAMERA / SCANSIONE ASSET
// ============================================================
async function openAssetScanner(cachedRows=null){
  const overlay=document.createElement('div');
  overlay.className='scanner-overlay';
  overlay.innerHTML=`<div class="scanner-card">
    <div class="scanner-head"><div><span class="eyebrow">V8 · VERIFICA SUL CAMPO</span><h3>Scansiona asset</h3></div><button class="ghost compact" id="closeScanner">Chiudi</button></div>
    <div class="scanner-video-wrap"><video id="scannerVideo" autoplay playsinline muted></video><div class="scanner-frame"></div></div>
    <div id="scannerStatus" class="info-box">Avvio fotocamera…</div>
    <div class="scanner-manual"><label>Codice asset<input id="scannerManualCode" autocomplete="off" autocapitalize="characters" placeholder="Es. A4076"></label><button id="scannerOpenCode" class="primary">Apri asset</button></div>
    <p class="muted-line">Se l'etichetta contiene QR/barcode, il browser prova a riconoscerla automaticamente. Per le etichette solo testuali puoi usare la fotocamera come supporto e digitare il codice.</p>
  </div>`;
  document.body.appendChild(overlay);
  const video=overlay.querySelector('#scannerVideo');const status=overlay.querySelector('#scannerStatus');
  let stream=null,stopped=false,raf=0,detector=null;
  const close=()=>{stopped=true;if(raf)cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());overlay.remove()};
  overlay.querySelector('#closeScanner').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  async function openCode(raw){
    const code=String(raw||'').trim().toUpperCase().match(/[A-Z]+-?[A-Z]*\d+|A\d+/)?.[0]||String(raw||'').trim().toUpperCase();
    if(!code)return toast('Inserisci un codice asset');
    let a=(cachedRows||[]).find(x=>String(x.asset_code||'').toUpperCase()===code);
    if(!a){const found=await select('assets',`select=id,asset_code&asset_code=eq.${encodeURIComponent(code)}&limit=1`);a=found[0]}
    if(!a){status.innerHTML=`Codice <b>${esc(code)}</b> non trovato nel censimento.`;return}
    close();openSubView('asset-detail',()=>assetDetail(a.id));
  }
  overlay.querySelector('#scannerOpenCode').onclick=()=>openCode(overlay.querySelector('#scannerManualCode').value);
  overlay.querySelector('#scannerManualCode').addEventListener('keydown',e=>{if(e.key==='Enter')openCode(e.target.value)});
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});video.srcObject=stream;
    const formats=['qr_code','code_128','code_39','ean_13','ean_8','data_matrix'];
    if('BarcodeDetector' in window){try{detector=new BarcodeDetector({formats})}catch{try{detector=new BarcodeDetector()}catch{detector=null}}}

    // Safari/iOS non espone sempre BarcodeDetector: V8.2 usa Quagga2 come fallback 1D.
    const canQuagga=typeof window.Quagga!=='undefined';
    status.innerHTML=detector
      ? 'Fotocamera attiva. Inquadra il barcode: il codice asset verrà aperto automaticamente.'
      : canQuagga
        ? 'Fotocamera attiva. Scanner compatibile iPhone attivo: inquadra il barcode e tienilo fermo nel riquadro.'
        : 'Fotocamera attiva. Scanner automatico non caricato: puoi comunque digitare il codice stampato.';

    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    let lastQuagga=0,quaggaBusy=false,lastRaw='',sameRawCount=0;

    const normalizeDetectedRaw=(raw)=>{
      const t=String(raw||'').toUpperCase().replace(/ARCHEA/g,' ').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
      // Etichette Archea: accetta A4021, A 4021, ARCHEA-A4021, ecc.
      const m=t.match(/(?:^|[^A-Z0-9])A\s*-?\s*(\d{3,6})(?:$|[^A-Z0-9])/i)||t.match(/^A\s*-?\s*(\d{3,6})$/i);
      return m?`A${m[1]}`:t.replace(/\s+/g,'');
    };

    const quaggaFrame=async()=>{
      if(!canQuagga||quaggaBusy||video.readyState<2||!video.videoWidth||!video.videoHeight)return null;
      quaggaBusy=true;
      try{
        const vw=video.videoWidth,vh=video.videoHeight;
        // Ritaglio centrale: coincide con il riquadro visivo e riduce falsi positivi.
        const sw=Math.floor(vw*0.78),sh=Math.floor(vh*0.42),sx=Math.floor((vw-sw)/2),sy=Math.floor((vh-sh)/2);
        const maxW=1100,scale=Math.min(1,maxW/sw);
        canvas.width=Math.max(320,Math.floor(sw*scale));canvas.height=Math.max(180,Math.floor(sh*scale));
        ctx.drawImage(video,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
        const src=canvas.toDataURL('image/jpeg',0.86);
        return await new Promise(resolve=>{
          try{window.Quagga.decodeSingle({
            src,
            numOfWorkers:0,
            locate:true,
            inputStream:{size:Math.min(canvas.width,1000)},
            locator:{patchSize:'medium',halfSample:true},
            decoder:{readers:['code_128_reader','code_39_reader','code_39_vin_reader','ean_reader','ean_8_reader','upc_reader','upc_e_reader']}
          },r=>resolve(r?.codeResult?.code||null))}catch{resolve(null)}
        });
      }finally{quaggaBusy=false}
    };

    const scan=async()=>{
      if(stopped)return;
      try{
        let raw='';
        if(detector&&video.readyState>=2){
          const codes=await detector.detect(video);
          raw=codes?.[0]?.rawValue||'';
        }else if(canQuagga&&performance.now()-lastQuagga>450){
          lastQuagga=performance.now();
          raw=await quaggaFrame()||'';
        }
        if(raw){
          const normalized=normalizeDetectedRaw(raw);
          if(normalized===lastRaw)sameRawCount++;else{lastRaw=normalized;sameRawCount=1}
          status.innerHTML=`Rilevato: <b>${esc(raw)}</b>${normalized!==raw?` → <b>${esc(normalized)}</b>`:''}`;
          // Due letture uguali consecutive riducono aperture errate su barcode poco nitidi.
          if(detector||sameRawCount>=2){await openCode(normalized);return}
        }
      }catch{}
      raf=requestAnimationFrame(scan);
    };
    scan();
  }catch(err){status.innerHTML=`Fotocamera non disponibile: ${esc(err.message)}. Puoi comunque digitare il codice.`}
}

// ============================================================
// V8.2 — SCANSIONE SERIALE: BARCODE + TESTO (OCR) + MANUALE
// ============================================================
async function openSerialScanner(targetInput){
  const overlay=document.createElement('div');
  overlay.className='scanner-overlay';
  overlay.innerHTML=`<div class="scanner-card">
    <div class="scanner-head"><div><span class="eyebrow">VERIFICA DEVICE</span><h3>Leggi seriale</h3></div><button class="ghost compact" id="closeSerialScanner">Chiudi</button></div>
    <div class="scanner-video-wrap"><video id="serialVideo" autoplay playsinline muted></video><div class="scanner-frame"></div></div>
    <div id="serialStatus" class="info-box">Avvio fotocamera…</div>
    <div class="scanner-actions-row"><button id="serialOcr" class="secondary" type="button">Leggi testo</button><button id="serialUse" class="primary" type="button">Usa seriale</button></div>
    <label>Seriale rilevato / manuale<input id="serialCandidate" autocomplete="off" autocapitalize="characters" placeholder="Inserisci o correggi il seriale"></label>
    <p class="muted-line">Barcode: lettura automatica quando supportata. Testo: premi <b>Leggi testo</b>, poi controlla sempre il risultato prima di usarlo. Il valore non viene salvato senza conferma.</p>
  </div>`;
  document.body.appendChild(overlay);
  const video=overlay.querySelector('#serialVideo'),status=overlay.querySelector('#serialStatus'),candidate=overlay.querySelector('#serialCandidate');
  let stream=null,stopped=false,raf=0,detector=null,lastRaw='',same=0;
  const close=()=>{stopped=true;if(raf)cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());overlay.remove()};
  overlay.querySelector('#closeSerialScanner').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  const normalizeSerial=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
  overlay.querySelector('#serialUse').onclick=()=>{const v=normalizeSerial(candidate.value);if(!v)return toast('Nessun seriale inserito');targetInput.value=v;targetInput.dispatchEvent(new Event('input',{bubbles:true}));close();};
  candidate.addEventListener('input',()=>{candidate.value=candidate.value.toUpperCase()});
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});video.srcObject=stream;
    if('BarcodeDetector' in window){try{detector=new BarcodeDetector()}catch{detector=null}}
    status.textContent=detector?'Fotocamera attiva. Inquadra barcode/QR del seriale.':'Fotocamera attiva. Puoi usare Leggi testo oppure inserire il seriale manualmente.';
    const scan=async()=>{if(stopped)return;try{if(detector&&video.readyState>=2){const codes=await detector.detect(video);const raw=codes?.[0]?.rawValue||'';if(raw){const n=normalizeSerial(raw);if(n===lastRaw)same++;else{lastRaw=n;same=1} candidate.value=n;status.innerHTML=`Barcode rilevato: <b>${esc(n)}</b>`;if(same>=2&&navigator.vibrate)navigator.vibrate(35);}}}catch{}raf=requestAnimationFrame(scan)};scan();
  }catch(err){status.innerHTML=`Fotocamera non disponibile: ${esc(err.message)}. Inserisci il seriale manualmente.`}
  overlay.querySelector('#serialOcr').onclick=async()=>{
    if(!video.videoWidth){toast('Fotocamera non pronta');return}
    if(typeof window.Tesseract==='undefined'){toast('Modulo lettura testo non disponibile');return}
    status.textContent='Lettura testo in corso…';
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const vw=video.videoWidth,vh=video.videoHeight,sw=Math.floor(vw*.88),sh=Math.floor(vh*.42),sx=Math.floor((vw-sw)/2),sy=Math.floor((vh-sh)/2);
    canvas.width=Math.min(1600,sw);canvas.height=Math.round(sh*(canvas.width/sw));ctx.drawImage(video,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
    try{
      const result=await window.Tesseract.recognize(canvas,'eng',{logger:()=>{}});
      const lines=String(result?.data?.text||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
      const candidates=lines.map(x=>x.replace(/[^A-Za-z0-9._\/-]/g,'')).filter(x=>x.length>=4).sort((a,b)=>b.length-a.length);
      const best=normalizeSerial(candidates[0]||'');
      if(best){candidate.value=best;status.innerHTML=`Testo rilevato: <b>${esc(best)}</b>. Controllalo prima di confermare.`;if(navigator.vibrate)navigator.vibrate(35)}
      else status.textContent='Nessuna stringa affidabile rilevata. Riprova più vicino o inseriscila manualmente.';
    }catch(err){status.textContent='Lettura testo non riuscita. Puoi comunque inserire il seriale manualmente.'}
  };
}

// ============================================================
// V8 — MAPPA SCHEMATICA POSTAZIONI / MAGAZZINO
// ============================================================
async function mapView(){
  const epoch=navigationEpoch;
  if(!isITRole())return userHome();
  page('Mappa','Persone, postazioni e magazzino per sede');
  let positions=[];
  try{positions=await select('map_positions','select=*&is_active=eq.true&order=site.asc,zone_code.asc,position_code.asc')}catch(err){
    $('content').innerHTML=`<div class="panel"><div class="info-box"><b>Mappa V8 non ancora inizializzata.</b><br>Esegui la migration <code>08_migration_v8_map.sql</code> in Supabase e ricarica la pagina.</div></div>`;return;
  }
  const [persons,assets,approvedSiteRows]=await Promise.all([
    selectAll('people','select=id,display_name,site,department,current_status,map_position_id&current_status=neq.USCITO&order=display_name.asc'),
    selectAll('assets','select=id,asset_code,category,brand,model,site,position,status,is_label_only&is_label_only=eq.false&order=asset_code.asc'),
    select('reference_values','select=value&value_type=eq.SITE&is_approved=eq.true&order=value.asc')
  ]);
  if(epoch!==navigationEpoch)return;
  const sites=approvedSiteRows.map(x=>x.value).filter(Boolean);
  let activeSite=sites[0]||'';
  const render=()=>{
    const ps=positions.filter(x=>!activeSite||x.site===activeSite);
    const peopleSite=persons.filter(x=>!activeSite||x.site===activeSite);
    const unplaced=peopleSite.filter(x=>!x.map_position_id);
    const warehouse=ps.filter(x=>x.position_type==='MAGAZZINO');
    $('mapBody').innerHTML=`
      <div class="map-summary"><div><span>Posizioni</span><b>${ps.length}</b></div><div><span>Persone senza posizione</span><b>${unplaced.length}</b></div><div><span>Magazzino</span><b>${warehouse.length}</b></div></div>
      ${ps.length?`<div class="map-zone-grid">${ps.map(pos=>{
        const occupants=peopleSite.filter(p=>p.map_position_id===pos.id);
        const posAssets=assets.filter(a=>(!activeSite||a.site===activeSite)&&normSearch(a.position)===normSearch(pos.position_code));
        return `<div class="map-position-card ${pos.position_type==='MAGAZZINO'?'warehouse-position':''}">
          <div class="map-position-head"><div><span class="position-code">${esc(pos.position_code)}</span><small>${esc(pos.zone_code||pos.position_type)}</small></div><span class="badge">${esc(pos.position_type)}</span></div>
          ${pos.label?`<p>${esc(pos.label)}</p>`:''}
          <div class="map-occupants">${occupants.length?occupants.map(p=>`<button class="map-person-chip" data-map-person="${p.id}">${esc(p.display_name)}${p.department?` · ${esc(p.department)}`:''}</button>`).join(''):'<span class="muted-line">Nessuna persona</span>'}</div>
          <div class="map-assets">${posAssets.length?`<b>${posAssets.length} asset</b><small>${esc(posAssets.slice(0,5).map(a=>a.asset_code).join(', '))}${posAssets.length>5?'…':''}</small>`:'<span class="muted-line">Nessun asset</span>'}</div>
          <div class="button-row"><button class="ghost compact" data-assign-map="${pos.id}">Assegna persona</button></div>
        </div>`}).join('')}</div>`:'<div class="empty">Nessuna posizione configurata per questa sede.</div>'}
      ${unplaced.length?`<div class="panel map-unplaced"><h3>Persone senza posizione in ${esc(activeSite||'sede')}</h3><div class="map-unplaced-list">${unplaced.slice(0,100).map(p=>`<button class="ghost compact" data-map-person="${p.id}">${esc(p.display_name)}</button>`).join('')}</div></div>`:''}`;
    document.querySelectorAll('[data-map-person]').forEach(b=>b.onclick=()=>openSubView('person-detail',()=>personDetail(+b.dataset.mapPerson)));
    document.querySelectorAll('[data-assign-map]').forEach(b=>b.onclick=()=>showAssignPerson(+b.dataset.assignMap));
  };
  $('content').innerHTML=`<div class="panel map-toolbar-panel">
    <div class="map-toolbar"><label>Sede<select id="mapSite">${sites.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label><button id="newMapPosition" class="primary">+ Posizione</button><button id="exportMapXls" class="ghost">Scarica Mappa XLS</button></div>
    <div class="info-box"><b>Convenzione magazzino:</b> le posizioni di magazzino usano sempre il prefisso <b>M-</b>, ad esempio <b>M-A1</b>, <b>M-A2</b>, <b>M-B1</b>. Le postazioni normali non possono usare M-.</div>
  </div><div id="mapBody"></div><div id="mapEditor"></div>`;
  $('mapSite').value=activeSite;$('mapSite').onchange=e=>{activeSite=e.target.value;render()};
  $('newMapPosition').onclick=()=>showPositionEditor();
  $('exportMapXls').onclick=()=>{const rr=[['Sede','Tipo','Zona','Codice','Etichetta','Persone','Asset']];positions.forEach(pos=>{const occ=persons.filter(p=>p.map_position_id===pos.id).map(p=>p.display_name).join(', ');const aa=assets.filter(a=>a.site===pos.site&&normSearch(a.position)===normSearch(pos.position_code)).map(a=>a.asset_code).join(', ');rr.push([pos.site,pos.position_type,pos.zone_code||'',pos.position_code,pos.label||'',occ,aa])});downloadXls(`Archea_Mappa_${new Date().toISOString().slice(0,10)}.xls`,[{name:'Mappa',rows:rr}])};
  async function showPositionEditor(){
    const ed=$('mapEditor');ed.innerHTML=`<div class="panel"><h3>Nuova posizione</h3><div class="formgrid"><label>Sede<input id="mpSite" value="${esc(activeSite)}" required></label><label>Tipo<select id="mpType"><option>POSTAZIONE</option><option>MAGAZZINO</option></select></label><label>Zona<input id="mpZone" placeholder="Es. A, B, Piano 1"></label><label>Codice<input id="mpCode" placeholder="Es. Z-A12 oppure M-A1" required></label><label class="full">Etichetta / nota breve<input id="mpLabel" placeholder="Es. Open space A / Armadio basso"></label></div><div class="button-row"><button id="saveMapPosition" class="primary">Salva posizione</button><button id="cancelMapPosition" class="ghost">Annulla</button></div></div>`;
    $('cancelMapPosition').onclick=()=>ed.innerHTML='';$('saveMapPosition').onclick=async()=>{const type=$('mpType').value;const code=$('mpCode').value.trim().toUpperCase();if(type==='MAGAZZINO'&&!warehouseCodeOk(code))return toast('Il magazzino deve usare codici M-A1, M-B2, ecc.');if(type==='POSTAZIONE'&&!normalPositionCodeOk(code))return toast('Una postazione normale non può iniziare con M-');try{await insert('map_positions',{site:$('mpSite').value.trim(),position_type:type,zone_code:$('mpZone').value.trim()||null,position_code:code,label:$('mpLabel').value.trim()||null,created_by:user.id,created_by_name:currentITName()},false);toast('Posizione creata');mapView()}catch(err){toast(err.message)}};
  }
  async function showAssignPerson(positionId){
    const pos=positions.find(x=>x.id===positionId);const candidates=persons.filter(p=>p.site===pos.site&&p.current_status!=='USCITO');const ed=$('mapEditor');ed.innerHTML=`<div class="panel"><h3>Assegna persona a ${esc(pos.position_code)}</h3><label>Persona<select id="mapPersonSelect"><option value="">Seleziona…</option>${candidates.map(p=>`<option value="${p.id}">${esc(p.display_name)}${p.department?` · ${esc(p.department)}`:''}</option>`).join('')}</select></label><div class="button-row"><button id="saveMapPerson" class="primary">Assegna</button><button id="cancelMapPerson" class="ghost">Annulla</button></div></div>`;$('cancelMapPerson').onclick=()=>ed.innerHTML='';$('saveMapPerson').onclick=async()=>{const pid=+$('mapPersonSelect').value;if(!pid)return toast('Seleziona una persona');try{await update('people',`id=eq.${pid}`,{map_position_id:positionId,updated_at:new Date().toISOString()});await insert('person_events',{person_id:pid,event_type:'POSIZIONE_MAPPA',event_date:new Date().toISOString().slice(0,10),source_type:'PORTALE',note:`Posizione mappa assegnata: ${pos.position_code}`,new_data:{map_position_id:positionId,position_code:pos.position_code},created_by:user.id,created_by_name:currentITName()},false);toast('Posizione assegnata');mapView()}catch(err){toast(err.message)}};
  }
  render();
}


// ============================================================
// V8.3 — NAVIGATION FOUNDATION
// Icone SVG leggibili + stato attivo coerente su desktop/mobile.
// ============================================================
const NAV_ICON_PATHS={
  home:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  new:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  mine:'<path d="M7 4h10M7 9h10M7 14h7M4 4h.01M4 9h.01M4 14h.01"/><path d="M15 18l2 2 4-4"/>',
  it:'<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  movimenti:'<path d="M7 7h11M14 3l4 4-4 4M17 17H6M10 13l-4 4 4 4"/>',
  persone:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  prenotazioni:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  censimento:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  mappa:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  eliminazioni:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  'hr-new':'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v6M16 11h6"/>',
  'hr-history':'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  'hr-stats':'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
};
function navIconKey(view){return view==='calendar'?'calendar':view==='movimenti'?'movimenti':view==='persone'?'persone':view==='prenotazioni'?'prenotazioni':view==='censimento'?'censimento':view==='mappa'?'mappa':view==='eliminazioni'?'eliminazioni':view}
function installNavIcons(){
  document.querySelectorAll('nav button[data-view]').forEach(btn=>{
    if(btn.querySelector('.nav-icon'))return;
    const key=navIconKey(btn.dataset.view);
    const path=NAV_ICON_PATHS[key]||NAV_ICON_PATHS.mine;
    const icon=document.createElement('span');icon.className='nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    btn.prepend(icon);
  });
}
function setActiveNavigation(view){
  document.querySelectorAll('nav button[data-view]').forEach(btn=>{
    const active=btn.dataset.view===view || (view==='movimenti'&&btn.dataset.view==='hr-history');
    btn.classList.toggle('active',active);
    if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
  });
}

function nav(v){
  navigationEpoch++;
  const normalUserViews=['new','mine'];
  const hrViews=['persone','hr-new','hr-history','hr-stats'];

  if(currentView!==v){
    if(currentView && !String(currentView).includes('detail') && currentView!=='asset-edit'){
      previousView=currentView;
    }
    currentView=v;
  }

  setActiveNavigation(v);

  if(isHR()){
    if(!normalUserViews.includes(v)&&!hrViews.includes(v))return userHome();
  }else if(!isITRole()&&!normalUserViews.includes(v)){
    return userHome();
  }

  if(v==='home')home();
  else if(v==='new')newTicket();
  else if(v==='mine')mine();
  else if(v==='it')it();
  else if(v==='calendar')calendar();
  else if(v==='prenotazioni')bookings();
  else if(v==='movimenti')hrHistory();
  else if(v==='persone')people();
  else if(v==='censimento')census();
  else if(v==='mappa')mapView();
  else if(v==='eliminazioni')deletionRequests();
  else if(v==='hr-new')hrNewMovement();
  else if(v==='hr-history')hrHistory();
  else if(v==='hr-stats')hrStats();
  else placeholder(v);

  updateBackButton();
}
async function boot(){const raw=localStorage.getItem('archea_sd_session');if(raw){try{session=JSON.parse(raw);user=await api('/auth/v1/user')}catch{clear()}}if(!user){$('login').classList.remove('hidden');$('app').classList.add('hidden');return}const p=await select('profiles',`select=*&id=eq.${user.id}`);if(!p.length){clear();$('loginErr').textContent='Profilo non trovato';return}profile=p[0];$('who').textContent=profile.nome||user.email;$('role').textContent=profile.ruolo;$('userNav').classList.toggle('hidden',isITRole()||isHR());
$('hrNav').classList.toggle('hidden',!isHR());
$('itNav').classList.toggle('hidden',!isITRole());$('login').classList.add('hidden');$('app').classList.remove('hidden');currentView=isITRole()?'home':(isHR()?'persone':'mine');previousView=null;setActiveNavigation(currentView);isITRole()?home():(isHR()?people():userHome());updateBackButton();
refreshNotifications();
setInterval(refreshNotifications,30000);
setInterval(async()=>{
  try{
    if(session?.refresh_token) await refreshSession();
  }catch(e){
    console.warn('Refresh sessione fallito:',e.message);
  }
},10*60*1000);
}
$('loginForm').onsubmit=async e=>{e.preventDefault();$('loginErr').textContent='';try{const d=await api('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:{email:$('email').value.trim(),password:$('password').value}});save(d);user=d.user;await boot()}catch(err){$('loginErr').textContent=err.message}}
$('logout').onclick=()=>{clear();location.reload()};
function closeMobileNav(){
  const sidebar=$('sidebar');
  const backdrop=$('mobileNavBackdrop');
  const btn=$('mobileMenuBtn');
  if(sidebar)sidebar.classList.remove('mobile-open');
  if(backdrop)backdrop.classList.add('hidden');
  if(btn)btn.setAttribute('aria-expanded','false');
  document.body.classList.remove('mobile-nav-open');
}
function openMobileNav(){
  const sidebar=$('sidebar');
  const backdrop=$('mobileNavBackdrop');
  const btn=$('mobileMenuBtn');
  if(sidebar)sidebar.classList.add('mobile-open');
  if(backdrop)backdrop.classList.remove('hidden');
  if(btn)btn.setAttribute('aria-expanded','true');
  document.body.classList.add('mobile-nav-open');
}
document.querySelectorAll('nav button,[data-bottom-view]').forEach(b=>b.onclick=()=>{closeMobileNav();nav(b.dataset.view||b.dataset.bottomView)});
if($('mobileMenuBtn'))$('mobileMenuBtn').onclick=()=>{
  const open=$('sidebar')?.classList.contains('mobile-open');
  open?closeMobileNav():openMobileNav();
};
if($('mobileNavBackdrop'))$('mobileNavBackdrop').onclick=closeMobileNav;
window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMobileNav()});
if($('backBtn')) $('backBtn').onclick=goBack;
if($('themeToggle')) $('themeToggle').onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
installNavIcons();
initTheme();
boot();
