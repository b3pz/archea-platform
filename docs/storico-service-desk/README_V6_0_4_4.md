# Archea Service Desk V6.0.4.4 — Device Import Chunked/Resumable

## Perché questa fix
Il file `Censimento_smaltimento.xlsx` contiene oltre 6.000 codici nel foglio `Device`.
La precedente Edge Function riusciva a leggere il file ma poteva esaurire le risorse mentre scriveva migliaia di record nella stessa esecuzione.

Il controllo sul database ha mostrato un import interrotto a circa riga 385; il codice `A4076` risultava infatti non ancora presente.

## Cosa cambia
- L'import viene eseguito automaticamente a blocchi da 200 righe/codici.
- Ogni chiamata alla Edge Function scrive solo il blocco corrente.
- L'interfaccia mostra avanzamento e percentuale.
- Il file viene rilanciato in modo idempotente: i record già importati vengono riconosciuti e non duplicati.
- Non è necessario cancellare i record del tentativo precedente.
- I record `VERIFICATO` restano protetti.
- I codici duplicati non vengono auto-risolti.
- I seriali duplicati restano conservati e marcati `DUBBIO`.
- Le password/PIN/PUK non vengono importate.
- Viene letto esclusivamente il foglio `Device`.

## Installazione
### 1. Supabase Edge Function
Aggiornare solamente:
`supabase/functions/import-censimento/index.ts`

Funzione da aggiornare: `import-censimento`
Poi fare Deploy.

### 2. GitHub Pages
Sostituire nella root del repository:
- `app.js`
- `index.html`

Non serve eseguire SQL e non serve aggiornare le altre Edge Functions.

### 3. Import
Accedere come `SUPER_IT` e caricare nuovamente il file completo `Censimento_smaltimento.xlsx` da Censimento → Importa foglio Device.
Non estrarre il foglio e non cancellare i record già presenti.

## Verifica finale
Eseguire `CHECK_DEVICE_IMPORT.sql` dopo che la barra arriva al 100%.
