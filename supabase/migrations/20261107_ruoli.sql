-- ARCHEA Platform · Ruoli: chi fa cosa
-- Si può rieseguire senza danni. Sostituisce la funzione admin_users con regole più strette.
--
--   USER      apre ticket e segue le sue task
--   HR        + persone, movimenti (ingressi, uscite, spostamenti), planimetrie
--   IT        + gestione IT (coda, censimento, dashboard) e creazione utenti USER e HR
--   SUPER_IT  tutto, compresi gli account IT, i gruppi che gestiscono gli utenti e la console sviluppatore

create or replace function public.admin_users(p_action text, p jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  me_id     uuid := auth.uid();
  me_super  boolean;
  v_id      uuid;
  v_email   text;
  v_nome    text;
  v_ruolo   text;
  v_pwd     text;
  v_target  text;
  v_result  jsonb;
begin
  if me_id is null or not public.has_perm('gestione_utenti') then
    raise exception 'Non hai il permesso di gestire gli utenti';
  end if;
  me_super := exists (select 1 from public.profiles where id = me_id and ruolo = 'SUPER_IT');

  -- ---------- elenco: TUTTI gli account che possono accedere ----------
  if p_action = 'list' then
    select coalesce(jsonb_agg(x order by x->>'nome' nulls last, x->>'email'), '[]'::jsonb) into v_result
    from (
      select jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'nome', pr.nome,
        'ruolo', pr.ruolo,
        'has_profile', pr.id is not null,
        'confirmed', u.email_confirmed_at is not null,
        'invited', u.invited_at is not null and u.last_sign_in_at is null,
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'disabled', u.banned_until is not null and u.banned_until > now(),
        'gruppi', coalesce((select jsonb_agg(m.group_id) from public.access_group_members m where m.user_id = u.id), '[]'::jsonb)
      ) as x
      from auth.users u
      left join public.profiles pr on pr.id = u.id
      where u.deleted_at is null
    ) t;
    return jsonb_build_object('users', v_result);
  end if;

  -- ruolo richiesto (create / update)
  if p ? 'ruolo' then
    v_ruolo := coalesce(nullif(p->>'ruolo', ''), 'USER');
    if v_ruolo not in ('USER', 'HR', 'IT', 'SUPER_IT') then raise exception 'Ruolo non valido'; end if;
    if v_ruolo in ('IT', 'SUPER_IT') and not me_super then raise exception 'Solo il super admin può dare il ruolo IT o super admin'; end if;
  end if;

  -- ---------- nuovo utente con password ----------
  if p_action = 'create' then
    v_email := lower(btrim(coalesce(p->>'email', '')));
    v_nome  := btrim(coalesce(p->>'nome', ''));
    v_pwd   := coalesce(p->>'password', '');
    if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Email non valida'; end if;
    if char_length(v_nome) < 2 then raise exception 'Scrivi nome e cognome'; end if;
    if coalesce((p->>'invite')::boolean, false) then
      raise exception 'L''invito per email richiede la Edge Function: scegli "Password temporanea"';
    end if;
    if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
    if exists (select 1 from auth.users where lower(email) = v_email) then
      raise exception 'Esiste già un account con questa email';
    end if;
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome', v_nome), now(), now(),
      '', '', '', '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      now(), now(), now());
    insert into public.profiles (id, email, nome, ruolo)
    values (v_id, v_email, v_nome, coalesce(v_ruolo, 'USER'))
    on conflict (id) do update set email = excluded.email, nome = excluded.nome, ruolo = excluded.ruolo;
    if p ? 'gruppi' then
    if not me_super and exists (
      select 1 from public.access_groups g
      where 'gestione_utenti' = any (g.permessi)
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x)
             or g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x))
            is distinct from (g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
    ) then
      raise exception 'Solo il super admin può aggiungere o togliere persone dai gruppi che gestiscono gli utenti';
    end if;
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    -- chi diventa IT entra da solo nel gruppo IT (che dà i permessi del reparto)
    if v_ruolo = 'IT' then
      insert into public.access_group_members (group_id, user_id)
      select g.id, v_id from public.access_groups g where g.nome = 'IT'
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  -- da qui in poi serve l'utente
  v_id := nullif(p->>'id', '')::uuid;
  if v_id is null then raise exception 'Utente mancante'; end if;
  select pr.ruolo into v_target from public.profiles pr where pr.id = v_id;
  -- gli account IT e super admin li gestisce solo il super admin (ognuno può cambiare nome e password propri)
  if v_target in ('IT', 'SUPER_IT') and not me_super and v_id <> me_id then
    raise exception 'Gli account IT li gestisce solo il super admin';
  end if;

  -- ---------- modifica: nome, ruolo, password, gruppi ----------
  if p_action = 'update' then
    if v_id = me_id and v_ruolo is not null and v_ruolo is distinct from v_target then
      raise exception 'Non puoi cambiare il tuo ruolo';
    end if;
    select email into v_email from auth.users where id = v_id;
    if v_email is null then raise exception 'Utente non trovato'; end if;
    if p ? 'nome' or v_ruolo is not null then
      insert into public.profiles (id, email, nome, ruolo)
      values (v_id, v_email, nullif(btrim(coalesce(p->>'nome', '')), ''), coalesce(v_ruolo, v_target, 'USER'))
      on conflict (id) do update set
        nome  = coalesce(nullif(btrim(coalesce(p->>'nome', '')), ''), public.profiles.nome),
        ruolo = coalesce(v_ruolo, public.profiles.ruolo);
    end if;
    v_pwd := coalesce(p->>'password', '');
    if v_pwd <> '' then
      if char_length(v_pwd) < 8 then raise exception 'La password deve avere almeno 8 caratteri'; end if;
      update auth.users set encrypted_password = extensions.crypt(v_pwd, extensions.gen_salt('bf')), updated_at = now()
      where id = v_id;
    end if;
    if p ? 'gruppi' then
    if not me_super and exists (
      select 1 from public.access_groups g
      where 'gestione_utenti' = any (g.permessi)
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x)
             or g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        and (g.id in (select x::bigint from jsonb_array_elements_text(coalesce(p->'gruppi', '[]'::jsonb)) x))
            is distinct from (g.id in (select m.group_id from public.access_group_members m where m.user_id = coalesce(v_id, '00000000-0000-0000-0000-000000000000'::uuid)))
    ) then
      raise exception 'Solo il super admin può aggiungere o togliere persone dai gruppi che gestiscono gli utenti';
    end if;
      delete from public.access_group_members m
      where m.user_id = v_id
        and m.group_id not in (select g::bigint from jsonb_array_elements_text(p->'gruppi') g);
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    -- chi diventa IT entra da solo nel gruppo IT (che dà i permessi del reparto)
    if v_ruolo = 'IT' then
      insert into public.access_group_members (group_id, user_id)
      select g.id, v_id from public.access_groups g where g.nome = 'IT'
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- disattiva / riattiva: non entra più, lo storico resta ----------
  if p_action in ('disable', 'enable') then
    if v_id = me_id then raise exception 'Non puoi disattivare te stesso'; end if;
    update auth.users
       set banned_until = case when p_action = 'disable' then now() + interval '100 years' else null end,
           updated_at = now()
     where id = v_id;
    if p_action = 'disable' then delete from auth.sessions where user_id = v_id; end if;
    return jsonb_build_object('ok', true);
  end if;

  -- ---------- elimina ----------
  if p_action = 'delete' then
    if v_id = me_id then raise exception 'Non puoi eliminare te stesso'; end if;
    begin
      delete from public.access_group_members where user_id = v_id;
      delete from public.profiles where id = v_id;
      delete from auth.users where id = v_id;
    exception when foreign_key_violation then
      raise exception 'Impossibile eliminare: l''utente ha ticket o dati collegati. Usa "Disattiva": non potrà più accedere e lo storico resta.';
    end;
    return jsonb_build_object('ok', true);
  end if;

  raise exception 'Azione sconosciuta: %', p_action;
