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
