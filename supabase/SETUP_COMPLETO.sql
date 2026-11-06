-- ARCHEA Platform · SETUP COMPLETO
-- Supabase → SQL Editor → New query → incolla TUTTO questo file → Run.
-- Si può rieseguire senza danni: crea solo ciò che manca e aggiorna le funzioni.
-- GENERATO da tools/genera_setup.py unendo, in ordine, i file in supabase/migrations/.

-- ================================================================
-- 20261106_chat.sql
-- ================================================================
-- ARCHEA Platform · Chat tra utenti (Service Desk V9.1)
-- Da eseguire UNA volta: Supabase → SQL Editor → New query → incolla tutto → Run.
-- Si può rieseguire senza danni.

-- 1) Messaggi
create table if not exists public.chat_messages (
  id           bigserial primary key,
  sender_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body         text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at   timestamptz not null default now(),
  read_at      timestamptz
);
create index if not exists chat_messages_recipient_idx on public.chat_messages (recipient_id, read_at);
create index if not exists chat_messages_pair_idx on public.chat_messages (sender_id, recipient_id, created_at);

-- 2) Sicurezza: ognuno vede solo i messaggi che ha inviato o ricevuto
alter table public.chat_messages enable row level security;

drop policy if exists chat_select_own on public.chat_messages;
create policy chat_select_own on public.chat_messages
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists chat_insert_as_me on public.chat_messages;
create policy chat_insert_as_me on public.chat_messages
  for insert to authenticated
  with check (sender_id = auth.uid() and recipient_id <> auth.uid());

drop policy if exists chat_mark_read on public.chat_messages;
create policy chat_mark_read on public.chat_messages
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Il destinatario può solo segnare come letto: il testo non si modifica.
revoke update on public.chat_messages from authenticated;
grant select, insert on public.chat_messages to authenticated;
grant update (read_at) on public.chat_messages to authenticated;
grant usage, select on sequence public.chat_messages_id_seq to authenticated;

-- 3) Rubrica: solo id, nome e ruolo dei colleghi (non espone gli altri campi di profiles)
create or replace function public.chat_contacts()
returns table (id uuid, nome text, ruolo text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, coalesce(p.nome, p.email)::text, p.ruolo::text
  from public.profiles p
  where auth.uid() is not null and p.id <> auth.uid()
  order by 2;
$$;
revoke all on function public.chat_contacts() from public, anon;
grant execute on function public.chat_contacts() to authenticated;

-- 4) Notifica al destinatario (campanella del Service Desk)
create or replace function public.chat_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
begin
  select coalesce(nome, email) into sender_name from public.profiles where id = new.sender_id;
  begin
    insert into public.notifications (user_id, title, message, is_read)
    values (new.recipient_id, 'Nuovo messaggio', coalesce(sender_name, 'Collega') || ': ' || left(new.body, 120), false);
  exception when others then
    -- una notifica non riuscita non deve mai bloccare il messaggio
    null;
  end;
  return new;
end;
$$;

drop trigger if exists chat_messages_notify on public.chat_messages;
create trigger chat_messages_notify
  after insert on public.chat_messages
  for each row execute function public.chat_notify();

-- ================================================================
-- 20261106_calendario.sql
-- ================================================================
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

-- ================================================================
-- 20261106_offtopic.sql
-- ================================================================
-- ARCHEA Platform · Off topic (bacheca libera tra colleghi)
-- Da eseguire UNA volta: Supabase → SQL Editor → New query → incolla tutto → Run.
-- Richiede 20261106_calendario.sql (usa la funzione is_it_staff). Si può rieseguire.

create table if not exists public.forum_topics (
  id               bigserial primary key,
  categoria        text not null default 'GENERALE'
                   check (categoria in ('GENERALE', 'EVENTI', 'CONSIGLI', 'MERCATINO', 'SVAGO')),
  titolo           text not null check (char_length(btrim(titolo)) between 3 and 160),
  corpo            text not null check (char_length(btrim(corpo)) between 1 and 8000),
  author_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_nome      text,
  pinned           boolean not null default false,
  locked           boolean not null default false,
  replies_count    integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index if not exists forum_topics_activity_idx on public.forum_topics (pinned desc, last_activity_at desc);

create table if not exists public.forum_replies (
  id          bigserial primary key,
  topic_id    bigint not null references public.forum_topics(id) on delete cascade,
  corpo       text not null check (char_length(btrim(corpo)) between 1 and 8000),
  author_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_nome text,
  created_at  timestamptz not null default now()
);
create index if not exists forum_replies_topic_idx on public.forum_replies (topic_id, created_at);

alter table public.forum_topics  enable row level security;
alter table public.forum_replies enable row level security;

-- Tutti gli utenti autenticati leggono e scrivono; ognuno modifica/cancella solo i propri
-- contenuti; IT (moderazione) può fissare, chiudere e cancellare qualsiasi argomento.
drop policy if exists forum_t_read on public.forum_topics;
create policy forum_t_read on public.forum_topics for select to authenticated using (true);
drop policy if exists forum_t_insert on public.forum_topics;
create policy forum_t_insert on public.forum_topics for insert to authenticated
  with check (author_id = auth.uid() and pinned = false and locked = false);
drop policy if exists forum_t_update on public.forum_topics;
create policy forum_t_update on public.forum_topics for update to authenticated
  using (author_id = auth.uid() or public.is_it_staff())
  with check (author_id = auth.uid() or public.is_it_staff());
drop policy if exists forum_t_delete on public.forum_topics;
create policy forum_t_delete on public.forum_topics for delete to authenticated
  using (author_id = auth.uid() or public.is_it_staff());

drop policy if exists forum_r_read on public.forum_replies;
create policy forum_r_read on public.forum_replies for select to authenticated using (true);
drop policy if exists forum_r_insert on public.forum_replies;
create policy forum_r_insert on public.forum_replies for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.forum_topics t where t.id = topic_id and (not t.locked or public.is_it_staff()))
  );
