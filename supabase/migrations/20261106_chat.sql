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
