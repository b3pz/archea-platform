# Archea Service Desk V8.1.1 — iPhone Scanner Fix

Hotfix frontend della V8.1.

## Fix
- Scanner barcode automatico su Safari/iPhone tramite fallback Quagga2 quando `BarcodeDetector` non è disponibile.
- Mantiene `BarcodeDetector` nativo sui browser che lo supportano.
- Supporto 1D: Code 128, Code 39, EAN/UPC.
- Normalizzazione etichette Archea: `A4021`, `A 4021`, `ARCHEA-A4021` -> `A4021`.
- Due letture consecutive identiche prima dell'apertura automatica nel fallback, per ridurre falsi positivi.
- Campo manuale sempre disponibile.

## Installazione da V8.1
Solo GitHub: sostituire `index.html` e `app.js`.
Nessun SQL. Nessuna Edge Function.

## Nota rete
Quagga2 viene caricato da jsDelivr con versione bloccata 1.8.4. Se la libreria CDN non fosse raggiungibile, rimane disponibile l'inserimento manuale del codice.
