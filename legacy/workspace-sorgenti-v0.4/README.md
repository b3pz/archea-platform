# ARCHEA WORKSPACE — progetto ricostruito

Questa è una versione modificabile dell'applicazione presente nello ZIP fornito. Il codice applicativo è stato estratto dal bundle compilato, separato in moduli, rinominato e riportato in JSX dove possibile. CSS, icone e schermate sono conservati.

**Non è il sorgente TypeScript originale di Claude.** Il runtime recuperato è JavaScript e JSX; `src/domain/types.ts` documenta i contratti dei dati ricostruiti. Alcune variabili locali e istruzioni conservano la forma prodotta dalla compilazione. `typecheck` verifica i contratti TypeScript, non l'intero runtime JavaScript (`checkJs: false`).

## Avvio

Con Node.js 20 o successivo:

```bash
npm ci
npm run dev
```

Aprire l'indirizzo indicato da Vite. Per provare dal telefono sulla stessa rete:

```bash
npm run dev -- --host 0.0.0.0
```

Aprire su iPhone `http://IP-DEL-COMPUTER:5173`. Per l'installazione definitiva dalla schermata Home usare un sito pubblicato in HTTPS.

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

`dist/` contiene anche la versione già compilata. Per GitHub Pages pubblicare il **contenuto di `dist/`**, conservando il progetto sorgente nella repository. Pubblicare soltanto `dist/` non permette di recuperare i sorgenti con Download ZIP.

## Dove modificare

| Area | File o cartella |
|---|---|
| Schede, intestazioni, alias, intervalli, esclusioni | `src/config/sheets.js` |
| Persone della simulazione | `src/config/accounts.js` |
| Visibilità per ruolo | `src/config/permissions.js` |
| Stato, priorità e ordinamento task | `src/domain/tasks.js` |
| Date e fuso Europe/Rome | `src/domain/dates.js` |
| Periodi e riepiloghi ore | `src/domain/hours.js` |
| Modelli documentati | `src/domain/types.ts` |
| Parser delle celle | `src/data/parsers/` |
| Composizione dataset | `src/data/build.js` |
| Dati dimostrativi | `src/data/demo/workbook.js` |
| Importazione Excel | `src/data/adapters/excel.js` |
| Stato applicazione e caricamento | `src/ui/context.jsx` |
| Oggi, Progetti, Note, Ore | `src/ui/screens/` |
| Finestre di dettaglio | `src/ui/dialogs/` |
| Navigazione e intestazione | `src/ui/App.jsx` |
| Stili | `src/styles.css` |

## Funzioni conservate

- Consultazione in sola lettura delle quattro sezioni.
- Dati dimostrativi e importazione locale XLSX/XLSM.
- Filtri task, ricerche, selezione persona e dettagli.
- Progetti attivi in cima, note aperte/chiuse, periodi ore e intervallo personalizzato.
- Collegamenti agli allegati e copia dei percorsi server.
- Manifest, icone e impostazioni di visualizzazione iPhone.

La selezione persona è una simulazione: **non è un login**. L’ultimo dataset importato viene conservato in questo browser e ripristinato alla riapertura. Il pulsante Rimuovi dati e torna alla demo elimina la copia locale. Il pulsante Aggiorna non rilegge automaticamente un file Excel dal disco. Google Fogli live, autenticazione, scrittura, notifiche e offline non sono implementati.

## Verifiche

17 test automatici: confronto del dataset e delle regole con il bundle originale, stati task, celle ore, date, periodi e totali, progetti e persone escluse, visibilità e importazione di un workbook XLSX sintetico. Il bundle originale è incluso in `tests/fixtures/` esclusivamente come riferimento di regressione; non entra nella build pubblicata.

Vedere `VERIFICA.md` per l'esito delle verifiche sul browser. Nessun confronto con il Google Fogli reale è stato possibile: non è incluso nei file forniti.

## Prossima fase

Questa consegna include anche la persistenza locale dell’ultimo Excel e un riepilogo visibile della sorgente dei dati. Le nuove funzioni non sono ancora state introdotte. Priorità suggerita: connessione ai dati reali, home operativa, scheda progetto completa.

Versione 0.2.1: coordinate Excel conservate da A1, stati in M oppure N su tutte le righe e nomi scheda normalizzati.

Versione 0.2.2: l'importazione sostituisce il dataset precedente, salva solo i dati elaborati nel browser e li ripristina al ricaricamento. Il file Excel originale non viene salvato né inviato. Per avere dati aggiornati occorre reimportare un nuovo Excel. Il browser può rimuovere i dati locali: in quel caso serve reimportare.
