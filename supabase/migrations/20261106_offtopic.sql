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
