Warning: truncated output (original token count: 7288)
Total output lines: 362

# Changelog

## 3.4.0 — Task e ore collegate a identità e progetti

- **Task Manager**: gruppi PM e vice possono vedere e gestire le task nei soli progetti assegnati; PM nomina e rimuove vice nella squadra del singolo progetto. I vice non possono modificare la squadra o nominare altri vice.
- **Permessi PM**: rimosso l'accesso alle Note dal menu e dalle policy del database.
- **Identità e ore**: task e registrazioni ore fanno riferimento agli UUID degli account; il database verifica appartenenza alla squadra, progetto esistente, date, stato della task e quantità ore.
- **Salvataggi**: modifiche a una raccolta vengono applicate in una singola transazione; le revisioni rifiutano sovrascritture concorrenti e l'errore indica che l'utente deve reinserire la modifica.
- **Notifiche task**: assegnazioni, proposte, completamenti, correzioni e validazioni generano notifiche persistenti e push tramite la funzione già presente, senza un nuovo provider a pagamento.
- Gli UUID sono generati quando si crea un account; il modello usa chiavi indicizzate e non prealloca account segnaposto per raggiungere 300 persone.

## 3.3.0 — Gruppi operativi, BIM, inventario licenze e uscite verificabili

- **Ruoli e gruppi**: `USER` è il ruolo base; `SUPER_IT` amministra la piattaforma e non eredita i permessi IT/HR/PM. IT, HR, PM e BIM sono gruppi cumulabili; solo Super IT assegna i gruppi con pe…6588 tokens truncated… reale viene ripristinata alla riapertura e rinnovata se scaduta.
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
