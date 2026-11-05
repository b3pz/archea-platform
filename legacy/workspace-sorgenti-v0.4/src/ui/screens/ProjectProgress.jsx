import React from 'react';
import { useApp } from '../context.jsx';
import { STUDIOS, EMPLOYEES, statusCategory, studioForProject, groupsForProject } from '../../data/property.js';
import { isProperty } from '../../config/permissions.js';
import { BuildingIcon, ChevronLeftIcon, ChevronRightIcon, IdentityIcon } from '../components/icons.jsx';
import { ProjectAccountingDetail } from './Accounting.jsx';

const CATEGORIES = [
  ['active','Progetti attivi','Active projects'],
  ['standby','Progetti in standby','Standby projects'],
  ['stopped','Progetti fermi','Stopped projects'],
  ['completed','Progetti conclusi','Completed projects'],
];
const hoursFor = (data, code) => data.ore.filter(row => row.progettoCodice === code).reduce((sum,row) => sum + (Number(row.ore) || 0), 0);
const formatHours = value => `${value.toLocaleString('it-IT',{maximumFractionDigits:1})} h`;
const roleRank = role => /partner/i.test(role) ? 0 : /senior/i.test(role) ? 1 : 2;

function ProjectProgressScreen() {
  const { data, viewer, language, setTab, setSelectedEmployeeId } = useApp();
  const en = language === 'en';
  const [studioId,setStudioId] = React.useState(null);
  const [category,setCategory] = React.useState(null);
  const [projectCode,setProjectCode] = React.useState(null);
  const [groupId,setGroupId] = React.useState(null);
  if (!isProperty(viewer)) return <div className="access-denied"><h1>{en?'Restricted area':'Area riservata'}</h1></div>;
  const studio = STUDIOS.find(item => item.id === studioId);
  const projectsForStudio = data.progetti.filter(project => studioForProject(project.codice) === studioId);
  const project = data.progetti.find(item => item.codice === projectCode);
  const rawGroups = project ? groupsForProject(project.codice) : [];
  const fallbackMembers = Object.values(EMPLOYEES).filter(person => person.studio === studioId).slice(0,2).map(person => person.id);
  const groups = project && rawGroups.length ? rawGroups : project ? [{ id:`${project.codice}-studio`, studio:studioId, name:en?'Studio team':'Gruppo di studio', share:1, members:fallbackMembers }] : [];
  const group = groups.find(item => item.id === groupId);
  const projectHours = project ? hoursFor(data,project.codice) : 0;
  const openBio = id => { setSelectedEmployeeId(id); setTab('bio'); };
  const resetAfterStudio = id => { setStudioId(id); setCategory(null); setProjectCode(null); setGroupId(null); };
  const back = () => groupId ? setGroupId(null) : projectCode ? setProjectCode(null) : category ? setCategory(null) : setStudioId(null);
  const crumbs = [studio?.name, CATEGORIES.find(item=>item[0]===category)?.[en?2:1], project?.nome, group?.name].filter(Boolean);
  return <>
    <div className="property-title"><div><small>ARCHEA PROPERTY</small><h1>{en?'Project progress':'Avanzamento progetti'}</h1></div>{studioId && <button className="icon-btn" onClick={back} aria-label={en?'Back':'Indietro'}><ChevronLeftIcon /></button>}</div>
    {crumbs.length > 0 && <div className="breadcrumbs"><button onClick={() => {setStudioId(null);setCategory(null);setProjectCode(null);setGroupId(null);}}>{en?'Studios':'Studi'}</button>{crumbs.map((item,index)=><React.Fragment key={`${item}-${index}`}><span>›</span><b>{item}</b></React.Fragment>)}</div>}
    {!studioId && <><p className="sub property-sub">{en?'Select a studio to view its projects.':'Seleziona uno studio per consultarne i progetti.'}</p><div className="studio-grid">{STUDIOS.map(item => { const officeProjects=data.progetti.filter(project=>studioForProject(project.codice)===item.id); return <button onClick={()=>resetAfterStudio(item.id)} key={item.id}><span className="studio-icon"><BuildingIcon /></span><b>{item.name}</b><small>{officeProjects.length} {en?'projects':'progetti'}</small><span className="mini-statuses"><i>{officeProjects.filter(p=>statusCategory(p.stato)==='active').length} {en?'active':'attivi'}</i><i>{formatHours(officeProjects.reduce((sum,p)=>sum+hoursFor(data,p.codice),0))}</i></span></button>;})}</div></>}
    {studioId && !category && <><p className="sub property-sub">{en?'Choose project status.':'Scegli lo stato dei progetti.'}</p><div className="property-menu">{CATEGORIES.map(([id,itLabel,enLabel])=>{const matching=projectsForStudio.filter(p=>statusCategory(p.stato)===id);return <button onClick={()=>setCategory(id)} key={id}><span><b>{en?enLabel:itLabel}</b><small>{matching.length} {matching.length===1?(en?'project':'progetto'):(en?'projects':'progetti')}</small></span><ChevronRightIcon /></button>;})}</div></>}
    {studioId && category && !projectCode && <><div className="section-head"><h2>{en?'Project list':'Elenco progetti'}</h2></div><div className="property-list">{projectsForStudio.filter(item=>statusCategory(item.stato)===category).map(item=><button onClick={()=>setProjectCode(item.codice)} key={item.codice}><span><b>{item.codice}</b><small>{item.nome}</small></span><span className="hours-badge">{formatHours(hoursFor(data,item.codice))}</span><ChevronRightIcon /></button>)}{!projectsForStudio.some(item=>statusCategory(item.stato)===category)&&<p className="empty">{en?'No projects in this category.':'Nessun progetto in questa categoria.'}</p>}</div></>}
    {project && !groupId && <><div className="project-property-hero"><small>{project.codice}</small><h2>{project.nome}</h2><span>{en?'Total studio hours':'Ore complessive dello studio'} · <b>{formatHours(projectHours)}</b></span></div><div className="section-head"><h2>{en?'Work groups by studio':'Gruppi di lavoro per studio'}</h2></div><div className="property-list">{groups.map(item=>{const office=STUDIOS.find(st=>st.id===item.studio);return <button onClick={()=>setGroupId(item.id)} key={item.id}><span><b>{item.name}</b><small>{office?.name}</small></span><span className="hours-badge">{formatHours(projectHours*item.share)}</span><ChevronRightIcon /></button>;})}</div><details className="project-accounting-disclosure" open><summary>{en?'Project accounting':'Contabilità del progetto'}<ChevronRightIcon /></summary><ProjectAccountingDetail key={project.codice} data={data} viewer={viewer} project={project} en={en} embedded/></details></>}
    {group && <><div className="project-property-hero group"><small>{STUDIOS.find(item=>item.id===group.studio)?.name}</small><h2>{group.name}</h2><span>{en?'Group hours':'Ore complessive del gruppo'} · <b>{formatHours(projectHours*group.share)}</b></span></div><div className="section-head"><h2>{en?'Team members':'Componenti del gruppo'}</h2></div><div className="member-list">{group.members.slice().sort((a,b)=>roleRank(EMPLOYEES[a]?.role)-roleRank(EMPLOYEES[b]?.role)).map(id=>{const person=EMPLOYEES[id];if(!person)return null;const lead=roleRank(person.role)<2;return <div key={id}><span className="member-avatar">{person.name.split(' ').map(part=>part[0]).slice(0,2).join('')}</span><span><span className="member-name">{lead&&<strong>{en?'Lead: ':'Referente: '}</strong>}{person.name}</span><small>{person.role} · {formatHours((projectHours*group.share)/Math.max(1,group.members.length))}</small></span><button onClick={()=>openBio(id)} aria-label={`${en?'Open employee bio':'Apri bio dipendente'} ${person.name}`}><IdentityIcon /></button></div>})}</div></>}
    <p className="hint property-data-note">{en?'Demo organizational mapping. Hours come from the imported Excel file.':'Mappatura organizzativa dimostrativa. Le ore provengono dall’Excel importato.'}</p>
  </>;
}
export { CATEGORIES, hoursFor, roleRank, ProjectProgressScreen };
