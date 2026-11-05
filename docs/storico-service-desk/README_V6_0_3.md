# ARCHEA SERVICE DESK V6.0.3 — Supabase Master Database

Release da installare direttamente sopra l'attuale V5.4 seguendo l'ordine SQL indicato sotto. La V6.0.3 include le migration V5.5, V6.0, V6.0.2 e la fix V6.0.3: non è necessario installare ZIP intermedie.

## Regole chiave V6

- Supabase è il database operativo master.
- PDF Chi Siamo, HR e Device vengono conservati come fonti tracciabili; i valori raw non vengono corretti automaticamente.
- Un device può esistere senza utente assegnato.
- Un codice con solo etichetta e nessun altro dato resta `ETICHETTA LIBERA`.
- Device occupati importati dal foglio Device partono da verificare; la verifica fisica conferma o corregge la situazione.
- Uscita è sempre `USCITA`: una data passata non crea un tipo diverso di movimento.
- Un'uscita svincola gli asset attribuiti alla persona e li rimette da confermare; non li dichiara automaticamente disponibili.
- Le fonti originali, gli assegnatari legacy e lo storico non vengono cancellati per correggere il presente.

## Fix V6.0.3 — Correzione ≠ Movimento

La V6.0.3 separa esplicitamente due operazioni:

### Correggi dati
Serve per errori di compilazione o digitazione.

Esempio: una persona è sempre stata a Firenze ma per errore è stata inserita Milano.

- aggiorna il dato corrente;
- richiede un motivo;
- crea un evento `CORREZIONE_DATO`;
- conserva prima/dopo, autore e data;
- **non** crea un movimento HR;
- **non** entra nelle statistiche ingressi/uscite/spostamenti.

### Registra movimento
Serve quando il cambiamento è realmente avvenuto.

Per le persone si usa il modulo Movimenti (`INGRESSO`, `USCITA`, `SPOSTAMENTO SEDE`, `SPOSTAMENTO POSTAZIONE`).

Per gli asset la scheda mostra un'azione separata `Registra movimento`, con data effettiva e motivo. La cronologia viene registrata come `MOVIMENTO_ASSET`; se cambia persona, vengono chiuse/aperte anche le relazioni storiche persona↔asset.

## Fix V6.0.3 — Eliminazione con approvazione SUPER_IT

Non esiste più eliminazione diretta dal client.

Flusso:

1. qualsiasi utente `IT` o `SUPER_IT` può premere `Richiedi eliminazione`;
2. il motivo è obbligatorio;
3. la richiesta entra in stato `IN_ATTESA`;
4. la sezione `Eliminazioni` mostra le proprie richieste agli IT e tutte le richieste a SUPER_IT;
5. solo `SUPER_IT` può `Approva` o `Rifiuta`;
6. anche dopo l'approvazione, i guard server-side bloccano la cancellazione se il record ha fonti, storico, assegnazioni, ticket o prenotazioni non eliminabili;
7. ogni eliminazione effettiva resta in `deletion_audit` con snapshot, autore e timestamp.

Per le persone reali si usa `USCITA`, non eliminazione. Per gli asset reali si usano gli stati operativi (`DISMESSO`, `VENDUTO`, ecc.). L'eliminazione è destinata a record creati realmente per errore.

## Ordine installazione

Eseguire in Supabase SQL Editor, nell'ordine:

1. `sql/00_PRECHECK_V6.sql`
2. `sql/01_migration_v5_5_movimenti.sql`
3. `sql/02_migration_v6_0.sql`
4. `sql/03_seed_chi_siamo_2026_09_02.sql`
5. `sql/04_migration_v6_0_2_superit_delete_guard.sql`
6. `sql/05_migration_v6_0_3_corrections_delete_approval.sql`
7. `sql/06_POSTCHECK_V6.sql`

Se un passaggio SQL restituisce un errore, fermarsi e non procedere al successivo prima di averlo verificato.

## Edge Functions

Distribuire/aggiornare:

- `supabase/functions/import-censimento/index.ts`
- `supabase/functions/import-hr/index.ts`
- `supabase/functions/telegram-new-ticket/index.ts`

Telegram continua a essere usato soltanto per la creazione di nuovi ticket.

## Frontend GitHub Pages

Sostituire nella root del repository:

- `index.html`
- `app.js`
- `styles.css`
- `logo_archea.png`

## Primo import V6

Ordine consigliato:

1. accedere come `SUPER_IT`;
2. importare HR;
3. importare il foglio `Device` del censimento;
4. controllare conflitti e numeri;
5. iniziare la verifica fisica persona per persona.

### Device

L'import legge esclusivamente il foglio `Device`.

Non vengono importati:

- password / PSW Apple-Google;
- PIN;
- PUK;
- altri fogli del workbook.

Un device con dati ma senza utente resta un device reale e può essere, per esempio, in magazzino, disponibile, in manutenzione o destinato al prestito.

## File sorgenti

La release non contiene i workbook HR/Censimento, il PDF Chi Siamo o il file di audit pre-import.
