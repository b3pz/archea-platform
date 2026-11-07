-- ARCHEA Platform · Rubrica fornitori aperta a tutti, con traccia di chi modifica
-- Si può rieseguire senza danni. Richiede licenze_fornitori.
--
-- Tutti gli account possono aggiungere e correggere fornitori: si vede sempre chi l'ha
-- creato e chi l'ha modificato per ultimo. Eliminare resta a chi l'ha creato, all'IT
-- (fornitori IT), ai PM (fornitori di progetto) e al Super admin.

alter table public.suppliers add column if not exists created_by_name text;
alter table public.suppliers add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.suppliers add column if not exists updated_by_name text;

create or replace function public.suppliers_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select coalesce(nullif(nome, ''), email) into who from public.profiles where id = auth.uid();
  if tg_op = 'INSERT' then
    new.created_by := auth.uid(); new.created_by_name := who; new.created_at := now();
  else
    new.created_by := old.created_by; new.created_by_name := old.created_by_name; new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid(); new.updated_by_name := who; new.updated_at := now();
  return new;
end $$;
drop trigger if exists suppliers_stamp on public.suppliers;
create trigger suppliers_stamp before insert or update on public.suppliers
  for each row execute function public.suppliers_stamp();

drop policy if exists sup_insert on public.suppliers;
create policy sup_insert on public.suppliers for insert to authenticated with check (auth.uid() is not null);
drop policy if exists sup_update on public.suppliers;
create policy sup_update on public.suppliers for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists sup_delete on public.suppliers;
create policy sup_delete on public.suppliers for delete to authenticated
  using (created_by = auth.uid() or public.supplier_can_edit(ambito));
