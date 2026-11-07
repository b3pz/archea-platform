# ARCHEA Platform · nuova versione in React

Frontend unico in **React 18 + TypeScript + Vite**, che sostituisce un pezzo alla volta il sito attuale
(Service Desk in JavaScript semplice + Workspace compilato). Il database Supabase resta lo stesso.

## Comandi
```
cd app
npm install
npm run dev        # sviluppo in locale
npm test           # test (vitest)
npm run build      # controllo dei tipi + pubblicazione in ../v2  →  https://b3pz.github.io/archea-platform/v2/
```
Dopo `npm run build` si fa commit anche della cartella `v2/`: GitHub Pages pubblica quella.

## Struttura
- `src/lib/supabase.ts` · client Supabase unico (sessione salvata e rinnovata dalla libreria)
- `src/lib/auth.tsx` · stato di accesso: avvio → fuori/dentro; profilo e permessi in memoria (React Query)
- `src/lib/roles.ts` · ruoli, permessi, **menu per ruolo** (logica pura, testata in `roles.test.ts`)
- `src/lib/tickets.ts` · accesso ai dati dei ticket
- `src/components/` · layout (menu a sinistra), icone, elenco ticket
- `src/pages/` · una pagina per file

## Stato della migrazione
| Modulo | Stato |
| --- | --- |
| Accesso, ruoli, menu, tema chiaro/scuro | fatto |
| Ticket: apri, i miei, dettaglio e conversazione | fatto |
| Reparto IT: dashboard, coda, presa in carico, stato e priorità | fatto |
| Censimento e asset, prenotazioni, eliminazioni | da fare (link al sito attuale) |
| HR: persone, movimenti, planimetrie | da fare |
| Calendario, chat, Off topic, foto cantiere, notifiche | da fare |
| Utenti e gruppi | da fare |
| Workspace: progetti, task, ore, organico, PM | da fare (riscrittura: il sorgente aggiornato non esiste) |

## Modello autorizzazioni (3.3.0)
Il profilo ha solo il ruolo base `USER` oppure `SUPER_IT`. Le capacità operative si sommano tramite gruppi `IT`, `HR`, `PM` e `BIM`. `SUPER_IT` gestisce la piattaforma e non eredita automaticamente i permessi operativi. Il catalogo licenze e le checklist di uscita sono ancora nel Service Desk legacy.

Le voci non ancora portate compaiono nel menu con l'icona ↗ e aprono il sito attuale.
