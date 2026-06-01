-- pg_data table DELETE / RECREATE ke baad HAR BAAR chalao
-- Dashboard: select count(*) → 116 | App: 0 = yeh SQL missing hai
-- Supabase SQL Editor → Run → "Success. No rows returned" = OK

alter table pg_data enable row level security;

drop policy if exists "Public read pg_data" on pg_data;
create policy "Public read pg_data"
  on pg_data
  for select
  to public
  using (true);

grant usage on schema public to anon, authenticated;
grant select on table pg_data to anon, authenticated;
