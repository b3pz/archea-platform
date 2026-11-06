-- ARCHEA Platform · PULIZIA DATI (per ripartire da zero)
--
-- ATTENZIONE: cancella i dati in modo DEFINITIVO. Non si può annullare.
-- Prima fai un backup: Supabase → Database → Backups, oppure esporta le tabelle in CSV.
--
-- Come si usa: Supabase → SQL Editor → New query → incolla tutto →
-- scegli qui sotto cosa pulire (true = pulisci, false = lascia) → Run.
--
-- Non vengono MAI toccati:
--   la struttura (tabelle, regole di accesso, funzioni), i gruppi e i permessi,
--   le sale e le auto del calendario, l'elenco sedi, il tuo account.

do $$
declare
  -- 1) ATTIVITÀ: ticket e loro storico, commenti, appuntamenti IT, prenotazioni materiale,
  --    notifiche, chat, calendario comune, Off topic (argomenti, risposte, sondaggi), foto.
  pulisci_attivita   boolean := true;

  -- 2) ANAGRAFICA: asset e censimento, persone, movimenti HR, postazioni, planimetrie, conflitti.
  --    Lascia false se vuoi tenere il censimento già importato.
  pulisci_anagrafica boolean := false;

  -- 3) UTENTI: elimina tutti gli account tranne IT e SUPER_IT (che restano per ricreare gli altri).
  pulisci_utenti     boolean := false;

  t text;
  n bigint;
  attivita text[] := array[
    'notifications', 'ticket_history', 'ticket_collaborators', 'comments', 'checklist_items',
    'appointments', 'material_bookings', 'deletion_requests', 'tickets',
    'chat_messages',
    'calendar_attendees', 'calendar_events',
    'forum_poll_votes', 'forum_poll_options', 'forum_polls', 'forum_replies', 'forum_topics',
    'site_photos'
  ];
  anagrafica text[] := array[
    'conflict_resolution_requests', 'data_conflicts', 'asset_history', 'asset_assignments',
    'person_events', 'hr_movements', 'people_source_records', 'map_positions', 'floor_plans',
    'assets', 'people'
  ];
begin
  if pulisci_attivita then
    foreach t in array attivita loop
      if to_regclass('public.' || t) is not null then
        execute format('delete from public.%I', t);
        get diagnostics n = row_count;
        raise notice 'Attività · %: % righe cancellate', t, n;
      end if;
    end loop;
  end if;

  if pulisci_anagrafica then
    foreach t in array anagrafica loop
      if to_regclass('public.' || t) is not null then
        execute format('delete from public.%I', t);
        get diagnostics n = row_count;
        raise notice 'Anagrafica · %: % righe cancellate', t, n;
      end if;
    end loop;
  end if;

  if pulisci_utenti then
    delete from public.access_group_members m
     using public.profiles p
     where p.id = m.user_id and coalesce(p.ruolo, 'USER') not in ('IT', 'SUPER_IT');
    delete from auth.users u
     where not exists (select 1 from public.profiles p where p.id = u.id and p.ruolo in ('IT', 'SUPER_IT'));
    get diagnostics n = row_count;
    raise notice 'Utenti: % account eliminati (restano IT e SUPER_IT)', n;
  end if;
end $$;

-- Le FOTO (file) non si possono cancellare da SQL: Supabase → Storage → bucket "foto" →
-- seleziona tutte le cartelle → Delete. Le righe dell'archivio foto sono già state cancellate sopra.

-- Controllo: quante righe restano
select 'tickets' as tabella, count(*) from public.tickets
union all select 'assets', count(*) from public.assets
union all select 'people', count(*) from public.people
union all select 'utenti', count(*) from auth.users;
