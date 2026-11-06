# Changelog

## 2.7.0 — Si parte da "Inizio", funzioni raggruppate, Organico compilabile dall'HR

- **La prima pagina è sempre "Inizio"**: saluto, "Cosa facciamo?" e pulsanti grandi. È la prima voce del menu e il primo tasto in basso sul telefono. "Oggi" di Francesco resta nel menu. Tolto il titolo doppio "Service Desk IT".
- **Inizio a gruppi**, ognuno con il suo titolo. Ogni ruolo vede i gruppi suoi, tutto visibile:
  - *Il mio lavoro* (per tutti): Le mie task, Apri un ticket, I miei ticket, Il mio lavoro di oggi;
  - *Progetti (PM)*: Nuovo progetto e squadra, Progetti, Ore;
  - *HR · Persone*: Ingresso, uscita o spostamento, Persone, Storico movimenti, Statistiche HR, Organico;
  - *Reparto IT*: Coda ticket, Dashboard, Scansiona asset, Censimento, Appuntamenti IT, Prestiti materiale, Eliminazioni;
  - *Persone* (IT), *Spazi e postazioni* (HR e IT);
  - *Calendario e prenotazioni* e *Comunicazione* (per tutti);
  - *Amministrazione*: Utenti e gruppi.
  
  I pulsanti del Workspace (Le mie task, Organico, Progetti…) aprono direttamente la sezione nella piattaforma.
- **Organico compilabile dall'HR**: con "Modifica dati" si inseriscono ruolo, studio, anni in Archea, compenso, scadenza del contratto e note. I dati si salvano su Supabase e li vedono **solo HR e super admin**: lo blocca il database, nemmeno un PM o un IT li legge.

## 2.6.0 — Più grande, popup delle notifiche, menu ordinati per ruolo

- **Testi più grandi sul computer**: i testi del Workspace sotto i 12 px ora sono 11–13 px (`assets/sizes.css`, generato da `tools/genera_sizes.py`).
- **Contrasti**: nel tema chiaro i testi grigi tenui sono scuriti fino a un contrasto 5:1 (`assets/contrast.css`). La voce selezionata della barra laterale ora ha il testo scuro (prima era bianco su grigio chiaro).
- **Popup delle notifiche**:
  - ogni notifica nuova compare in un riquadro in alto a destra; toccandolo si apre il ticket, la chat, il calendario o l'Off topic;
  - con "🔔 Attiva i popup sul computer e sul telefono" (nella campanella) arriva anche la notifica del sistema, con il sito aperto in un'altra scheda. Su iPhone solo con il sito aggiunto alla schermata Home.
  - Controllo ogni 15 secondi.
- **Menu del Service Desk a gruppi per ruolo**, tutte le voci visibili (prima quelle a destra restavano nascoste):
  - Utente: Ticket;
  - HR: Ticket, Persone, Spazi;
  - IT: Ticket, Asset, Persone e spazi, Amministrazione.
  
  Chat, Calendario, Foto e Off topic non si ripetono, perché sono già nel menu principale. Sul telefono il menu è un pulsante che si apre.
- **Project Manager**: i PM hanno la schermata "Project Manager" per creare i progetti e scegliere le persone del team. Le squadre sono condivise su Supabase.
- **Via i dati di esempio per gli account reali**:
  - pannello HR con numeri finti;
  - appuntamenti finti in "Oggi";
  - notifiche inventate nella campanella;
  - persone di esempio in Organico, che ora mostra l'anagrafica vera.
