import React from 'react';
import { useApp } from '../context.jsx';
import { EMPLOYEES, STUDIOS, PROJECT_GROUPS } from '../../data/property.js';
import { isProperty } from '../../config/permissions.js';
import { FileIcon, IdentityIcon } from '../components/icons.jsx';

const roleKey = role => /partner/i.test(role) ? 'partner' : /senior/i.test(role) ? 'senior' : 'architect';
const ROLE_OPTIONS = [['architect','Architect'],['senior','Senior Architect'],['partner','Partner Architect']];

function EmployeeBioScreen() {
  const {data,viewer,language,selectedEmployeeId,setSelectedEmployeeId}=useApp(); const en=language==='en';
  const initialRole=roleKey(EMPLOYEES[selectedEmployeeId]?.role||'Architect');
  const [roleFilter,setRoleFilter]=React.useState(initialRole);
  if(!isProperty(viewer))return <div className="access-denied"><h1>{en?'Restricted area':'Area riservata'}</h1></div>;
  const filtered=Object.values(EMPLOYEES).filter(item=>roleKey(item.role)===roleFilter);
  const person=filtered.find(item=>item.id===selectedEmployeeId)??filtered[0];
  const studio=STUDIOS.find(item=>item.id===person.studio);
  const followedCodes=Object.entries(PROJECT_GROUPS).filter(([,groups])=>groups.some(group=>group.members.includes(person.id))).map(([code])=>code);
  const followedProjects=data.progetti.filter(project=>followedCodes.includes(project.codice));
  const showProjects=['senior','partner'].includes(roleKey(person.role));
  const money=value=>value==null?'—':new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
  const changeRole=value=>{setRoleFilter(value);const first=Object.values(EMPLOYEES).find(item=>roleKey(item.role)===value);if(first)setSelectedEmployeeId(first.id);};
  return <>
    <div className="property-title"><div><small>ARCHEA PROPERTY</small><h1>{en?'Employee bios':'Bio dipendenti'}</h1></div></div>
    <div className="bio-filters"><label className="field-label">{en?'Role':'Ruolo'}<select className="select-field" value={roleFilter} onChange={event=>changeRole(event.target.value)}>{ROLE_OPTIONS.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label className="field-label">{en?'Employee':'Dipendente'}<select className="select-field" value={person.id} onChange={event=>setSelectedEmployeeId(event.target.value)}>{filtered.map(item=><option value={item.id} key={item.id}>{item.name} · {STUDIOS.find(st=>st.id===item.studio)?.name}</option>)}</select></label></div>
    <section className="bio-card"><div className="bio-head"><span><IdentityIcon /></span><div><h2>{person.name}</h2><p>{person.role} · {studio?.name}</p></div></div><dl><div><dt>{en?'Years at Archea':'Anni in Archea'}</dt><dd>{person.years??(en?'To be connected':'Da collegare')}</dd></div><div><dt>{en?'Role':'Ruolo ricoperto'}</dt><dd>{person.role}</dd></div><div><dt>{en?'Annual compensation':'Compenso annuo'}</dt><dd>{money(person.annualCompensation)}</dd></div><div><dt>{en?'Contract expiry':'Scadenza contratto'}</dt><dd>{person.expiresAt??'—'}</dd></div></dl><div className="bio-contract"><span><FileIcon /></span><div><b>{person.contract}</b><small>{en?'Employment contract · PDF':'Contratto di lavoro · PDF'}</small></div><button>{en?'Open':'Apri'}</button></div></section>
    {showProjects&&<section className="followed-projects"><div className="section-head"><h2>{en?'Projects followed':'Progetti seguiti'}</h2><span className="count">{followedProjects.length}</span></div><div>{followedProjects.map(project=><article key={project.codice}><b>{project.codice}</b><span>{project.nome}</span><small>{project.stato}</small></article>)}{!followedProjects.length&&<p className="empty">{en?'No assigned projects.':'Nessun progetto assegnato.'}</p>}</div></section>}
    <p className="hint accounting-note">{en?'Demo profile: compensation and contract data are not real and must be connected to the protected HR source.':'Profilo dimostrativo: compensi e contratti non sono dati reali e dovranno essere collegati alla fonte HR protetta.'}</p>
  </>;
}
export { ROLE_OPTIONS, roleKey, EmployeeBioScreen };
