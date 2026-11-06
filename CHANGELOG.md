# Changelog

## 1.2.1 — Calendario: viste Giorno, Settimana e Mese

- Selettore **Giorno / Settimana / Mese**; la scelta viene ricordata.
- Mese: fino a 3 eventi per giorno e "+ altri N"; un clic sul numero apre il giorno, doppio clic crea un appuntamento.
- Sul telefono il mese è compatto, con pallini colorati, e sotto c'è l'elenco del giorno toccato.

## 1.2.0 — Calendario comune, riunioni online, aiuto "?"

- **Calendario comune**: appuntamenti con inviti e notifica, prenotazione di sale meeting e auto senza doppie prenotazioni, risposta Partecipo/Non partecipo, annullamento con avviso.
- **Riunioni online**: Zoom, Google Meet, Microsoft Teams, Webex o altro. Il pulsante "Crea" apre la piattaforma, il link si salva e tutti vedono "Partecipa alla riunione".
- **Aiuto "?"** accanto ai campi da compilare, con la spiegazione di cosa scrivere (`config/help.js`).
- **Account reale**: menu con in primo piano Service Desk, Calendario e Chat. I moduli ancora dimostrativi restano in "Altro" come "Anteprima demo".
- **Link Telegram**: il vecchio sito `Archea_IT` reindirizza alla piattaforma. I link `?ticket=` aprono direttamente il ticket.
- Pulizia: note delle vecchie versioni riassunte in `docs/STORICO.md`.

## 1.1.0 — Inizio e Chat

- **Inizio**: il Service Desk si apre sempre con un saluto ("Buongiorno, Giuseppe! Cosa facciamo?") e i pulsanti delle azioni possibili per il ruolo, cioè utente, HR o IT. Per l'IT ci sono anche i contatori (non assegnati, urgenti, assegnati a te).
- **Chat tra utenti**, reale su Supabase: rubrica dei colleghi, conversazioni 1 a 1, non letti, "letto", aggiornamento ogni 4 secondi, notifica nella campanella. La scheda Chat del Workspace usa questa chat.
- Nuovo script `supabase/migrations/20261106_chat.sql`, da eseguire una volta.
- Nuovo script `supabase/crea_utente.sql` per abilitare un collega.
- La demo supporta chat e notifiche dei messaggi.

## 1.0.0 — ARCHEA Platform (prima versione unificata)

Unione di **ARCHEA Workspace 0.14.5** e **ARCHEA Service Desk 8.3**.

### Login unico
- Il login del Workspace accetta sia gli account di prova (password `demo`) sia gli account ARCHEA reali (Supabase Auth).
- La sessione reale viene ripristinata alla riapertura e rinnovata se scaduta.
- "Esci" chiude la sessione del Workspace e quella del Service Desk.
- Nuovo account di prova **Reparto IT** (`it@archea.it`).

### Service Desk dentro il Workspace
- Nuova sezione **Service Desk IT** per tutti i profili: nel menu principale per IT e HR, in "Altro" per gli altri.
- Nuovo profilo Workspace **Reparto IT**, con menu dedicato su desktop e mobile.
- Nel Workspace la navigazione del Service Desk diventa una fila di schede, con lo stile del Workspace.
- Badge LIVE (dati Supabase) o DEMO (dati finti).

### Modalità demo del Service Desk
- `servicedesk/demo-backend.js` emula le parti di Supabase usate dall'app: tabelle, filtri, ordinamenti, relazioni, inserimenti e modifiche.
- Dati inventati: 13 persone, 27 asset, 10+ ticket, mappa postazioni, movimenti HR.
- Nessuna chiamata di rete in demo: niente Telegram, niente import.

### Pulizia
- Configurazione Supabase in un solo file: `config/platform.js`.
- Tolti 76 file compilati non più usati, la cartella di update `v031` e i duplicati.
- Le librerie scanner (Quagga2, Tesseract) si caricano in differita: se la CDN è lenta, il Service Desk parte lo stesso.
- Service worker: le pagine sono salvate separatamente, quindi il Service Desk non sostituisce più la pagina principale nella cache offline.
- I README delle singole versioni sono spostati in `docs/`.
