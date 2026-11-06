-- ARCHEA Platform · Foto (cantieri e Off topic) su Supabase Storage
-- Da eseguire dopo le altre migrazioni (oppure usa supabase/SETUP_COMPLETO.sql). Si può rieseguire.
--
-- Le foto stanno nel "bucket" privato "foto": nessun link pubblico. Il sito chiede
-- di volta in volta un link temporaneo (1 ora), solo per utenti autenticati.
-- Cartelle: cantiere/<anno>/<uuid>.jpg   offtopic/<anno>/<uuid>.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto', 'foto', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists foto_read on storage.objects;
create policy foto_read on storage.objects for select to authenticated
  using (bucket_id = 'foto');
drop policy if exists foto_upload on storage.objects;
create policy foto_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'foto' and (storage.foldername(name))[1] in ('cantiere', 'offtopic'));
drop policy if exists foto_delete on storage.objects;
create policy foto_delete on storage.objects for delete to authenticated
  using (bucket_id = 'foto' and (owner = auth.uid() or public.is_it_staff()));

-- Archivio delle foto di cantiere
create table if not exists public.site_photos (
  id          bigserial primary key,
  cantiere    text not null check (char_length(btrim(cantiere)) between 2 and 120),
  path        text not null unique,
  nota        text,
  taken_at    timestamptz not null default now(),
  lat         double precision,
  lng         double precision,
  author_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_nome text,
  created_at  timestamptz not null default now()
);
create index if not exists site_photos_cantiere_idx on public.site_photos (cantiere, taken_at desc);

alter table public.site_photos enable row level security;
drop policy if exists site_photos_read on public.site_photos;
create policy site_photos_read on public.site_photos for select to authenticated using (true);
drop policy if exists site_photos_insert on public.site_photos;
create policy site_photos_insert on public.site_photos for insert to authenticated
  with check (author_id = auth.uid());
drop policy if exists site_photos_update on public.site_photos;
create policy site_photos_update on public.site_photos for update to authenticated
  using (author_id = auth.uid() or public.is_it_staff()) with check (author_id = auth.uid() or public.is_it_staff());
drop policy if exists site_photos_delete on public.site_photos;
create policy site_photos_delete on public.site_photos for delete to authenticated
  using (author_id = auth.uid() or public.is_it_staff());
grant select, insert, update, delete on public.site_photos to authenticated;
grant usage, select on sequence public.site_photos_id_seq to authenticated;

-- Foto negli argomenti e nelle risposte di Off topic
alter table public.forum_topics  add column if not exists immagini text[] not null default '{}';
alter table public.forum_replies add column if not exists immagini text[] not null default '{}';
