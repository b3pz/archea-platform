import React from 'react';
import { useApp } from '../context.jsx';
import { EVENTS } from '../../data/workspace.js';
import { GOOGLE_INTEGRATION } from '../../config/google.js';
function CalendarScreen() {
  const { language } = useApp(); const en = language === 'en';
  return <><h1 className="big title-row">{en ? 'Calendar' : 'Calendario'}</h1><p className="sub">{en ? 'Meetings, deadlines and site visits' : 'Riunioni, scadenze e sopralluoghi'}</p><div className="integration-banner"><span className="live-dot"/><span><b>Google Calendar</b><small>{GOOGLE_INTEGRATION.enabled ? (en ? 'Connected' : 'Collegato') : (en ? 'Ready to configure' : 'Predisposto, da configurare')}</small></span></div><div className="section-head"><h2>{en ? 'Upcoming' : 'Prossimi appuntamenti'}</h2></div><div className="list">{EVENTS.map(event => <article className="event-row" key={event.id}><time><b>{event.day}</b><small>{event.month}</small></time><span><b>{event.title}</b><small>{event.meta}</small></span></article>)}</div></>;
}
export { CalendarScreen };
