-- ARCHEA Platform · Catalogo licenze, capacità, gruppo BIM e checklist di uscita tracciata.
-- Password e codici di attivazione restano fuori dal database applicativo.

insert into public.access_groups (nome, descrizione, permessi)
values ('BIM', 'Team BIM. I permessi applicativi si definiranno quando sarà attiva la sezione BIM.', '{}')
on conflict (nome) do update set descrizione = excluded.descrizione, permessi = '{}';

create table if not exists public.software_catalog (
  id bigserial primary key,
  nome text not null unique check (char_length(btrim(nome)) between 2 and 160),
  fornitore text,
  tipo text not null default 'LICENZA' check (tipo in ('LICENZA', 'ACCOUNT', 'SERVIZIO', 'DISPOSITIVO')),
  posti_acquistati integer not null default 0 check (posti_acquistati >= 0),
  scorta_minima integer not null default 0 check (scorta_minima >= 0),
  costo_unitario numeric(12,2) check (costo_unitario is null or costo_unitario >= 0),
  valuta text not null default 'EUR' check (valuta ~ '^[A-Z]{3}$'),
  rinnovo_at date,
  conteggio_verificato boolean not null default false,
  attivo boolean not null default true,
  note text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists software_catalog_attivo_nome on public.software_catalog (attivo, nome);
create or replace function public.software_catalog_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then new.created_by := auth.uid(); end if;
  else
    new.created_by := old.created_by;
  end if;
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.software_catalog_audit() from public, anon, authenticated;
drop trigger if exists software_catalog_audit on public.software_catalog;
create trigger software_catalog_audit before insert or update on public.software_catalog
for each row execute function public.software_catalog_audit();
alter table public.software_catalog enable row level security;
drop policy if exists software_catalog_read on public.software_catalog;
create policy software_catalog_read on public.software_catalog for select to authenticated
  using (public.is_it_role());
drop policy if exists software_catalog_manage on public.software_catalog;
create policy software_catalog_manage on public.software_catalog for all to authenticated
  using (public.is_it_role())
  with check (public.is_it_role());
grant select, insert, update, delete on public.software_catalog to authenticated;
grant usage, select on sequence public.software_catalog_id_seq to authenticated;

insert into public.software_catalog (nome, fornitore, tipo) values
  ('Google Workspace / Gmail', 'Google', 'ACCOUNT'),
  ('Active Directory', 'Microsoft', 'ACCOUNT'),
  ('Microsoft 365 / Office', 'Microsoft', 'LICENZA'),
  ('Microsoft Project', 'Microsoft', 'LICENZA'),
  ('Microsoft Visio', 'Microsoft', 'LICENZA'),
  ('Rhino', 'McNeel', 'LICENZA'),
  ('Adobe Creative Cloud', 'Adobe', 'LICENZA'),
  ('Adobe Acrobat', 'Adobe', 'LICENZA'),
  ('Adobe InDesign', 'Adobe', 'LICENZA'),
  ('Adobe Photoshop', 'Adobe', 'LICENZA'),
  ('Autodesk AEC Collection', 'Autodesk', 'LICENZA'),
  ('Autodesk AutoCAD', 'Autodesk', 'LICENZA'),
  ('Autodesk Docs', 'Autodesk', 'LICENZA'),
  ('Autodesk BIM Collaborate Pro', 'Autodesk', 'LICENZA'),
  ('Autodesk Revit LT Suite', 'Autodesk', 'LICENZA'),
  ('Chaos / Enscape', 'Chaos', 'LICENZA'),
  ('Lumion', 'Lumion', 'LICENZA'),
  ('BIMcollab', 'BIMcollab', 'LICENZA'),
  ('SketchUp', 'Trimble', 'LICENZA'),
  ('AnyDesk', 'AnyDesk', 'LICENZA'),
  ('Topaz Video / Image', 'Topaz Labs', 'LICENZA'),
  ('Windows', 'Microsoft', 'DISPOSITIVO')
on conflict (nome) do nothing;

alter table public.person_software add column if not exists catalog_id bigint;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'person_software_catalog_id_fkey') then
    alter table public.person_software add constraint person_software_catalog_id_fkey
      foreign key (catalog_id) references public.software_catalog(id) on delete set null;
  end if;