drop policy if exists forum_r_delete on public.forum_replies;
create policy forum_r_delete on public.forum_replies for delete to authenticated
  using (author_id = auth.uid() or public.is_it_staff());

grant select, insert, update, delete on public.forum_topics to authenticated;
grant select, insert, delete on public.forum_replies to authenticated;
grant usage, select on sequence public.forum_topics_id_seq to authenticated;
grant usage, select on sequence public.forum_replies_id_seq to authenticated;

-- Solo IT può fissare o chiudere: l'autore può cambiare titolo e testo, non questi campi.
create or replace function public.forum_guard_topic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- aggiornamenti fatti dai trigger interni (contatore risposte) passano
  if pg_trigger_depth() > 1 then return new; end if;
  if not public.is_it_staff() then
    new.pinned := old.pinned;
    new.locked := old.locked;
  end if;
  new.author_id := old.author_id;
  new.replies_count := old.replies_count;
  return new;
end $$;
drop trigger if exists forum_topics_guard on public.forum_topics;
create trigger forum_topics_guard before update on public.forum_topics
  for each row execute function public.forum_guard_topic();

-- Contatore risposte, ultima attività e notifiche a chi partecipa
create or replace function public.forum_on_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare t record;
begin
  update public.forum_topics
     set replies_count = replies_count + 1, last_activity_at = now()
   where id = new.topic_id
  returning * into t;
  begin
    insert into public.notifications (user_id, title, message, is_read)
    select distinct u.uid, 'Off topic · nuova risposta',
           coalesce(new.author_nome, 'Un collega') || ' ha risposto a "' || left(t.titolo, 80) || '"', false
    from (
      select t.author_id as uid
      union select r.author_id from public.forum_replies r where r.topic_id = new.topic_id
    ) u
    where u.uid <> new.author_id;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists forum_replies_after_insert on public.forum_replies;
create trigger forum_replies_after_insert after insert on public.forum_replies
  for each row execute function public.forum_on_reply();

create or replace function public.forum_on_reply_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.forum_topics set replies_count = greatest(replies_count - 1, 0) where id = old.topic_id;
  return old;
end $$;
drop trigger if exists forum_replies_after_delete on public.forum_replies;
create trigger forum_replies_after_delete after delete on public.forum_replies
  for each row execute function public.forum_on_reply_delete();

-- ================================================================
-- 20261106_sondaggi.sql
-- ================================================================
-- ARCHEA Platform · Sondaggi negli argomenti Off topic
-- Da eseguire dopo 20261106_offtopic.sql. Si può rieseguire.

create table if not exists public.forum_polls (
  topic_id   bigint primary key references public.forum_topics(id) on delete cascade,
  domanda    text not null check (char_length(btrim(domanda)) between 3 and 200),
  multipla   boolean not null default false,   -- true = si possono scegliere più risposte
  chiude_at  timestamptz,                      -- vuoto = sempre aperto
  created_at timestamptz not null default now()
);

create table if not exists public.forum_poll_options (
  id       bigserial primary key,
  topic_id bigint not null references public.forum_polls(topic_id) on delete cascade,
  testo    text not null check (char_length(btrim(testo)) between 1 and 120),
  ord      integer not null default 0
);
create index if not exists forum_poll_options_topic_idx on public.forum_poll_options (topic_id, ord);

create table if not exists public.forum_poll_votes (
  option_id  bigint not null references public.forum_poll_options(id) on delete cascade,
  topic_id   bigint not null references public.forum_polls(topic_id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_nome  text,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);
create index if not exists forum_poll_votes_topic_idx on public.forum_poll_votes (topic_id, user_id);

alter table public.forum_polls enable row level security;
alter table public.forum_poll_options enable row level security;
alter table public.forum_poll_votes enable row level security;

create or replace function public.forum_poll_open(tid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.forum_polls p join public.forum_topics t on t.id = p.topic_id
                 where p.topic_id = tid and not t.locked and (p.chiude_at is null or p.chiude_at > now()));
$$;
grant execute on function public.forum_poll_open(bigint) to authenticated;

-- Lettura per tutti; il sondaggio lo crea solo l'autore dell'argomento
drop policy if exists polls_read on public.forum_polls;
create policy polls_read on public.forum_polls for select to authenticated using (true);
drop policy if exists polls_insert on public.forum_polls;
create policy polls_insert on public.forum_polls for insert to authenticated
  with check (exists (select 1 from public.forum_topics t where t.id = topic_id and t.author_id = auth.uid()));
drop policy if exists polls_update on public.forum_polls;
create policy polls_update on public.forum_polls for update to authenticated
  using (exists (select 1 from public.forum_topics t where t.id = topic_id and t.author_id = auth.uid()));

drop policy if exists poll_opts_read on public.forum_poll_options;
create policy poll_opts_read on public.forum_poll_options for select to authenticated using (true);
drop policy if exists poll_opts_insert on public.forum_poll_options;
create policy poll_opts_insert on public.forum_poll_options for insert to authenticated
  with check (exists (select 1 from public.forum_topics t where t.id = topic_id and t.author_id = auth.uid()));

-- Voti: ognuno vota per sé finché il sondaggio è aperto; i voti sono visibili (chi viene alla festa)
drop policy if exists poll_votes_read on public.forum_poll_votes;
create policy poll_votes_read on public.forum_poll_votes for select to authenticated using (true);
drop policy if exists poll_votes_insert on public.forum_poll_votes;
create policy poll_votes_insert on public.forum_poll_votes for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.forum_poll_open(topic_id)
    and exists (select 1 from public.forum_poll_options o where o.id = option_id and o.topic_id = forum_poll_votes.topic_id)
  );
