# ARCHEA Platform · Regole per chi scrive codice (persone e intelligenze artificiali)

Questo file vale per **chiunque** modifichi il progetto: sviluppatori, Claude, ChatGPT, Copilot, Gemini o altre AI.
Le regole sono **obbligatorie**. Se una richiesta le contraddice, si chiede prima a Giuseppe Milano (IT Archea).
Autori del progetto: **Francesco Diamanti** (Workspace) e **Giuseppe Milano** (Service Desk, piattaforma, backend).

---

## 1. Com'è fatto il progetto

| Cartella | Cosa contiene | Regola |
| --- | --- | --- |
| `app/` | **Nuova versione** in React 18 + TypeScript + Vite, pubblicata in `v2/` | **Tutte le funzioni nuove si scrivono qui.** |
| `servicedesk/` | Service Desk attuale, JavaScript senza framework | Solo correzioni e piccoli ritocchi finché non è sostituito. Niente moduli nuovi grandi. |
| `assets/workspace.js` | Workspace di Francesco **compilato** (il sorgente aggiornato non esiste) | Non si estende. Solo patch minime, ognuna con un commento `// ARCHEA:` che spiega perché. |
| `assets/sd-shell.js`, `assets/ws-cloud.js`, `config/` | Collegamenti tra Workspace, Service Desk e Supabase | Modifiche piccole e commentate. |
| `supabase/migrations/` | Struttura del database, una migrazione per file | Vedi §4. |
| `supabase/functions/` | Edge Function (codice sul server) | Le chiavi segrete solo qui, mai nel sito. |
| `tools/` | Script che generano file (`genera_setup.py`, `genera_dark.py`, `genera_sizes.py`) | I file generati non si modificano a mano. |
| `docs/` | Documentazione | Da aggiornare quando cambia il funzionamento. |

Il database è **Supabase** (PostgreSQL + Auth + Storage + Edge Functions). In futuro andrà su un server dello studio (WSL2 + Docker + Tailscale, vedi `docs/PROSSIMO_PASSO_INDIPENDENZA.md`): **non usare servizi esterni nuovi** che renderebbero più difficile il trasloco.

## 2. Framework e librerie (decisioni prese, non si cambiano senza accordo)

- **React 18 + TypeScript in modalità `strict` + Vite.** Niente Angular, Vue, Svelte, jQuery, Next.js.
- **React Router** con `HashRouter` (GitHub Pages non gestisce le rotte del server).
- **TanStack Query** per tutti i dati che arrivano dal database (memoria, ricarica, stato di caricamento).
- **`@supabase/supabase-js`**, con **un solo client** in `app/src/lib/supabase.ts`. Mai `fetch` diretto verso Supabase fuori da `src/lib/`.
- **CSS semplice con variabili** in `app/src/styles.css` (tema chiaro e scuro cambiano solo le variabili). Niente Tailwind, Bootstrap o librerie di componenti.
- **Vitest** per i test. Il browser di prova è Playwright, già installato: **non eseguire `playwright install`**.
- Una libreria nuova si aggiunge solo se risparmia molto lavoro, con versione esatta in `package.json`, e va scritta nel CHANGELOG.

## 3. Come si scrive il codice

- **Lingua**: testi a schermo, commenti, messaggi di errore e commit in **italiano**, semplice e chiaro. Nomi di variabili e funzioni in italiano o inglese, ma coerenti dentro lo stesso file.
- **TypeScript**: niente `any`. Ogni tabella del database ha il suo tipo in `src/lib/`.
- **Struttura di `app/src/`**:
  - `lib/`: dati e logica senza React (accesso al database, regole, calcoli). Funzioni pure dove possibile, e quindi testate.
  - `components/`: pezzi riusabili (un componente per file, nome con la maiuscola).
  - `pages/`: una pagina per file.
  - `App.tsx`: solo le rotte.
- **Ruoli e permessi**:
  - il menu e la prima pagina di ogni ruolo stanno **solo** in `src/lib/roles.ts`;
  - nessun componente decide da solo chi vede cosa;
  - lo schermo nasconde, ma **è il database che vieta** (§4).
- **Interfaccia** (decisioni di Giuseppe):
  - ogni ruolo entra nella **sua** pagina: IT → Dashboard, HR → Statistiche HR, PM → Il lavoro di oggi, utente → le sue richieste;
  - le funzioni del Service Desk stanno nella **barra in alto**, raggruppate (Ticket, Asset, Persone e spazi, Amministrazione);
  - tutto il resto sta nel **menu a sinistra**, raggruppato per tipo, con tutte le voci visibili (niente «Altro» che nasconde);
  - chat, calendario, Off topic e foto cantiere si aprono a schermo libero, senza barra sopra;
  - **niente pagina a cartelle** all'inizio.
- **Accessibilità e telefono**:
  - ogni campo ha la sua etichetta e i testi sono grandi;
  - sul telefono i campi hanno almeno 16 px, altrimenti iPhone ingrandisce la pagina;
  - contrasto almeno 4,5:1, anche nel tema scuro;
  - ogni pagina ha la **favicon**.
- **Errori**: sempre un messaggio in italiano che dice cosa fare. Mai una schermata bianca.
- **Niente dati dimostrativi** negli account veri. La parte di Francesco non va nascosta, perché è la parte fondamentale.
- **Commenti**: spiegano il *perché*, non il *cosa*. In cima a ogni file una riga che dice a cosa serve.

## 4. Database: regole severe

