ARCHEA SERVICE DESK V2.0
========================

BASE
- Mantiene login, ruoli, RLS, notifiche interne, appuntamenti con conferma,
  Telegram solo sul nuovo ticket e JWT refresh della V1.7.1.

V2 - CODA IT
- Filtri rapidi:
  * Aperti
  * Non assegnati
  * I miei
  * Urgenti
  * In attesa
- Ricerca per numero ticket, nome, email, oggetto e categoria.
- Filtro categoria.
- Ordinamento:
  * più vecchi prima
  * più recenti
  * priorità
- "Prendi in carico" direttamente dalla lista.
- Ticket preso in carico:
  * Assegnato a = IT loggato
  * Stato = IN LAVORAZIONE

V2 - PRENOTAZIONI MATERIALE
Quando USER sceglie "Prenotazione materiale" compaiono:
- Materiale
- Quantità
- Data ritiro
- Restituzione prevista
- Sede
- Motivo / progetto
- Accessori richiesti
- Note

Il ticket continua ad essere il contenitore principale.

IT può:
- vedere tutte le prenotazioni;
- impostare stato:
  RICHIESTA -> DA VERIFICARE -> CONFERMATA -> CONSEGNATA -> RESTITUITA;
- assegnare codice asset;
- descrizione/modello;
- seriale;
- accessori consegnati;
- note IT;
- generare il verbale.

VERBALE
- Non viene salvato nel database.
- Il pulsante "Genera verbale / PDF" apre il documento A4.
- Il browser apre la finestra di stampa.
- Da Chrome/macOS:
  * stampare direttamente su carta, oppure
  * scegliere "Salva come PDF".
- Il verbale contiene:
  * logo Archea Associati
  * numero ticket
  * assegnatario
  * sede
  * date
  * materiale
  * asset
  * seriale
  * accessori
  * progetto/motivo
  * note
  * spazio firma assegnatario
  * spazio firma IT
- Firma prevista A PENNA.

CHECKLIST
Ogni nuovo ticket riceve automaticamente una checklist generale:
1. Presa in carico
2. Verifica richiesta / informazioni necessarie
3. Intervento o preparazione
4. Test / verifica finale
5. Conferma con utente e chiusura

INSTALLAZIONE
1. Supabase -> SQL Editor -> New query.
2. Eseguire migration_v2_0.sql UNA SOLA VOLTA.
3. GitHub: sostituire/caricare:
   - index.html
   - styles.css
   - app.js
   - logo_archea.png
4. NON modificare la Edge Function Telegram se già funziona.
5. NON modificare i Secrets Telegram.
6. Commit changes.
7. Cmd + Shift + R.

TEST CODA IT
- Aprire 2-3 ticket.
- Gestione IT -> provare Non assegnati / I miei / Urgenti.
- Prendere in carico un ticket dalla lista.

TEST MATERIALE
- USER -> Nuovo ticket -> Prenotazione materiale.
- Compilare tutti i campi.
- IT -> Prenotazioni.
- Aprire richiesta.
- Inserire codice asset, modello, seriale e accessori.
- Stato -> CONFERMATA.
- Genera verbale / PDF.
- Stampare oppure salvare come PDF.
- Verificare che nessun PDF venga caricato o salvato su Supabase.