end $$;

revoke all on function public.admin_users(text, jsonb) from public, anon;
grant execute on function public.admin_users(text, jsonb) to authenticated;

-- I gruppi che danno "gestione utenti" li modifica solo il super admin
create or replace function public.is_super_it()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'SUPER_IT');
$$;
revoke all on function public.is_super_it() from public, anon;
grant execute on function public.is_super_it() to authenticated;

drop policy if exists groups_manage on public.access_groups;
create policy groups_manage on public.access_groups for all to authenticated
  using (public.has_perm('gestione_utenti') and (public.is_super_it() or not ('gestione_utenti' = any (permessi))))
  with check (public.has_perm('gestione_utenti') and (public.is_super_it() or not ('gestione_utenti' = any (permessi))));

drop policy if exists members_manage on public.access_group_members;
create policy members_manage on public.access_group_members for all to authenticated
  using (public.has_perm('gestione_utenti') and (public.is_super_it()
         or not exists (select 1 from public.access_groups g where g.id = group_id and 'gestione_utenti' = any (g.permessi))))
  with check (public.has_perm('gestione_utenti') and (public.is_super_it()
         or not exists (select 1 from public.access_groups g where g.id = group_id and 'gestione_utenti' = any (g.permessi))));

-- Il ruolo IT o super admin lo assegna solo il super admin (anche fuori dal sito)
create or replace function public.profiles_guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ruolo is distinct from old.ruolo and auth.uid() is not null then
    if not public.has_perm('gestione_utenti') then
      raise exception 'Non hai il permesso di cambiare il ruolo';
    end if;
    if (new.ruolo in ('IT', 'SUPER_IT') or old.ruolo in ('IT', 'SUPER_IT')) and not public.is_super_it() then
      raise exception 'Il ruolo IT o super admin lo cambia solo il super admin';
    end if;
  end if;
  return new;
end $$;

-- Tutti gli IT e super admin di oggi stanno nel gruppo IT
insert into public.access_group_members (group_id, user_id)
select g.id, p.id from public.access_groups g, public.profiles p
where g.nome = 'IT' and p.ruolo in ('IT', 'SUPER_IT')
on conflict do nothing;
