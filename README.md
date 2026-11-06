# ARCHEA Platform

Un'unica web app per lo studio ARCHEA che unisce:

- **ARCHEA Workspace** (di Francesco Diamanti): interfaccia, navigazione desktop/mobile, task, progetti, ore, cantiere, contabilità, Property, agenda, prenotazioni, materioteca, planning.
- **ARCHEA Service Desk IT** (del Dipartimento IT): ticket, asset e censimento, persone e movimenti HR, mappa postazioni, prenotazioni materiale IT. Backend reale su **Supabase**.

Il Service Desk è una sezione del Workspace ("Service Desk IT") e usa lo **stesso login**.

## Come si entra

| Account | Cosa succede |
|---|---|
| **Account ARCHEA reale** (email + password Supabase) | Login vero. Il Service Desk lavora sui **dati reali** (badge verde LIVE). Gli altri moduli del Workspace restano dimostrativi. |
| **Account di prova** (password `demo`) | Tutto con dati finti. Il Service Desk usa un backend simulato salvato solo nel browser (badge arancione DEMO). |

Account di prova utili per la presentazione:

| Email | Profilo | Nel Service Desk |
|---|---|---|
| `it@archea.it` | Reparto IT (nuovo) | SUPER_IT: dashboard, coda, censimento, mappa, persone |
| `elisabetta.pietrelli@archea.it` | HR Manager | HR: persone, movimenti, statistiche |
| `lisandro.leyra@archea.it` | Architect | Utente: apre ticket e vede i suoi |
| `francesco.diamanti@archea.it` | Partner / Platform owner | SUPER_IT |

Il database demo è **condiviso tra gli account di prova** nello stesso browser: un ticket aperto da Lisandro compare poi nella coda del Reparto IT. Per azzerarlo: console del browser → `localStorage.removeItem('archea_sd_demo_db_v1')`.

### Mappa ruoli (login reale)

`profiles.ruolo` su Supabase decide il profilo nel Workspace:

| Ruolo Supabase | Profilo Workspace |
|---|---|
| `IT`, `SUPER_IT` | Reparto IT (menu centrato sul Service Desk) |
| `HR` | HR Manager |
| `USER` | Architect, oppure il profilo dell'account demo con la stessa email |

## Attivare chat e calendario (una volta sola)

Supabase → **SQL Editor** → New query. Incolla ed esegui (**Run**), in quest'ordine:
1. `supabase/migrations/20261106_chat.sql`
2. `supabase/migrations/20261106_calendario.sql`

Sale e auto si modificano da Supabase → Table Editor → `calendar_resources`.

## Aggiungere un collega reale

1. Supabase → **Authentication** → **Users** → **Add user** → *Create new user*: email, password, spunta **Auto Confirm User**.
2. SQL Editor: incolla `supabase/crea_utente.sql`, cambia email/nome/ruolo, **Run**.

## Struttura

```
index.html              Workspace (pagina principale)
config/platform.js      UNICO punto di configurazione Supabase + login condiviso
assets/workspace.js     Workspace compilato (0.14.5 + integrazione piattaforma)
assets/workspace.css
assets/platform.css     stile della sezione Service Desk dentro il Workspace
assets/planning-suite.* modulo Pianificazione
assets/archea-update-*  aggiornamenti 0.14.x del Workspace
servicedesk/            Service Desk IT (v9.0)
  app.js                applicazione
  demo-backend.js       backend finto per la modalità demo
  embed.css             aspetto quando è aperto dentro il Workspace
supabase/               schema, policy e Edge Functions (da completare, vedi sotto)
docs/                   changelog e storico delle versioni precedenti
sw.js, manifest.webmanifest, icons/
```

Il Service Desk funziona anche da solo su `/servicedesk/` con il suo login storico.

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
- I moduli del Workspace (task, progetti, ore, contabilità…) usano ancora dati dimostrativi o Excel locale. Il passo successivo è spostarli su tabelle Supabase.
- Ci sono due "Prenotazioni": quelle del Workspace (sale, auto, materiali) e quelle IT del Service Desk (materiale legato ai ticket). Da unificare.
- Il modulo Pianificazione ha propri profili demo, separati dal login.
