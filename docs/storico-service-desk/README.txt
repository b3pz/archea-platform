ARCHEA SERVICE DESK V1.7
==========================

OBIETTIVO DI QUESTA BUILD
- Conserva la logica V1.6 che già funziona.
- Telegram viene usato SOLO alla nascita di un nuovo ticket.
- Nessun messaggio Telegram per commenti, appuntamenti, cambi stato o chiusure.
- Aggiunta gestione pensata per un reparto IT composto da più persone.

NOVITÀ IT
1. Colonna ASSEGNATO A molto visibile nella lista.
2. Colonna PRIORITÀ:
   - BASSA
   - NORMALE
   - ALTA
   - URGENTE
3. Data apertura visibile.
4. Stato visibile.
5. Categoria visibile.
6. Pulsante "PRENDI IN CARICO" se il ticket non è ancora assegnato.
   Al click:
   - assegna il ticket all'IT loggato;
   - passa automaticamente a IN LAVORAZIONE.
7. Dashboard:
   - Da prendere in carico
   - In lavorazione
   - Urgenti
   - Aperti totali

TELEGRAM
Telegram manda UN SOLO messaggio quando il ticket viene creato.

Per ogni nuovo ticket:
NUOVO TICKET -> Telegram -> poi tutta la gestione resta nel portale.

Non vengono inviati Telegram per:
- commenti
- note interne
- appuntamenti
- conferme appuntamento
- cambio stato
- checklist
- chiusura

PASSO 1 - DATABASE
Supabase > SQL Editor > New query
Eseguire:
migration_v1_7_priority.sql

PASSO 2 - EDGE FUNCTION TELEGRAM
La cartella pronta è:
supabase/functions/telegram-new-ticket/index.ts

La Edge Function deve chiamarsi:
telegram-new-ticket

Impostare nei Secrets della funzione:
TELEGRAM_BOT_TOKEN = token del bot Archea Service Desk
ARCHEA_TELEGRAM_CHAT_ID = -5391368217

NON mettere mai il token Telegram in app.js o GitHub.

PASSO 3 - FRONTEND
Su GitHub sostituire:
- index.html
- styles.css
- app.js
- logo_archea.png (può restare quello già presente)

Fare Commit changes e poi CTRL+F5.

TEST
1. Rider apre un ticket.
2. Nel gruppo Telegram deve arrivare UN SOLO messaggio.
3. Giuseppe apre il portale IT.
4. Il ticket appare "NON ASSEGNATO".
5. Giuseppe clicca "Prendi in carico".
6. Diventa:
   Assegnato a = Giuseppe
   Stato = IN LAVORAZIONE
7. Nessun altro messaggio deve arrivare su Telegram.
8. Commenti e appuntamenti continuano a generare soltanto notifiche interne.
