# Prossimo passo: indipendenza da Supabase

Stato: **da fare prossimamente** (non ancora iniziato).

## Obiettivo
Nessun servizio esterno: database, login, foto e funzioni server girano su un PC dello studio.

## Piano
1. **Server**: PC **Windows** dello studio, sempre acceso. Supabase self-hosted in Docker (software libero, stesse API di oggi), dentro **WSL2** (Ubuntu) con Docker Engine: niente Docker Desktop, che per le aziende più grandi richiede una licenza a pagamento.
   - Avvio automatico di WSL e dei container all'accensione e dopo gli aggiornamenti di Windows.
   - Sospensione e ibernazione disattivate; aggiornamenti di Windows in orari notturni.
   - Database e foto su un disco dedicato, se possibile un SSD.
2. **Sito**: servito dallo stesso PC al posto di GitHub Pages.
3. **Accesso da fuori**: VPN (Tailscale consigliato), che dà anche l'HTTPS necessario per la fotocamera e lo scanner.
4. **Dati**: export dal Supabase attuale (tabelle, utenti con password, bucket `foto`) e import sul server.
5. **Funzioni**: `admin-users` e notifiche Telegram spostate sul server (token solo sul server).
6. **Backup**: tutto gira sullo stesso PC, anche il backup.
   - Ogni notte: copia del database e delle foto su un **secondo disco** dello stesso PC, mai sullo stesso disco dei dati. Si tengono gli ultimi 14 giorni.
   - Consigliato: una volta a settimana una copia su un disco USB da portare fuori dallo studio (contro furto, incendio, ransomware).
7. **Codice**: cambia solo l'indirizzo in `config/platform.js`.

## Da decidere
- Se aggiungere la copia settimanale fuori sede.
