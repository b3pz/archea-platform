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

-- ================================================================
-- 20261108_licenze_fornitori.sql
-- ================================================================
-- ARCHEA Platform · Rubrica fornitori + licenze e programmi della persona
-- Si può rieseguire senza danni.
--
--   suppliers       rubrica fornitori. La leggono tutti; la modificano:
--                   IT (fornitori IT), PM (fornitori di progetto), Super admin (tutto)
--   person_software licenze, programmi e account assegnati a una persona (lato IT),
--                   con fornitore, scadenza e computer su cui sono installati.
--                   La vede e la modifica solo l'IT. NON si salvano le chiavi di licenza.

create or replace function public.is_it_role()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo in ('IT', 'SUPER_IT'));
$$;
revoke all on function public.is_it_role() from public, anon;
grant execute on function public.is_it_role() to authenticated;

-- ---------- Rubrica fornitori ----------
create table if not exists public.suppliers (
  id          bigserial primary key,
  nome        text not null check (char_length(btrim(nome)) between 2 and 160),
  categoria   text,
  ambito      text not null default 'ENTRAMBI' check (ambito in ('IT', 'PROGETTI', 'ENTRAMBI')),
  referente   text,
  telefono    text,
  email       text,
  sito        text,
  indirizzo   text,
  partita_iva text,
  note        text,
  progetti    text[] not null default '{}',   -- codici commessa (es. P51) per i fornitori di progetto
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists suppliers_nome on public.suppliers (lower(nome));
alter table public.suppliers enable row level security;

create or replace function public.supplier_can_edit(p_ambito text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
      or (public.is_it_role() and p_ambito in ('IT', 'ENTRAMBI'))
      or (public.has_perm('gestione_progetti') and p_ambito in ('PROGETTI', 'ENTRAMBI'));
$$;
revoke all on function public.supplier_can_edit(text) from public, anon;
grant execute on function public.supplier_can_edit(text) to authenticated;

drop policy if exists sup_read on public.suppliers;
create policy sup_read on public.suppliers for select to authenticated using (true);
drop policy if exists sup_insert on public.suppliers;
create policy sup_insert on public.suppliers for insert to authenticated with check (public.supplier_can_edit(ambito));
drop policy if exists sup_update on public.suppliers;
create policy sup_update on public.suppliers for update to authenticated
  using (public.supplier_can_edit(ambito)) with check (public.supplier_can_edit(ambito));
drop policy if exists sup_delete on public.suppliers;
create policy sup_delete on public.suppliers for delete to authenticated using (public.supplier_can_edit(ambito));
grant select, insert, update, delete on public.suppliers to authenticated;
grant usage, select on sequence public.suppliers_id_seq to authenticated;

-- ---------- Licenze e programmi della persona ----------
create table if not exists public.person_software (
  id          bigserial primary key,
  person_id   bigint not null references public.people(id) on delete cascade,
  tipo        text not null default 'LICENZA' check (tipo in ('LICENZA', 'PROGRAMMA', 'ACCOUNT')),
  nome        text not null check (char_length(btrim(nome)) between 1 and 160),
  versione    text,
  supplier_id bigint references public.suppliers(id) on delete set null,
  riferimento text,                          -- n. contratto / ordine / utente: MAI la chiave di licenza
  asset_id    bigint references public.assets(id) on delete set null,
  data_inizio date,
  scadenza    date,
  stato       text not null default 'ATTIVA' check (stato in ('ATTIVA', 'SCADUTA', 'DISMESSA')),
  note        text,
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists person_software_person on public.person_software (person_id);
create index if not exists person_software_scadenza on public.person_software (scadenza) where stato = 'ATTIVA';
alter table public.person_software enable row level security;
drop policy if exists psw_it on public.person_software;
create policy psw_it on public.person_software for all to authenticated
  using (public.is_it_role()) with check (public.is_it_role());
grant select, insert, update, delete on public.person_software to authenticated;
grant usage, select on sequence public.person_software_id_seq to authenticated;

-- ================================================================
-- 20261108_fornitori_tutti.sql
-- ================================================================
-- ARCHEA Platform · Rubrica fornitori aperta a tutti, con traccia di chi modifica
-- Si può rieseguire senza danni. Richiede licenze_fornitori.
--
-- Tutti gli account possono aggiungere e correggere fornitori: si vede sempre chi l'ha
-- creato e chi l'ha modificato per ultimo. Eliminare resta a chi l'ha creato, all'IT
-- (fornitori IT), ai PM (fornitori di progetto) e al Super admin.

alter table public.suppliers add column if not exists created_by_name text;
alter table public.suppliers add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.suppliers add column if not exists updated_by_name text;

create or replace function public.suppliers_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select coalesce(nullif(nome, ''), email) into who from public.profiles where id = auth.uid();
  if tg_op = 'INSERT' then
    new.created_by := auth.uid(); new.created_by_name := who; new.created_at := now();
  else
    new.created_by := old.created_by; new.created_by_name := old.created_by_name; new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid(); new.updated_by_name := who; new.updated_at := now();
  return new;
end $$;
drop trigger if exists suppliers_stamp on public.suppliers;
create trigger suppliers_stamp before insert or update on public.suppliers
  for each row execute function public.suppliers_stamp();

drop policy if exists sup_insert on public.suppliers;
create policy sup_insert on public.suppliers for insert to authenticated with check (auth.uid() is not null);
drop policy if exists sup_update on public.suppliers;
create policy sup_update on public.suppliers for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists sup_delete on public.suppliers;
create policy sup_delete on public.suppliers for delete to authenticated
  using (created_by = auth.uid() or public.supplier_can_edit(ambito));

-- ================================================================
-- 20261108_sottochat.sql
-- ================================================================
-- ARCHEA Platform · Sottochat di progetto
-- Si può rieseguire senza danni. Richiede chat_gruppi.
--
-- Dentro la chat di un progetto chiunque ne faccia parte può aprire una SOTTOCHAT e invitarci
-- anche colleghi che non sono nella squadra (collaborazioni), senza toccare la chat di base
-- che resta legata alla squadra del progetto.

alter table public.chat_groups add column if not exists parent_id bigint references public.chat_groups(id) on delete cascade;
alter table public.chat_groups drop constraint if exists chat_groups_tipo_check;
alter table public.chat_groups add constraint chat_groups_tipo_check check (tipo in ('GRUPPO', 'PROGETTO', 'SOTTOGRUPPO'));
alter table public.chat_groups drop constraint if exists chat_groups_sotto_parent;
alter table public.chat_groups add constraint chat_groups_sotto_parent check ((tipo = 'SOTTOGRUPPO') = (parent_id is not null));
create index if not exists chat_groups_parent on public.chat_groups (parent_id);

-- chi crea un gruppo o una sottochat la gestisce (nome, persone, eliminazione)
create or replace function public.chat_is_group_admin(gid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_groups g where g.id = gid and g.tipo in ('GRUPPO', 'SOTTOGRUPPO') and g.created_by = auth.uid());
$$;

create or replace function public.chat_is_project(gid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_groups g where g.id = gid and g.tipo = 'PROGETTO');
$$;
revoke all on function public.chat_is_project(bigint) from public, anon;
grant execute on function public.chat_is_project(bigint) to authenticated;

drop policy if exists cg_insert on public.chat_groups;
create policy cg_insert on public.chat_groups for insert to authenticated with check (
  created_by = auth.uid() and progetto_codice is null and (
    (tipo = 'GRUPPO' and parent_id is null)
    or (tipo = 'SOTTOGRUPPO' and public.chat_is_member(parent_id) and public.chat_is_project(parent_id))
  )
);
drop policy if exists cg_update on public.chat_groups;
create policy cg_update on public.chat_groups for update to authenticated
  using (tipo in ('GRUPPO', 'SOTTOGRUPPO') and created_by = auth.uid())
  with check (tipo in ('GRUPPO', 'SOTTOGRUPPO') and created_by = auth.uid());
drop policy if exists cg_delete on public.chat_groups;
create policy cg_delete on public.chat_groups for delete to authenticated
  using (tipo in ('GRUPPO', 'SOTTOGRUPPO') and created_by = auth.uid());

drop policy if exists cgm_delete on public.chat_group_members;
create policy cgm_delete on public.chat_group_members for delete to authenticated
  using (public.chat_is_group_admin(group_id)
         or (user_id = auth.uid() and exists (select 1 from public.chat_groups g where g.id = group_id and g.tipo in ('GRUPPO', 'SOTTOGRUPPO'))));

-- ================================================================
-- 20261107_gruppi_operativi.sql
-- ================================================================
-- ARCHEA Platform · Gruppi operativi cumulabili e Super IT tecnico.
-- La migrazione conserva i gruppi già assegnati, trasferisce IT/HR storici nei gruppi
-- corrispondenti e limita il PM ai progetti in cui compare la sua squadra.

alter table public.access_groups drop constraint if exists access_groups_permessi_validi;
alter table public.access_groups add constraint access_groups_permessi_validi
  check (permessi <@ array[
    'gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe',
    'gestione_progetti', 'gestione_it', 'gestione_hr'
  ]::text[]);

-- Mantiene gli ID dei gruppi già usati; i permessi restano la fonte delle autorizzazioni.
update public.access_groups set nome = 'PM'
where nome = 'Project Manager' and not exists (select 1 from public.access_groups where nome = 'PM');

-- Se il gruppo PM era già stato creato separatamente, consolida le appartenenze prima di rimuovere il vecchio contenitore.
insert into public.access_group_members (group_id, user_id)
select pm.id, m.user_id from public.access_groups old
join public.access_groups pm on pm.nome = 'PM'
join public.access_group_members m on m.group_id = old.id
where old.nome = 'Project Manager'
on conflict do nothing;
delete from public.access_groups old where old.nome = 'Project Manager'
  and exists (select 1 from public.access_groups pm where pm.nome = 'PM');

insert into public.access_groups (nome, descrizione, permessi) values
  ('IT', 'Operatività del reparto IT e gestione account ordinari', array['gestione_utenti', 'gestione_it', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe']),
  ('HR', 'Gestione operativa delle persone e delle planimetrie', array['gestione_hr', 'gestione_mappe']),
  ('PM', 'Progetti, task e ore delle squadre assegnate', array['gestione_progetti'])
on conflict (nome) do update set descrizione = excluded.descrizione, permessi = excluded.permessi;

-- Completa i gruppi preesistenti senza cancellare le appartenenze aggiuntive (es. IT + PM).
update public.access_groups set
  descrizione = 'Operatività del reparto IT e gestione account ordinari',
  permessi = array['gestione_utenti', 'gestione_it', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe']
where nome = 'IT';
update public.access_groups set
  descrizione = 'Gestione operativa delle persone e delle planimetrie',
  permessi = array['gestione_hr', 'gestione_mappe']
where nome = 'HR';
update public.access_groups set
  descrizione = 'Progetti, task e ore delle squadre assegnate',
  permessi = array['gestione_progetti']
where nome = 'PM';

-- Mappa i profili operativi esistenti nei gruppi prima di riportare il campo legacy a USER.
insert into public.access_group_members (group_id, user_id)
select g.id, p.id from public.access_groups g cross join public.profiles p
where (g.nome = 'IT' and p.ruolo = 'IT') or (g.nome = 'HR' and p.ruolo = 'HR')
on conflict do nothing;

-- SUPER_IT è amministrazione tecnica: rimuove soltanto le appartenenze operative automatiche.
delete from public.access_group_members m
using public.profiles p, public.access_groups g
where m.user_id = p.id and m.group_id = g.id and p.ruolo = 'SUPER_IT'
  and g.nome in ('IT', 'PM');

update public.profiles set ruolo = 'USER' where ruolo in ('IT', 'HR');

create or replace function public.has_perm(p text)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    (p = 'gestione_utenti' and exists (
      select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT'
    ))
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
  select coalesce(array_agg(distinct perm), '{}'::text[])
  from (
    select unnest(g.permessi) as perm
    from public.access_group_members m
    join public.access_groups g on g.id = m.group_id
    where m.user_id = auth.uid()
    union all
    select 'gestione_utenti'
    where exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT')
  ) p;
$$;
revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated;

-- Gruppi di sistema: IT e HR possono mantenere account ordinari, ma solo SUPER_IT
-- può concedere/rimuovere permessi o cambiare la composizione dei gruppi privilegiati.
create or replace function public.access_groups_guard_privileged()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_super_it() then
    if tg_op = 'DELETE' and cardinality(old.permessi) > 0 then
      raise exception 'Solo SUPER_IT può modificare gruppi con permessi';
    elsif tg_op = 'INSERT' and cardinality(new.permessi) > 0 then
      raise exception 'Solo SUPER_IT può modificare gruppi con permessi';
    elsif tg_op = 'UPDATE' and (cardinality(old.permessi) > 0 or cardinality(new.permessi) > 0) then
      raise exception 'Solo SUPER_IT può modificare gruppi con permessi';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
revoke all on function public.access_groups_guard_privileged() from public, anon, authenticated;
drop trigger if exists access_groups_guard_privileged on public.access_groups;
create trigger access_groups_guard_privileged before insert or update or delete on public.access_groups
for each row execute function public.access_groups_guard_privileged();

create or replace function public.access_group_members_guard_privileged()
returns trigger language plpgsql security definer set search_path = public as $$
declare old_privileged boolean := false; new_privileged boolean := false;
begin
  if tg_op <> 'INSERT' then
    select cardinality(g.permessi) > 0 into old_privileged
    from public.access_groups g where g.id = old.group_id;
  end if;
  if tg_op <> 'DELETE' then
    select cardinality(g.permessi) > 0 into new_privileged
    from public.access_groups g where g.id = new.group_id;
  end if;
  if auth.uid() is not null and not public.is_super_it() and (coalesce(old_privileged, false) or coalesce(new_privileged, false)) then
    raise exception 'Solo SUPER_IT può assegnare gruppi con permessi';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
revoke all on function public.access_group_members_guard_privileged() from public, anon, authenticated;
drop trigger if exists access_group_members_guard_privileged on public.access_group_members;
create trigger access_group_members_guard_privileged before insert or update or delete on public.access_group_members
for each row execute function public.access_group_members_guard_privileged();

-- Il campo ruolo ora distingue soltanto account ordinari e amministratori tecnici.
create or replace function public.profiles_guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.ruolo is distinct from old.ruolo then
    if new.ruolo not in ('USER', 'SUPER_IT') then
      raise exception 'IT, HR e PM si assegnano tramite gruppi';
    end if;
    if new.ruolo = 'SUPER_IT' and not public.is_super_it() then
      raise exception 'Solo SUPER_IT può nominare un altro SUPER_IT';
    end if;
    if old.ruolo = 'SUPER_IT' and not public.is_super_it() then
      raise exception 'Solo SUPER_IT può modificare un SUPER_IT';
    end if;
  end if;
  return new;
end $$;

create or replace function public.profiles_guard_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.ruolo not in ('USER', 'SUPER_IT') then
    raise exception 'IT, HR e PM si assegnano tramite gruppi';
  end if;
  if auth.uid() is not null and new.ruolo = 'SUPER_IT' and not public.is_super_it() then
    raise exception 'Solo SUPER_IT può nominare un altro SUPER_IT';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_insert on public.profiles;
create trigger profiles_guard_insert before insert on public.profiles
for each row execute function public.profiles_guard_insert();
revoke all on function public.profiles_guard_role(), public.profiles_guard_insert() from public, anon;

-- I vecchi helper continuano a funzionare, ma leggono i gruppi, non il testo del profilo.
create or replace function public.is_it_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_it');
$$;
create or replace function public.is_it_role()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_it');
$$;
create or replace function public.is_it()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_it');
$$;
create or replace function public.is_hr()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_hr');
$$;
create or replace function public.ws_is_hr()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_hr');
$$;
revoke all on function public.is_it_staff(), public.is_it_role(), public.is_it(), public.is_hr(), public.ws_is_hr() from public, anon;
grant execute on function public.is_it_staff(), public.is_it_role(), public.is_it(), public.is_hr(), public.ws_is_hr() to authenticated;

-- In Workspace ogni record team è {id: codice progetto, persone: [UUID]}.
create or replace function public.ws_pm_in_project(p_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and public.has_perm('gestione_progetti') and exists (
    select 1 from public.ws_records t
    where t.collection = 'team' and t.id = p_code and coalesce(t.data->'persone', '[]'::jsonb) ? auth.uid()::text
  );
$$;
create or replace function public.ws_pm_can_manage_project(p_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.ws_pm_in_project(p_code) or (
    auth.uid() is not null and public.has_perm('gestione_progetti') and exists (
      select 1 from public.ws_records p
      where p.collection = 'progetti' and p.id = p_code and p.created_by = auth.uid()
    )
  );
$$;
revoke all on function public.ws_pm_in_project(text), public.ws_pm_can_manage_project(text) from public, anon;
grant execute on function public.ws_pm_in_project(text), public.ws_pm_can_manage_project(text) to authenticated;

create or replace function public.ws_is_pm()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('gestione_progetti');
$$;
revoke all on function public.ws_is_pm() from public, anon;
grant execute on function public.ws_is_pm() to authenticated;

drop policy if exists ws_read on public.ws_records;
create policy ws_read on public.ws_records for select to authenticated using (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' and public.ws_is_pm() then public.ws_pm_can_manage_project(id)
    when collection = 'team' and public.ws_is_pm() then public.ws_pm_can_manage_project(id)
    when collection = 'task' and public.ws_is_pm() then public.ws_pm_in_project(data->>'progettoCodice')
    when collection = 'ore' and public.ws_is_pm() then public.ws_pm_in_project(data->>'progettoCodice')
    when collection = 'note' and public.ws_is_pm() then public.ws_pm_in_project(data->>'progettoCodice')
    else collection in ('progetti', 'note', 'team')
      or created_by = auth.uid()
      or (collection = 'task' and public.ws_assigned_to_me(data->>'assegnatario'))
      or (collection = 'ore' and lower(btrim(data->>'persona')) = public.ws_my_name())
  end
);

drop policy if exists ws_insert on public.ws_records;
create policy ws_insert on public.ws_records for insert to authenticated with check (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.ws_is_pm()
    when collection = 'team' then public.ws_is_pm()
    when collection = 'task' then (public.ws_is_pm() and public.ws_pm_can_manage_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and lower(btrim(data->>'assegnatario')) = public.ws_my_name())
    when collection = 'ore' then (public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and lower(btrim(data->>'persona')) = public.ws_my_name())
    when collection = 'note' then not public.ws_is_pm() or public.ws_pm_in_project(data->>'progettoCodice')
    else false
  end
);

drop policy if exists ws_update on public.ws_records;
create policy ws_update on public.ws_records for update to authenticated
using (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.ws_is_pm() and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.ws_is_pm()
    when collection = 'task' then (public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and public.ws_assigned_to_me(data->>'assegnatario'))
    when collection = 'ore' then (public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and lower(btrim(data->>'persona')) = public.ws_my_name())
    when collection = 'note' then (not public.ws_is_pm() and created_by = auth.uid())
      or public.ws_pm_in_project(data->>'progettoCodice')
    else false
  end
)
with check (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.ws_is_pm() and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.ws_is_pm()
    when collection = 'task' then (public.ws_is_pm() and public.ws_pm_can_manage_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and public.ws_assigned_to_me(data->>'assegnatario'))
    when collection = 'ore' then (public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and lower(btrim(data->>'persona')) = public.ws_my_name())
    when collection = 'note' then (not public.ws_is_pm() and created_by = auth.uid())
      or public.ws_pm_in_project(data->>'progettoCodice')
    else false
  end
);

drop policy if exists ws_delete on public.ws_records;
create policy ws_delete on public.ws_records for delete to authenticated using (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.ws_is_pm() and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.ws_is_pm()
    when collection = 'task' then public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice')
    when collection = 'ore' then (public.ws_is_pm() and public.ws_pm_in_project(data->>'progettoCodice'))
      or (not public.ws_is_pm() and lower(btrim(data->>'persona')) = public.ws_my_name())
    when collection = 'note' then (not public.ws_is_pm() and created_by = auth.uid())
      or public.ws_pm_in_project(data->>'progettoCodice')
    else false
  end
);

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

  if new.collection = 'team' and auth.uid() is not null and not public.is_super_it() then
    if not public.has_perm('gestione_progetti') then raise exception 'Serve il gruppo PM'; end if;
    if tg_op = 'INSERT' then
      if not exists (select 1 from public.ws_records p where p.collection = 'progetti' and p.id = new.id and p.created_by = auth.uid())
         or not (coalesce(new.data->'persone', '[]'::jsonb) ? auth.uid()::text) then
        raise exception 'Puoi inizializzare solo la squadra di un progetto creato da te e devi farne parte';
      end if;
    elsif not public.ws_pm_in_project(old.id) and not exists (
      select 1 from public.ws_records p where p.collection = 'progetti' and p.id = old.id and p.created_by = auth.uid()
    ) then
      raise exception 'Puoi modificare soltanto la squadra di un tuo progetto o di un progetto assegnato a te';
    end if;
  end if;

  if tg_op = 'UPDATE' and new.collection = 'task'
     and not public.ws_pm_can_manage_project(coalesce(old.data->>'progettoCodice', new.data->>'progettoCodice')) then
    new.data := (new.data - pm_only) || (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb) from jsonb_each(old.data) as e(k, v) where k = any (pm_only));
  end if;
  return new;
end $$;
revoke all on function public.ws_guard() from public, anon, authenticated;

-- La console ticket non tratta più il Super IT come membro automatico del reparto.
create or replace function public.can_access_ticket(p_ticket_id bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tickets t
    where t.id = p_ticket_id and (
      t.richiedente_email = auth.jwt()->>'email'
      or (public.is_it() and t.assigned_to is null)
      or t.assigned_to = auth.uid()
      or exists (select 1 from public.ticket_collaborators c where c.ticket_id = t.id and c.user_id = auth.uid())
    )
  );
$$;
revoke all on function public.can_access_ticket(bigint) from public, anon;
grant execute on function public.can_access_ticket(bigint) to authenticated;

drop policy if exists groups_manage on public.access_groups;
create policy groups_manage on public.access_groups for all to authenticated
  using (public.has_perm('gestione_utenti')) with check (public.has_perm('gestione_utenti'));
drop policy if exists members_manage on public.access_group_members;
create policy members_manage on public.access_group_members for all to authenticated
  using (public.has_perm('gestione_utenti')) with check (public.has_perm('gestione_utenti'));

-- ================================================================
-- 20261108_licenze_uscite_bim.sql
-- ================================================================
-- ARCHEA Platform · Catalogo licenze, capacità, gruppo BIM e checklist di uscita tracciata.
-- Password e codici di attivazione restano fuori dal database applicativo.

insert into public.access_groups (nome, descrizione, permessi)
values ('BIM', 'Team BIM. I permessi applicativi si definiranno quando sarà attiva la sezione BIM.', '{}')
on conflict (nome) do update set descrizione = excluded.descrizione, permessi = '{}';

create table if not exists public.software_catalog (
  id bigserial primary key,
  nome text not null unique check (char_length(btrim(nome)) between 2 and 160),
  fornitore text,
  tipo text not null default 'LICENZA' check (tipo in ('LICENZA', 'ACCOUNT', 'SERVIZIO', 'DISPOSITIVO')),
  posti_acquistati integer not null default 0 check (posti_acquistati >= 0),
  scorta_minima integer not null default 0 check (scorta_minima >= 0),
  costo_unitario numeric(12,2) check (costo_unitario is null or costo_unitario >= 0),
  valuta text not null default 'EUR' check (valuta ~ '^[A-Z]{3}$'),
  rinnovo_at date,
  conteggio_verificato boolean not null default false,
  attivo boolean not null default true,
  note text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists software_catalog_attivo_nome on public.software_catalog (attivo, nome);
create or replace function public.software_catalog_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then new.created_by := auth.uid(); end if;
  else
    new.created_by := old.created_by;
  end if;
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.software_catalog_audit() from public, anon, authenticated;
drop trigger if exists software_catalog_audit on public.software_catalog;
create trigger software_catalog_audit before insert or update on public.software_catalog
for each row execute function public.software_catalog_audit();
alter table public.software_catalog enable row level security;
drop policy if exists software_catalog_read on public.software_catalog;
create policy software_catalog_read on public.software_catalog for select to authenticated
  using (public.is_it_role());
drop policy if exists software_catalog_manage on public.software_catalog;
create policy software_catalog_manage on public.software_catalog for all to authenticated
  using (public.is_it_role())
  with check (public.is_it_role());
grant select, insert, update, delete on public.software_catalog to authenticated;
grant usage, select on sequence public.software_catalog_id_seq to authenticated;

insert into public.software_catalog (nome, fornitore, tipo) values
  ('Google Workspace / Gmail', 'Google', 'ACCOUNT'),
  ('Active Directory', 'Microsoft', 'ACCOUNT'),
  ('Microsoft 365 / Office', 'Microsoft', 'LICENZA'),
  ('Microsoft Project', 'Microsoft', 'LICENZA'),
  ('Microsoft Visio', 'Microsoft', 'LICENZA'),
  ('Rhino', 'McNeel', 'LICENZA'),
  ('Adobe Creative Cloud', 'Adobe', 'LICENZA'),
  ('Adobe Acrobat', 'Adobe', 'LICENZA'),
  ('Adobe InDesign', 'Adobe', 'LICENZA'),
  ('Adobe Photoshop', 'Adobe', 'LICENZA'),
  ('Autodesk AEC Collection', 'Autodesk', 'LICENZA'),
  ('Autodesk AutoCAD', 'Autodesk', 'LICENZA'),
  ('Autodesk Docs', 'Autodesk', 'LICENZA'),
  ('Autodesk BIM Collaborate Pro', 'Autodesk', 'LICENZA'),
  ('Autodesk Revit LT Suite', 'Autodesk', 'LICENZA'),
  ('Chaos / Enscape', 'Chaos', 'LICENZA'),
  ('Lumion', 'Lumion', 'LICENZA'),
  ('BIMcollab', 'BIMcollab', 'LICENZA'),
  ('SketchUp', 'Trimble', 'LICENZA'),
  ('AnyDesk', 'AnyDesk', 'LICENZA'),
  ('Topaz Video / Image', 'Topaz Labs', 'LICENZA'),
  ('Windows', 'Microsoft', 'DISPOSITIVO')
on conflict (nome) do nothing;

alter table public.person_software add column if not exists catalog_id bigint;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'person_software_catalog_id_fkey') then
    alter table public.person_software add constraint person_software_catalog_id_fkey
      foreign key (catalog_id) references public.software_catalog(id) on delete set null;
  end if;
end $$;
create index if not exists person_software_catalog_status on public.person_software (catalog_id, stato);
update public.person_software ps set catalog_id = c.id
from public.software_catalog c
where ps.catalog_id is null and lower(btrim(ps.nome)) = lower(btrim(c.nome));

create or replace function public.license_capacity_report()
returns table (
  id bigint, nome text, fornitore text, tipo text, posti_acquistati integer,
  assegnate integer, libere integer, scorta_minima integer, da_acquistare integer,
  costo_unitario numeric, valuta text, rinnovo_at date, conteggio_verificato boolean, attivo boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_it_role() then
    raise exception 'Non hai il permesso di consultare il conteggio licenze';
  end if;
  return query
    select c.id, c.nome, c.fornitore, c.tipo, c.posti_acquistati,
      coalesce(a.n, 0)::integer,
      greatest(c.posti_acquistati - coalesce(a.n, 0), 0)::integer,
      c.scorta_minima,
      greatest(c.scorta_minima - greatest(c.posti_acquistati - coalesce(a.n, 0), 0), 0)::integer,
      c.costo_unitario, c.valuta, c.rinnovo_at, c.conteggio_verificato, c.attivo
    from public.software_catalog c
    left join (
      select ps.catalog_id, count(*)::integer n
      from public.person_software ps join public.people p on p.id = ps.person_id
      where ps.stato = 'ATTIVA' and coalesce(p.current_status, '') <> 'USCITO'
      group by ps.catalog_id
    ) a on a.catalog_id = c.id
    order by c.attivo desc, c.nome;
end $$;
revoke all on function public.license_capacity_report() from public, anon;
grant execute on function public.license_capacity_report() to authenticated;

alter table public.checklist_items add column if not exists person_software_id bigint;
alter table public.checklist_items add column if not exists completed_by_id uuid references auth.users(id) on delete set null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'checklist_items_person_software_id_fkey') then
    alter table public.checklist_items add constraint checklist_items_person_software_id_fkey
      foreign key (person_software_id) references public.person_software(id) on delete set null;
  end if;
end $$;
create unique index if not exists checklist_exit_software_unique
  on public.checklist_items (ticket_id, person_software_id) where person_software_id is not null;

create or replace function public.checklist_items_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare actor_name text;
begin
  if tg_op = 'INSERT' and auth.uid() is not null and new.completato then
    raise exception 'Una checklist si completa solo dopo averla presa in carico';
  end if;
  if tg_op = 'UPDATE' then
    new.ticket_id := old.ticket_id;
    new.testo := old.testo;
    new.person_software_id := old.person_software_id;
    if old.person_software_id is not null and old.completato and not new.completato then
      raise exception 'Una licenza ritirata non può essere riattivata annullando la spunta';
    end if;
  end if;
  if auth.uid() is not null then
    select coalesce(nullif(nome, ''), email) into actor_name from public.profiles where id = auth.uid();
    if new.completato then
      new.completed_at := coalesce(new.completed_at, now());
      new.completed_by_id := auth.uid();
      new.completed_by := coalesce(actor_name, 'IT');
    else
      new.completed_at := null;
      new.completed_by_id := null;
      new.completed_by := null;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.checklist_items_guard() from public, anon, authenticated;
drop trigger if exists checklist_items_guard on public.checklist_items;
create trigger checklist_items_guard before insert or update on public.checklist_items
for each row execute function public.checklist_items_guard();

create or replace function public.checklist_items_complete_license()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.person_software_id is not null and new.completato and not old.completato then
    update public.person_software set stato = 'DISMESSA', updated_at = now()
    where id = new.person_software_id and stato = 'ATTIVA';
  end if;
  return new;
end $$;
revoke all on function public.checklist_items_complete_license() from public, anon, authenticated;
drop trigger if exists checklist_items_complete_license on public.checklist_items;
create trigger checklist_items_complete_license after update of completato on public.checklist_items
for each row execute function public.checklist_items_complete_license();

create or replace function public.person_software_add_exit_checklist()
returns trigger language plpgsql security definer set search_path = public as $$
declare mv record; label text;
begin
  if new.stato <> 'ATTIVA' then return new; end if;
  select h.ticket_id into mv from public.hr_movements h
  where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO'
    and h.ticket_id is not null and h.person_id = new.person_id
  order by h.movement_date desc, h.id desc limit 1;
  if mv.ticket_id is null then return new; end if;
  label := 'Disattiva/revoca ' || coalesce(nullif(btrim(new.nome), ''), 'licenza o account') || ' e libera il posto';
  insert into public.checklist_items(ticket_id, testo, person_software_id)
  values (mv.ticket_id, label, new.id)
  on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;
  return new;
end $$;
revoke all on function public.person_software_add_exit_checklist() from public, anon, authenticated;
drop trigger if exists person_software_add_exit_checklist on public.person_software;
create trigger person_software_add_exit_checklist after insert or update of stato, nome, person_id, catalog_id on public.person_software
for each row execute function public.person_software_add_exit_checklist();

create or replace function public.trg_hr_movement_operational_checklist()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record; s record; full_name text;
begin
  if new.ticket_id is null then return new; end if;
  full_name := trim(coalesce(new.person_name,'') || ' ' || coalesce(new.person_surname,''));
  delete from public.checklist_items where ticket_id = new.ticket_id;

  if new.movement_type = 'NUOVO INGRESSO' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del nuovo ingresso'),
      (new.ticket_id,'Creazione/verifica account e accessi aziendali'),
      (new.ticket_id,'Preparazione postazione nella sede indicata'),
      (new.ticket_id,'Assegnazione hardware e aggiornamento censimento'),
      (new.ticket_id,'Installazione/verifica software e licenze necessarie'),
      (new.ticket_id,'Test accessi, rete/VDI e servizi'),
      (new.ticket_id,'Conferma con utente e chiusura');
  elsif new.movement_type = 'USCITA' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico dell’uscita'),
      (new.ticket_id,'Verifica della data effettiva di uscita'),
      (new.ticket_id,'Recupero hardware e accessori assegnati'),
      (new.ticket_id,'Disabilitazione account Active Directory e verifica accessi'),
      (new.ticket_id,'Disabilitazione account Google Workspace/Gmail'),
      (new.ticket_id,'Verifica e revoca licenze Microsoft Office 365'),
      (new.ticket_id,'Aggiornamento censimento e disponibilità degli asset'),
      (new.ticket_id,'Completa e registra il take-out della persona'),
      (new.ticket_id,'Verifica finale IT e chiusura');
  elsif new.movement_type = 'CAMBIO POSTAZIONE' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del cambio postazione'),
      (new.ticket_id,'Verifica nuova postazione e collegamenti'),
      (new.ticket_id,'Verifica monitor, dock e periferiche'),
      (new.ticket_id,'Verifica rete e servizi di postazione'),
      (new.ticket_id,'Aggiornamento posizione degli asset nel censimento'),
      (new.ticket_id,'Conferma con utente e chiusura');
  elsif new.movement_type = 'CAMBIO SEDE' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del cambio sede'),
      (new.ticket_id,'Verifica hardware attualmente assegnato'),
      (new.ticket_id,'Preparazione accessi e postazione nella nuova sede'),
      (new.ticket_id,'Verifica rete/VDI/servizi della nuova sede'),
      (new.ticket_id,'Aggiornamento sede e posizione degli asset nel censimento'),
      (new.ticket_id,'Conferma con utente e chiusura');
  end if;

  for a in
    select id, asset_code, brand, model from public.assets
    where coalesce(is_label_only,false)=false and status not in ('DISMESSO','VENDUTO') and (
      (new.person_email is not null and lower(coalesce(assigned_user_email,'')) = lower(new.person_email))
      or (new.person_email is null and lower(trim(coalesce(assigned_user_name,''))) = lower(full_name))
    ) order by asset_code
  loop
    if new.movement_type = 'USCITA' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Recupera asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    elsif new.movement_type = 'CAMBIO SEDE' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Aggiorna sede asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    elsif new.movement_type = 'CAMBIO POSTAZIONE' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Aggiorna posizione asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    end if;
  end loop;

  if new.movement_type = 'USCITA' then
    for s in
      select ps.id, ps.nome from public.person_software ps
      where ps.stato = 'ATTIVA' and (
        (new.person_id is not null and ps.person_id = new.person_id)
        or (new.person_id is null and exists (
          select 1 from public.people p where p.id = ps.person_id and (
            (new.person_email is not null and lower(coalesce(p.corporate_email,'')) = lower(new.person_email))
            or lower(btrim(p.display_name)) = lower(btrim(full_name))
          )
        ))
      ) order by ps.nome, ps.id
    loop
      insert into public.checklist_items(ticket_id,testo,person_software_id)
      values (new.ticket_id,'Disattiva/revoca ' || s.nome || ' e libera il posto',s.id)
      on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;
    end loop;
  end if;

  if new.needs_manual_check then
    insert into public.checklist_items(ticket_id,testo)
    values (new.ticket_id,'CONTROLLO MANUALE: storico precedente della persona non disponibile nel portale');
  end if;
  return new;
end $$;
drop trigger if exists hr_movement_operational_checklist on public.hr_movements;
create trigger hr_movement_operational_checklist after insert on public.hr_movements
for each row execute function public.trg_hr_movement_operational_checklist();
revoke all on function public.trg_hr_movement_operational_checklist() from public, anon, authenticated;

insert into public.checklist_items(ticket_id,testo)
select h.ticket_id, v.testo
from public.hr_movements h
cross join (values
  ('Completa e registra il take-out della persona'),
  ('Disabilitazione account Active Directory e verifica accessi'),
  ('Disabilitazione account Google Workspace/Gmail'),
  ('Verifica e revoca licenze Microsoft Office 365')
) as v(testo)
where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO' and h.ticket_id is not null
  and not exists (select 1 from public.checklist_items c where c.ticket_id=h.ticket_id and c.testo=v.testo);

-- Le uscite già aperte ricevono anche la checklist delle licenze ancora attive.
insert into public.checklist_items(ticket_id,testo,person_software_id)
select h.ticket_id, 'Disattiva/revoca ' || ps.nome || ' e libera il posto', ps.id
from public.hr_movements h
join public.person_software ps on ps.stato = 'ATTIVA'
join public.people p on p.id = ps.person_id
where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO' and h.ticket_id is not null
  and ((h.person_id is not null and ps.person_id = h.person_id)
    or (h.person_id is null and ((h.person_email is not null and lower(coalesce(p.corporate_email,''))=lower(h.person_email))
      or lower(btrim(p.display_name))=lower(btrim(coalesce(h.person_name,'') || ' ' || coalesce(h.person_surname,''))))))
on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;

create or replace function public.guard_exit_ticket_completion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stato = 'CHIUSO' and old.stato is distinct from 'CHIUSO'
     and exists (select 1 from public.hr_movements h where h.ticket_id = new.id and h.movement_type = 'USCITA' and h.status <> 'ANNULLATO')
     and (not exists (select 1 from public.checklist_items c where c.ticket_id = new.id)
       or exists (select 1 from public.checklist_items c where c.ticket_id = new.id and not coalesce(c.completato,false))) then
    raise exception 'Non puoi chiudere l’uscita: completa tutte le attività della checklist IT';
  end if;
  return new;
end $$;
revoke all on function public.guard_exit_ticket_completion() from public, anon, authenticated;
drop trigger if exists guard_exit_ticket_completion on public.tickets;
create trigger guard_exit_ticket_completion before update of stato on public.tickets
for each row execute function public.guard_exit_ticket_completion();

-- ================================================================
-- 20261107180000_task_workflow.sql
-- ================================================================
-- ARCHEA Platform · Identità, autorizzazioni, validazione e salvataggi atomici per task e ore.
-- I dati restano compatibili con il Workspace JSON, ma il database applica vincoli e scope.

alter table public.ws_records add column if not exists revision bigint not null default 1;
alter table public.notifications add column if not exists task_id text;
create index if not exists ws_records_collection_project on public.ws_records (collection, (data->>'progettoCodice'));
create index if not exists ws_records_team_people on public.ws_records using gin ((data->'persone')) where collection = 'team';
create index if not exists ws_records_team_vice on public.ws_records using gin ((data->'viceIds')) where collection = 'team';
create index if not exists notifications_user_task_created on public.notifications (user_id, task_id, created_at desc) where task_id is not null;

-- Una persona è membro solo se il suo UUID compare nella squadra del progetto.
create or replace function public.ws_person_in_project(p_user uuid, p_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select p_user is not null and p_code is not null and exists (
    select 1 from public.ws_records t
    where t.collection = 'team' and t.id = p_code
      and coalesce(t.data->'persone', '[]'::jsonb) ? p_user::text
  );
$$;

-- I vice sono delegati sul singolo progetto, senza iscriverli al gruppo PM globale.
create or replace function public.ws_is_project_vice(p_code text, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select p_user is not null and p_code is not null and exists (
    select 1 from public.ws_records t
    where t.collection = 'team' and t.id = p_code
      and coalesce(t.data->'persone', '[]'::jsonb) ? p_user::text
      and coalesce(t.data->'viceIds', '[]'::jsonb) ? p_user::text
  );
$$;

create or replace function public.ws_is_any_project_vice(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select p_user is not null and exists (
    select 1 from public.ws_records t
    where t.collection='team' and coalesce(t.data->'viceIds','[]'::jsonb) ? p_user::text
  );
$$;

create or replace function public.ws_is_project_manager(p_code text, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select p_user is not null and p_code is not null and (
    (p_user = auth.uid() and public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(p_code))
    or public.ws_is_project_vice(p_code, p_user)
  );
$$;
revoke all on function public.ws_person_in_project(uuid,text), public.ws_is_project_vice(text,uuid), public.ws_is_any_project_vice(uuid), public.ws_is_project_manager(text,uuid) from public, anon;
grant execute on function public.ws_person_in_project(uuid,text), public.ws_is_project_vice(text,uuid), public.ws_is_any_project_vice(uuid), public.ws_is_project_manager(text,uuid) to authenticated;

-- Task e ore si riferiscono agli UUID Supabase, non ai nomi visualizzati.
create or replace function public.ws_assigned_to_me(assegnatario text)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and assegnatario = auth.uid()::text;
$$;
revoke all on function public.ws_assigned_to_me(text) from public, anon;
grant execute on function public.ws_assigned_to_me(text) to authenticated;

-- RLS: PM e vice vedono il progetto delegato; i vice non possono cambiare squadra/progetto.
drop policy if exists ws_read on public.ws_records;
create policy ws_read on public.ws_records for select to authenticated using (
  case
    when collection = 'staff' then public.ws_is_hr()
    -- RETURNING dell'RPC deve poter leggere la riga appena creata: il controllo di
    -- appartenenza non può ancora trovare il progetto/la squadra nella stessa INSERT.
    when collection = 'progetti' and public.has_perm('gestione_progetti')
      then public.ws_is_project_manager(id) or created_by = auth.uid()
    when collection = 'team' and public.has_perm('gestione_progetti')
      then public.ws_is_project_manager(id) or created_by = auth.uid()
    when collection in ('progetti','team') and public.ws_is_project_vice(id) then true
    when collection = 'task' and public.ws_is_project_manager(data->>'progettoCodice') then true
    when collection = 'task' then public.ws_assigned_to_me(data->>'assegnatarioId')
    when collection = 'ore' and public.ws_is_project_manager(data->>'progettoCodice') then true
    when collection = 'ore' then public.ws_assigned_to_me(data->>'personaId')
    when collection = 'note' and (public.has_perm('gestione_progetti') or public.ws_is_any_project_vice()) then false
    else collection in ('progetti','note','team') or created_by = auth.uid()
  end
);

drop policy if exists ws_insert on public.ws_records;
create policy ws_insert on public.ws_records for insert to authenticated with check (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.has_perm('gestione_progetti')
    when collection = 'team' then public.has_perm('gestione_progetti')
    when collection = 'task' then public.ws_is_project_manager(data->>'progettoCodice')
      or (public.ws_assigned_to_me(data->>'assegnatarioId') and public.ws_person_in_project(auth.uid(), data->>'progettoCodice'))
    when collection = 'ore' then public.ws_assigned_to_me(data->>'personaId')
      and public.ws_person_in_project(auth.uid(), data->>'progettoCodice')
    when collection = 'note' then not public.has_perm('gestione_progetti') and not public.ws_is_any_project_vice()
    else false
  end
);

drop policy if exists ws_update on public.ws_records;
create policy ws_update on public.ws_records for update to authenticated using (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'task' then public.ws_is_project_manager(data->>'progettoCodice')
      or public.ws_assigned_to_me(data->>'assegnatarioId')
    when collection = 'ore' then public.ws_assigned_to_me(data->>'personaId')
      and public.ws_person_in_project(auth.uid(), data->>'progettoCodice')
    when collection = 'note' then not public.has_perm('gestione_progetti') and not public.ws_is_any_project_vice() and created_by = auth.uid()
    else false
  end
) with check (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'task' then public.ws_is_project_manager(data->>'progettoCodice')
      or (public.ws_assigned_to_me(data->>'assegnatarioId') and public.ws_person_in_project(auth.uid(), data->>'progettoCodice'))
    when collection = 'ore' then public.ws_assigned_to_me(data->>'personaId')
      and public.ws_person_in_project(auth.uid(), data->>'progettoCodice')
    when collection = 'note' then not public.has_perm('gestione_progetti') and not public.ws_is_any_project_vice() and created_by = auth.uid()
    else false
  end
);

drop policy if exists ws_delete on public.ws_records;
create policy ws_delete on public.ws_records for delete to authenticated using (
  case
    when collection = 'staff' then public.ws_is_hr()
    when collection = 'progetti' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'team' then public.has_perm('gestione_progetti') and public.ws_pm_can_manage_project(id)
    when collection = 'task' then public.ws_is_project_manager(data->>'progettoCodice')
    when collection = 'ore' then public.ws_assigned_to_me(data->>'personaId')
      and public.ws_person_in_project(auth.uid(), data->>'progettoCodice')
    when collection = 'note' then not public.has_perm('gestione_progetti')
      and not public.ws_is_any_project_vice() and created_by = auth.uid()
    else false
  end
);

-- Convalida i documenti lato server, anche se il client viene aggirato o modificato.
create or replace function public.ws_validate_record()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_user uuid;
  v_hours numeric;
  v_start date;
  v_due date;
  v_name text;
  v_vice jsonb;
begin
  if new.collection = 'team' then
    if jsonb_typeof(coalesce(new.data->'persone','[]'::jsonb)) <> 'array'
       or jsonb_typeof(coalesce(new.data->'viceIds','[]'::jsonb)) <> 'array' then
      raise exception 'Squadra o vice non validi';
    end if;
    if not exists (select 1 from public.ws_records p where p.collection='progetti' and p.id=new.id) then
      raise exception 'La squadra deve appartenere a un progetto esistente';
    end if;
    if exists (
      select 1 from jsonb_array_elements_text(coalesce(new.data->'persone','[]'::jsonb)) x
      left join public.profiles p on p.id=case when x.value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then x.value::uuid else null end
      where p.id is null
    ) then raise exception 'La squadra contiene una persona senza account valido'; end if;
    v_vice := coalesce(new.data->'viceIds','[]'::jsonb);
    if exists (select 1 from jsonb_array_elements_text(v_vice) x where not (coalesce(new.data->'persone','[]'::jsonb) ? x)) then
      select coalesce(jsonb_agg(x.value),'[]'::jsonb) into v_vice
      from jsonb_array_elements_text(v_vice) x
      where coalesce(new.data->'persone','[]'::jsonb) ? x.value;
      new.data := jsonb_set(new.data,'{viceIds}',v_vice,true);
    end if;
    if tg_op = 'UPDATE' and old.data->'viceIds' is distinct from new.data->'viceIds'
       and auth.uid() is not null and not public.has_perm('gestione_progetti') then
      raise exception 'Solo il PM del progetto può nominare o rimuovere un vice';
    end if;
    if auth.uid() is not null and not public.has_perm('gestione_progetti') then
      raise exception 'Solo un PM può modificare la squadra';
    end if;
    if auth.uid() is not null and tg_op = 'UPDATE'
       and not (coalesce(new.data->'persone','[]'::jsonb) ? auth.uid()::text) then
      raise exception 'Il PM deve restare nella squadra del progetto';
    end if;
    return new;
  end if;

  if new.collection not in ('task','ore') then return new; end if;
  v_code := nullif(btrim(new.data->>'progettoCodice'),'');
  if v_code is null or not exists (
    select 1 from public.ws_records p where p.collection='progetti' and p.id=v_code
  ) then raise exception 'Seleziona un progetto esistente'; end if;
  if not exists (
    select 1 from public.ws_records t where t.collection='team' and t.id=v_code
  ) then raise exception 'Il progetto non ha una squadra assegnata'; end if;

  if new.collection = 'task' then
    if nullif(btrim(new.data->>'titolo'),'') is null or char_length(new.data->>'titolo') > 300 then
      raise exception 'La task deve avere un titolo (massimo 300 caratteri)';
    end if;
    if coalesce(new.data->>'assegnatarioId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Assegna la task a una persona registrata';
    end if;
    v_user := (new.data->>'assegnatarioId')::uuid;
    if not exists (select 1 from public.profiles p where p.id=v_user)
       or not public.ws_person_in_project(v_user,v_code) then
      raise exception 'L’assegnatario deve essere una persona della squadra del progetto';
    end if;
    if coalesce(new.data->>'inizio','') !~ '^\d{4}-\d{2}-\d{2}$'
       or coalesce(new.data->>'scadenza','') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Inserisci date di inizio e scadenza valide';
    end if;
    begin
      v_start := (new.data->>'inizio')::date;
      v_due := (new.data->>'scadenza')::date;
    exception when others then raise exception 'Inserisci date di calendario valide';
    end;
    if v_start > v_due then raise exception 'La scadenza non può precedere la data di inizio'; end if;
    if coalesce((new.data->>'validated')::boolean,false) and not coalesce((new.data->>'completed')::boolean,false) then
      raise exception 'Una task si valida solo dopo il completamento';
    end if;
    if coalesce((new.data->>'validated')::boolean,false) and coalesce((new.data->>'notValidated')::boolean,false) then
      raise exception 'Una task non può essere validata e respinta insieme';
    end if;
    select coalesce(nome,email) into v_name from public.profiles where id=v_user;
    new.data := jsonb_set(new.data,'{assegnatario}',to_jsonb(v_name),true);
    return new;
  end if;

  if coalesce(new.data->>'personaId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'La registrazione ore deve appartenere a una persona registrata';
  end if;
  v_user := (new.data->>'personaId')::uuid;
  if not exists (select 1 from public.profiles p where p.id=v_user)
     or not public.ws_person_in_project(v_user,v_code) then
    raise exception 'La persona deve appartenere alla squadra del progetto';
  end if;
  if coalesce(new.data->>'data','') !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'Inserisci una data valida per le ore';
  end if;
  begin v_start := (new.data->>'data')::date;
  exception when others then raise exception 'Inserisci una data di calendario valida per le ore'; end;
  if coalesce(new.data->>'ore','') !~ '^\d+(\.\d+)?$' then raise exception 'Le ore devono essere un numero'; end if;
  v_hours := (new.data->>'ore')::numeric;
  if v_hours <= 0 or v_hours > 24 or mod(v_hours * 2,1) <> 0 then
    raise exception 'Le ore devono essere tra 0,5 e 24, a intervalli di 30 minuti';
  end if;
  select coalesce(nome,email) into v_name from public.profiles where id=v_user;
  new.data := jsonb_set(new.data,'{persona}',to_jsonb(v_name),true);
  return new;
end $$;
revoke all on function public.ws_validate_record() from public, anon, authenticated;
drop trigger if exists ws_validate_record on public.ws_records;
create trigger ws_validate_record before insert or update on public.ws_records
for each row execute function public.ws_validate_record();

create or replace function public.ws_guard_project_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.collection='progetti' and exists (
    select 1 from public.ws_records r
    where r.id=old.id and r.collection in ('task','ore','note','team')
  ) then
    raise exception 'Il progetto contiene task, ore o documenti: archivialo invece di eliminarlo';
  end if;
  return old;
end $$;
revoke all on function public.ws_guard_project_delete() from public, anon, authenticated;
drop trigger if exists ws_guard_project_delete on public.ws_records;
create trigger ws_guard_project_delete before delete on public.ws_records
for each row execute function public.ws_guard_project_delete();

-- Revisioni ottimistiche e incremento nel database: un client obsoleto non sovrascrive un altro.
create or replace function public.ws_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pm_only text[] := array['id','numero','titolo','assegnatario','assegnatarioId','progettoCodice','inizio','scadenza','priorita','tipologia',
                          'validated','notValidated','validatedBy','validatedAt','correctionBy','approvedBy','createdBy'];
begin
  if tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.revision := old.revision + 1;
  else
    new.revision := 1;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  if new.collection = 'team' and auth.uid() is not null then
    if not public.has_perm('gestione_progetti') then raise exception 'Solo il gruppo PM può modificare la squadra'; end if;
    if tg_op = 'INSERT' then
      if not exists (select 1 from public.ws_records p where p.collection='progetti' and p.id=new.id and p.created_by=auth.uid())
         or not (coalesce(new.data->'persone','[]'::jsonb) ? auth.uid()::text) then
        raise exception 'Puoi inizializzare solo un progetto creato da te e devi far parte della squadra';
      end if;
    elsif not public.ws_pm_in_project(old.id) and not exists (
      select 1 from public.ws_records p where p.collection='progetti' and p.id=old.id and p.created_by=auth.uid()
    ) then
      raise exception 'Puoi modificare solo la squadra di un progetto assegnato a te';
    end if;
  end if;
  if tg_op = 'UPDATE' and new.collection='task'
     and not public.ws_is_project_manager(old.data->>'progettoCodice') then
    new.data := (new.data - pm_only) || (select coalesce(jsonb_object_agg(k,v),'{}'::jsonb)
      from jsonb_each(old.data) as e(k,v) where k=any(pm_only));
  end if;
  return new;
end $$;
revoke all on function public.ws_guard() from public, anon, authenticated;

-- RPC atomica per un'intera raccolta: tutte le modifiche passano o nessuna viene salvata.
create or replace function public.ws_apply_changes(p_collection text, p_upserts jsonb, p_deletes jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  item jsonb;
  v_id text;
  v_expected bigint;
  v_saved public.ws_records%rowtype;
  v_upserted jsonb := '[]'::jsonb;
  v_deleted jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  if p_collection not in ('progetti','task','ore','note','team','staff') then raise exception 'Raccolta non valida'; end if;
  if jsonb_typeof(coalesce(p_upserts,'[]'::jsonb)) <> 'array' or jsonb_typeof(coalesce(p_deletes,'[]'::jsonb)) <> 'array' then
    raise exception 'Modifiche non valide';
  end if;
  for item in select value from jsonb_array_elements(coalesce(p_upserts,'[]'::jsonb)) loop
    v_id := nullif(item->>'id','');
    if v_id is null or jsonb_typeof(item->'data') <> 'object' then raise exception 'Riga priva di ID o dati validi'; end if;
    if item->>'expected_revision' is null or item->'expected_revision' = 'null'::jsonb then
      insert into public.ws_records(collection,id,data) values (p_collection,v_id,item->'data') returning * into v_saved;
    else
      v_expected := (item->>'expected_revision')::bigint;
      update public.ws_records set data=item->'data'
        where collection=p_collection and id=v_id and revision=v_expected returning * into v_saved;
      if not found then raise exception 'Conflitto: questa riga è stata modificata da un altro utente. Ricarica e ripeti la modifica'; end if;
    end if;
    v_upserted := v_upserted || jsonb_build_array(jsonb_build_object('id',v_saved.id,'data',v_saved.data,'revision',v_saved.revision));
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_deletes,'[]'::jsonb)) loop
    v_id := nullif(item->>'id','');
    v_expected := (item->>'expected_revision')::bigint;
    delete from public.ws_records where collection=p_collection and id=v_id and revision=v_expected;
    if not found then raise exception 'Conflitto: la riga da eliminare è cambiata. Ricarica e ripeti la modifica'; end if;
    v_deleted := v_deleted || jsonb_build_array(v_id);
  end loop;
  return jsonb_build_object('upserts',v_upserted,'deletes',v_deleted);
end $$;
revoke all on function public.ws_apply_changes(text,jsonb,jsonb) from public, anon;
grant execute on function public.ws_apply_changes(text,jsonb,jsonb) to authenticated;

-- Notifiche persistenti per assegnazione, proposta, completamento, correzione e validazione.
create or replace function public.ws_notify_task()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_code text := new.data->>'progettoCodice';
  v_assignee uuid;
  v_actor uuid := coalesce(auth.uid(),new.updated_by,new.created_by);
  v_message text;
begin
  if coalesce(new.data->>'assegnatarioId','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_assignee := (new.data->>'assegnatarioId')::uuid;
  end if;
  if tg_op = 'INSERT' then
    if coalesce((new.data->>'approvalPending')::boolean,false) then
      v_message := 'Nuova proposta task · ' || coalesce(new.data->>'titolo',new.id) || ' · ' || v_code;
      insert into public.notifications(user_id,title,message,is_read,task_id)
      select distinct m.user_id,'Task da approvare',left(v_message,500),false,new.id
      from public.access_group_members m join public.access_groups g on g.id=m.group_id
      where 'gestione_progetti'=any(g.permessi) and m.user_id<>v_actor
        and public.ws_person_in_project(m.user_id,v_code);
    elsif v_assignee is not null and v_assignee<>v_actor then
      insert into public.notifications(user_id,title,message,is_read,task_id)
      values(v_assignee,'Nuova task assegnata',left(coalesce(new.data->>'titolo',new.id) || ' · ' || v_code,500),false,new.id);
    end if;
    return new;
  end if;
  if old.data->>'assegnatarioId' is distinct from new.data->>'assegnatarioId' and v_assignee is not null and v_assignee<>v_actor then
    insert into public.notifications(user_id,title,message,is_read,task_id)
    values(v_assignee,'Task assegnata',left(coalesce(new.data->>'titolo',new.id) || ' · ' || v_code,500),false,new.id);
  end if;
  if not coalesce((old.data->>'completed')::boolean,false) and coalesce((new.data->>'completed')::boolean,false)
     and not coalesce((new.data->>'validated')::boolean,false) then
    v_message := 'Task completata da verificare · ' || coalesce(new.data->>'titolo',new.id) || ' · ' || v_code;
    insert into public.notifications(user_id,title,message,is_read,task_id)
    select distinct recipient,'Task da verificare',left(v_message,500),false,new.id from (
      select m.user_id as recipient from public.access_group_members m join public.access_groups g on g.id=m.group_id
      where 'gestione_progetti'=any(g.permessi) and public.ws_person_in_project(m.user_id,v_code)
      union select jsonb_array_elements_text(coalesce(t.data->'viceIds','[]'::jsonb))::uuid
      from public.ws_records t where t.collection='team' and t.id=v_code
    ) q where recipient<>v_actor;
  end if;
  if (not coalesce((old.data->>'notValidated')::boolean,false) and coalesce((new.data->>'notValidated')::boolean,false))
     or (not coalesce((old.data->>'validated')::boolean,false) and coalesce((new.data->>'validated')::boolean,false)) then
    insert into public.notifications(user_id,title,message,is_read,task_id)
    select v_assignee,case when coalesce((new.data->>'validated')::boolean,false) then 'Task validata' else 'Correzioni richieste' end,
      left(coalesce(new.data->>'titolo',new.id) || ' · ' || coalesce(new.data->>'commenti',''),500),false,new.id
    where v_assignee is not null and v_assignee<>v_actor;
  end if;
  return new;
end $$;
revoke all on function public.ws_notify_task() from public, anon, authenticated;
drop trigger if exists ws_notify_task on public.ws_records;
create trigger ws_notify_task after insert or update on public.ws_records
for each row when (new.collection='task') execute function public.ws_notify_task();

-- Il payload conserva l'identificativo task per aprire direttamente il Task Manager.
create or replace function public.push_on_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record;
begin
  select function_url,hook_secret into c from public.push_config
    where id=1 and public_key is not null and function_url is not null;
  if c.function_url is null then return new; end if;
  if not exists (select 1 from public.push_subscriptions where user_id=new.user_id) then return new; end if;
  begin
    perform net.http_post(
      url:=c.function_url,
      body:=jsonb_build_object('id',new.id,'user_id',new.user_id,'title',new.title,'message',new.message,
        'ticket_id',new.ticket_id,'task_id',new.task_id),
      headers:=jsonb_build_object('Content-Type','application/json','x-archea-hook',c.hook_secret),
      timeout_milliseconds:=8000);
  exception when others then null;
  end;
  return new;
end $$;
revoke all on function public.push_on_notification() from public, anon, authenticated;
