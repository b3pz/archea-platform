ARCHEA SERVICE DESK V5.5 — MOVIMENTI HR OPERATIVI
===================================================

NOVITÀ
- Nuovo ingresso
- Uscita
- Cambio postazione
- Cambio sede

FORM DINAMICO
Il modulo mostra solo i campi pertinenti al tipo di movimento.

CONTROLLI
- Email @archea.it se presente
- Controllo duplicato stesso movimento / stessa data
- Stato precedente della persona derivato dallo storico:
  ATTIVO / USCITO / SCONOSCIUTO
- Blocca un secondo ingresso se la persona risulta già attiva
- Blocca una seconda uscita se risulta già uscita
- Blocca spostamenti se la persona risulta uscita
- Un vecchio ingresso seguito da uscita NON blocca un futuro rientro
- Se lo storico precedente non esiste, il movimento può essere creato
  ma viene marcato per controllo manuale

CHECKLIST IT AUTOMATICA
Ogni tipo di movimento genera una checklist dedicata.
Per USCITA / CAMBIO SEDE / CAMBIO POSTAZIONE la checklist individua anche
gli asset attualmente assegnati alla persona nel censimento.

IMPORTANTE
Gli asset NON vengono modificati automaticamente.
Il sistema crea le attività di controllo per IT: nessun dato hardware viene
spostato o liberato senza verifica umana.

TELEGRAM
Rimane la logica esistente: Telegram viene usato soltanto per la nascita del
nuovo ticket Movimento Persona.

INSTALLAZIONE
1. Supabase > SQL Editor
   eseguire migration_v5_5_movimenti.sql

2. GitHub
   sostituire:
   - app.js
   - styles.css
   - index.html (può essere sostituito, è incluso per mantenere il pacchetto completo)

3. Nessuna Edge Function da modificare.
4. Non toccare telegram-new-ticket.
5. Hard refresh del browser.

NOTA EXCEL HR
Questa release rende operativo il flusso HR nel Service Desk.
La scrittura fisica nel file Excel HR/OneDrive NON è inclusa: richiede
il mapping esatto del file HR e l'integrazione OneDrive/Microsoft Graph.