end $$;
create index if not exists person_software_catalog_status on public.person_software (catalog_id, stato);
update public.person_software ps set catalog_id = c.id
from public.software_catalog c
where ps.catalog_id is null and lower(btrim(ps.nome)) = lower(btrim(c.nome));

create or replace function public.license_capacity_report()
returns table (
  id bigint, nome text, fornitore text, tipo text, posti_acquistati integer,
  assegnate integer, libere integer, scorta_minima integer, da_acquistare integer,
  costo_unitario numeric, valuta text, rinnovo_at date, conteggio_verificato boolean, attivo boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_it_role() then
    raise exception 'Non hai il permesso di consultare il conteggio licenze';
  end if;
  return query
    select c.id, c.nome, c.fornitore, c.tipo, c.posti_acquistati,
      coalesce(a.n, 0)::integer,
      greatest(c.posti_acquistati - coalesce(a.n, 0), 0)::integer,
      c.scorta_minima,
      greatest(c.scorta_minima - greatest(c.posti_acquistati - coalesce(a.n, 0), 0), 0)::integer,
      c.costo_unitario, c.valuta, c.rinnovo_at, c.conteggio_verificato, c.attivo
    from public.software_catalog c
    left join (
      select ps.catalog_id, count(*)::integer n
      from public.person_software ps join public.people p on p.id = ps.person_id
      where ps.stato = 'ATTIVA' and coalesce(p.current_status, '') <> 'USCITO'
      group by ps.catalog_id
    ) a on a.catalog_id = c.id
    order by c.attivo desc, c.nome;
end $$;
revoke all on function public.license_capacity_report() from public, anon;
grant execute on function public.license_capacity_report() to authenticated;

alter table public.checklist_items add column if not exists person_software_id bigint;
alter table public.checklist_items add column if not exists completed_by_id uuid references auth.users(id) on delete set null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'checklist_items_person_software_id_fkey') then
    alter table public.checklist_items add constraint checklist_items_person_software_id_fkey
      foreign key (person_software_id) references public.person_software(id) on delete set null;
  end if;
end $$;
create unique index if not exists checklist_exit_software_unique
  on public.checklist_items (ticket_id, person_software_id) where person_software_id is not null;

create or replace function public.checklist_items_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare actor_name text;
begin
  if tg_op = 'INSERT' and auth.uid() is not null and new.completato then
    raise exception 'Una checklist si completa solo dopo averla presa in carico';
  end if;
  if tg_op = 'UPDATE' then
    new.ticket_id := old.ticket_id;
    new.testo := old.testo;
    new.person_software_id := old.person_software_id;
    if old.person_software_id is not null and old.completato and not new.completato then
      raise exception 'Una licenza ritirata non può essere riattivata annullando la spunta';
    end if;
  end if;
  if auth.uid() is not null then
    select coalesce(nullif(nome, ''), email) into actor_name from public.profiles where id = auth.uid();
    if new.completato then
      new.completed_at := coalesce(new.completed_at, now());
      new.completed_by_id := auth.uid();
      new.completed_by := coalesce(actor_name, 'IT');
    else
      new.completed_at := null;
      new.completed_by_id := null;
      new.completed_by := null;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.checklist_items_guard() from public, anon, authenticated;
drop trigger if exists checklist_items_guard on public.checklist_items;
create trigger checklist_items_guard before insert or update on public.checklist_items
for each row execute function public.checklist_items_guard();

create or replace function public.checklist_items_complete_license()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.person_software_id is not null and new.completato and not old.completato then
    update public.person_software set stato = 'DISMESSA', updated_at = now()
    where id = new.person_software_id and stato = 'ATTIVA';
  end if;
  return new;
end $$;
revoke all on function public.checklist_items_complete_license() from public, anon, authenticated;
drop trigger if exists checklist_items_complete_license on public.checklist_items;
create trigger checklist_items_complete_license after update of completato on public.checklist_items
for each row execute function public.checklist_items_complete_license();

