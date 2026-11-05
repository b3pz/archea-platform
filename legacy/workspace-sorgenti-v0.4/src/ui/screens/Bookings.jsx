import React from 'react';
import { useApp } from '../context.jsx';
import { RESOURCES } from '../../data/workspace.js';
const categories = ['Auto', 'Materiale', 'Sale'];
function BookingsScreen() {
  const { language } = useApp(); const en = language === 'en';
  const [category, setCategory] = React.useState('Auto'); const [booked, setBooked] = React.useState([]);
  const book = resource => { if (!resource.available || booked.includes(resource.id)) return; setBooked(current => [...current, resource.id]); };
  return <><h1 className="big title-row">{en ? 'Bookings' : 'Prenotazioni'}</h1><p className="sub">{en ? 'Cars, equipment and meeting rooms' : 'Auto, materiale e sale riunioni'}</p><div className="chips">{categories.map(item => <button className={`chip${category === item ? ' on' : ''}`} onClick={() => setCategory(item)} key={item}>{en ? ({Auto:'Cars',Materiale:'Equipment',Sale:'Rooms'}[item]) : item}</button>)}</div><div className="resource-grid">{RESOURCES.filter(item => item.category === category).map(resource => { const mine = booked.includes(resource.id); return <button className={`resource-card${(!resource.available && !mine) ? ' busy' : ''}`} onClick={() => book(resource)} key={resource.id}><span className="resource-mark">{resource.name.slice(0,2).toUpperCase()}</span><b>{resource.name}</b><small>{mine ? (en ? 'Booked by you' : 'Prenotato da te') : resource.available ? (en ? 'Available' : 'Disponibile') : (en ? 'Busy' : 'Occupato')}</small></button>; })}</div><p className="hint">{en ? 'Demo bookings. Google Calendar resources are ready to be connected.' : 'Prenotazioni dimostrative. Le risorse Google Calendar sono predisposte per il collegamento.'}</p></>;
}
export { BookingsScreen };
