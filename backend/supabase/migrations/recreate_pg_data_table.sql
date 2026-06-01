-- pg_data table delete ho gayi thi → yeh poora script Supabase SQL Editor mein Run karo
-- Phir CSV dubara import karo (Table Editor → pg_data → Import)

-- 1) Table (areas jaisi columns + app mapping)
create table if not exists pg_data (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique,
  city text default 'Gurugram',
  sector text,
  pincode text,
  description text,
  image_url text,
  lat double precision,
  lng double precision,
  category text,
  address text,
  rating double precision,
  reviews_count integer default 0,
  hours text,
  top_review text,
  maps_url text,
  created_at timestamptz default now()
);

create index if not exists pg_data_slug_idx on pg_data (slug);
create index if not exists pg_data_name_idx on pg_data (name);

-- 2) App read (anon key) — delete ke baad dubara zaroori
alter table pg_data enable row level security;

drop policy if exists "Public read pg_data" on pg_data;
create policy "Public read pg_data"
  on pg_data
  for select
  to anon, authenticated
  using (true);

grant select on table pg_data to anon, authenticated;

-- 3) Verify (116 ya tumhari row count aani chahiye)
-- select count(*) from pg_data;
