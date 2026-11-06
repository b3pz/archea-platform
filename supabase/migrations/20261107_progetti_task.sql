-- ARCHEA Platform · Progetti, task, ore e note del Workspace su Supabase (condivisi)
-- Si può rieseguire senza danni.
--
-- Ruolo PM = permesso "gestione_progetti" (gruppo "Project Manager"; il super admin ce l'ha sempre).
--   PM:      crea e modifica progetti e task, assegna le task, vede le task e le ore di tutti
--   utente:  vede le task assegnate a lui, ne aggiorna stato, completamento, commenti e immagini,
--            registra le proprie ore; progetti e note li vedono tutti
--
-- Le schermate del Workspace salvano ogni progetto/task/ora/nota come un documento JSON
-- (stesso formato di prima), nella tabella ws_records.

-- 1) Permesso nuovo
alter table public.access_groups drop constraint if exists access_groups_permessi_validi;
alter table public.access_groups add constraint access_groups_permessi_validi
  check (permessi <@ array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe', 'gestione_progetti']::text[]);

create or replace function public.my_permissions()
returns text[] language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
      then array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe', 'gestione_progetti']
    else coalesce((
      select array_agg(distinct perm) from public.access_group_members m
      join public.access_groups g on g.id = m.group_id, unnest(g.permessi) as perm
      where m.user_id = auth.uid()
    ), '{}')
  end;
$$;

insert into public.access_groups (nome, descrizione, permessi) values
  ('Project Manager', 'Creano i progetti, assegnano le task e vedono l''avanzamento del team', array['gestione_progetti'])
on conflict (nome) do nothing;

-- 2) Tabella documenti
create table if not exists public.ws_records (
  collection text not null check (collection in ('progetti', 'task', 'ore', 'note')),
  id         text not null check (char_length(id) between 1 and 300),
  data       jsonb not null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
create index if not exists ws_records_updated on public.ws_records (updated_at desc);
-- 'team' = squadra di ogni progetto (schermata Project Manager)
alter table public.ws_records drop constraint if exists ws_records_collection_check;
alter table public.ws_records add constraint ws_records_collection_check
  check (collection in ('progetti', 'task', 'ore', 'note', 'team'));

-- 3) Funzioni di controllo
create or replace function public.ws_is_pm()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_progetti');
$$;

create or replace function public.ws_my_name()
returns text language sql stable security definer set search_path = public as $$
  select lower(btrim(coalesce(nome, ''))) from public.profiles where id = auth.uid();
$$;

-- vero se il mio nome è tra gli assegnatari ("Mario Rossi, Anna Bianchi")
create or replace function public.ws_assigned_to_me(assegnatario text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.ws_my_name(), '') <> '' and exists (
    select 1 from regexp_split_to_table(coalesce(assegnatario, ''), '[,;/&\n]+') x
    where lower(btrim(x)) = public.ws_my_name()
  );
$$;
revoke all on function public.ws_is_pm(), public.ws_my_name(), public.ws_assigned_to_me(text) from public, anon;
grant execute on function public.ws_is_pm(), public.ws_my_name(), public.ws_assigned_to_me(text) to authenticated;

-- 4) Regole di accesso
alter table public.ws_records enable row level security;

drop policy if exists ws_read on public.ws_records;
create policy ws_read on public.ws_records for select to authenticated using (
  collection in ('progetti', 'note', 'team')
  or public.ws_is_pm()
  or created_by = auth.uid()
  or (collection = 'task' and public.ws_assigned_to_me(data->>'assegnatario'))
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
);

drop policy if exists ws_insert on public.ws_records;
create policy ws_insert on public.ws_records for insert to authenticated with check (
  public.ws_is_pm()
  or collection = 'note'
  -- task personale: assegnata solo a sé stessi
  or (collection = 'task' and lower(btrim(data->>'assegnatario')) = public.ws_my_name())
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
);

drop policy if exists ws_update on public.ws_records;
create policy ws_update on public.ws_records for update to authenticated
  using (
    public.ws_is_pm()
    or (collection = 'task' and public.ws_assigned_to_me(data->>'assegnatario'))
    or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
    or (collection = 'note' and created_by = auth.uid())
  )
  with check (
    public.ws_is_pm()
    or collection in ('task', 'note')
    or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  );

drop policy if exists ws_delete on public.ws_records;
create policy ws_delete on public.ws_records for delete to authenticated using (
  public.ws_is_pm()
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  or (collection = 'note' and created_by = auth.uid())
);

grant select, insert, update, delete on public.ws_records to authenticated;

-- 5) Chi non è PM, su una task assegnata a lui aggiorna il proprio lavoro (stato, completamento,
--    commenti, immagini, link, dati della task...). Restano del PM: titolo, assegnatari, progetto,
--    date, priorità e validazione.
create or replace function public.ws_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pm_only text[] := array['id', 'numero', 'titolo', 'assegnatario', 'progettoCodice', 'inizio', 'scadenza', 'priorita', 'tipologia',
                          'validated', 'notValidated', 'validatedBy', 'validatedAt', 'correctionBy', 'approvedBy', 'createdBy'];
begin
  if tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.collection = 'task' and not public.ws_is_pm() then
    new.data := (new.data - pm_only) || (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb) from jsonb_each(old.data) as e(k, v) where k = any (pm_only));
  end if;
  return new;
end $$;
drop trigger if exists ws_guard on public.ws_records;
create trigger ws_guard before insert or update on public.ws_records
  for each row execute function public.ws_guard();

-- 6) Il super admin entra nel gruppo Project Manager (gli altri PM si aggiungono da Utenti e gruppi)
insert into public.access_group_members (group_id, user_id)
select g.id, p.id from public.access_groups g, public.profiles p
where g.nome = 'Project Manager' and p.ruolo = 'SUPER_IT'
on conflict do nothing;
