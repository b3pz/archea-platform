-- ARCHEA Platform · Calendario comune: appuntamenti, sale meeting e auto
-- Da eseguire UNA volta: Supabase → SQL Editor → New query → incolla tutto → Run.
-- Si può rieseguire senza danni. Richiede la chat (20261106_chat.sql) per la rubrica.

create extension if not exists btree_gist;

-- 1) Risorse prenotabili (sale, auto, attrezzature)
create table if not exists public.calendar_resources (
  id         bigserial primary key,
  tipo       text not null check (tipo in ('SALA', 'AUTO', 'ATTREZZATURA')),
  nome       text not null,
  sede       text,
  dettagli   text,            -- es. "10 posti, schermo 75''" oppure targa
  attivo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Eventi del calendario comune
create table if not exists public.calendar_events (
  id           bigserial primary key,
  tipo         text not null default 'APPUNTAMENTO' check (tipo in ('APPUNTAMENTO', 'SALA', 'AUTO', 'ATTREZZATURA')),
  titolo       text not null check (char_length(btrim(titolo)) between 1 and 200),
  descrizione  text,
  luogo        text,
  resource_id  bigint references public.calendar_resources(id) on delete set null,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  stato        text not null default 'CONFERMATO' check (stato in ('CONFERMATO', 'ANNULLATO')),
  organizer_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  organizer_nome text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (end_at > start_at)
);
-- Riunioni online (Zoom, Google Meet, Teams, Webex, altro)
alter table public.calendar_events add column if not exists meeting_provider text;
alter table public.calendar_events add column if not exists meeting_url text
  check (meeting_url is null or meeting_url ~* '^https://');
create index if not exists calendar_events_range_idx on public.calendar_events (start_at, end_at);

-- Nessuna doppia prenotazione della stessa sala/auto nello stesso orario
alter table public.calendar_events drop constraint if exists calendar_events_no_overlap;
alter table public.calendar_events add constraint calendar_events_no_overlap
  exclude using gist (resource_id with =, tstzrange(start_at, end_at, '[)') with &&)
  where (resource_id is not null and stato <> 'ANNULLATO');

-- 3) Partecipanti
create table if not exists public.calendar_attendees (
  event_id   bigint not null references public.calendar_events(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  risposta   text not null default 'IN ATTESA' check (risposta in ('IN ATTESA', 'ACCETTATO', 'RIFIUTATO')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- 4) Sicurezza
alter table public.calendar_resources enable row level security;
alter table public.calendar_events    enable row level security;
alter table public.calendar_attendees enable row level security;

create or replace function public.is_it_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo in ('IT', 'SUPER_IT'));
$$;
revoke all on function public.is_it_staff() from public, anon;
grant execute on function public.is_it_staff() to authenticated;

-- Risorse: tutti le vedono, solo IT le gestisce
drop policy if exists cal_res_read on public.calendar_resources;
create policy cal_res_read on public.calendar_resources for select to authenticated using (true);
drop policy if exists cal_res_manage on public.calendar_resources;
create policy cal_res_manage on public.calendar_resources for all to authenticated
  using (public.is_it_staff()) with check (public.is_it_staff());

-- Eventi: calendario comune visibile a tutti gli utenti autenticati
drop policy if exists cal_ev_read on public.calendar_events;
create policy cal_ev_read on public.calendar_events for select to authenticated using (true);
drop policy if exists cal_ev_insert on public.calendar_events;
create policy cal_ev_insert on public.calendar_events for insert to authenticated
  with check (organizer_id = auth.uid());
drop policy if exists cal_ev_update on public.calendar_events;
create policy cal_ev_update on public.calendar_events for update to authenticated
  using (organizer_id = auth.uid() or public.is_it_staff())
  with check (organizer_id = auth.uid() or public.is_it_staff());
drop policy if exists cal_ev_delete on public.calendar_events;
create policy cal_ev_delete on public.calendar_events for delete to authenticated
  using (organizer_id = auth.uid() or public.is_it_staff());

-- Partecipanti: visibili a tutti; li aggiunge l'organizzatore; ognuno risponde per sé
drop policy if exists cal_att_read on public.calendar_attendees;
create policy cal_att_read on public.calendar_attendees for select to authenticated using (true);
drop policy if exists cal_att_insert on public.calendar_attendees;
create policy cal_att_insert on public.calendar_attendees for insert to authenticated
  with check (exists (select 1 from public.calendar_events e where e.id = event_id and e.organizer_id = auth.uid()));
drop policy if exists cal_att_answer on public.calendar_attendees;
create policy cal_att_answer on public.calendar_attendees for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists cal_att_delete on public.calendar_attendees;
create policy cal_att_delete on public.calendar_attendees for delete to authenticated
  using (exists (select 1 from public.calendar_events e where e.id = event_id and e.organizer_id = auth.uid()));

grant select on public.calendar_resources to authenticated;
grant insert, update, delete on public.calendar_resources to authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;
grant select, insert, update, delete on public.calendar_attendees to authenticated;
grant usage, select on sequence public.calendar_resources_id_seq to authenticated;
grant usage, select on sequence public.calendar_events_id_seq to authenticated;

-- 5) Notifiche (campanella): invito, risposta, annullamento
create or replace function public.calendar_notify_invite()
returns trigger language plpgsql security definer set search_path = public as $$
declare ev record;
begin
  select * into ev from public.calendar_events where id = new.event_id;
  begin
    insert into public.notifications (user_id, title, message, is_read)
    values (new.user_id, 'Nuovo appuntamento',
            coalesce(ev.organizer_nome, 'Un collega') || ' ti ha invitato: ' || ev.titolo || ' · ' ||
            to_char(ev.start_at at time zone 'Europe/Rome', 'DD/MM HH24:MI'), false);
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists calendar_attendees_invite on public.calendar_attendees;
create trigger calendar_attendees_invite after insert on public.calendar_attendees
  for each row execute function public.calendar_notify_invite();

