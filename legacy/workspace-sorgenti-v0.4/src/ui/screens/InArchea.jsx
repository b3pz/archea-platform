import React from 'react';
import { useApp } from '../context.jsx';
import { COMMUNITY } from '../../data/workspace.js';
import { canEdit } from '../../config/permissions.js';
import { NoteIcon, PlusIcon } from '../components/icons.jsx';
function InArcheaScreen() {
  const { viewer, language } = useApp(); const en = language === 'en'; const [vote, setVote] = React.useState('');
  return <><div className="title-action"><div><h1 className="big title-row">IN ARCHEA</h1><p className="sub">{en ? 'Studio life, culture and people' : 'Vita, cultura e persone dello studio'}</p></div>{canEdit(viewer) && <button className="round-add" aria-label="Aggiungi"><PlusIcon /></button>}</div><article className="report-card"><span><NoteIcon size={30}/></span><div><small>{COMMUNITY.report.issue}</small><h2>{COMMUNITY.report.title}</h2><p>{COMMUNITY.report.description}</p><button className="mini">{en ? 'Open report' : 'Apri il report'}</button></div></article><div className="section-head"><h2>{en ? 'Events and visits' : 'Eventi e uscite'}</h2></div><div className="list">{COMMUNITY.items.map(item => <article className="community-row" key={item.id}><span>{item.kind}</span><div><b>{item.title}</b><small>{item.meta}</small></div></article>)}</div><div className="poll-card"><small>{en ? 'POLL' : 'SONDAGGIO'}</small><h2>{COMMUNITY.poll.question}</h2><div>{COMMUNITY.poll.options.map(option => <button className={vote === option ? 'on' : ''} onClick={() => setVote(option)} key={option}>{option}</button>)}</div>{vote && <p>{en ? 'Response saved.' : 'Risposta registrata.'}</p>}</div></>;
}
export { InArcheaScreen };
