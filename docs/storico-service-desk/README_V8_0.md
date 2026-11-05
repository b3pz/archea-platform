# Archea Service Desk V8.0 — MAP · CAMERA · XLS

Costruita sopra V7.0 Mobile First e la base dati V6/V7 già funzionante.

## Novità V8

### 1. Mappa postazioni / magazzino
- Nuova voce **Mappa** per IT e SUPER_IT.
- Posizioni organizzate per sede e zona.
- Assegnazione persona → posizione senza creare falsi movimenti HR.
- Conteggio asset presenti nella posizione.
- Persone senza posizione evidenziate.
- Convenzione magazzino obbligatoria: `M-A1`, `M-A2`, `M-B1`, `M-B2`, ecc.
- Le postazioni normali non possono iniziare con `M-`.
- La mappa è volutamente schematica: una futura planimetria grafica potrà usare gli stessi record `map_positions` e i campi `x_pct/y_pct`.

### 2. Fotocamera / scansione asset
Nel Censimento compare **Fotocamera / Scansiona**.
- Usa la fotocamera posteriore su HTTPS/GitHub Pages.
- Se il browser supporta `BarcodeDetector`, prova QR/barcode automaticamente.
- Per etichette solo testuali resta sempre disponibile l'inserimento rapido del codice (es. `A4076`) nello stesso pannello.
- Il codice trovato apre direttamente la scheda asset.

### 3. Export Excel
- **Scarica Persone XLS**: esportazione completa anagrafica con conteggi asset.
- **Scarica Censimento XLS**: esportazione completa e sicura del censimento, senza credenziali.
- **Scarica Mappa XLS**: posizioni, persone e asset.
- Tutte le altre tabelle visibili ricevono anche un pulsante **Scarica XLS**.

### 4. Ordinamento
- Desktop: click su qualsiasi intestazione `▲ / ▼`.
- Mobile: Persone e Censimento hanno controlli **Ordina per** + crescente/decrescente.
- Numeri e date vengono ordinati in modo coerente.

## Installazione sopra V7

### Supabase
Eseguire in SQL Editor:
1. `sql/08_migration_v8_map.sql`
2. facoltativo: `sql/09_POSTCHECK_V8.sql`

Non serve modificare Edge Functions.

### GitHub
Sostituire nella root:
- `index.html`
- `app.js`
- `styles.css`
- `logo_archea.png` solo se mancante (è invariato)

Fare poi refresh forzato / chiudere e riaprire la web app sul telefono.

## Nota sulla mappa
Questa V8 introduce la struttura dati definitiva per le posizioni. Non inventa la planimetria reale: le postazioni vengono create progressivamente con i codici effettivi dello studio. In futuro si potrà caricare una planimetria e associare ogni `map_position` a coordinate grafiche senza cambiare il database.
