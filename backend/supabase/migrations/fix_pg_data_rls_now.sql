-- pg_data: Table Editor mein data dikhe, site par 0 → RLS block
-- Supabase SQL Editor → paste ALL → Run

-- Option A (recommended): public read policy
alter table pg_data enable row level security;

drop policy if exists "Public read pg_data" on pg_data;

create policy "Public read pg_data"
  on pg_data
  for select
  to public
  using (true);

grant usage on schema public to anon, authenticated;
grant select on table pg_data to anon, authenticated;

-- Option B (agar Option A ke baad bhi site 0 ho — quick fix)
-- alter table pg_data disable row level security;
-- grant select on table pg_data to anon, authenticated;

-- Verify (116 aana chahiye):
-- select count(*) from pg_data;
