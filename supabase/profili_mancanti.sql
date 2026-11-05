-- ARCHEA Platform · crea il profilo per gli utenti registrati che non ce l'hanno
-- Risolve l'errore "Account senza profilo nel Service Desk".
-- Supabase → SQL Editor → New query → incolla → Run. Si può rieseguire.
-- Tutti i nuovi profili sono USER; il ruolo si cambia poi da Table Editor → profiles.

insert into public.profiles (id, email, nome, ruolo)
select u.id,
       u.email,
       initcap(replace(split_part(u.email, '@', 1), '.', ' ')),
       'USER'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

select email, nome, ruolo from public.profiles order by email;
