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

