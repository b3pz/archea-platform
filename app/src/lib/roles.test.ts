import { describe, expect, it } from 'vitest';
import { gruppiMenu, numeroTicket, primaPagina, type Utente } from './roles';

const u = (ruolo: Utente['profilo']['ruolo'], permessi: Utente['permessi'] = []): Utente =>
  ({ profilo: { id: 'x', email: 'a@archea.it', nome: 'A', ruolo }, permessi });
const ids = (x: Utente) => gruppiMenu(x).map(g => g.id);

describe('menu per ruolo', () => {
  it('utente: solo lavoro, calendario, comunicazione', () => expect(ids(u('USER'))).toEqual(['lavoro', 'calendario', 'comunicazione']));
  it('HR: in più le persone', () => expect(ids(u('HR'))).toEqual(['lavoro', 'persone', 'calendario', 'comunicazione']));
  it('IT: reparto IT e persone, niente amministrazione senza permesso', () => expect(ids(u('IT'))).toEqual(['lavoro', 'it', 'persone', 'calendario', 'comunicazione']));
  it('IT con gestione utenti vede Amministrazione', () => expect(ids(u('IT', ['gestione_utenti']))).toContain('admin'));
  it('PM vede Progetti', () => expect(ids(u('USER', ['gestione_progetti']))).toContain('pm'));
  it('super admin vede tutto', () => expect(ids(u('SUPER_IT'))).toEqual(['lavoro', 'pm', 'it', 'persone', 'calendario', 'comunicazione', 'admin']));
  it('ogni voce va da qualche parte', () => gruppiMenu(u('SUPER_IT')).flatMap(g => g.voci).forEach(v => expect(v.to || v.legacy).toBeTruthy()));
});

describe('varie', () => {
  it('IT parte dalla dashboard', () => { expect(primaPagina(u('IT'))).toBe('/it'); expect(primaPagina(u('HR'))).toBe('/'); });
  it('numero ticket', () => expect(numeroTicket(29, 2026)).toBe('TKT-2026-00029'));
});
