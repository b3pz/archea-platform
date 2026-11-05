# Verifica della ricostruzione

## Esito

- Installazione pulita `npm ci`: riuscita.
- `npm test`: 8 test superati.
- `npm run typecheck`: superato per i contratti TypeScript. Il JavaScript recuperato non è verificato staticamente (`checkJs: false`).
- `npm run build`: riuscita.
- Browser Chromium, viewport 390 × 844: quattro sezioni, dettagli task/progetto/nota, cinque periodi ore, selezione membro e importazione XLSX controllati.
- Nessun errore JavaScript durante la prova sul browser.
- Nessuno scorrimento orizzontale nelle quattro sezioni.

## Confronto visivo

Originale e ricostruzione sono stati caricati con la stessa data simulata: 2 ottobre 2026, ore 19:00 Europe/Rome. Gli screenshot di Oggi, Progetti, Note e Ore sono identici pixel per pixel, nella dimensione controllata. Le immagini della ricostruzione sono incluse in `verifica/`.

Questo confronto riguarda gli stati iniziali delle quattro schermate. Non implica la verifica di ogni combinazione possibile di dati o dimensioni del dispositivo.

## Dati

I test confrontano dataset, stati task, date e riepiloghi ore con il codice del bundle originale. L'importazione è stata provata con un workbook sintetico che riproduce le schede previste, sia nel test automatico sia nel browser.

Non sono stati verificati il Google Fogli reale, un iPhone fisico, autenticazione o sincronizzazione live. Queste ultime due funzioni non sono presenti nell'app originale e non sono state aggiunte.

## Identità della versione di partenza

Archivio fornito: `ARCHEA_WORKSPACE-main (1).zip`.
Commit indicato nello ZIP: `8c35836bf98f78e5681431ca909df4cb58142c65`.
Bundle originale conservato in `tests/fixtures/original-bundle.js`, usato soltanto per i test.

## Correzione 0.2.1

13 test superati: gli 8 precedenti e 5 nuovi controlli sull'importazione progetti.

Browser Chromium 390 × 844, stesso workbook sintetico con intervalli non inizializzati in A1 e stati in M: versione originale 0 progetti attivi; versione 0.2.1 5 progetti attivi. Il selettore Note mantiene i progetti attivi in cima. Nessun errore JavaScript.

L'Excel reale dell'utente non è stato fornito: la prova riproduce i difetti identificati nel codice.

## Correzione 0.2.2 — ultimo Excel e riapertura

17 test automatici superati. Importazione sul browser verificata anche con il workbook reale fornito: 26 progetti, 11 attivi, 24 task, 3 note e 5968 ore complessive. Nessuna commessa della demo viene aggiunta ai progetti importati.

Il difetto è stato riprodotto nella versione 0.2.1: dopo l'importazione si vedono 11 progetti attivi, ma al ricaricamento si torna alla demo con 5. Nella versione 0.2.2 gli 11 progetti attivi restano presenti sia dopo il ricaricamento sia in una nuova scheda dello stesso browser.

Controllati anche: importazione successiva che sostituisce tutti i dati, eliminazione della copia locale tramite Rimuovi dati e torna alla demo, sorgente e nome file visibili, assenza di overflow a 390 × 844 e assenza di errori JavaScript. Nessuna prova su iPhone fisico.

Il workbook reale e i suoi dati non sono inclusi nel pacchetto GitHub. Le precedenti note che dichiarano assenza del file reale riguardano esclusivamente le verifiche storiche delle versioni 0.2.0 e 0.2.1.

## Aggiornamento 0.2.3 — icone ARCHEA

Favicon SVG e ICO, PNG da 16/32/192/512 pixel e icona Apple da 180 pixel aggiornati con scritta ARCHEA bianca su fondo nero. Verificati i collegamenti nell'HTML, le dimensioni del manifest e l'aspetto dell'icona a 512 pixel. Build completata. Le funzioni Excel della versione 0.2.2 restano presenti.
