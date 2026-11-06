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
