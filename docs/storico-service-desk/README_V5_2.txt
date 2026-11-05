ARCHEA SERVICE DESK V5.2 — RESTYLE + TEMA + NAVIGAZIONE
========================================================

OBIETTIVO
Versione da presentazione che mantiene invariata l'architettura e il database.

NOVITÀ
- Login compatto orizzontale:
  logo Archea a sinistra;
  ID/Email + password a destra.
- Tema CHIARO / SCURO.
- Preferenza tema salvata sul browser.
- Pulsante “Torna indietro” nelle viste secondarie.
- Restyling V5.1 mantenuto.

COSA NON CAMBIA
- Supabase
- database
- RLS
- ticket
- ruoli
- Telegram
- appuntamenti
- prenotazioni
- HR
- censimento e struttura dati
- Edge Functions esistenti

INSTALLAZIONE
Sostituire su GitHub:
- index.html
- styles.css
- app.js

NON eseguire migration SQL.
NON modificare Supabase.
NON modificare Telegram.

NOTA CENSIMENTO
La Edge Function di importazione è rimasta volutamente invariata in questa release.
Il problema di trascrizione Excel va verificato separatamente, perché l'importer V5
riconosce intestazioni precise e assume la prima riga del foglio come intestazione.
È preferibile correggerlo dopo aver confrontato il mapping con il file reale, senza
rischiare di alterare dati prima della presentazione.
