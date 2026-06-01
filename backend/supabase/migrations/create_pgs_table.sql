-- Dedicated PG / hostel listings (Google Maps CSV import + app use)

create table if not exists pgs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  city text default 'Gurugram',
  sector text,
  pincode text,
  description text,
  image_url text,
  lat float,
  lng float,
  type text,
  category text,
  address text,
  rating float check (rating is null or (rating >= 0 and rating <= 5)),
  reviews_count integer default 0,
  hours text,
  top_review text,
  maps_url text,
  -- Optional link to parent area / sector
  area_slug text,
  area_id uuid references areas(id) on delete set null,
  -- PG-specific (optional on import)
  gender text check (
    gender is null or gender in ('boys', 'girls', 'co_ed')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists pgs_city_sector_idx on pgs (city, sector);
create index if not exists pgs_area_slug_idx on pgs (area_slug);
create index if not exists pgs_slug_idx on pgs (slug);

alter table pgs enable row level security;

drop policy if exists "Public read pgs" on pgs;
create policy "Public read pgs"
  on pgs for select
  using (true);

drop policy if exists "Authenticated insert pgs" on pgs;
create policy "Authenticated insert pgs"
  on pgs for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated update pgs" on pgs;
create policy "Authenticated update pgs"
  on pgs for update
  using (auth.role() = 'authenticated');
