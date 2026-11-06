-- ARCHEA Platform · Gruppi e permessi
-- Da eseguire dopo chat, calendario, off topic e sondaggi (oppure usa supabase/SETUP_COMPLETO.sql).
-- Si può rieseguire senza danni.
--
-- Idea: le persone stanno in GRUPPI (es. "IT", "Moderatori Off topic", "Segreteria").
-- Ogni gruppo ha dei PERMESSI. Chi è nel gruppo ha quei permessi.
-- SUPER_IT ha sempre tutti i permessi.
--
-- Permessi disponibili:
--   gestione_utenti        vedere, aggiungere, modificare ed eliminare utenti e gruppi
--   moderazione_offtopic   mettere in evidenza, chiudere ed eliminare argomenti e risposte
--   gestione_calendario    modificare/annullare prenotazioni di tutti, gestire sale e auto

-- 1) Tabelle
create table if not exists public.access_groups (
  id          bigserial primary key,
  nome        text not null unique check (char_length(btrim(nome)) between 2 and 60),
  descrizione text,
  permessi    text[] not null default '{}',
  created_at  timestamptz not null default now()
);
alter table public.access_groups drop constraint if exists access_groups_permessi_validi;
alter table public.access_groups add constraint access_groups_permessi_validi
  check (permessi <@ array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe', 'gestione_progetti']::text[]);

create table if not exists public.access_group_members (
  group_id   bigint not null references public.access_groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Sale/auto riservate a un gruppo (vuoto = le prenotano tutti)
alter table public.calendar_resources add column if not exists gruppo_id bigint references public.access_groups(id) on delete set null;

-- 2) Funzioni di controllo
create or replace function public.has_perm(p text)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
    or exists (
      select 1 from public.access_group_members m
      join public.access_groups g on g.id = m.group_id
      where m.user_id = auth.uid() and p = any (g.permessi)
    )
  );
$$;
revoke all on function public.has_perm(text) from public, anon;
grant execute on function public.has_perm(text) to authenticated;

create or replace function public.my_permissions()
returns text[] language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
      then array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario']
    else coalesce((
      select array_agg(distinct perm) from public.access_group_members m
      join public.access_groups g on g.id = m.group_id, unnest(g.permessi) as perm
      where m.user_id = auth.uid()
    ), '{}')
  end;
$$;
revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated;

create or replace function public.can_book_resource(rid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select rid is null or exists (
    select 1 from public.calendar_resources r
    where r.id = rid and r.attivo and (
      r.gruppo_id is null
      or public.has_perm('gestione_calendario')
      or exists (select 1 from public.access_group_members m where m.group_id = r.gruppo_id and m.user_id = auth.uid())
    )
  );
$$;
revoke all on function public.can_book_resource(bigint) from public, anon;
grant execute on function public.can_book_resource(bigint) to authenticated;

-- 3) Sicurezza tabelle gruppi: tutti leggono, gestisce solo chi ha gestione_utenti
alter table public.access_groups enable row level security;
alter table public.access_group_members enable row level security;
drop policy if exists groups_read on public.access_groups;
create policy groups_read on public.access_groups for select to authenticated using (true);
drop policy if exists groups_manage on public.access_groups;
create policy groups_manage on public.access_groups for all to authenticated
  using (public.has_perm('gestione_utenti')) with check (public.has_perm('gestione_utenti'));
drop policy if exists members_read on public.access_group_members;
create policy members_read on public.access_group_members for select to authenticated using (true);
drop policy if exists members_manage on public.access_group_members;
create policy members_manage on public.access_group_members for all to authenticated
  using (public.has_perm('gestione_utenti')) with check (public.has_perm('gestione_utenti'));
grant select, insert, update, delete on public.access_groups, public.access_group_members to authenticated;
grant usage, select on sequence public.access_groups_id_seq to authenticated;

