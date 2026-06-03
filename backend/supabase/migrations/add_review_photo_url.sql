-- Review photos (user uploads) + public storage bucket
-- Run in Supabase SQL Editor

alter table reviews
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read review photos" on storage.objects;
create policy "Public read review photos"
  on storage.objects for select
  using (bucket_id = 'review-photos');

drop policy if exists "Anyone can upload review photos" on storage.objects;
create policy "Anyone can upload review photos"
  on storage.objects for insert
  with check (bucket_id = 'review-photos');
