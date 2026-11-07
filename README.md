# ARCHEA Platform

Un'unica web app per lo studio ARCHEA che unisce:

- **ARCHEA Workspace** (di Francesco Diamanti): interfaccia, navigazione desktop/mobile, task, progetti, ore, cantiere, contabilità, Property, agenda, prenotazioni, materioteca, planning.
- **ARCHEA Service Desk IT** (del Dipartimento IT): ticket, asset e censimento, persone e movimenti HR, mappa postazioni, prenotazioni materiale IT. Backend reale su **Supabase**.

Il Service Desk è una sezione del Workspace ("Service Desk IT") e usa lo **stesso login**.

## Come si entra

Solo con un **account ARCHEA registrato** (email e password su Supabase). Non esistono account di prova: chi non ha un account lo chiede al reparto IT, che lo crea da **Service Desk → Utenti e gruppi**.

Dopo l'accesso il menu operativo deriva dai gruppi assegnati all'account. I dati Workspace sono caricati da Supabase; i progetti e le task demo non vengono usati come dati reali.

### Ruoli

`profiles.ruolo` distingue solo account ordinari e amministrazione tecnica. Le funzioni operative si sommano tramite gruppi; un account può essere, ad esempio, IT+PM o HR+PM. Ogni persona usa l'UUID stabile del proprio account Supabase, generato quando l'account viene creato: non occorre preparare ID vuoti in anticipo, e il modello è progettato per almeno 300 account.

| Ruolo | Cosa fa |
|---|---|
| `USER` | Accesso base; vede e aggiorna le task a lui assegnate e registra le proprie ore sui progetti di cui è membro |
| Gruppo `IT` | Assistenza, ticket, asset e amministrazione utenti ordinari secondo i permessi assegnati |
| Gruppo `HR` | Persone, ingressi/uscite, movimenti e planimetrie |
| Gruppo `PM` | Progetti, task e ore dei soli progetti della propria squadra; può nominare vice PM per singolo progetto |
| Gruppo `BIM` | Creato senza permessi applicativi finché non vengono definiti |
| `SUPER_IT` | Amministrazione tecnica; non eredita automaticamente le funzioni operative. Solo Super IT assegna gruppi privilegiati e nomina altri Super IT |

Le regole sono nel database, non solo nei pulsanti. Il vice PM può gestire task e ore del progetto delegato, ma non cambiare la squadra né nominare altri vice.

Task e ore sono salvate su Supabase (`ws_records`, `assets/ws-cloud.js`). Il server verifica ID assegnatario, appartenenza al progetto, date, stato e ore; i salvataggi di una raccolta sono atomici e usano revisioni per rilevare modifiche concorrenti. I PM e i vice non accedono alle Note.

## Attivare le funzioni nuove (una volta sola)

1. Supabase → **SQL Editor** → New query → incolla **tutto** `supabase/SETUP_COMPLETO.sql` → **Run**. Crea chat, calendario, Off topic, sondaggi, gruppi e permessi. Si può rieseguire senza danni.
2. *(Facoltativo)* Edge Function `admin-users`: serve solo per invitare via email. Aggiungere, modificare, disattivare ed eliminare utenti funziona già con lo script del punto 1.

Da quel momento utenti, ruoli e gruppi si gestiscono da **Service Desk → Utenti e gruppi**. Sale e auto si gestiscono da **Calendario → Sale e auto**.

## Aggiungere un collega reale (metodo manuale, se la funzione non è pubblicata)

1. Supabase → **Authentication** → **Users** → **Add user** → *Create new user*: email, password, spunta **Auto Confirm User**.
2. SQL Editor: incolla `supabase/crea_utente.sql`, cambia email/nome/ruolo, **Run**.

## Struttura

```
index.html              Workspace (pagina principale)
config/platform.js      UNICO punto di configurazione Supabase + login condiviso
assets/workspace.js     Workspace compilato (0.14.5 + integrazione piattaforma)
assets/workspace.css
assets/platform.css     stile della sezione Service Desk dentro il Workspace
assets/archea-update-*.css  stili 0.14.x del Workspace
servicedesk/            Service Desk IT (v9.0)
  app.js                applicazione
  cantieri.js           elenco cantieri per le foto (nomi, indirizzi, GPS)
  embed.css             aspetto quando è aperto dentro il Workspace
supabase/               schema, policy e Edge Functions (da completare, vedi sotto)
docs/                   changelog e storico delle versioni precedenti
sw.js, manifest.webmanifest, icons/
```

L'indirizzo `/servicedesk/` porta alla piattaforma: il login è uno solo.

## Pubblicazione (GitHub Pages)

1. Repository → **Settings** → **Pages**.
2. *Source*: **Deploy from a branch** → branch `main`, cartella `/ (root)` → **Save**.
3. Dopo 1–2 minuti l'app è su `https://b3pz.github.io/archea-platform/`.
4. Su iPhone: Safari → Condividi → **Aggiungi alla schermata Home**.

Con un piano GitHub gratuito Pages funziona solo se la repository è pubblica.

## Prima di usarla con dati reali

1. **Policy RLS su Supabase.** I controlli dei ruoli nel browser servono solo all'interfaccia: la protezione vera sono le policy RLS. Esegui `supabase/verifica_rls.sql` nel SQL Editor e controlla il risultato (vedi `supabase/README.md`).
2. **Versionare il backend.** Le migrazioni SQL e le Edge Functions (`import-hr`, `import-censimento`, `telegram-new-ticket`) non sono mai state in una repository: vanno copiate in `supabase/`.
3. **Telegram.** Il token del bot resta solo nei Secrets della Edge Function, mai nel codice.

## Limiti noti (onesti)

- Il codice del Workspace è il **bundle compilato** della 0.14.5, modificato direttamente (come già si faceva). I sorgenti React nella repo di Francesco sono fermi alla 0.4/0.5 e non corrispondono più. Ricostruire i sorgenti è il primo lavoro dopo la presentazione.
- Task, progetti, ore e note sono condivisi su Supabase. Gli altri moduli del Workspace (contabilità, Pianificazione, fornitori, materioteca…) salvano ancora **nel browser** di chi li usa.

## Ripartire da zero con i dati

`supabase/PULIZIA_DATI.sql`: scegli cosa cancellare (attività, anagrafica, utenti) e lo esegui nel SQL Editor. Fai prima un backup.