drop policy if exists poll_votes_delete on public.forum_poll_votes;
create policy poll_votes_delete on public.forum_poll_votes for delete to authenticated
  using (user_id = auth.uid() and public.forum_poll_open(topic_id));

grant select, insert, update on public.forum_polls to authenticated;
grant select, insert on public.forum_poll_options to authenticated;
grant select, insert, delete on public.forum_poll_votes to authenticated;
grant usage, select on sequence public.forum_poll_options_id_seq to authenticated;

-- Scelta singola: un nuovo voto sostituisce il precedente
create or replace function public.forum_poll_single_choice()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not (select multipla from public.forum_polls where topic_id = new.topic_id) then
    delete from public.forum_poll_votes where topic_id = new.topic_id and user_id = new.user_id and option_id <> new.option_id;
  end if;
  return new;
end $$;
drop trigger if exists forum_poll_votes_single on public.forum_poll_votes;
create trigger forum_poll_votes_single before insert on public.forum_poll_votes
  for each row execute function public.forum_poll_single_choice();

-- ================================================================
-- 20261106_utenti_gruppi.sql
-- ================================================================
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

-- ================================================================
-- 20261106_planimetrie.sql
-- ================================================================
-- ARCHEA Platform · Planimetrie disegnabili
-- Da eseguire dopo 20261106_utenti_gruppi.sql (oppure usa supabase/SETUP_COMPLETO.sql). Si può rieseguire.
--
-- Ogni pianta è un disegno (muri, stanze, porte, scrivanie, postazioni, WRKA, TV, accessori)
-- salvato come elenco di elementi. Le postazioni e le WRKA sono collegate alle righe di
-- map_positions tramite il codice (es. CAP-T01): persone e dispositivi restano dove sono già.

create table if not exists public.floor_plans (
  id              text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  nome            text not null,
  sede            text not null,
  prefisso        text,
  width           numeric not null default 1600 check (width between 200 and 20000),
  height          numeric not null default 1100 check (height between 200 and 20000),
  griglia         numeric not null default 10,
  sfondo          text,                 -- immagine da ricalcare (facoltativa)
  elements        jsonb not null default '[]'::jsonb check (jsonb_typeof(elements) = 'array'),
  ordine          integer not null default 0,
  updated_at      timestamptz not null default now(),
  updated_by_nome text
);

-- Nuovo permesso: disegnare e modificare le planimetrie
alter table public.access_groups drop constraint if exists access_groups_permessi_validi;
alter table public.access_groups add constraint access_groups_permessi_validi
  check (permessi <@ array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe', 'gestione_progetti']::text[]);

create or replace function public.my_permissions()
returns text[] language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
      then array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe']
    else coalesce((
      select array_agg(distinct perm) from public.access_group_members m
      join public.access_groups g on g.id = m.group_id, unnest(g.permessi) as perm
      where m.user_id = auth.uid()
    ), '{}')
  end;
$$;

update public.access_groups set permessi = array_append(permessi, 'gestione_mappe')
where nome = 'IT' and not ('gestione_mappe' = any (permessi));

alter table public.floor_plans enable row level security;
drop policy if exists plans_read on public.floor_plans;
create policy plans_read on public.floor_plans for select to authenticated using (true);
drop policy if exists plans_write on public.floor_plans;
create policy plans_write on public.floor_plans for all to authenticated
  using (public.has_perm('gestione_mappe') or public.is_it_staff())
  with check (public.has_perm('gestione_mappe') or public.is_it_staff());
grant select, insert, update, delete on public.floor_plans to authenticated;

-- ================================================================
-- 20261106_foto.sql
-- ================================================================
-- ARCHEA Platform · Foto (cantieri e Off topic) su Supabase Storage
-- Da eseguire dopo le altre migrazioni (oppure usa supabase/SETUP_COMPLETO.sql). Si può rieseguire.
--
-- Le foto stanno nel "bucket" privato "foto": nessun link pubblico. Il sito chiede
-- di volta in volta un link temporaneo (1 ora), solo per utenti autenticati.
-- Cartelle: cantiere/<anno>/<uuid>.jpg   offtopic/<anno>/<uuid>.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto', 'foto', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists foto_read on storage.objects;
create policy foto_read on storage.objects for select to authenticated
  using (bucket_id = 'foto');
drop policy if exists foto_upload on storage.objects;
create policy foto_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'foto' and (storage.foldername(name))[1] in ('cantiere', 'offtopic'));
drop policy if exists foto_delete on storage.objects;
create policy foto_delete on storage.objects for delete to authenticated
  using (bucket_id = 'foto' and (owner = auth.uid() or public.is_it_staff()));

-- Archivio delle foto di cantiere
create table if not exists public.site_photos (
  id          bigserial primary key,
  cantiere    text not null check (char_length(btrim(cantiere)) between 2 and 120),
  path        text not null unique,
  nota        text,
  taken_at    timestamptz not null default now(),
  lat         double precision,
  lng         double precision,
  author_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_nome text,
  created_at  timestamptz not null default now()
);
create index if not exists site_photos_cantiere_idx on public.site_photos (cantiere, taken_at desc);

