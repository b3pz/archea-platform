ARCHEA SERVICE DESK V4.0
========================

NOVITÀ HR
- Ruolo HR.
- HR mantiene tutte le funzioni USER:
  * Apri ticket normale
  * I miei ticket
  * Commenti
  * Appuntamenti
- In più vede:
  * Nuovo movimento
  * Storico movimenti
  * Statistiche HR

MOVIMENTI SUPPORTATI
- NUOVO INGRESSO
- USCITA
- CAMBIO POSTAZIONE
- CAMBIO SEDE

FLUSSO
1. HR compila il movimento.
2. Viene creato automaticamente un ticket Movimento persona.
3. Il ticket usa numerazione MOV-AAAA-xxxxx.
4. Il movimento viene salvato nello storico HR.
5. Telegram riceve SOLO il nuovo ticket, come per gli altri ticket.
6. IT lavora il ticket nel Service Desk.
7. IT può marcare il movimento HR come VERIFICATO.

ANTI-DUPLICATI
- Con email aziendale: il portale cerca movimenti precedenti della stessa persona.
- Nuovo ingresso già presente -> blocco.
- Uscita già presente -> blocco.
- Cambio sede/postazione identico nella stessa data -> blocco.
- Senza email usa nome + cognome come controllo prudenziale.
- I casi non chiarissimi restano DA VERIFICARE.

IMPORTANTE
In V4 NON viene ancora modificato direttamente HR_Collaboratori.xlsx.
Il collegamento al file reale verrà aggiunto dopo, con logica idempotente e controlli più forti.

STATISTICHE
- ingressi
- uscite
- spostamenti
- da verificare
- riepilogo per mese
- riepilogo per sede

INSTALLAZIONE
1. Supabase -> SQL Editor -> New query
2. Eseguire migration_v4_0.sql UNA SOLA VOLTA
3. La migration imposta hr@archea.it come ruolo HR
4. GitHub: sostituire
   - index.html
   - styles.css
   - app.js
   - logo_archea.png
5. NON toccare Telegram / Secrets
6. Commit
7. Cmd + Shift + R

TEST
A. Login hr@archea.it
B. Deve vedere:
   - Apri ticket
   - I miei ticket
   - Nuovo movimento
   - Storico movimenti
   - Statistiche HR
C. NON deve vedere Dashboard IT / Prenotazioni / Censimento.
D. HR apre un normale ticket IT per sé.
E. HR crea un NUOVO INGRESSO.
F. SUPER_IT vede il ticket MOV.
G. IT apre Storico movimenti e imposta VERIFICATO.
