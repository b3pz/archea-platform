-- ARCHEA Platform · Chat di gruppo e chat di progetto
-- Si può rieseguire senza danni. Richiede chat, utenti e gruppi, progetti e task.
--
--   GRUPPO    lo crea chiunque, sceglie le persone; lo gestisce chi l'ha creato
--   PROGETTO  uno per progetto, si crea da solo: ci sono solo le persone della squadra del progetto
--             (schermata Project Manager) e chi l'ha formata. Si aggiorna quando cambia la squadra.

create table if not exists public.chat_groups (
  id              bigserial primary key,
  nome            text not null check (char_length(btrim(nome)) between 2 and 120),
  tipo            text not null default 'GRUPPO' check (tipo in ('GRUPPO', 'PROGETTO')),
  progetto_codice text unique,
  created_by      uuid default auth.uid() references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table if not exists public.chat_group_members (
  group_id     bigint not null references public.chat_groups(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.chat_group_messages (
  id         bigserial primary key,
  group_id   bigint not null references public.chat_groups(id) on delete cascade,
  sender_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists chat_group_messages_group on public.chat_group_messages (group_id, created_at);

create or replace function public.chat_is_member(gid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_group_members where group_id = gid and user_id = auth.uid());
$$;
create or replace function public.chat_is_group_admin(gid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_groups g where g.id = gid and g.tipo = 'GRUPPO' and g.created_by = auth.uid());
$$;
revoke all on function public.chat_is_member(bigint), public.chat_is_group_admin(bigint) from public, anon;
grant execute on function public.chat_is_member(bigint), public.chat_is_group_admin(bigint) to authenticated;

alter table public.chat_groups enable row level security;
alter table public.chat_group_members enable row level security;
alter table public.chat_group_messages enable row level security;

drop policy if exists cg_read on public.chat_groups;
create policy cg_read on public.chat_groups for select to authenticated
  using (public.chat_is_member(id) or created_by = auth.uid());
drop policy if exists cg_insert on public.chat_groups;
create policy cg_insert on public.chat_groups for insert to authenticated
  with check (tipo = 'GRUPPO' and created_by = auth.uid() and progetto_codice is null);
drop policy if exists cg_update on public.chat_groups;
create policy cg_update on public.chat_groups for update to authenticated
  using (tipo = 'GRUPPO' and created_by = auth.uid()) with check (tipo = 'GRUPPO' and created_by = auth.uid());
drop policy if exists cg_delete on public.chat_groups;
create policy cg_delete on public.chat_groups for delete to authenticated
  using (tipo = 'GRUPPO' and created_by = auth.uid());

drop policy if exists cgm_read on public.chat_group_members;
create policy cgm_read on public.chat_group_members for select to authenticated
  using (public.chat_is_member(group_id) or public.chat_is_group_admin(group_id));
drop policy if exists cgm_insert on public.chat_group_members;
create policy cgm_insert on public.chat_group_members for insert to authenticated
  with check (public.chat_is_group_admin(group_id));
drop policy if exists cgm_update on public.chat_group_members;
create policy cgm_update on public.chat_group_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists cgm_delete on public.chat_group_members;
-- chi ha creato il gruppo toglie le persone; ognuno può uscire da un gruppo (non da quello di progetto)
create policy cgm_delete on public.chat_group_members for delete to authenticated
  using (public.chat_is_group_admin(group_id)
         or (user_id = auth.uid() and exists (select 1 from public.chat_groups g where g.id = group_id and g.tipo = 'GRUPPO')));

drop policy if exists cgmsg_read on public.chat_group_messages;
create policy cgmsg_read on public.chat_group_messages for select to authenticated
  using (public.chat_is_member(group_id));
drop policy if exists cgmsg_insert on public.chat_group_messages;
create policy cgmsg_insert on public.chat_group_messages for insert to authenticated
  with check (sender_id = auth.uid() and public.chat_is_member(group_id));
drop policy if exists cgmsg_delete on public.chat_group_messages;
create policy cgmsg_delete on public.chat_group_messages for delete to authenticated
  using (sender_id = auth.uid());

grant select, insert, update, delete on public.chat_groups, public.chat_group_members, public.chat_group_messages to authenticated;
grant usage, select on sequence public.chat_groups_id_seq, public.chat_group_messages_id_seq to authenticated;

-- chi crea un gruppo ne fa subito parte
create or replace function public.chat_group_add_creator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.chat_group_members (group_id, user_id) values (new.id, new.created_by) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists chat_group_add_creator on public.chat_groups;
create trigger chat_group_add_creator after insert on public.chat_groups
  for each row execute function public.chat_group_add_creator();

-- notifica a tutti gli altri del gruppo
create or replace function public.chat_group_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare sender_name text; group_name text;
begin
  select coalesce(nome, email) into sender_name from public.profiles where id = new.sender_id;
  select nome into group_name from public.chat_groups where id = new.group_id;
  begin
    insert into public.notifications (user_id, title, message, is_read)
    select m.user_id, 'Nuovo messaggio', coalesce(group_name, 'Gruppo') || ' · ' || coalesce(sender_name, 'Collega') || ': ' || left(new.body, 120), false
    from public.chat_group_members m where m.group_id = new.group_id and m.user_id <> new.sender_id;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists chat_group_notify on public.chat_group_messages;
create trigger chat_group_notify after insert on public.chat_group_messages
  for each row execute function public.chat_group_notify();

-- Chat di progetto: segue la squadra del progetto (ws_records, collection 'team')
create or replace function public.chat_sync_project()
returns trigger language plpgsql security definer set search_path = public as $$
declare gid bigint; pname text; people uuid[];
begin
  if new.collection = 'team' then
    select new.id || coalesce(' · ' || nullif(p.data->>'nome', ''), '') into pname
      from public.ws_records p where p.collection = 'progetti' and p.id = new.id;
    insert into public.chat_groups (nome, tipo, progetto_codice, created_by)
      values (coalesce(pname, new.id), 'PROGETTO', new.id, coalesce(new.created_by, new.updated_by))
      on conflict (progetto_codice) do update set nome = excluded.nome
      returning id into gid;
    select coalesce(array_agg(u.id), '{}') into people
      from jsonb_array_elements_text(coalesce(new.data->'persone', '[]'::jsonb)) x
      join auth.users u on u.id::text = x;
    people := people || array_remove(array[coalesce(new.created_by, new.updated_by)], null);
    delete from public.chat_group_members where group_id = gid and not (user_id = any (people));
    insert into public.chat_group_members (group_id, user_id) select gid, unnest(people) on conflict do nothing;
  elsif new.collection = 'progetti' then
    update public.chat_groups set nome = new.id || coalesce(' · ' || nullif(new.data->>'nome', ''), '')
      where progetto_codice = new.id;
  end if;
  return new;
end $$;
drop trigger if exists chat_sync_project on public.ws_records;
create trigger chat_sync_project after insert or update on public.ws_records
  for each row execute function public.chat_sync_project();