alter table public.site_photos enable row level security;
drop policy if exists site_photos_read on public.site_photos;
create policy site_photos_read on public.site_photos for select to authenticated using (true);
drop policy if exists site_photos_insert on public.site_photos;
create policy site_photos_insert on public.site_photos for insert to authenticated
  with check (author_id = auth.uid());
drop policy if exists site_photos_update on public.site_photos;
create policy site_photos_update on public.site_photos for update to authenticated
  using (author_id = auth.uid() or public.is_it_staff()) with check (author_id = auth.uid() or public.is_it_staff());
drop policy if exists site_photos_delete on public.site_photos;
create policy site_photos_delete on public.site_photos for delete to authenticated
  using (author_id = auth.uid() or public.is_it_staff());
grant select, insert, update, delete on public.site_photos to authenticated;
grant usage, select on sequence public.site_photos_id_seq to authenticated;

-- Foto negli argomenti e nelle risposte di Off topic
alter table public.forum_topics  add column if not exists immagini text[] not null default '{}';
alter table public.forum_replies add column if not exists immagini text[] not null default '{}';

-- ================================================================
-- 20261107_utenti_dal_sito.sql
-- ================================================================
-- ARCHEA Platform · Gestione utenti dal sito, SENZA Edge Function
-- Da eseguire dopo 20261106_utenti_gruppi.sql (oppure usa supabase/SETUP_COMPLETO.sql).
-- Si può rieseguire senza danni.
--
-- Una sola funzione, public.admin_users(azione, dati), chiamata dal Service Desk
-- (Utenti e gruppi). Gira sul database con i diritti del proprietario, ma solo
-- chi ha il permesso "gestione_utenti" (o è SUPER_IT) può usarla.
--
-- Azioni: list, create, update, disable, enable, delete.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_users(p_action text, p jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  me_id     uuid := auth.uid();
  me_super  boolean;
  v_id      uuid;
  v_email   text;
  v_nome    text;
  v_ruolo   text;
  v_pwd     text;
  v_target  text;
  v_result  jsonb;
begin
  if me_id is null or not public.has_perm('gestione_utenti') then
    raise exception 'Non hai il permesso di gestire gli utenti';
  end if;
  me_super := exists (select 1 from public.profiles where id = me_id and ruolo = 'SUPER_IT');

  -- ---------- elenco: TUTTI gli account che possono accedere ----------
  if p_action = 'list' then
    select coalesce(jsonb_agg(x order by x->>'nome' nulls last, x->>'email'), '[]'::jsonb) into v_result
    from (
      select jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'nome', pr.nome,
        'ruolo', pr.ruolo,
        'has_profile', pr.id is not null,
        'confirmed', u.email_confirmed_at is not null,
        'invited', u.invited_at is not null and u.last_sign_in_at is null,
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'disabled', u.banned_until is not null and u.banned_until > now(),
        'gruppi', coalesce((select jsonb_agg(m.group_id) from public.access_group_members m where m.user_id = u.id), '[]'::jsonb)
      ) as x
      from auth.users u
      left join public.profiles pr on pr.id = u.id
      where u.deleted_at is null
    ) t;
    return jsonb_build_object('users', v_result);
  end if;

  -- ruolo richiesto (create / update)
  if p ? 'ruolo' then
    v_ruolo := coalesce(nullif(p->>'ruolo', ''), 'USER');
    if v_ruolo not in ('USER', 'HR', 'IT', 'SUPER_IT') then raise exception 'Ruolo non valido'; end if;
    if v_ruolo = 'SUPER_IT' and not me_super then raise exception 'Solo un SUPER_IT può nominare un altro SUPER_IT'; end if;
  end if;

  -- ---------- nuovo utente con password ----------
  if p_action = 'create' then
    v_email := lower(btrim(coalesce(p->>'email', '')));
    v_nome  := btrim(coalesce(p->>'nome', ''));
    v_pwd   := coalesce(p->>'password', '');
    if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Email non valida'; end if;
    if char_length(v_nome) < 2 then raise exception 'Scrivi nome e cognome'; end if;
    if coalesce((p->>'invite')::boolean, false) then
      raise exception 'L''invito per email richiede la Edge Function: scegli "Password temporanea"';
    end if;
    if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
    if exists (select 1 from auth.users where lower(email) = v_email) then
      raise exception 'Esiste già un account con questa email';
    end if;
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome', v_nome), now(), now(),
      '', '', '', '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      now(), now(), now());
    insert into public.profiles (id, email, nome, ruolo)
    values (v_id, v_email, v_nome, coalesce(v_ruolo, 'USER'))
    on conflict (id) do update set email = excluded.email, nome = excluded.nome, ruolo = excluded.ruolo;
    if p ? 'gruppi' then
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  -- da qui in poi serve l'utente
  v_id := nullif(p->>'id', '')::uuid;
  if v_id is null then raise exception 'Utente mancante'; end if;
  select pr.ruolo into v_target from public.profiles pr where pr.id = v_id;
  if v_target = 'SUPER_IT' and not me_super then raise exception 'Solo un SUPER_IT può modificare un SUPER_IT'; end if;

  -- ---------- modifica: nome, ruolo, password, gruppi ----------
  if p_action = 'update' then
    if v_id = me_id and v_ruolo is not null and v_ruolo is distinct from v_target then
      raise exception 'Non puoi cambiare il tuo ruolo';
    end if;
    select email into v_email from auth.users where id = v_id;
    if v_email is null then raise exception 'Utente non trovato'; end if;
    if p ? 'nome' or v_ruolo is not null then
      insert into public.profiles (id, email, nome, ruolo)
      values (v_id, v_email, nullif(btrim(coalesce(p->>'nome', '')), ''), coalesce(v_ruolo, v_target, 'USER'))
      on conflict (id) do update set
        nome  = coalesce(nullif(btrim(coalesce(p->>'nome', '')), ''), public.profiles.nome),
        ruolo = coalesce(v_ruolo, public.profiles.ruolo);
    end if;
    v_pwd := coalesce(p->>'password', '');
    if v_pwd <> '' then
      if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
      update auth.users set encrypted_password = extensions.crypt(v_pwd, extensions.gen_salt('bf')), updated_at = now()
      where id = v_id;
    end if;
    if p ? 'gruppi' then
      delete from public.access_group_members m
      where m.user_id = v_id
        and m.group_id not in (select g::bigint from jsonb_array_elements_text(p->'gruppi') g);
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- disattiva / riattiva: non entra più, lo storico resta ----------
  if p_action in ('disable', 'enable') then
    if v_id = me_id then raise exception 'Non puoi disattivare te stesso'; end if;
    update auth.users
       set banned_until = case when p_action = 'disable' then now() + interval '100 years' else null end,
           updated_at = now()
     where id = v_id;
    if p_action = 'disable' then delete from auth.sessions where user_id = v_id; end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- elimina ----------
  if p_action = 'delete' then
    if v_id = me_id then raise exception 'Non puoi eliminare te stesso'; end if;
    begin
      delete from public.access_group_members where user_id = v_id;
      delete from public.profiles where id = v_id;
      delete from auth.users where id = v_id;
    exception when foreign_key_violation then
      raise exception 'Impossibile eliminare: l''utente ha ticket o dati collegati. Usa "Disattiva": non potrà più accedere e lo storico resta.';
    end;
    return jsonb_build_object('ok', true);
  end if;

  raise exception 'Azione sconosciuta: %', p_action;
