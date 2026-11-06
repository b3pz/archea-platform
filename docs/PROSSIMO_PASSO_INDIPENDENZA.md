# Prossimo passo: indipendenza da Supabase

Stato: **da fare prossimamente** (non ancora iniziato).

## Obiettivo
Nessun servizio esterno: database, login, foto e funzioni server girano su un PC dello studio.

## Piano
1. **Server**: mini-PC dello studio sempre acceso, Supabase self-hosted in Docker (software libero, stesse API di oggi).
2. **Sito**: servito dallo stesso PC al posto di GitHub Pages.
3. **Accesso da fuori**: VPN (Tailscale consigliato), che dà anche l'HTTPS necessario per la fotocamera e lo scanner.
4. **Dati**: export dal Supabase attuale (tabelle, utenti con password, bucket `foto`) e import sul server.
5. **Funzioni**: `admin-users` e notifiche Telegram spostate sul server (token solo sul server).
6. **Backup**: copia automatica ogni notte del database e delle foto.
7. **Codice**: cambia solo l'indirizzo in `config/platform.js`.

## Da decidere
- PC Windows o Linux.
- Dove tenere il backup (NAS, disco esterno, altra sede).
