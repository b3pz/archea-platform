ARCHEA SERVICE DESK V5.0
========================

NOVITÀ PRINCIPALE
CENSIMENTO IT integrato nel Service Desk.

ACCESSO
- USER: NO
- HR: NO
- IT: SÌ
- SUPER_IT: SÌ
- Importazione Excel: solo SUPER_IT

FUNZIONI CENSIMENTO
- Ricerca per codice, seriale, modello, utente.
- Filtri per sede, stato e verifica.
- Scheda asset completa:
  * codice
  * categoria
  * marca
  * modello
  * seriale
  * sede
  * posizione
  * utente assegnato
  * account associato (solo identificativo)
  * SSD/HDD
  * GPU
  * RAM
  * CPU
  * note
- Stato asset:
  DISPONIBILE
  ASSEGNATO
  PRENOTATO
  IN PRESTITO
  IN MANUTENZIONE
  GUASTO
  DISMESSO
  VENDUTO
  DA VERIFICARE
- Stato verifica:
  VERIFICATO
  DA VERIFICARE
  DUBBIO
  NON TROVATO
  ASSEGNAZIONE DA CONFERMARE
- Pulsante "Verifica ora".
- Registra chi e quando ha verificato.
- Storico delle modifiche principali.

IMPORTAZIONE DEL CENSIMENTO ESISTENTE
È inclusa una Edge Function:
supabase/functions/import-censimento/index.ts

La funzione:
- accetta il file Excel .xlsx direttamente dal portale;
- legge tutti i fogli;
- cerca colonne come codice, categoria, marca, modello, seriale, sede,
  posizione, utente, nome vecchio, SSD/HDD, GPU, RAM, CPU, NOTE;
- importa SOLO righe con codice asset;
- non crea duplicati per codice asset;
- un asset già VERIFICATO nel portale NON viene sovrascritto;
- tutti i dati legacy sono marcati da verificare;
- conserva foglio e riga di origine;
- NON importa password, password Apple/Google, PIN o PUK;
- il file Excel non viene archiviato.

COLLEGAMENTO PRENOTAZIONI
In Prenotazioni:
- l'IT sceglie l'asset preciso dal censimento;
- codice, modello e seriale vengono compilati automaticamente;
- CONFERMATA / PRONTA -> asset PRENOTATO;
- CONSEGNATA -> asset IN PRESTITO;
- RESTITUITA + OK -> asset DISPONIBILE;
- RESTITUITA con problemi -> DA VERIFICARE o GUASTO;
- lo storico asset registra il cambio.

INSTALLAZIONE
1. Supabase -> SQL Editor -> New query
2. Eseguire migration_v5_0.sql UNA SOLA VOLTA.

3. GitHub: caricare direttamente i file V5:
   - index.html
   - styles.css
   - app.js
   - logo_archea.png

4. Per abilitare IMPORT EXCEL:
   Supabase -> Edge Functions -> crea funzione:
   import-censimento

   Copia il contenuto di:
   supabase/functions/import-censimento/index.ts

   e fai Deploy.

   NON servono nuovi Secrets:
   usa quelli standard SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.

5. NON modificare telegram-new-ticket.
6. Commit GitHub.
7. Cmd + Shift + R.

TEST CONSIGLIATO
A. Login IT -> Censimento -> Nuovo asset.
B. Cerca l'asset e usa "Verifica ora".
C. Controlla lo storico.
D. Login SUPER_IT -> Importa censimento Excel -> scegli il file attuale.
E. Verifica che gli asset importati siano DA VERIFICARE.
F. Apri Prenotazione materiale -> assegna un asset censito.
G. Stato CONSEGNATA -> controlla nel Censimento che sia IN PRESTITO.
H. Stato RESTITUITA + OK -> deve tornare DISPONIBILE.

NOTA SICUREZZA
Non inserire password nel Censimento.
Il portale conserva solo eventuali identificativi account associati.
