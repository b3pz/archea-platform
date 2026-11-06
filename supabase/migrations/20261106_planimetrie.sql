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
  check (permessi <@ array['gestione_utenti', 'moderazione_offtopic', 'gestione_calendario', 'gestione_mappe']::text[]);

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
