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
