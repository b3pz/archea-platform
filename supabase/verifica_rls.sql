-- ARCHEA Platform · controllo RLS (sola lettura, non modifica nulla)
-- Supabase → SQL Editor → New query → incolla → Run

-- 1) Tabelle pubbliche e stato RLS (attenzione alle righe con rls_attiva = false)
select
  c.relname                as tabella,
  c.relrowsecurity         as rls_attiva,
  c.relforcerowsecurity    as rls_forzata,
  (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as numero_policy
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;

-- 2) Elenco completo delle policy
select
  tablename  as tabella,
  policyname as policy,
  cmd        as operazione,
  roles      as ruoli,
  qual       as condizione_lettura,
  with_check as condizione_scrittura
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 3) Policy permissive "per tutti" da rivedere con attenzione
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
  and (qual = 'true' or with_check = 'true')
order by tablename;
