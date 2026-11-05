# Archea Service Desk V5.4 — Device / Etichette

## Cosa cambia

Questa versione consolida il Censimento sulla logica reale del foglio **Device**.

### Import Excel
- viene letto **solo** il foglio `Device`;
- tutti gli altri fogli vengono ignorati;
- il codice asset è la chiave;
- se dopo il codice non esiste alcun valore nella riga, il record è una **ETICHETTA LIBERA**;
- se dopo il codice esiste almeno un valore, il codice è considerato già associato a un dispositivo;
- password / PSW ID Apple-Google / PIN / PUK non vengono importati;
- gli asset già `VERIFICATO` non vengono sovrascritti;
- se Excel mostra una riga solo-codice ma nel portale quel codice contiene già un asset, l'import non cancella i dati: segnala un conflitto protetto.

### Nuovo asset
`+ Associa etichetta a dispositivo` ora funziona così:
1. inserisci il codice fisico, es. `A4689`;
2. il portale controlla il database importato dal foglio Device;
3. se il codice è una `ETICHETTA LIBERA`, abilita il salvataggio;
4. se il codice è già compilato, mostra cosa contiene e blocca il doppione;
5. se il codice non è presente nell'ultimo Device importato, chiede di aggiornare/importare prima il censimento;
6. al salvataggio ricontrolla il codice per evitare collisioni tra due tecnici.

### Ricerca / report rapido
- ricerca per codice, categoria, marca, modello, seriale, sede, posizione e assegnatario;
- `laptop` comprende anche `portatile`, `notebook` e `macbook`;
- riepilogo dinamico dei risultati: dispositivi, assegnati, disponibili, etichette libere;
- le etichette libere non entrano nel conteggio degli asset reali;
- le etichette libere non sono selezionabili nelle prenotazioni materiale.

### Categoria
La categoria nel form asset è ora un menu a tendina con valori standard e con le categorie già presenti nel censimento.

## Verifica sul file reale Censimento_smaltimento.xlsx
Sul foglio `Device` del file fornito sono stati rilevati:
- **6004** righe con un codice;
- **2684** righe con almeno un dato dopo il codice (dispositivi / codici già utilizzati);
- **3320** righe con il solo codice (etichette libere secondo la regola definita);
- `A4689` è presente alla riga Excel **4697** e non contiene valori successivi: viene quindi correttamente riconosciuto come **ETICHETTA LIBERA**.

## Installazione

### 1. Supabase SQL Editor
Eseguire una sola volta:
`migration_v5_4_device_labels.sql`

### 2. Edge Function
Sostituire/deployare:
`supabase/functions/import-censimento/index.ts`

La funzione Telegram non va modificata.

### 3. GitHub Pages
Sostituire:
- `index.html`
- `styles.css`
- `app.js`

### 4. Reimport
Dal portale, come `SUPER_IT`, aprire Censimento e importare nuovamente `Censimento_smaltimento.xlsx`.
Da questa versione verrà letto esclusivamente `Device` e verranno classificate le etichette libere.

## Importante: scrittura fisica su Excel
Questa release rende coerente il portale con il foglio Device importato, ma **non modifica fisicamente il file Excel su OneDrive** quando un asset viene compilato nel portale.
Per la sincronizzazione bidirezionale reale con lo stesso file aziendale servirà il collegamento a OneDrive/Microsoft Graph. È intenzionalmente separato da questa release per non introdurre un'integrazione esterna non configurata prima della presentazione.
