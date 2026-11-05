# ARCHEA WORKSPACE

Web app per iPhone (installabile dalla schermata Home), **in sola lettura**, per consultare task, progetti, note e ore dello studio.
Sezioni: **Oggi · Progetti · Note · Ore**. React + TypeScript + Vite. Nessun modello AI.

## Stato dei dati: cosa è reale e cosa no

| Livello | Stato |
|---|---|
| 1. Demo con dati dimostrativi fittizi | ✅ **Questa versione**. Badge «DEMO» sempre visibile. |
| 2. Anteprima con dati reali dall'Excel | ⚠️ Pronta ma **non verificata sul tuo file** (non era tra gli allegati). Si usa da «Persona e dati → Importa Excel (locale)»; il file è letto solo nel browser, mai salvato né inviato. Badge «EXCEL STATICO». |
| 3. Collegamento live a Google Fogli | ❌ **Non implementato.** Serve un backend con login Google (vedi `docs/LIVE.md`). |

Nessun dato reale è nel codice o nel bundle. Per questo la demo si può pubblicare.

## Provare

```bash
npm install
npm run dev        # sviluppo
npm test           # test mirati
npm run build      # build in dist/
```
Su iPhone: apri l'URL pubblicato in Safari → Condividi → «Aggiungi alla schermata Home».
Pubblicazione: `.github/workflows/pages.yml` pubblica su GitHub Pages (Settings → Pages → Source: GitHub Actions) se il progetto è alla radice della repo.

## Architettura

```
src/config/     sheets.ts (schede, intestazioni, intervalli, alias, esclusioni) · permissions.ts · accounts.ts
src/domain/     tipi, regole task, date Europe/Rome, ore e periodi
src/data/       parsers/ (celle → modello) · build.ts · adapters/ (demo, Excel, Google Fogli) · demo/
src/ui/         schermate e componenti
```
Ogni sorgente produce celle grezze → `buildDataset` → modello comune (`Persona, Progetto, Task, Nota, RegistrazioneOre`). L'interfaccia non sa da dove arrivano. Anche la demo è scritta nel layout dei fogli reali e passa dagli stessi parser.

## Regole implementate (da verificare sul foglio)

- **Colonne task per intestazione normalizzata**, non per lettera. Intestazioni mancanti → segnalazione, non errore silenzioso. `Shared` è letta ma **non** usata per autorizzazioni.
- **Stato task** (priorità): Validata (`Validated` + `Completed` + data chiusura) › Da rivedere (commenti) › Scaduta (< oggi) › In scadenza (oggi/domani) › In corso. ⚠️ Ricavata dalle istruzioni, **non dalla formula viva del foglio**: l'import Excel segnala quante task hanno uno stato diverso dall'icona della colonna STATUS.
- Una task validata è chiusa; scaduta non validata resta aperta. Righe senza titolo né descrizione ignorate.
- Date: calendario `YYYY-MM-DD`, «oggi» in **Europe/Rome**, nessuna conversione UTC.
- **Progetti**: #DV colonna D da riga 5 (esclusi vuoti/ND/righe senza codice); stati da #InsightData K32:N57; attivi in cima, poi ordine #DV. Progetti con dati ma assenti da #DV: conservati come «Storico» e segnalati. Alias `P16 → P13` (solo questo).
- **Note**: progetto dal marcatore `N:CODICE` della riga (non dalla riga precedente), quindi robusto al riordino dei blocchi.
- **Ore**: colonne data riconosciute dalla riga 2 (nessuna larghezza fissa); separatori ignorati; vuoto, `-`, `OFF` non sono ore; `0` e decimali validi; testi/errori inattesi contati e segnalati, mai trasformati in ore. Esclusi dai riepiloghi: Francesco Dall'O' (riconosciuto per prefisso normalizzato `francescodall`, **grafia da verificare**) e Doriana Mastro; registrazioni conservate. Settimana lunedì–domenica; per progetto senza totali zero.
- **Permessi** centralizzati in `src/config/permissions.ts`. Il selettore persona è una **simulazione**, non un accesso.

## Decisioni in sospeso (necessarie prima dell'accesso live)

1. I membri vedono tutti i progetti e tutte le note? (ora sì, solo demo)
2. La colonna `Shared` deve avere un ruolo di autorizzazione? (ora no)
3. I membri vedono le task degli altri? (ora no)
4. Mappa account Google → persona (`src/config/accounts.ts`, vuota: nessuna email inventata).

## Migrazione per la futura scrittura

Gli ID attuali sono derivati dal contenuto (non dalla riga). Per scrivere servirà una colonna ID permanente (UUID) in 02_TaskManager e 04_Ore, e usare la colonna G di 03_Note (oggi solo marcatore `N:CODICE`) con un ID per nota. Non fatto: il foglio di produzione non è stato toccato.

## PWA

Manifest, icone, modalità standalone e safe area presenti. **Nessun service worker: niente offline e nessuna cache di dati privati.**

## Verifiche eseguite

- 13 test (`npm test`): codici e alias, priorità stati, «oggi» in Europe/Rome, celle ore (OFF/`-`/0/decimali/errori), calendario con separatori, note a blocchi, colonne task riordinate, settimana lun–dom, custom, zero esclusi, esclusione persone, permessi ore.
- Browser (Chromium, viewport iPhone 390×844): navigazione 4 sezioni, filtri, dettagli, selettore progetto, tutti i periodi ore, vista come membro; **0 overflow orizzontale**, 0 errori in console.
- **Non eseguito**: confronto con i totali ore del foglio reale e con la dashboard (file Excel non disponibile); prova su iPhone fisico; accessi live.
