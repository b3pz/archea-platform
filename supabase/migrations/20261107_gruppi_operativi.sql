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

