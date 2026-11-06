import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUtente } from '../lib/auth';
import { CATEGORIE } from '../lib/roles';
import { creaTicket } from '../lib/tickets';

export function NuovoTicket() {
  const u = useUtente();
  const qc = useQueryClient();
  const go = useNavigate();
  const [categoria, setCategoria] = useState('');
  const [oggetto, setOggetto] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const crea = useMutation({
    mutationFn: () => creaTicket(u, { categoria, oggetto: oggetto.trim(), descrizione: descrizione.trim() }),
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['ticket'] }); go(`/ticket/${r.id}`, { state: { creato: r.numero } }); },
  });
  const invia = (e: FormEvent) => { e.preventDefault(); crea.mutate(); };

  return (
    <>
      <header className="page-head"><h1>Apri un ticket</h1><p className="muted">L'IT riceve subito l'avviso e ti risponde qui.</p></header>
      <form className="card form" onSubmit={invia}>
        <label>Categoria
          <select required value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Scegli…</option>{CATEGORIE.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Oggetto<input required minLength={3} maxLength={200} value={oggetto} onChange={e => setOggetto(e.target.value)} placeholder="Es. Il monitor non si accende" /></label>
        <label className="full">Descrizione
          <textarea required rows={6} value={descrizione} onChange={e => setDescrizione(e.target.value)} placeholder="Dove sei, cosa succede, da quando" />
        </label>
        <div className="full row">
          <button className="btn primary big" disabled={crea.isPending}>{crea.isPending ? 'Invio…' : 'Invia ticket'}</button>
          {crea.error && <span className="error">{(crea.error as Error).message}</span>}
        </div>
      </form>
    </>
  );
}
