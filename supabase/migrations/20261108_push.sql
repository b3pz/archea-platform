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
