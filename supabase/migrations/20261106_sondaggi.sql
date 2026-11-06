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
