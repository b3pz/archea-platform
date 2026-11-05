-- ARCHEA Platform · abilitare un nuovo utente reale
--
-- PASSO 1 (dashboard, non SQL):
--   Supabase → Authentication → Users → Add user → Create new user
--   inserisci email e password, spunta "Auto Confirm User" → Create user
--
-- PASSO 2 (questo script): Supabase → SQL Editor → New query → incolla →
--   cambia EMAIL, NOME e RUOLO qui sotto → Run
--
-- RUOLO: USER (apre ticket), HR, IT, SUPER_IT

insert into public.profiles (id, email, nome, ruolo)
select u.id, u.email, 'Nome Cognome', 'USER'
from auth.users u
where lower(u.email) = lower('nome.cognome@archea.it')
on conflict (id) do update
  set nome = excluded.nome,
      ruolo = excluded.ruolo;

-- Controllo: deve comparire una riga
select id, email, nome, ruolo from public.profiles where lower(email) = lower('nome.cognome@archea.it');