create or replace function public.calendar_notify_answer()
returns trigger language plpgsql security definer set search_path = public as $$
declare ev record; who text;
begin
  if new.risposta = old.risposta then return new; end if;
  select * into ev from public.calendar_events where id = new.event_id;
  select coalesce(nome, email) into who from public.profiles where id = new.user_id;
  begin
    insert into public.notifications (user_id, title, message, is_read)
    values (ev.organizer_id, 'Risposta appuntamento',
            coalesce(who, 'Un collega') || ' ha ' || lower(new.risposta) || ': ' || ev.titolo, false);
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists calendar_attendees_answer on public.calendar_attendees;
create trigger calendar_attendees_answer after update on public.calendar_attendees
  for each row execute function public.calendar_notify_answer();

create or replace function public.calendar_notify_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stato = 'ANNULLATO' and old.stato <> 'ANNULLATO' then
    begin
      insert into public.notifications (user_id, title, message, is_read)
      select a.user_id, 'Appuntamento annullato',
             new.titolo || ' · ' || to_char(new.start_at at time zone 'Europe/Rome', 'DD/MM HH24:MI'), false
      from public.calendar_attendees a where a.event_id = new.id and a.user_id <> auth.uid();
    exception when others then null;
    end;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists calendar_events_cancel on public.calendar_events;
create trigger calendar_events_cancel before update on public.calendar_events
  for each row execute function public.calendar_notify_cancel();

-- 6) Risorse iniziali (modificabili da Table Editor → calendar_resources)
insert into public.calendar_resources (tipo, nome, sede, dettagli)
select * from (values
  ('SALA', 'Sala meeting grande', 'FIRENZE', '12 posti · schermo e videoconferenza'),
  ('SALA', 'Sala meeting piccola', 'FIRENZE', '6 posti · schermo'),
  ('AUTO', 'Auto aziendale 1', 'FIRENZE', 'Targa da inserire'),
  ('AUTO', 'Auto aziendale 2', 'FIRENZE', 'Targa da inserire')
) as v(tipo, nome, sede, dettagli)
where not exists (select 1 from public.calendar_resources);