end $$;

revoke all on function public.admin_users(text, jsonb) from public, anon;
grant execute on function public.admin_users(text, jsonb) to authenticated;

-- I SUPER_IT hanno anche il permesso gestione_mappe (correzione di my_permissions)
create or replace function public.my_permissions()
returns text[] language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
      then array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe']
    else coalesce((
      select array_agg(distinct perm) from public.access_group_members m
      join public.access_groups g on g.id = m.group_id, unnest(g.permessi) as perm
      where m.user_id = auth.uid()
    ), '{}')
  end;
$$;

-- ================================================================
-- 20261107_scan_telefono.sql
-- ================================================================
-- ARCHEA Platform · iPhone come lettore di codici per il computer
-- Il telefono legge l'etichetta e scrive il codice qui; il computer della stessa persona lo legge e apre l'asset.
-- Si può rieseguire senza danni.

create table if not exists public.scan_relay (
  id         bigserial primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session    text not null check (char_length(session) between 8 and 64),
  code       text not null check (char_length(btrim(code)) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists scan_relay_user_session on public.scan_relay (user_id, session, id desc);

alter table public.scan_relay enable row level security;
drop policy if exists scan_relay_own on public.scan_relay;
create policy scan_relay_own on public.scan_relay for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, delete on public.scan_relay to authenticated;
grant usage, select on sequence public.scan_relay_id_seq to authenticated;

-- Le letture più vecchie di un giorno non servono più
delete from public.scan_relay where created_at < now() - interval '1 day';

-- ================================================================
-- 20261107_offtopic_modifica.sql
-- ================================================================
-- ARCHEA Platform · Off topic: modificare i propri argomenti e le proprie risposte
-- Si può rieseguire senza danni.
-- Solo l'autore può cambiare il testo (i moderatori possono mettere in evidenza, chiudere ed eliminare,
-- ma non riscrivere le parole degli altri). Dopo la modifica compare "modificato".

alter table public.forum_topics  add column if not exists edited_at timestamptz;
alter table public.forum_replies add column if not exists edited_at timestamptz;

-- Argomenti: regole di modifica (sostituisce la versione precedente della funzione)
create or replace function public.forum_guard_topic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if not public.has_perm('moderazione_offtopic') then
    new.pinned := old.pinned;
    new.locked := old.locked;
  end if;
  if old.author_id is distinct from auth.uid() then
    new.titolo := old.titolo;
    new.corpo := old.corpo;
    new.categoria := old.categoria;
    new.immagini := old.immagini;
  end if;
  if new.titolo is distinct from old.titolo or new.corpo is distinct from old.corpo or new.categoria is distinct from old.categoria then
    new.edited_at := now();
  else
    new.edited_at := old.edited_at;
  end if;
  new.author_id := old.author_id;
  new.author_nome := old.author_nome;
  new.created_at := old.created_at;
  new.replies_count := old.replies_count;
  return new;
end $$;

-- Risposte: l'autore può modificare il testo
create or replace function public.forum_guard_reply()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.id := old.id;
  new.topic_id := old.topic_id;
  new.author_id := old.author_id;
  new.author_nome := old.author_nome;
  new.created_at := old.created_at;
  new.edited_at := case when new.corpo is distinct from old.corpo then now() else old.edited_at end;
  return new;
end $$;
drop trigger if exists forum_replies_guard on public.forum_replies;
create trigger forum_replies_guard before update on public.forum_replies
  for each row execute function public.forum_guard_reply();

drop policy if exists forum_r_update on public.forum_replies;
create policy forum_r_update on public.forum_replies for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
grant update on public.forum_replies to authenticated;

-- ================================================================
-- 20261107_ruoli.sql
-- ================================================================
-- ARCHEA Platform · Ruoli: chi fa cosa
-- Si può rieseguire senza danni. Sostituisce la funzione admin_users con regole più strette.
--
--   USER      apre ticket e segue le sue task
--   HR        + persone, movimenti (ingressi, uscite, spostamenti), planimetrie
--   IT        + gestione IT (coda, censimento, dashboard) e creazione utenti USER e HR
--   SUPER_IT  tutto, compresi gli account IT, i gruppi che gestiscono gli utenti e la console sviluppatore

create or replace function public.admin_users(p_action text, p jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  me_id     uuid := auth.uid();
  me_super  boolean;
  v_id      uuid;
  v_email   text;
  v_nome    text;
  v_ruolo   text;
  v_pwd     text;
  v_target  text;
  v_result  jsonb;
begin
  if me_id is null or not public.has_perm('gestione_utenti') then
    raise exception 'Non hai il permesso di gestire gli utenti';
  end if;
  me_super := exists (select 1 from public.profiles where id = me_id and ruolo = 'SUPER_IT');

  -- ---------- elenco: TUTTI gli account che possono accedere ----------
  if p_action = 'list' then
    select coalesce(jsonb_agg(x order by x->>'nome' nulls last, x->>'email'), '[]'::jsonb) into v_result
    from (
      select jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'nome', pr.nome,
        'ruolo', pr.ruolo,
        'has_profile', pr.id is not null,
        'confirmed', u.email_confirmed_at is not null,
        'invited', u.invited_at is not null and u.last_sign_in_at is null,
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'disabled', u.banned_until is not null and u.banned_until > now(),
        'gruppi', coalesce((select jsonb_agg(m.group_id) from public.access_group_members m where m.user_id = u.id), '[]'::jsonb)
      ) as x
      from auth.users u
      left join public.profiles pr on pr.id = u.id
      where u.deleted_at is null
    ) t;
    return jsonb_build_object('users', v_result);
  end if;

  -- ruolo richiesto (create / update)
  if p ? 'ruolo' then
    v_ruolo := coalesce(nullif(p->>'ruolo', ''), 'USER');
    if v_ruolo not in ('USER', 'HR', 'IT', 'SUPER_IT') then raise exception 'Ruolo non valido'; end if;
    if v_ruolo in ('IT', 'SUPER_IT') and not me_super then raise exception 'Solo il super admin può dare il ruolo IT o super admin'; end if;
  end if;

  -- ---------- nuovo utente con password ----------
  if p_action = 'create' then
    v_email := lower(btrim(coalesce(p->>'email', '')));
    v_nome  := btrim(coalesce(p->>'nome', ''));
    v_pwd   := coalesce(p->>'password', '');
    if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Email non valida'; end if;
    if char_length(v_nome) < 2 then raise exception 'Scrivi nome e cognome'; end if;
    if coalesce((p->>'invite')::boolean, false) then
      raise exception 'L''invito per email richiede la Edge Function: scegli "Password temporanea"';
    end if;
    if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
    if exists (select 1 from auth.users where lower(email) = v_email) then
      raise exception 'Esiste già un account con questa email';
    end if;
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome', v_nome), now(), now(),
      '', '', '', '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      now(), now(), now());
    insert into public.profiles (id, email, nome, ruolo)
    values (v_id, v_email, v_nome, coalesce(v_ruolo, 'USER'))
    on conflict (id) do update set email = excluded.email, nome = excluded.nome, ruolo = excluded.ruolo;
    if p ? 'gruppi' then
    if not me_super and exists (
      select 1 from public.access_groups g
      where 'gestione_utenti' = any (g.permessi)
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x)
             or g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x))
            is distinct from (g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
    ) then
      raise exception 'Solo il super admin può aggiungere o togliere persone dai gruppi che gestiscono gli utenti';
    end if;
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    -- chi diventa IT entra da solo nel gruppo IT (che dà i permessi del reparto)
    if v_ruolo = 'IT' then
      insert into public.access_group_members (group_id, user_id)
      select g.id, v_id from public.access_groups g where g.nome = 'IT'
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  -- da qui in poi serve l'utente
  v_id := nullif(p->>'id', '')::uuid;
  if v_id is null then raise exception 'Utente mancante'; end if;
  select pr.ruolo into v_target from public.profiles pr where pr.id = v_id;
  -- gli account IT e super admin li gestisce solo il super admin (ognuno può cambiare nome e password propri)
  if v_target in ('IT', 'SUPER_IT') and not me_super and v_id <> me_id then
    raise exception 'Gli account IT li gestisce solo il super admin';
  end if;

  -- ---------- modifica: nome, ruolo, password, gruppi ----------
  if p_action = 'update' then
    if v_id = me_id and v_ruolo is not null and v_ruolo is distinct from v_target then
      raise exception 'Non puoi cambiare il tuo ruolo';
    end if;
    select email into v_email from auth.users where id = v_id;
    if v_email is null then raise exception 'Utente non trovato'; end if;
    if p ? 'nome' or v_ruolo is not null then
      insert into public.profiles (id, email, nome, ruolo)
      values (v_id, v_email, nullif(btrim(coalesce(p->>'nome', '')), ''), coalesce(v_ruolo, v_target, 'USER'))
      on conflict (id) do update set
        nome  = coalesce(nullif(btrim(coalesce(p->>'nome', '')), ''), public.profiles.nome),
        ruolo = coalesce(v_ruolo, public.profiles.ruolo);
    end if;
    v_pwd := coalesce(p->>'password', '');
    if v_pwd <> '' then
      if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
      update auth.users set encrypted_password = extensions.crypt(v_pwd, extensions.gen_salt('bf')), updated_at = now()
      where id = v_id;
    end if;
    if p ? 'gruppi' then
    if not me_super and exists (
      select 1 from public.access_groups g
      where 'gestione_utenti' = any (g.permessi)
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x)
             or g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x))
            is distinct from (g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
    ) then
      raise exception 'Solo il super admin può aggiungere o togliere persone dai gruppi che gestiscono gli utenti';
    end if;
      delete from public.access_group_members m
      where m.user_id = v_id
        and m.group_id not in (select g::bigint from jsonb_array_elements_text(p->'gruppi') g);
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    -- chi diventa IT entra da solo nel gruppo IT (che dà i permessi del reparto)
    if v_ruolo = 'IT' then
      insert into public.access_group_members (group_id, user_id)
      select g.id, v_id from public.access_groups g where g.nome = 'IT'
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- disattiva / riattiva: non entra più, lo storico resta ----------
  if p_action in ('disable', 'enable') then
    if v_id = me_id then raise exception 'Non puoi disattivare te stesso'; end if;
    update auth.users
       set banned_until = case when p_action = 'disable' then now() + interval '100 years' else null end,
           updated_at = now()
     where id = v_id;
    if p_action = 'disable' then delete from auth.sessions where user_id = v_id; end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- elimina ----------
  if p_action = 'delete' then
    if v_id = me_id then raise exception 'Non puoi eliminare te stesso'; end if;
    begin
      delete from public.access_group_members where user_id = v_id;
      delete from public.profiles where id = v_id;
      delete from auth.users where id = v_id;
    exception when foreign_key_violation then
      raise exception 'Impossibile eliminare: l''utente ha ticket o dati collegati. Usa "Disattiva": non potrà più accedere e lo storico resta.';
    end;
    return jsonb_build_object('ok', true);
  end if;

  raise exception 'Azione sconosciuta: %', p_action;
