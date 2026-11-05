# Backend Supabase

Il progetto Supabase usato è quello del Service Desk (`igfpkpcksllmofqfoxkf`). Questa cartella deve contenere **tutto** ciò che serve per ricrearlo da zero. Oggi è vuota perché migrazioni ed Edge Functions non sono mai state caricate in una repository.

## Da copiare qui

```
supabase/
  migrations/   i file sql/00…11 delle release del Service Desk (in ordine)
  functions/
    import-hr/index.ts
    import-censimento/index.ts
    telegram-new-ticket/index.ts
```

Se i file originali non si trovano più, lo schema si esporta da Supabase:

- con la CLI: `supabase db dump --schema public > supabase/migrations/000_schema_attuale.sql`;
- oppure dalla dashboard: Database → Backups, oppure SQL Editor.

Le Edge Functions si scaricano con `supabase functions download <nome>`.

**Mai** salvare qui la `service_role` key, il token Telegram o dati reali (XLS HR, censimento).

## Controllo sicurezza RLS

Esegui `verifica_rls.sql` nel SQL Editor. Non modifica nulla. Restituisce:

1. le tabelle `public` **senza RLS attiva**: chiunque abbia la chiave pubblica può leggerle e scriverle (la chiave è nel codice);
2. tutte le policy, per ruolo e operazione.

Cosa controllare nel risultato:

- `people`, `hr_movements`, `person_events`, `people_source_records`: leggibili solo da HR, IT e SUPER_IT, mai da `USER`;
- `tickets`, `comments`: un `USER` vede solo i propri ticket (`richiedente_email` = email del login) e non vede le note interne (`nota_interna = true`);
- `profiles`: nessun utente può cambiare il proprio `ruolo`;
- nessuna policy `using (true)` per il ruolo `anon`.
