-- areas table: app/API read (same pattern as pg_data)
-- Supabase SQL Editor → Run

alter table areas enable row level security;

drop policy if exists "Public read areas" on areas;
create policy "Public read areas"
  on areas
  for select
  to anon, authenticated
  using (true);

grant select on table areas to anon, authenticated;
