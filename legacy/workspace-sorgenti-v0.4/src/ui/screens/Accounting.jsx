import React from 'react';
import { useApp } from '../context.jsx';
import { canEdit, canViewAccounting, isProperty } from '../../config/permissions.js';
import { accountingFor } from '../../data/accounting.js';
import { STUDIOS, studioForProject } from '../../data/property.js';
import { FileIcon, PlusIcon, ChevronRightIcon } from '../components/icons.jsx';

const HOURLY_COST = 10;
const isoDate = value => value ? new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`)) : '—';
const paymentStatus = payment => payment.paid >= payment.expected ? 'complete' : payment.paid > 0 ? 'partial' : 'pending';
const money = (value,en=false) => new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);

function financialsForProject(data,project,accounting=accountingFor(project.codice)) {
  const hours=data.ore.filter(row=>row.progettoCodice===project.codice).reduce((sum,row)=>sum+(Number(row.ore)||0),0);
  const hoursCost=hours*HOURLY_COST;
  const paid=accounting.payments.reduce((sum,payment)=>sum+payment.paid,0);
  const turnover=accounting.contract.value;
  const totalExpenses=accounting.consultantExpenses+hoursCost;
  return { accounting,hours,hoursCost,paid,turnover,totalExpenses,receivable:Math.max(0,turnover-paid),expectedProfit:turnover-totalExpenses,cashBalance:paid-totalExpenses };
}

function ProjectAccountingDetail({data,viewer,project,en=false,embedded=false}) {
  const [accounting,setAccounting]=React.useState(()=>accountingFor(project.codice));
  const totals=financialsForProject(data,project,accounting);
  const addPayment=()=>{const amount=Number(prompt(en?'Payment amount (€)':'Importo pagamento (€)'));if(!(amount>0))return;const payment={id:crypto.randomUUID(),label:en?'New payment':'Nuovo pagamento',dueAt:new Date().toISOString().slice(0,10),paidAt:null,expected:amount,paid:0};setAccounting(current=>({...current,payments:[...current.payments,payment]}));};
  return <div className={embedded?'embedded-accounting':''}>
    {embedded&&<div className="embedded-title"><small>{en?'PROJECT ACCOUNTING':'CONTABILITÀ DEL PROGETTO'}</small><h2>{en?'Economic overview':'Quadro economico'}</h2></div>}
    <section className="account-total"><small>{en?'PROJECT VALUE':'VALORE COMMESSA'}</small><b>{money(totals.turnover,en)}</b><span>{project.codice} · {project.nome}</span></section>
    <div className="account-kpis"><div><small>{en?'Collected':'Incassato'}</small><b>{money(totals.paid,en)}</b></div><div><small>{en?'To collect':'Da incassare'}</small><b>{money(totals.receivable,en)}</b></div><div><small>{en?'Expected margin':'Margine previsto'}</small><b className={totals.expectedProfit<0?'negative':''}>{money(totals.expectedProfit,en)}</b></div></div>
    <div className="section-head"><h2>{en?'Contract and client':'Contratto e cliente'}</h2></div>
    <article className="contract-card"><div className="contract-file"><span><FileIcon /></span><div><b>{accounting.contract.fileName}</b><small>{accounting.contract.signedAt?`${en?'Signed':'Firmato'} ${isoDate(accounting.contract.signedAt)}`:(en?'Contract not uploaded':'Contratto non caricato')}</small></div><button>{en?'Open':'Apri'}</button></div><dl><div><dt>{en?'Client':'Cliente'}</dt><dd>{accounting.client.name}</dd></div><div><dt>{en?'VAT no.':'P. IVA'}</dt><dd>{accounting.client.vat}</dd></div><div><dt>Email</dt><dd>{accounting.client.contact}</dd></div><div><dt>{en?'Address':'Sede'}</dt><dd>{accounting.client.address}</dd></div></dl></article>
    <div className="section-head"><h2>{en?'Payment schedule':'Scadenziario pagamenti'}</h2>{canEdit(viewer)&&<button className="link inline-add" onClick={addPayment}><PlusIcon />{en?'Add':'Aggiungi'}</button>}</div>
    <div className="payment-list">{accounting.payments.map(payment=>{const status=paymentStatus(payment),missing=Math.max(0,payment.expected-payment.paid);return <article className="payment-row" key={payment.id}><div className="payment-main"><span><b>{payment.label}</b><small>{en?'Due':'Scadenza'} · {isoDate(payment.dueAt)}</small></span><span className={`payment-status ${status}`}>{status==='complete'?(en?'Paid':'Pagato'):status==='partial'?(en?'Partial':'Parziale'):(en?'Due':'Da pagare')}</span></div><div className="payment-values"><span><small>{en?'Amount':'Importo'}</small><b>{money(payment.expected,en)}</b></span><span><small>{en?'Paid':'Pagato'}</small><b>{money(payment.paid,en)}</b></span><span><small>{en?'Missing':'Manca'}</small><b>{money(missing,en)}</b></span></div>{payment.paidAt&&<small className="paid-date">{en?'Payment date':'Data pagamento'} · {isoDate(payment.paidAt)}</small>}</article>})}{!accounting.payments.length&&<p className="empty">{en?'No payment schedule entered.':'Nessuna scadenza inserita.'}</p>}</div>
    <div className="section-head"><h2>{en?'Costs and resources':'Costi e risorse'}</h2></div>
    <div className="cost-list"><div><span>{en?'Consultants and external expenses':'Consulenti e spese esterne'}</span><b>{money(accounting.consultantExpenses,en)}</b></div>{accounting.expenses.map(expense=><div className="cost-detail" key={expense.label}><span>{expense.label}</span><b>{money(expense.amount,en)}</b></div>)}<div><span>{en?'Team hours':'Ore lavorate dalle risorse'}<small>{totals.hours.toLocaleString(en?'en-GB':'it-IT',{maximumFractionDigits:1})} h × {money(HOURLY_COST,en)}/h</small></span><b>{money(totals.hoursCost,en)}</b></div></div>
    <section className="grand-total"><h2>{en?'Project total':'Totale commessa'}</h2><div><span>{en?'Turnover':'Fatturato'}</span><b>{money(totals.turnover,en)}</b></div><div><span>{en?'Total expenses':'Spese totali'}</span><b>− {money(totals.totalExpenses,en)}</b></div><div className="grand-profit"><span>{en?'Expected profit':'Guadagno previsto'}</span><b>{money(totals.expectedProfit,en)}</b></div><footer><span>{en?'Collected cash balance':'Saldo di cassa sugli incassi'}</span><b>{money(totals.cashBalance,en)}</b></footer></section>
    <p className="hint accounting-note">{en?`Demo accounting data. Hourly cost: ${money(HOURLY_COST,en)}/h. VAT and taxes excluded.`:`Dati contabili dimostrativi. Costo orario: ${money(HOURLY_COST,en)}/h. IVA e imposte escluse.`}</p>
  </div>;
}

function StudioAccounting({data,en}) {
  const [studioId,setStudioId]=React.useState(null);
  const summaries=STUDIOS.map(studio=>{const projects=data.progetti.filter(project=>studioForProject(project.codice)===studio.id);const values=projects.map(project=>({project,...financialsForProject(data,project)}));return {studio,projects:values,turnover:values.reduce((s,x)=>s+x.turnover,0),paid:values.reduce((s,x)=>s+x.paid,0),expenses:values.reduce((s,x)=>s+x.totalExpenses,0),profit:values.reduce((s,x)=>s+x.expectedProfit,0)};});
  const selected=summaries.find(item=>item.studio.id===studioId);
  return <><div className="property-title"><div><small>ARCHEA PROPERTY</small><h1>{en?'Accounting by studio':'Contabilità per studio'}</h1></div></div><p className="sub property-sub">{en?'Overall financial performance of every studio.':'Andamento contabile complessivo di ogni studio.'}</p>
    <div className="studio-finance-list">{summaries.map(item=><button className={studioId===item.studio.id?'on':''} onClick={()=>setStudioId(studioId===item.studio.id?null:item.studio.id)} key={item.studio.id}><div><b>{item.studio.name}</b><small>{item.projects.length} {en?'projects':'progetti'}</small></div><div><span><small>{en?'Turnover':'Fatturato'}</small><b>{money(item.turnover,en)}</b></span><span><small>{en?'Costs':'Spese'}</small><b>{money(item.expenses,en)}</b></span><span><small>{en?'Profit':'Guadagno'}</small><b>{money(item.profit,en)}</b></span></div><ChevronRightIcon /></button>)}</div>
    {selected&&<section className="studio-finance-detail"><div className="account-total"><small>{en?'STUDIO TURNOVER':'FATTURATO STUDIO'}</small><b>{money(selected.turnover,en)}</b><span>{selected.studio.name} · {selected.projects.length} {en?'projects':'progetti'}</span></div><div className="account-kpis"><div><small>{en?'Collected':'Incassato'}</small><b>{money(selected.paid,en)}</b></div><div><small>{en?'Total costs':'Spese totali'}</small><b>{money(selected.expenses,en)}</b></div><div><small>{en?'Expected profit':'Guadagno previsto'}</small><b>{money(selected.profit,en)}</b></div></div><div className="section-head"><h2>{en?'Project contribution':'Composizione per progetto'}</h2></div><div className="finance-projects">{selected.projects.map(item=><div key={item.project.codice}><span><b>{item.project.codice}</b><small>{item.project.nome}</small></span><span><small>{en?'Turnover':'Fatturato'}</small><b>{money(item.turnover,en)}</b></span><span><small>{en?'Profit':'Guadagno'}</small><b>{money(item.expectedProfit,en)}</b></span></div>)}{!selected.projects.length&&<p className="empty">{en?'No projects assigned.':'Nessun progetto assegnato.'}</p>}</div></section>}
    <p className="hint accounting-note">{en?'Totals are the sum of all projects assigned to each studio.':'I totali sono la somma di tutti i progetti assegnati a ciascuno studio.'}</p></>;
}

function AccountingScreen() {
  const {data,viewer,language}=useApp(); const en=language==='en';
  const activeProjects=data.progetti.filter(project=>project.stato.toLowerCase()==='attivo');
  const [projectCode,setProjectCode]=React.useState(activeProjects[0]?.codice||'');
  const project=activeProjects.find(item=>item.codice===projectCode)??activeProjects[0];
  if(!canViewAccounting(viewer))return <div className="access-denied"><h1>{en?'Restricted area':'Area riservata'}</h1><p>{en?'Accounting is available to Senior Architects, Partner Architects and Property.':'La contabilità è disponibile per Senior Architect, Partner Architect e Property.'}</p></div>;
  if(isProperty(viewer))return <StudioAccounting data={data} en={en}/>;
  if(!project)return <p className="empty">{en?'No active project.':'Nessun progetto attivo.'}</p>;
  return <><div className="title-action"><div><h1 className="big title-row">{en?'Accounting':'Contabilità'}</h1><p className="sub">{en?'Contracts, payments and project margin':'Contratti, pagamenti e margine di commessa'}</p></div></div><label className="field-label">{en?'Active project':'Progetto attivo'}<select className="select-field" value={project.codice} onChange={event=>setProjectCode(event.target.value)}>{activeProjects.map(item=><option value={item.codice} key={item.codice}>{item.codice} · {item.nome}</option>)}</select></label><ProjectAccountingDetail key={project.codice} data={data} viewer={viewer} project={project} en={en}/></>;
}
export { HOURLY_COST, paymentStatus, money, financialsForProject, ProjectAccountingDetail, StudioAccounting, AccountingScreen };
