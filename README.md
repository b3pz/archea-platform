# ARCHEA Platform

Un'unica web app per lo studio ARCHEA che unisce:

- **ARCHEA Workspace** (di Francesco Diamanti): interfaccia, navigazione desktop/mobile, task, progetti, ore, cantiere, contabilità, Property, agenda, prenotazioni, materioteca, planning.
- **ARCHEA Service Desk IT** (del Dipartimento IT): ticket, asset e censimento, persone e movimenti HR, mappa postazioni, prenotazioni materiale IT. Backend reale su **Supabase**.

Il Service Desk è una sezione del Workspace ("Service Desk IT") e usa lo **stesso login**.

## Come si entra

Solo con un **account ARCHEA registrato** (email e password su Supabase). Non esistono account di prova: chi non ha un account lo chiede al reparto IT, che lo crea da **Service Desk → Utenti e gruppi**.

Dopo l'accesso si vedono tutti i moduli del Workspace (task, progetti, ore, contabilità, Pianificazione…) più le funzioni su Supabase: Service Desk, Calendario comune, Chat, Foto cantiere e Off topic. Chi ha già un profilo nel Workspace (es. Francesco) tiene il suo menu.

### Ruoli

`profiles.ruolo` su Supabase decide cosa si vede. Ogni ruolo ha tutto quello del ruolo sopra, più qualcosa:

| Ruolo | Cosa fa |
|---|---|
| `USER` | Apre ticket e segue i suoi; vede le sue task (Oggi, Task Manager); calendario, chat, foto, Off topic |
| `HR` | + Organico, Persone, Movimenti (ingressi in studio, uscite, spostamenti), Planimetrie |
| `IT` | + Coda ticket, Censimento, Dashboard; crea e gestisce utenti **Utente** e **HR** |
| `SUPER_IT` (super admin) | Tutto: tutti i moduli del Workspace, Pianificazione, console sviluppatore; è l'unico che crea o modifica account **IT**, assegna i ruoli IT e super admin e cambia i gruppi che gestiscono gli utenti |

Le regole sono nel database (`20261107_ruoli.sql`), non solo nei pulsanti.

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
- I moduli del Workspace (task, progetti, ore, contabilità, Pianificazione…) salvano ancora **nel browser** di chi li usa, non su Supabase: due colleghi non vedono le stesse task. Il passo successivo è spostarli su tabelle Supabase.

## Ripartire da zero con i dati

`supabase/PULIZIA_DATI.sql`: scegli cosa cancellare (attività, anagrafica, utenti) e lo esegui nel SQL Editor. Fai prima un backup.
