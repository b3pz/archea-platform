ARCHEA SERVICE DESK V1.7.1 - JWT HOTFIX

COSA CAMBIA
- Refresh automatico della sessione Supabase.
- Se una richiesta riceve JWT expired / 401:
  1. rinnova il token con il refresh_token;
  2. salva la nuova sessione;
  3. ripete automaticamente la richiesta una volta.
- Refresh preventivo ogni 10 minuti mentre il portale resta aperto.
- Se il refresh non è più possibile, torna al login con un messaggio chiaro.

TICKET NON PERSI
- Categoria, oggetto e descrizione vengono salvati automaticamente nel browser.
- Se l'utente deve rifare login, il ticket in compilazione resta salvato.
- Il draft viene cancellato solo dopo la creazione riuscita del ticket.

TELEGRAM
- Nessuna modifica.
- Rimane SOLO sul nuovo ticket.
- Se Telegram ora funziona, NON modificare Edge Function o Secrets.

AGGIORNAMENTO
Su GitHub basta sostituire:
- app.js

Non serve:
- nuova migration SQL
- cambiare index.html
- cambiare styles.css
- toccare Telegram

TEST
1. Aggiorna app.js su GitHub.
2. Commit.
3. Cmd+Shift+R.
4. Accedi come Rider.
5. Scrivi un ticket.
6. Invia.
7. Deve funzionare senza JWT expired.
