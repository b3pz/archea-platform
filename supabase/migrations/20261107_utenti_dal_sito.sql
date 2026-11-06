-- ARCHEA Platform · Gestione utenti dal sito, SENZA Edge Function
-- Da eseguire dopo 20261106_utenti_gruppi.sql (oppure usa supabase/SETUP_COMPLETO.sql).
-- Si può rieseguire senza danni.
--
-- Una sola funzione, public.admin_users(azione, dati), chiamata dal Service Desk
-- (Utenti e gruppi). Gira sul database con i diritti del proprietario, ma solo
-- chi ha il permesso "gestione_utenti" (o è SUPER_IT) può usarla.
--
-- Azioni: list, create, update, disable, enable, delete.

create extension if not exists pgcrypto with schema extensions;

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
    if v_ruolo = 'SUPER_IT' and not me_super then raise exception 'Solo un SUPER_IT può nominare un altro SUPER_IT'; end if;
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
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
      on conflict do nothing;
    end if;
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  -- da qui in poi serve l'utente
  v_id := nullif(p->>'id', '')::uuid;
  if v_id is null then raise exception 'Utente mancante'; end if;
  select pr.ruolo into v_target from public.profiles pr where pr.id = v_id;
  if v_target = 'SUPER_IT' and not me_super then raise exception 'Solo un SUPER_IT può modificare un SUPER_IT'; end if;

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
      delete from public.access_group_members m
      where m.user_id = v_id
        and m.group_id not in (select g::bigint from jsonb_array_elements_text(p->'gruppi') g);
      insert into public.access_group_members (group_id, user_id)
      select g::bigint, v_id from jsonb_array_elements_text(p->'gruppi') g
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

-- I SUPER_IT hanno anche il permesso gestione_mappe (correzione di my_permissions)
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
