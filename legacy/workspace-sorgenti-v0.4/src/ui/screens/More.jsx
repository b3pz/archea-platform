import React from 'react';
import { useApp } from '../context.jsx';
import { CalendarIcon, CarIcon, CommunityIcon, NoteIcon, ChevronRightIcon, EuroIcon } from '../components/icons.jsx';
import { canViewAccounting } from '../../config/permissions.js';
function MoreScreen() {
  const { setTab, language, setLanguage, viewer } = useApp(); const en = language === 'en';
  const items = [
    ['note', en ? 'Notes' : 'Note', en ? 'Project notes and follow-ups' : 'Note di progetto e follow-up', NoteIcon],
    ['calendario', en ? 'Calendar' : 'Calendario', en ? 'Meetings and site visits' : 'Riunioni e sopralluoghi', CalendarIcon],
    ['prenota', en ? 'Bookings' : 'Prenotazioni', en ? 'Cars, equipment and rooms' : 'Auto, materiale e sale', CarIcon],
    ['inarchea', 'IN ARCHEA', en ? 'Report, events and polls' : 'Report, eventi e sondaggi', CommunityIcon],
  ];
  if (canViewAccounting(viewer)) items.push(['contabilita', en ? 'Accounting' : 'Contabilità', en ? 'Contracts, payments and margins' : 'Contratti, pagamenti e margini', EuroIcon]);
  return <><h1 className="big title-row">{en ? 'More' : 'Altro'}</h1><p className="sub">{en ? 'Studio tools and community' : 'Strumenti e community dello studio'}</p><div className="menu-list">{items.map(([id,title,subtitle,Icon]) => <button onClick={() => setTab(id)} key={id}><span className="menu-icon"><Icon /></span><span><b>{title}</b><small>{subtitle}</small></span><ChevronRightIcon /></button>)}</div><div className="section-head"><h2>{en ? 'Language' : 'Lingua'}</h2></div><div className="language-switch"><button className={language === 'it' ? 'on' : ''} onClick={() => setLanguage('it')}>Italiano</button><button className={language === 'en' ? 'on' : ''} onClick={() => setLanguage('en')}>English</button></div></>;
}
export { MoreScreen };