-- 4) Nessuno può cambiarsi il ruolo da solo (solo chi gestisce gli utenti, o il server)
create or replace function public.profiles_guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ruolo is distinct from old.ruolo and auth.uid() is not null and not public.has_perm('gestione_utenti') then
    raise exception 'Non hai il permesso di cambiare il ruolo';
  end if;
  if new.ruolo = 'SUPER_IT' and old.ruolo is distinct from 'SUPER_IT' and auth.uid() is not null
     and not exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT') then
    raise exception 'Solo un SUPER_IT può nominare un altro SUPER_IT';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.profiles_guard_role();

-- Un profilo creato dal browser da chi non gestisce gli utenti nasce sempre USER
create or replace function public.profiles_guard_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(new.ruolo, 'USER') <> 'USER' and not public.has_perm('gestione_utenti') then
    new.ruolo := 'USER';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_insert on public.profiles;
create trigger profiles_guard_insert before insert on public.profiles
  for each row execute function public.profiles_guard_insert();

-- 5) Calendario: gestione con permesso e sale riservate
drop policy if exists cal_res_manage on public.calendar_resources;
create policy cal_res_manage on public.calendar_resources for all to authenticated
  using (public.has_perm('gestione_calendario')) with check (public.has_perm('gestione_calendario'));
drop policy if exists cal_ev_insert on public.calendar_events;
create policy cal_ev_insert on public.calendar_events for insert to authenticated
  with check (organizer_id = auth.uid() and public.can_book_resource(resource_id));
drop policy if exists cal_ev_update on public.calendar_events;
create policy cal_ev_update on public.calendar_events for update to authenticated
  using (organizer_id = auth.uid() or public.has_perm('gestione_calendario'))
  with check (organizer_id = auth.uid() or public.has_perm('gestione_calendario'));
drop policy if exists cal_ev_delete on public.calendar_events;
create policy cal_ev_delete on public.calendar_events for delete to authenticated
  using (organizer_id = auth.uid() or public.has_perm('gestione_calendario'));

-- 6) Off topic: moderazione con permesso
drop policy if exists forum_t_update on public.forum_topics;
create policy forum_t_update on public.forum_topics for update to authenticated
  using (author_id = auth.uid() or public.has_perm('moderazione_offtopic'))
  with check (author_id = auth.uid() or public.has_perm('moderazione_offtopic'));
drop policy if exists forum_t_delete on public.forum_topics;
create policy forum_t_delete on public.forum_topics for delete to authenticated
  using (author_id = auth.uid() or public.has_perm('moderazione_offtopic'));
drop policy if exists forum_r_insert on public.forum_replies;
create policy forum_r_insert on public.forum_replies for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.forum_topics t where t.id = topic_id and (not t.locked or public.has_perm('moderazione_offtopic')))
  );
drop policy if exists forum_r_delete on public.forum_replies;
create policy forum_r_delete on public.forum_replies for delete to authenticated
  using (author_id = auth.uid() or public.has_perm('moderazione_offtopic'));

create or replace function public.forum_guard_topic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if not public.has_perm('moderazione_offtopic') then
    new.pinned := old.pinned;
    new.locked := old.locked;
  end if;
  new.author_id := old.author_id;
  new.replies_count := old.replies_count;
  return new;
end $$;

-- 7) Gruppi iniziali (modificabili dal sito: Service Desk → Utenti e gruppi)
insert into public.access_groups (nome, descrizione, permessi) values
  ('IT', 'Reparto IT: gestisce utenti, calendario e moderazione', array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario']),
  ('Moderatori Off topic', 'Moderano la bacheca Off topic', array['moderazione_offtopic']),
  ('Gestione calendario', 'Gestiscono sale, auto e prenotazioni di tutti', array['gestione_calendario'])
on conflict (nome) do nothing;

-- Chi oggi è IT o SUPER_IT entra nel gruppo IT
insert into public.access_group_members (group_id, user_id)
select g.id, p.id from public.access_groups g, public.profiles p
where g.nome = 'IT' and p.ruolo in ('IT', 'SUPER_IT')
on conflict do nothing;