end $$;

revoke all on function public.admin_users(text, jsonb) from public, anon;
grant execute on function public.admin_users(text, jsonb) to authenticated;

-- I gruppi che danno "gestione utenti" li modifica solo il super admin
create or replace function public.is_super_it()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT');
$$;
revoke all on function public.is_super_it() from public, anon;
grant execute on function public.is_super_it() to authenticated;

drop policy if exists groups_manage on public.access_groups;
create policy groups_manage on public.access_groups for all to authenticated
  using (public.has_perm('gestione_utenti') and (public.is_super_it() or not ('gestione_utenti' = any (permessi))))
  with check (public.has_perm('gestione_utenti') and (public.is_super_it() or not ('gestione_utenti' = any (permessi))));

drop policy if exists members_manage on public.access_group_members;
create policy members_manage on public.access_group_members for all to authenticated
  using (public.has_perm('gestione_utenti') and (public.is_super_it()
         or not exists (select 1 from public.access_groups g where g.id = group_id and 'gestione_utenti' = any (g.permessi))))
  with check (public.has_perm('gestione_utenti') and (public.is_super_it()
         or not exists (select 1 from public.access_groups g where g.id = group_id and 'gestione_utenti' = any (g.permessi))));

-- Il ruolo IT o super admin lo assegna solo il super admin (anche fuori dal sito)
create or replace function public.profiles_guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ruolo is distinct from old.ruolo and auth.uid() is not null then
    if not public.has_perm('gestione_utenti') then
      raise exception 'Non hai il permesso di cambiare il ruolo';
    end if;
    if (new.ruolo in ('IT', 'SUPER_IT') or old.ruolo in ('IT', 'SUPER_IT')) and not public.is_super_it() then
      raise exception 'Il ruolo IT o super admin lo cambia solo il super admin';
    end if;
  end if;
  return new;