- La Pianificazione non nasconde più voci del menu agli account reali (all'HR spariva Task Manager).
- Crediti: Francesco Diamanti e Giuseppe Milano.

## 2.5.1 — Calendario a un tocco, tema scuro più leggibile

- **Calendario**: un clic su una casella vuota apre subito un nuovo appuntamento per quel giorno. Nelle viste Giorno e Settimana prende anche l'ora cliccata. Prima serviva il doppio clic.
- **Calendario sul telefono**: ogni giorno ha "+ Appuntamento", e i giorni liberi si toccano per aggiungere.
- **Tema scuro**: testi più chiari, sfondi più scuri e bordi più visibili. I testi bianchi su pulsanti colorati diventano scuri quando il pulsante si schiarisce.
- `supabase/setup.html` e `supabase/pulizia.html`: per copiare gli script SQL con un tocco, senza scaricare file.

## 2.5.0 — Progetti e task condivisi, ruolo PM

- **Progetti, task, ore e note del Workspace sono su Supabase** e condivisi tra tutti. Le schermate di Francesco (Oggi, Task Manager, Progetti, Ore, Note, Insight) restano le stesse.
- **Ruolo PM** (gruppo "Project Manager", permesso "gestione progetti"; il super admin ce l'ha sempre):
  - crea i progetti e le task e le assegna alle persone;
  - vede l'avanzamento di tutto il team e quello di ogni persona (filtro "Persona"), e valida le task.
- **Utente**:
  - vede solo le task assegnate a lui;
  - le aggiorna: completata, data di chiusura, commenti, immagini, link e dati della task;
  - registra le proprie ore;
  - può crearsi task personali.
  
  Titolo, assegnatari, progetto, date, priorità e validazione restano del PM: lo blocca il database.
- Le persone tra cui scegliere sono i colleghi veri (gli account del portale), non più quelle di esempio.
- Le modifiche degli altri arrivano da sole ogni 20 secondi e quando torni sulla pagina.
- Migrazione `20261107_progetti_task.sql` (tabella `ws_records`), inclusa in `SETUP_COMPLETO.sql`.

## 2.4.0 — Ruoli: chi fa cosa

- **Utente**: apre ticket e segue i suoi, vede le sue task (Oggi, Task Manager), più calendario, chat, foto e Off topic.
- **HR**: in più Organico, Persone, Movimenti (ingressi in studio, uscite, spostamenti) e Planimetrie.
- **IT**: in più coda ticket, censimento e dashboard; crea e gestisce utenti Utente e HR.
- **Super admin**: tutto, compresi tutti i moduli del Workspace, la Pianificazione e la console sviluppatore. È l'unico che può:
  - creare, modificare, disattivare o eliminare account IT;
  - dare il ruolo IT o super admin;
  - cambiare i gruppi che danno la gestione degli utenti.
- Utente, HR e IT vedono le stesse schermate: cambia solo il numero di pulsanti.
- Chi diventa IT entra da solo nel gruppo IT.
- Le regole sono nel database (`20261107_ruoli.sql`): un IT non le può aggirare nemmeno fuori dal sito.
- `SETUP_COMPLETO.sql` ora si rigenera con `tools/genera_setup.py`.

## 2.3.1 — Off topic: modifica

- **Modifica** dei propri argomenti (titolo, categoria, testo) e delle proprie risposte. Dopo la modifica, accanto all'ora compare "modificato".
- Solo l'autore può cambiare il testo. I moderatori continuano a mettere in evidenza, chiudere ed eliminare, ma non possono riscrivere le parole degli altri: lo blocca il database.
- Migrazione `20261107_offtopic_modifica.sql`, inclusa in `SETUP_COMPLETO.sql`.

## 2.3.0 — Tema scuro

- **Tema scuro** per tutta la piattaforma: Workspace, Service Desk, Pianificazione e login.
  - Si cambia con il pulsante ☀/☾ nell'intestazione, e nel login in basso a destra.
  - All'inizio segue l'impostazione del telefono o del computer.
  - La scelta vale insieme per Workspace e Service Desk e viene ricordata.
- `assets/dark.css` è generato da `tools/genera_dark.py`, che converte in versione scura tutti i colori dei CSS del Workspace (980 regole). Va rilanciato se cambiano quei CSS. I ritocchi a mano sono in `assets/dark-extra.css`.
- La barra laterale del computer, già scura, resta com'è; il logo diventa bianco.

## 2.2.0 — iPhone come lettore per il computer

- Nella scansione da computer c'è **📱 Usa l'iPhone come lettore**:
  - compare un QR, lo inquadri con la Fotocamera dell'iPhone e si apre il lettore sul telefono, con il tuo account;
  - ogni etichetta letta col telefono si apre da sola sul computer, in circa 1–2 secondi;
  - il telefono resta pronto per il codice successivo.
- La fotocamera chiede la risoluzione più alta disponibile, utile con le webcam dei computer.
- I link `?ticket=` e `?scan=` aprono sempre il Service Desk.
- Nuova migrazione `20261107_scan_telefono.sql` (tabella `scan_relay`: ognuno vede solo le proprie letture), inclusa in `SETUP_COMPLETO.sql`.

## 2.1.1 — Lettore codici: anche da computer

- Ogni immagine viene letta in tre modi a turno: riquadro centrale, riquadro ingrandito 2× (codici piccoli o lontani, tipici della webcam del Mac) e immagine intera, con contrasto aumentato.
- **Leggi da una foto**: scegli o scatti una foto dell'etichetta e il codice viene letto dalla foto, a piena risoluzione.
- **Lettore USB**: da computer il campo del codice è già attivo, quindi un lettore di codici a barre USB funziona da solo (scrive il codice e preme Invio).
- Sotto la fotocamera compare una riga di controllo: lettore usato, risoluzione e immagini analizzate.

## 2.1.0 — Moduli del Workspace di nuovo visibili, utenti dal sito, lettore codici

- **Moduli del Workspace di nuovo visibili** per gli account registrati: task, progetti, note, ore, contabilità, insight, Pianificazione, BIM, fornitori, materioteca, ARCHEAI e notifiche. Chi ha già un profilo nel Workspace (es. Francesco Diamanti) ritrova il suo menu completo. Le scritte "demo" sono diventate "dati di esempio" o "locale".
- **Utenti e gruppi funziona senza Edge Function**: basta `SETUP_COMPLETO.sql` (nuova funzione `admin_users`).
  - Elenco di **tutti gli account** che possono entrare.
  - Aggiungi con password, modifica nome, ruolo, gruppi e password, disattiva, elimina.
  - In "Persone" un avviso spiega la differenza tra anagrafica e account, con il pulsante per aggiungere un utente.
- **Lettore codici a barre nuovo** (ZXing in WebAssembly, file nel sito, nessuna CDN):
  - legge Code 128, Code 39, Code 93, EAN, UPC, ITF, Codabar, QR e DataMatrix anche su iPhone;
  - un codice ARCHEA (A1234) si apre al primo colpo;
  - fuoco continuo e pulsante luce dove il telefono li supporta.
  
  Prima su iPhone si usava Quagga, che spesso non riconosceva i codici.
- **`supabase/PULIZIA_DATI.sql`**: cancella le attività, e a scelta anagrafica e utenti, per ripartire da zero. Struttura, gruppi, sale e auto restano.

## 2.0.0 — Solo account registrati

- **Niente più demo**: si entra solo con un account ARCHEA registrato su Supabase. Gli account di prova e la password `demo` non funzionano più.
- **Login**:
  - senza "Account di prova" e senza la scritta "DEMO · LIVE";
  - il messaggio dice di chiedere un account al reparto IT;
  - il sito ricorda l'ultima email usata.
- **Si vedono solo le funzioni con dati veri**: Service Desk, Calendario comune, Chat, Foto cantiere, Off topic. Restano nascosti, finché non saranno collegati a Supabase:
  - i moduli del Workspace con dati finti (task, progetti, ore, contabilità, Property, Pianificazione, fornitori, materioteca…);
  - l'assistente ARCHEAI, che dava risposte preimpostate;
  - la campanella con notifiche inventate. Restano le notifiche vere del Service Desk.
- **Tolti**:
  - il backend finto del Service Desk (`demo-backend.js`);
  - i badge DEMO/LIVE;
  - la sezione "Origine dei dati" nelle impostazioni;
  - gli script dimostrativi `planning-suite.js` e `archea-update-0143.js`.
- All'apertura vengono cancellati dal browser i dati rimasti delle vecchie prove.

## 1.9.0 — Un solo accesso, una sola grafica

- **Un solo login**: aprendo l'indirizzo del Service Desk (`/servicedesk/`) si arriva alla piattaforma, con lo stesso accesso per tutti. I link `?ticket=` continuano ad aprire il ticket. Per i controlli tecnici resta `servicedesk/?standalone=1`.
- **Stessa grafica del Workspace** nel Service Desk:
  - fondo bianco e titoli pieni;
  - barra delle sezioni chiara, a pillole;
  - schede, pulsanti e campi arrotondati;
  - contatori grigi.
  
  Tra un ruolo e l'altro cambia solo il numero di pulsanti.
- **Telefono**: se un browser dentro un'app, o l'opzione "Richiedi sito desktop", disegna la pagina larga come un computer, la pagina torna alla larghezza dello schermo.

## 1.8.0 — Foto cantiere: elenco cantieri e GPS

- **Elenco cantieri** pronto da scegliere (`servicedesk/cantieri.js`): 7 commesse dimostrative con indirizzo e coordinate, da sostituire con quelle vere.
- **GPS**:
  - "📍 Trova il cantiere dove sono" sceglie da solo il cantiere in cui ti trovi e mostra la distanza;
  - se la posizione è già concessa, il cantiere viene proposto appena apri la pagina;
  - la posizione si salva sulle foto in automatico (si può togliere, e la scelta viene ricordata);
  - le foto con posizione hanno il segno 📍 e si aprono sulla mappa;
  - scegliendo un cantiere nell'archivio compaiono l'indirizzo e il link alla mappa.

## 1.7.2 — iPhone: pagina a larghezza schermo

- Su iPhone il riquadro del Service Desk poteva allargarsi fino al suo contenuto e far rimpicciolire tutta la pagina. Ora resta largo quanto lo schermo.
- Nessun elemento può più allargare la pagina oltre lo schermo.
- Cache aggiornata: il telefono scarica la versione nuova invece di quella salvata.

## 1.7.1 — Controllo completo

- Controllo automatico: 11 account, su computer e telefono, tutte le voci di menu e tutte le schermate del Service Desk.
- **Corretto**: con Reception e Responsabili di reparto (Interior, Concept, Visual) un errore nell'agenda di "Oggi" bloccava l'aggiornamento della pagina. L'errore era già nel Workspace originale (`archea-update-0143.js`).

## 1.7.0 — Foto cantiere, foto in Off topic, fotocamera sbloccata

- **Foto cantiere** (per tutti):
  - scegli o scrivi il cantiere o la commessa (il sito ricorda l'ultimo usato), una nota facoltativa e la posizione GPS se vuoi;
  - "Scatta foto" apre direttamente la fotocamera del telefono;
  - le foto vengono ridotte (circa 300–600 KB) e salvate nello **spazio privato "foto" di Supabase Storage**;
  - l'archivio si sfoglia per cantiere e per giorno, con foto a schermo intero, autore, ora, nota e posizione;
  - **senza rete** le foto restano in coda sul telefono e partono da sole appena torna la connessione.
- **Foto in Off topic**: fino a 6 foto per argomento o risposta.
- **Fotocamera sbloccata nella piattaforma**: il riquadro interno del Service Desk non aveva il permesso per fotocamera e posizione, quindi lo scanner delle etichette non poteva funzionare. Ora funziona.
- **Corretto**: `SETUP_COMPLETO.sql` rieseguito una seconda volta si bloccava sul permesso delle planimetrie. Ora è provato tre volte di fila senza errori.
- Migrazione `supabase/migrations/20261106_foto.sql` (bucket privato, regole di accesso, tabella `site_photos`).

## 1.6.0 — Icona "archea" e telefono più leggibile

- Nuova icona **archea**:
  - nelle schede del browser una "a" bianca su fondo scuro, leggibile anche a 16 px;
  - sulla schermata Home del telefono e nell'app installata la scritta "archea".
  - Al posto delle vecchie icone con la scritta ARCHEA, che a piccole dimensioni diventava illeggibile.
- Telefono:
  - il Service Desk occupa tutto lo schermo, senza riquadro e titoli doppi;
  - testi a 16–17 px e pulsanti più alti;
  - i campi sono a 16 px, così iOS non ingrandisce più la pagina quando li tocchi;
  - contatori compatti su tre colonne;
  - calendario, chat e Off topic più grandi;
  - le planimetrie partono ingrandite e si scorrono col dito.

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
