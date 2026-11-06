-- ARCHEA Platform · Off topic: modificare i propri argomenti e le proprie risposte
-- Si può rieseguire senza danni.
-- Solo l'autore può cambiare il testo (i moderatori possono mettere in evidenza, chiudere ed eliminare,
-- ma non riscrivere le parole degli altri). Dopo la modifica compare "modificato".

alter table public.forum_topics  add column if not exists edited_at timestamptz;
alter table public.forum_replies add column if not exists edited_at timestamptz;

-- Argomenti: regole di modifica (sostituisce la versione precedente della funzione)
create or replace function public.forum_guard_topic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if not public.has_perm('moderazione_offtopic') then
    new.pinned := old.pinned;
    new.locked := old.locked;
  end if;
  if old.author_id is distinct from auth.uid() then
    new.titolo := old.titolo;
    new.corpo := old.corpo;
    new.categoria := old.categoria;
    new.immagini := old.immagini;
  end if;
  if new.titolo is distinct from old.titolo or new.corpo is distinct from old.corpo or new.categoria is distinct from old.categoria then
    new.edited_at := now();
  else
    new.edited_at := old.edited_at;
  end if;
  new.author_id := old.author_id;
  new.author_nome := old.author_nome;
  new.created_at := old.created_at;
  new.replies_count := old.replies_count;
  return new;
end $$;

-- Risposte: l'autore può modificare il testo
create or replace function public.forum_guard_reply()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.id := old.id;
  new.topic_id := old.topic_id;
  new.author_id := old.author_id;
  new.author_nome := old.author_nome;
  new.created_at := old.created_at;
  new.edited_at := case when new.corpo is distinct from old.corpo then now() else old.edited_at end;
  return new;
end $$;
drop trigger if exists forum_replies_guard on public.forum_replies;
create trigger forum_replies_guard before update on public.forum_replies
  for each row execute function public.forum_guard_reply();

drop policy if exists forum_r_update on public.forum_replies;
create policy forum_r_update on public.forum_replies for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
grant update on public.forum_replies to authenticated;