end $$;

-- Tutti gli IT e super admin di oggi stanno nel gruppo IT
insert into public.access_group_members (group_id, user_id)
select g.id, p.id from public.access_groups g, public.profiles p
where g.nome = 'IT' and p.ruolo in ('IT', 'SUPER_IT')
on conflict do nothing;

-- ================================================================
-- 20261107_progetti_task.sql
-- ================================================================
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
  check (collection in ('progetti', 'task', 'ore', 'note', 'team', 'staff'));

-- 3) Funzioni di controllo
create or replace function public.ws_is_pm()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_progetti');
$$;

-- HR e super admin: gli unici che vedono e modificano i dati dell'Organico (contratti, compensi)
create or replace function public.ws_is_hr()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo in ('HR', 'SUPER_IT'));
$$;
revoke all on function public.ws_is_hr() from public, anon;
grant execute on function public.ws_is_hr() to authenticated;

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
  case when collection = 'staff' then public.ws_is_hr() else (
  collection in ('progetti', 'note', 'team')
  or public.ws_is_pm()
  or created_by = auth.uid()
  or (collection = 'task' and public.ws_assigned_to_me(data->>'assegnatario'))
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  ) end
);

drop policy if exists ws_insert on public.ws_records;
create policy ws_insert on public.ws_records for insert to authenticated with check (
  case when collection = 'staff' then public.ws_is_hr() else (
  public.ws_is_pm()
  or collection = 'note'
  -- task personale: assegnata solo a sé stessi
  or (collection = 'task' and lower(btrim(data->>'assegnatario')) = public.ws_my_name())
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  ) end
);

drop policy if exists ws_update on public.ws_records;
create policy ws_update on public.ws_records for update to authenticated
  using (
    case when collection = 'staff' then public.ws_is_hr() else (
    public.ws_is_pm()
    or (collection = 'task' and public.ws_assigned_to_me(data->>'assegnatario'))
    or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
    or (collection = 'note' and created_by = auth.uid())
    ) end
  )
  with check (
    case when collection = 'staff' then public.ws_is_hr() else (
    public.ws_is_pm()
    or collection in ('task', 'note')
    or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
    ) end
  );

