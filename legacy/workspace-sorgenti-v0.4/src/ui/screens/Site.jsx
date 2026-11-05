import React from 'react';
import { useApp } from '../context.jsx';
import { SITE_TASKS } from '../../data/workspace.js';
import { canEdit } from '../../config/permissions.js';
import { BuildingIcon, CameraIcon, CheckIcon, PlusIcon } from '../components/icons.jsx';

function SiteScreen() {
  const { data, viewer, language } = useApp();
  const projects = data.progetti.filter(project => project.stato.toLowerCase() === 'attivo');
  const [projectCode, setProjectCode] = React.useState(projects[0]?.codice || '');
  const [tasks, setTasks] = React.useState(SITE_TASKS);
  const [photos, setPhotos] = React.useState([]);
  const fileRef = React.useRef(null);
  const english = language === 'en';
  const selected = projects.find(project => project.codice === projectCode);
  const projectTasks = tasks.filter(task => task.project === projectCode);
  const addTask = () => {
    const title = prompt(english ? 'New site task' : 'Nuova attività di cantiere');
    if (title?.trim()) setTasks(current => [...current, { id: crypto.randomUUID(), project: projectCode, title: title.trim(), done: false, checklist: [] }]);
  };
  const receivePhoto = file => {
    if (!file) return;
    const base = file.name.replace(/\.[^.]+$/, '');
    const name = prompt(english ? 'Rename photo before saving' : 'Rinomina la foto prima di salvarla', `${projectCode}_${base}`);
    if (!name?.trim()) return;
    setPhotos(current => [{ id: crypto.randomUUID(), name: name.trim(), url: URL.createObjectURL(file), status: 'pending' }, ...current]);
  };
  return <>
    <div className="title-action"><div><h1 className="big title-row">{english ? 'Site' : 'Cantiere'}</h1><p className="sub">{english ? 'Checks, tasks and project photos' : 'Controlli, attività e foto per progetto'}</p></div>{canEdit(viewer) && <button className="round-add" onClick={addTask} aria-label="Aggiungi"><PlusIcon /></button>}</div>
    <label className="field-label">{english ? 'Active project' : 'Progetto attivo'}<select className="select-field" value={projectCode} onChange={event => setProjectCode(event.target.value)}>{projects.map(project => <option value={project.codice} key={project.codice}>{project.codice} · {project.nome}</option>)}</select></label>
    {selected && <div className="project-hero"><span className="thumb"><BuildingIcon /></span><span><b>{selected.codice}</b><small>{selected.nome}</small></span></div>}
    <div className="section-head"><h2>{english ? 'Site tasks' : 'Task di sopralluogo'}</h2><span className="count">{projectTasks.filter(task => !task.done).length}</span></div>
    <div className="list">{projectTasks.map(task => <div className={`site-task${task.done ? ' done' : ''}`} key={task.id}><button className="check-button" onClick={() => canEdit(viewer) && setTasks(current => current.map(item => item.id === task.id ? { ...item, done: !item.done } : item))}><CheckIcon /></button><span><b>{task.title}</b>{task.checklist.length > 0 && <small>{task.checklist.join(' · ')}</small>}</span></div>)}{!projectTasks.length && <p className="empty">{english ? 'No site tasks for this project.' : 'Nessuna attività di cantiere per questo progetto.'}</p>}</div>
    <button className="camera-button" onClick={() => fileRef.current?.click()}><CameraIcon /><span><b>{english ? 'Take or choose a photo' : 'Scatta o scegli una foto'}</b><small>{english ? 'Rename it before Drive sync' : 'Rinominala prima della sincronizzazione Drive'}</small></span></button>
    <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={event => { receivePhoto(event.target.files?.[0]); event.target.value = ''; }} />
    {photos.length > 0 && <div className="photo-grid">{photos.map(photo => <figure key={photo.id}><img src={photo.url} alt=""/><figcaption>{photo.name}<small>{english ? 'Waiting for Drive connection' : 'In attesa del collegamento Drive'}</small></figcaption></figure>)}</div>}
  </>;
}
export { SiteScreen };
