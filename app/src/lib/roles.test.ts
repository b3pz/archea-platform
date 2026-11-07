import { describe, expect, it } from 'vitest';
import { gruppiMenu, numeroTicket, primaPagina, type Utente } from './roles';

const u = (ruolo: Utente['profilo']['ruolo'] = 'USER', permessi: Utente['permessi'] = []): Utente =>
  ({ profilo: { id: 'x', email: 'a@archea.it', nome: 'A', ruolo }, permessi });
const ids = (x: Utente) => gruppiMenu(x).map(g => g.id);

describe('menu per ruolo', () => {
  it('utente: solo lavoro, calendario, comunicazione', () => expect(ids(u('USER'))).toEqual(['lavoro', 'calendario', 'comunicazione']));
  it('HR: in più le persone', () => expect(ids(u('USER', ['gestione_hr']))).toEqual(['lavoro', 'persone', 'calendario', 'comunicazione']));
  it('IT: reparto IT e persone, niente amministrazione senza permesso', () => expect(ids(u('USER', ['gestione_it']))).toEqual(['lavoro', 'it', 'persone', 'calendario', 'comunicazione']));
  it('IT con gestione utenti vede Amministrazione', () => expect(ids(u('USER', ['gestione_it', 'gestione_utenti']))).toContain('admin'));
  it('PM vede Progetti', () => expect(ids(u('USER', ['gestione_progetti']))).toContain('pm'));
  it('IT + PM vede entrambe le aree', () => expect(ids(u('USER', ['gestione_it', 'gestione_progetti']))).toEqual(['lavoro', 'pm', 'it', 'persone', 'calendario', 'comunicazione']));
  it('Super admin tecnico non eredita IT, HR o PM', () => expect(ids(u('SUPER_IT', ['gestione_utenti']))).toEqual(['lavoro', 'calendario', 'comunicazione', 'admin']));
  it('ogni voce va da qualche parte', () => gruppiMenu(u('SUPER_IT', ['gestione_utenti'])).flatMap(g => g.voci).forEach(v => expect(v.to || v.legacy).toBeTruthy()));
});

describe('varie', () => {
  it('IT parte dalla dashboard e HR dall’inizio', () => { expect(primaPagina(u('USER', ['gestione_it']))).toBe('/it'); expect(primaPagina(u('USER', ['gestione_hr']))).toBe('/'); });
  it('numero ticket', () => expect(numeroTicket(29, 2026)).toBe('TKT-2026-00029'));
});