drop policy if exists ws_delete on public.ws_records;
create policy ws_delete on public.ws_records for delete to authenticated using (
  case when collection = 'staff' then public.ws_is_hr() else (
  public.ws_is_pm()
  or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  or (collection = 'note' and created_by = auth.uid())
  ) end
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

-- ================================================================
-- 20261107_chat_gruppi.sql
-- ================================================================
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

-- ================================================================
-- 20261108_push.sql
-- ================================================================
-- ARCHEA Platform · Notifiche vere del browser (Web Push), anche a sito chiuso
-- Si può rieseguire senza danni.
--
-- Come funziona:
--   1. ogni dispositivo che attiva le notifiche salva qui il suo "indirizzo" (push_subscriptions)
--   2. quando nasce una riga in notifications, il database chiama la Edge Function "push"
--   3. la Edge Function cifra il messaggio e lo manda a Chrome / Safari / Edge / Firefox,
--      che lo mostrano come notifica del sistema (anche con il sito chiuso)
-- Le chiavi VAPID le crea il sito da solo la prima volta che entra un Super admin:
-- la chiave privata resta solo nel database (nessuno la può leggere dal sito) e nella Edge Function.

do $$ begin
  create extension if not exists pg_net with schema extensions;
exception when others then
  raise notice 'pg_net non disponibile: attivalo da Database → Extensions → pg_net';
end $$;

create table if not exists public.push_subscriptions (
  id         bigserial primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint   text not null unique check (char_length(endpoint) between 10 and 1000),
  p256dh     text not null check (char_length(p256dh) between 10 and 200),
  auth       text not null check (char_length(auth) between 8 and 100),
  device     text,
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_own on public.push_subscriptions;
create policy push_own on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant usage, select on sequence public.push_subscriptions_id_seq to authenticated;

-- salva l'iscrizione di questo dispositivo per chi è entrato (un dispositivo = l'ultimo che vi è entrato)
create or replace function public.push_claim(p_endpoint text, p_p256dh text, p_auth text, p_device text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  if p_endpoint !~ '^https://' then raise exception 'Indirizzo non valido'; end if;
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id <> auth.uid();
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, device)
    values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_device, 80))
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, device = excluded.device, last_seen = now();
end $$;
revoke all on function public.push_claim(text, text, text, text) from public, anon;
grant execute on function public.push_claim(text, text, text, text) to authenticated;

-- Configurazione: una sola riga, nessun accesso dal sito (solo funzioni qui sotto e la Edge Function)
create table if not exists public.push_config (
  id           int primary key default 1 check (id = 1),
  public_key   text,
  private_key  text,
  function_url text,
  hook_secret  text not null default md5(random()::text || clock_timestamp()::text) || md5(random()::text),
  updated_at   timestamptz not null default now()
);
alter table public.push_config enable row level security;
revoke all on public.push_config from anon, authenticated;

-- chiave pubblica: serve a ogni dispositivo per iscriversi
create or replace function public.push_public_key()
returns text language sql stable security definer set search_path = public as $$
  select public_key from public.push_config where id = 1;
$$;

-- prima configurazione (solo Super admin). Non sovrascrive chiavi già presenti, salvo p_force.
create or replace function public.push_setup(p_public text, p_private text, p_url text, p_force boolean default false)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT') then
    raise exception 'Solo il Super admin può configurare le notifiche';
  end if;
  if p_public !~ '^[A-Za-z0-9_-]{80,100}$' or p_private !~ '^[A-Za-z0-9_-]{40,50}$' or p_url !~ '^https://' then
    raise exception 'Dati non validi';
  end if;
  insert into public.push_config (id) values (1) on conflict (id) do nothing;
  if p_force then
    update public.push_config set public_key = p_public, private_key = p_private, function_url = p_url, updated_at = now() where id = 1;
    delete from public.push_subscriptions; -- con chiavi nuove le vecchie iscrizioni non valgono più
    return 'rigenerate';
  end if;
  update public.push_config set function_url = p_url, updated_at = now() where id = 1;
  update public.push_config set public_key = p_public, private_key = p_private where id = 1 and public_key is null;
  return 'ok';
end $$;

-- stato per la pagina di controllo (solo Super admin)
create or replace function public.push_status()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT') then
    return jsonb_build_object('admin', false);
  end if;
  return jsonb_build_object('admin', true,
    'keys', exists (select 1 from public.push_config where id = 1 and public_key is not null),
    'url', (select function_url from public.push_config where id = 1),
    'devices', (select count(*) from public.push_subscriptions),
    'people', (select count(distinct user_id) from public.push_subscriptions));
end $$;

revoke all on function public.push_public_key(), public.push_setup(text, text, text, boolean), public.push_status() from public, anon;
grant execute on function public.push_public_key(), public.push_setup(text, text, text, boolean), public.push_status() to authenticated;

-- A ogni notifica nuova: chiama la Edge Function (in coda, non rallenta e non blocca mai l'inserimento)
create or replace function public.push_on_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record;
begin
  select function_url, hook_secret into c from public.push_config where id = 1 and public_key is not null and function_url is not null;
  if c.function_url is null then return new; end if;
  if not exists (select 1 from public.push_subscriptions where user_id = new.user_id) then return new; end if;
  begin
    perform net.http_post(
      url := c.function_url,
      body := jsonb_build_object('id', new.id, 'user_id', new.user_id, 'title', new.title, 'message', new.message, 'ticket_id', new.ticket_id),
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-archea-hook', c.hook_secret),
      timeout_milliseconds := 8000);
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists push_on_notification on public.notifications;
create trigger push_on_notification after insert on public.notifications
  for each row execute function public.push_on_notification();