create or replace function public.person_software_add_exit_checklist()
returns trigger language plpgsql security definer set search_path = public as $$
declare mv record; label text;
begin
  if new.stato <> 'ATTIVA' then return new; end if;
  select h.ticket_id into mv from public.hr_movements h
  where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO'
    and h.ticket_id is not null and h.person_id = new.person_id
  order by h.movement_date desc, h.id desc limit 1;
  if mv.ticket_id is null then return new; end if;
  label := 'Disattiva/revoca ' || coalesce(nullif(btrim(new.nome), ''), 'licenza o account') || ' e libera il posto';
  insert into public.checklist_items(ticket_id, testo, person_software_id)
  values (mv.ticket_id, label, new.id)
  on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;
  return new;
end $$;
revoke all on function public.person_software_add_exit_checklist() from public, anon, authenticated;
drop trigger if exists person_software_add_exit_checklist on public.person_software;
create trigger person_software_add_exit_checklist after insert or update of stato, nome, person_id, catalog_id on public.person_software
for each row execute function public.person_software_add_exit_checklist();

create or replace function public.trg_hr_movement_operational_checklist()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record; s record; full_name text;
begin
  if new.ticket_id is null then return new; end if;
  full_name := trim(coalesce(new.person_name,'') || ' ' || coalesce(new.person_surname,''));
  delete from public.checklist_items where ticket_id = new.ticket_id;

  if new.movement_type = 'NUOVO INGRESSO' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del nuovo ingresso'),
      (new.ticket_id,'Creazione/verifica account e accessi aziendali'),
      (new.ticket_id,'Preparazione postazione nella sede indicata'),
      (new.ticket_id,'Assegnazione hardware e aggiornamento censimento'),
      (new.ticket_id,'Installazione/verifica software e licenze necessarie'),
      (new.ticket_id,'Test accessi, rete/VDI e servizi'),
      (new.ticket_id,'Conferma con utente e chiusura');
  elsif new.movement_type = 'USCITA' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico dell’uscita'),
      (new.ticket_id,'Verifica della data effettiva di uscita'),
      (new.ticket_id,'Recupero hardware e accessori assegnati'),
      (new.ticket_id,'Disabilitazione account Active Directory e verifica accessi'),
      (new.ticket_id,'Disabilitazione account Google Workspace/Gmail'),
      (new.ticket_id,'Verifica e revoca licenze Microsoft Office 365'),
      (new.ticket_id,'Aggiornamento censimento e disponibilità degli asset'),
      (new.ticket_id,'Completa e registra il take-out della persona'),
      (new.ticket_id,'Verifica finale IT e chiusura');
  elsif new.movement_type = 'CAMBIO POSTAZIONE' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del cambio postazione'),
      (new.ticket_id,'Verifica nuova postazione e collegamenti'),
      (new.ticket_id,'Verifica monitor, dock e periferiche'),
      (new.ticket_id,'Verifica rete e servizi di postazione'),
      (new.ticket_id,'Aggiornamento posizione degli asset nel censimento'),
      (new.ticket_id,'Conferma con utente e chiusura');
  elsif new.movement_type = 'CAMBIO SEDE' then
    insert into public.checklist_items(ticket_id,testo) values
      (new.ticket_id,'Presa in carico del cambio sede'),
      (new.ticket_id,'Verifica hardware attualmente assegnato'),
      (new.ticket_id,'Preparazione accessi e postazione nella nuova sede'),
      (new.ticket_id,'Verifica rete/VDI/servizi della nuova sede'),
      (new.ticket_id,'Aggiornamento sede e posizione degli asset nel censimento'),
      (new.ticket_id,'Conferma con utente e chiusura');
  end if;

  for a in
    select id, asset_code, brand, model from public.assets
    where coalesce(is_label_only,false)=false and status not in ('DISMESSO','VENDUTO') and (
      (new.person_email is not null and lower(coalesce(assigned_user_email,'')) = lower(new.person_email))
      or (new.person_email is null and lower(trim(coalesce(assigned_user_name,''))) = lower(full_name))
    ) order by asset_code
  loop
    if new.movement_type = 'USCITA' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Recupera asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    elsif new.movement_type = 'CAMBIO SEDE' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Aggiorna sede asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    elsif new.movement_type = 'CAMBIO POSTAZIONE' then
      insert into public.checklist_items(ticket_id,testo) values (new.ticket_id,
        'Aggiorna posizione asset ' || a.asset_code || case when coalesce(a.brand,'')<>'' or coalesce(a.model,'')<>'' then ' — ' || trim(coalesce(a.brand,'') || ' ' || coalesce(a.model,'')) else '' end);
    end if;
  end loop;

  if new.movement_type = 'USCITA' then
    for s in
      select ps.id, ps.nome from public.person_software ps
      where ps.stato = 'ATTIVA' and (
        (new.person_id is not null and ps.person_id = new.person_id)
        or (new.person_id is null and exists (
          select 1 from public.people p where p.id = ps.person_id and (
            (new.person_email is not null and lower(coalesce(p.corporate_email,'')) = lower(new.person_email))
            or lower(btrim(p.display_name)) = lower(btrim(full_name))
          )
        ))
      ) order by ps.nome, ps.id
    loop
      insert into public.checklist_items(ticket_id,testo,person_software_id)
      values (new.ticket_id,'Disattiva/revoca ' || s.nome || ' e libera il posto',s.id)
      on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;
    end loop;
  end if;

  if new.needs_manual_check then
    insert into public.checklist_items(ticket_id,testo)
    values (new.ticket_id,'CONTROLLO MANUALE: storico precedente della persona non disponibile nel portale');
  end if;
  return new;
