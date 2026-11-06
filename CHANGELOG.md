# Changelog

## 1.5.0 — Planimetrie disegnabili

- **Planimetrie** (Service Desk, per IT e HR): pianta per sede e piano, con chi siede dove.
  - Si cerca una persona e il suo posto si illumina.
  - Un tocco su una postazione assegna o sposta una persona, oppure la libera; il cambio va nello storico della persona.
  - Un tocco su una WRKA mostra i suoi dispositivi, che si spostano su un'altra postazione; lo spostamento va nello storico dell'asset.
- **Editor** (permesso nuovo "Disegnare le planimetrie", incluso nel gruppo IT):
  - elementi: muri, stanze, porte, finestre, scrivanie, tavoli riunioni e rotondi, sedie, divani, armadi, TV/schermi, monitor, proiettori, videocamere, speaker, lavagne, stampanti, rack, access point, piante, scritte;
  - comandi: trascina, ridimensiona, ruota, duplica, annulla, griglia, zoom, sfondo da ricalcare;
  - al salvataggio crea le postazioni mancanti.
- **18 piante pronte**, convertite dalla v13 (Firenze, Genova, Milano, Roma, Parigi, Shanghai, 249 postazioni), da importare con un clic e rifinire.
- La vecchia "Mappa" (elenco) si chiama ora **Postazioni**.
- Migrazione `supabase/migrations/20261106_planimetrie.sql`, inclusa in `SETUP_COMPLETO.sql`.

## 1.4.0 — Sondaggi, gestione utenti dal sito, gruppi e permessi

- **Sondaggi** negli argomenti Off topic: domanda, da 2 a 12 risposte, scelta singola o multipla, chiusura facoltativa. Si vede chi ha votato cosa, e un voto si toglie toccandolo di nuovo.
- **Utenti e gruppi** (Service Desk, per chi ha il permesso): elenco utenti con stato e ultimo accesso. Si possono aggiungere utenti con password temporanea o invito per email, cambiare ruolo e gruppi, reimpostare la password, disattivare o eliminare.
- **Gruppi e permessi**: le persone si mettono nei gruppi e il gruppo dà i permessi (gestire utenti, moderare Off topic, gestire il calendario). I gruppi iniziali sono IT, Moderatori Off topic e Gestione calendario; SUPER_IT ha sempre tutto.
- **Sale e auto**: chi gestisce il calendario sceglie se una risorsa la prenotano tutti o solo un gruppo, e può aggiungere o disattivare risorse.
- **Sicurezza**: nessuno può cambiarsi il ruolo da solo, e solo un SUPER_IT può nominarne un altro.
- La **Mappa** è visibile anche all'HR.
- Nuovo `supabase/SETUP_COMPLETO.sql`, un unico script, provato su PostgreSQL 16. Nuova Edge Function `supabase/functions/admin-users`.

## 1.3.0 — Off topic

- Nuova sezione **Off topic**: ogni utente apre argomenti in 5 categorie (Generale, Eventi, Consigli, Mercatino, Svago) e risponde. Ci sono ricerca e filtri, e i link sono cliccabili.
- Notifica all'autore e a chi ha già risposto.
- Moderazione IT: mette in evidenza, chiude alle risposte, elimina. Ognuno può eliminare i propri messaggi.
- Migrazione `supabase/migrations/20261106_offtopic.sql`.

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