1. **Ogni modifica è una migrazione nuova**: `supabase/migrations/AAAAMMGG_nome.sql`. Non si riscrivono le migrazioni già pubblicate, salvo per correggere un errore.
2. **Ogni migrazione si può rieseguire senza danni**: `create table if not exists`, `add column if not exists`, `create or replace function`, `drop policy if exists` prima di `create policy`.
3. **Ogni tabella nuova ha `enable row level security` e le sue regole (policy)**. Nessuna tabella senza RLS.
4. Le regole usano le funzioni già pronte:
   - `has_perm('…')`;
   - `is_it_role()`;
   - `ws_is_hr()`;
   - `ws_is_pm()`;
   - `chat_is_member(id)`.
   
   Le funzioni nuove sono `security definer set search_path = public`, con `revoke … from public, anon` e `grant … to authenticated`.
5. Dentro una policy **non** si fa una sottoquery sulla stessa tabella con nomi di colonna ambigui: si usa una funzione `security definer`. Esempio: `chat_is_project()`.
6. Dopo una migrazione nuova:
   - si aggiunge il nome in `tools/genera_setup.py` (lista `ORDER`);
   - si lancia `python3 tools/genera_setup.py`;
   - si prova `supabase/SETUP_COMPLETO.sql` **due volte di seguito** su un PostgreSQL locale;
   - si prova la regola (policy) con almeno un utente che **può** e uno che **non può**.
7. Ruoli: `USER` (base) e `SUPER_IT` (amministrazione tecnica). Le funzioni operative sono cumulative tramite gruppi: `IT`, `HR`, `PM` e `BIM`; un utente può appartenere a più gruppi. Super IT non eredita permessi operativi. Permessi dei gruppi:
   - `gestione_utenti`;
   - `gestione_it`;
   - `gestione_hr`;
   - `moderazione_offtopic`;
   - `gestione_calendario`;
   - `gestione_mappe`;
   - `gestione_progetti` (= PM). BIM resta senza permessi applicativi finché non sono definiti.
   
   Il vincolo `access_groups_permessi_validi` deve elencarli **tutti** in ogni migrazione che lo ricrea.
8. Ogni modifica importante lascia traccia: chi (`created_by` / `updated_by` + nome) e quando. Esempi: movimenti, fornitori, task.

## 5. Sicurezza e privacy (mai derogabili)

- **Mai** nel codice del sito:
  - la chiave `service_role`;
  - il token di Telegram;
  - le chiavi VAPID private;
  - password.
  
  Nel sito va solo la chiave *publishable*, in `config/platform.js` e `app/src/lib/supabase.ts`. Le chiavi segrete stanno nelle Edge Functions o in tabelle senza accesso dal sito (come `push_config`).
- **Mai** salvare chiavi di licenza software (`person_software.riferimento` è solo un numero di contratto o ordine).
- Contratti e compensi dell'Organico: li vedono solo **HR** e **Super admin**.
- Note interne IT sui ticket: solo IT.
- Uno spostamento sulla planimetria richiede **due conferme**, poi la scrittura nel database e la **verifica rileggendo** il dato.

## 6. Come si aggiunge una parte nuova (passo per passo)

1. **Database**: migrazione nuova con tabella, RLS, policy e funzioni (§4). Rigenera `SETUP_COMPLETO.sql` e provalo.
2. **Dati**: in `app/src/lib/<modulo>.ts` scrivi il tipo della riga e le funzioni che leggono e scrivono (con `supabase.from(...)`).
3. **Regole**: se cambia chi vede cosa, aggiorna `app/src/lib/roles.ts` e i suoi test in `roles.test.ts`.
4. **Pagina**: `app/src/pages/<Nome>.tsx`, con `useQuery` e `useMutation` di TanStack Query; stati di caricamento ed errore sempre visibili.
5. **Rotta**: aggiungila in `app/src/App.tsx`.
6. **Menu**: aggiungi la voce in `gruppiMenu()` nel gruppo giusto (§3).
7. **Prove**:
   - `npm test` e `npm run typecheck`;
   - una prova nel browser con Supabase simulato, su computer e su telefono, con almeno due ruoli diversi;
   - **non dire mai** che una cosa è provata sul database vero se non lo è.
8. **Pubblicazione**: `npm run build`, che scrive in `v2/`, poi commit di `app/` **e** di `v2/`.
9. **Documentazione**:
   - una riga nel `CHANGELOG.md` con il numero di versione;
   - aggiorna la tabella in `app/README.md`;
   - se cambia l'uso, anche le guide in `docs/`.

Per il **sito attuale** (`servicedesk/`, `index.html`), solo correzioni:
- quando cambi un file, aumenta il suo `?v=` in `index.html`;
- aumenta `CACHE_NAME` in `sw.js`, così i telefoni scaricano la versione nuova.

## 7. Git

- Un commit per ogni modifica che ha senso da sola, con il messaggio in italiano e la versione: `3.1.0 Rubrica fornitori…`.
- Le AI aggiungono in fondo al messaggio la riga `Co-Authored-By:` con il proprio nome.
- Prima di dire «fatto»: commit **e** push.
- Mai forzare il push (`--force`) sul ramo principale.

## 8. Cose vietate

- Eseguire `playwright install`.
- Mettere segreti nel codice o nei commit.
- Disattivare l'RLS o scrivere policy `using (true)` per scrivere dati che non sono pubblici.
- Ripristinare la pagina a cartelle, il menu «Altro», gli account demo o i dati dimostrativi nel sito vero.
- Riscrivere da zero parti che funzionano senza che sia stato chiesto.
- Cambiare framework o librerie scelte (§2) di propria iniziativa.