end $$;
drop trigger if exists hr_movement_operational_checklist on public.hr_movements;
create trigger hr_movement_operational_checklist after insert on public.hr_movements
for each row execute function public.trg_hr_movement_operational_checklist();
revoke all on function public.trg_hr_movement_operational_checklist() from public, anon, authenticated;

insert into public.checklist_items(ticket_id,testo)
select h.ticket_id, v.testo
from public.hr_movements h
cross join (values
  ('Completa e registra il take-out della persona'),
  ('Disabilitazione account Active Directory e verifica accessi'),
  ('Disabilitazione account Google Workspace/Gmail'),
  ('Verifica e revoca licenze Microsoft Office 365')
) as v(testo)
where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO' and h.ticket_id is not null
  and not exists (select 1 from public.checklist_items c where c.ticket_id=h.ticket_id and c.testo=v.testo);

-- Le uscite già aperte ricevono anche la checklist delle licenze ancora attive.
insert into public.checklist_items(ticket_id,testo,person_software_id)
select h.ticket_id, 'Disattiva/revoca ' || ps.nome || ' e libera il posto', ps.id
from public.hr_movements h
join public.person_software ps on ps.stato = 'ATTIVA'
join public.people p on p.id = ps.person_id
where h.movement_type = 'USCITA' and h.status <> 'ANNULLATO' and h.ticket_id is not null
  and ((h.person_id is not null and ps.person_id = h.person_id)
    or (h.person_id is null and ((h.person_email is not null and lower(coalesce(p.corporate_email,''))=lower(h.person_email))
      or lower(btrim(p.display_name))=lower(btrim(coalesce(h.person_name,'') || ' ' || coalesce(h.person_surname,''))))))
on conflict (ticket_id, person_software_id) where person_software_id is not null do nothing;

create or replace function public.guard_exit_ticket_completion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stato = 'CHIUSO' and old.stato is distinct from 'CHIUSO'
     and exists (select 1 from public.hr_movements h where h.ticket_id = new.id and h.movement_type = 'USCITA' and h.status <> 'ANNULLATO')
     and (not exists (select 1 from public.checklist_items c where c.ticket_id = new.id)
       or exists (select 1 from public.checklist_items c where c.ticket_id = new.id and not coalesce(c.completato,false))) then
    raise exception 'Non puoi chiudere l’uscita: completa tutte le attività della checklist IT';
  end if;
  return new;
end $$;
revoke all on function public.guard_exit_ticket_completion() from public, anon, authenticated;
drop trigger if exists guard_exit_ticket_completion on public.tickets;
create trigger guard_exit_ticket_completion before update of stato on public.tickets
for each row execute function public.guard_exit_ticket_completion();

