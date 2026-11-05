const ACCOUNTING = {
  P51: {
    client: { name: 'ACF Fiorentina S.r.l.', vat: '05248440488', contact: 'project@acffiorentina.it', address: 'Bagno a Ripoli (FI)' },
    contract: { value: 100000, signedAt: '2026-02-12', fileName: 'P51_Contratto_firmato.pdf' },
    consultantExpenses: 10000,
    expenses: [
      { label: 'Consulenza impianti', amount: 6000 },
      { label: 'Consulenza strutture', amount: 4000 },
    ],
    payments: [
      { id: 'p51-1', label: 'Acconto incarico', dueAt: '2026-03-15', paidAt: '2026-03-12', expected: 30000, paid: 30000 },
      { id: 'p51-2', label: 'Consegna intermedia', dueAt: '2026-09-30', paidAt: '2026-10-02', expected: 40000, paid: 20000 },
      { id: 'p51-3', label: 'Saldo finale', dueAt: '2026-12-20', paidAt: null, expected: 30000, paid: 0 },
    ],
  },
  M86: {
    client: { name: 'Roma Capitale', vat: '02438750586', contact: 'direzione.lavori@example.it', address: 'Roma' },
    contract: { value: 250000, signedAt: '2026-01-28', fileName: 'M86_Contratto_firmato.pdf' },
    consultantExpenses: 32500,
    expenses: [{ label: 'Consulenze specialistiche', amount: 20500 }, { label: 'Rilievi e indagini', amount: 12000 }],
    payments: [
      { id: 'm86-1', label: 'Avvio progettazione', dueAt: '2026-02-28', paidAt: '2026-02-25', expected: 75000, paid: 75000 },
      { id: 'm86-2', label: 'Sviluppo definitivo', dueAt: '2026-10-15', paidAt: null, expected: 100000, paid: 0 },
      { id: 'm86-3', label: 'Saldo', dueAt: '2027-02-15', paidAt: null, expected: 75000, paid: 0 },
    ],
  },
  O80: {
    client: { name: 'AC Milan S.p.A.', vat: '01073200154', contact: 'development@example.it', address: 'Carnago (VA)' },
    contract: { value: 180000, signedAt: '2026-04-08', fileName: 'O80_Contratto_firmato.pdf' },
    consultantExpenses: 22000,
    expenses: [{ label: 'Urbanistica e ambiente', amount: 14000 }, { label: 'Consulenza impianti', amount: 8000 }],
    payments: [
      { id: 'o80-1', label: 'Acconto', dueAt: '2026-04-30', paidAt: '2026-04-29', expected: 54000, paid: 54000 },
      { id: 'o80-2', label: 'Conferenza dei Servizi', dueAt: '2026-11-10', paidAt: null, expected: 72000, paid: 0 },
      { id: 'o80-3', label: 'Saldo', dueAt: '2027-03-31', paidAt: null, expected: 54000, paid: 0 },
    ],
  },
  H05: {
    client: { name: 'Pisa Sporting Club S.r.l.', vat: '02247390507', contact: 'amministrazione@example.it', address: 'Pisa' },
    contract: { value: 85000, signedAt: '2026-05-20', fileName: 'H05_Contratto_firmato.pdf' },
    consultantExpenses: 7500,
    expenses: [{ label: 'Rilievi', amount: 4500 }, { label: 'Consulenza acustica', amount: 3000 }],
    payments: [
      { id: 'h05-1', label: 'Acconto', dueAt: '2026-06-15', paidAt: '2026-06-14', expected: 25000, paid: 25000 },
      { id: 'h05-2', label: 'Secondo SAL', dueAt: '2026-10-31', paidAt: null, expected: 35000, paid: 0 },
      { id: 'h05-3', label: 'Saldo', dueAt: '2027-01-31', paidAt: null, expected: 25000, paid: 0 },
    ],
  },
  I04: {
    client: { name: 'Cliente privato', vat: '—', contact: 'amministrazione@example.it', address: 'Firenze' },
    contract: { value: 60000, signedAt: '2026-03-18', fileName: 'I04_Contratto_firmato.pdf' },
    consultantExpenses: 5000,
    expenses: [{ label: 'Consulenze', amount: 5000 }],
    payments: [
      { id: 'i04-1', label: 'Acconto', dueAt: '2026-04-15', paidAt: '2026-04-12', expected: 20000, paid: 20000 },
      { id: 'i04-2', label: 'Consegna', dueAt: '2026-10-20', paidAt: null, expected: 25000, paid: 0 },
      { id: 'i04-3', label: 'Saldo', dueAt: '2026-12-15', paidAt: null, expected: 15000, paid: 0 },
    ],
  },
};
const emptyAccounting = code => ({
  client: { name: 'Dati cliente da inserire', vat: '—', contact: '—', address: '—' },
  contract: { value: 0, signedAt: null, fileName: `${code}_Contratto_da_caricare.pdf` },
  consultantExpenses: 0,
  expenses: [],
  payments: [],
});
const accountingFor = code => ACCOUNTING[code] ?? emptyAccounting(code);
export { ACCOUNTING, accountingFor };
