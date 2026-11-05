# Archea Service Desk V8.1 — HR Admin + Dropdown Normalization

## Obiettivo
V8.1 consolida i menu a tendina e porta HR allo stesso livello amministrativo di SUPER_IT nel proprio ambito, senza estendere HR alle funzioni tecniche IT/Censimento.

## Novità principali

### HR
- HR può aprire **Persone**.
- HR può **importare HR_Collaboratori.xlsx** tramite la Edge Function `import-hr`.
- HR può **esportare Persone XLS**.
- HR può usare **+ Aggiungi persona**: crea la scheda come `PREVISTO` e contemporaneamente un movimento `NUOVO INGRESSO` con stato `DA VERIFICARE`.
- HR, IT e SUPER_IT possono creare **Nuovo movimento**.
- Solo HR vede il controllo di conferma/rifiuto dei movimenti del portale nello Storico movimenti.
- HR può correggere i dati anagrafici e gestire i valori controllati di tipo COMPANY / SITE / DEPARTMENT / PROFILE.
- SUPER_IT mantiene il controllo globale e gestisce anche CATEGORY Asset.

### Dropdown
- Le sedi di Persone, Censimento, Storico movimenti e Mappa provengono dai valori `SITE` approvati.
- I tipi/stati dello Storico movimenti non vengono più costruiti dai valori sporchi presenti nei record.
- Le categorie Asset vengono gestite tramite `reference_values` di tipo `CATEGORY`.
- Le categorie operative Asset vengono salvate **sempre in MAIUSCOLO**.
- Le varianti che differiscono solo per maiuscole/minuscole vengono deduplicate dalla chiave normalizzata.
- Il valore originale del file Device resta comunque nella fonte/raw: la normalizzazione modifica solo il dato operativo.

### Workflow uscita
- Dalla scheda persona, `Registra uscita` non effettua più una uscita immediata.
- Apre il normale workflow `USCITA` in Movimenti.
- Il movimento resta `DA VERIFICARE` finché HR non lo conferma.

## Installazione da V8.0

1. Supabase → SQL Editor
   - eseguire `sql/10_migration_v8_1_hr_dropdowns.sql`
   - facoltativo: `sql/11_POSTCHECK_V8_1.sql`

2. Supabase → Edge Functions → `import-hr`
   - sostituire `index.ts` con `supabase/functions/import-hr/index.ts`
   - Deploy
   - non cambiare Secrets

3. GitHub Pages
   - sostituire nella root: `index.html`, `app.js`, `styles.css`
   - `logo_archea.png` è invariato

4. Refresh forzato del browser.

## Non serve aggiornare
- `import-censimento`
- `telegram-new-ticket`

## Note di sicurezza dati
- Nessun XLS/PDF sorgente è incluso nella release.
- Password/PIN/PUK non vengono introdotti dalla V8.1.
- Le categorie raw Device non vengono cancellate dalle fonti storiche.
