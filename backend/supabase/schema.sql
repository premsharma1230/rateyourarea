-- RateYourArea Supabase schema (run in SQL Editor)

-- 1. AREAS TABLE
create table if not exists areas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  city text default 'Gurugram',
  sector text,
  type text check (
    type in ('society', 'sector', 'pg', 'locality')
  ),
  pincode text,
  description text,
  image_url text,
  lat float,
  lng float,
  created_at timestamp default now()
);

-- 2. REVIEWS TABLE
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  area_id uuid references areas(id) on delete cascade,
  area_slug text not null,
  user_id uuid references auth.users(id) on delete set null,
  is_anonymous boolean default true,
  reviewer_display_name text,
  resident_type text check (
    resident_type in (
      'current_tenant',
      'past_tenant',
      'owner',
      'past_owner'
    )
  ),
  resident_since text,
  duration text,
  rating_overall float not null check (rating_overall between 1 and 5),
  rating_water float check (rating_water between 1 and 5),
  rating_power float check (rating_power between 1 and 5),
  rating_security float check (rating_security between 1 and 5),
  rating_maintenance float check (rating_maintenance between 1 and 5),
  rating_internet float check (rating_internet between 1 and 5),
  rating_parking float check (rating_parking between 1 and 5),
  rating_schools float check (rating_schools between 1 and 5),
  rating_builder_trust float check (rating_builder_trust between 1 and 5),
  pros text,
  cons text,
  tags text[] default '{}',
  review_target_type text check (
    review_target_type in ('society', 'sector', 'pg', 'flat', 'locality')
  ),
  review_target_name text,
  recommended boolean default true,
  status text default 'published' check (
    status in ('published', 'pending', 'rejected')
  ),
  created_at timestamp default now()
);

-- 3. PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  area_name text,
  area_slug text,
  pincode text,
  resident_since text,
  duration_lived text,
  is_current_resident boolean default false,
  onboarding_status text default 'pending' check (
    onboarding_status in ('pending', 'email_confirm', 'complete')
  ),
  is_verified boolean default false,
  verification_type text check (
    verification_type in ('email', 'bill_upload', 'rwa_email')
  ),
  created_at timestamp default now()
);

-- 4. AREA STATS VIEW
create or replace view area_stats as
select
  area_slug,
  count(*) as total_reviews,
  round(avg(rating_overall)::numeric, 1) as avg_overall,
  round(avg(rating_water)::numeric, 1) as avg_water,
  round(avg(rating_power)::numeric, 1) as avg_power,
  round(avg(rating_security)::numeric, 1) as avg_security,
  round(avg(rating_maintenance)::numeric, 1) as avg_maintenance,
  round(avg(rating_internet)::numeric, 1) as avg_internet,
  round(avg(rating_parking)::numeric, 1) as avg_parking,
  round(avg(rating_schools)::numeric, 1) as avg_schools,
  round(avg(rating_builder_trust)::numeric, 1) as avg_builder_trust,
  count(*) filter (where recommended = true) as recommended_count
from reviews
where status = 'published'
group by area_slug;

-- ROW LEVEL SECURITY
alter table reviews enable row level security;
alter table areas enable row level security;
alter table profiles enable row level security;

drop policy if exists "Public read reviews" on reviews;
create policy "Public read reviews"
  on reviews for select
  using (status = 'published');

drop policy if exists "Public read areas" on areas;
create policy "Public read areas"
  on areas for select
  using (true);

drop policy if exists "Anyone can post review" on reviews;
create policy "Anyone can post review"
  on reviews for insert
  with check (true);

drop policy if exists "Owner update review" on reviews;
create policy "Owner update review"
  on reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Own profile only" on profiles;
create policy "Own profile only"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Insert own profile" on profiles;
create policy "Insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Update own profile" on profiles;
create policy "Update own profile"
  on profiles for update
  using (auth.uid() = id);

-- SEED: 10 Gurugram areas
insert into areas (name, slug, city, type, pincode, description, lat, lng)
values
  ('Golf Course Road', 'golf-course-road', 'Gurugram', 'locality', '122002',
   'Premium stretch with luxury high-rises', 28.4601, 77.0635),
  ('DLF Phase 5', 'dlf-phase-5', 'Gurugram', 'society', '122009',
   'Gated community with top amenities', 28.4595, 77.0266),
  ('Sushant Lok', 'sushant-lok', 'Gurugram', 'locality', '122009',
   'Central locality with markets', 28.4681, 77.0541),
  ('Sector 56', 'sector-56', 'Gurugram', 'sector', '122011',
   'Well connected residential sector', 28.4089, 77.0722),
  ('Sector 57', 'sector-57', 'Gurugram', 'sector', '122003',
   'Popular sector near golf course', 28.4156, 77.0698),
  ('Palam Vihar', 'palam-vihar', 'Gurugram', 'locality', '122017',
   'Affordable residential colony', 28.5023, 77.0198),
  ('South City', 'south-city', 'Gurugram', 'society', '122001',
   'Large township with amenities', 28.4234, 77.0312),
  ('Cyber City', 'cyber-city', 'Gurugram', 'locality', '122002',
   'IT hub with premium apartments', 28.4950, 77.0880),
  ('MG Road', 'mg-road', 'Gurugram', 'locality', '122002',
   'Commercial and residential mix', 28.4748, 77.0700),
  ('Nirvana Country', 'nirvana-country', 'Gurugram', 'society', '122018',
   'Gated society with green spaces', 28.3982, 77.0445)
on conflict (slug) do nothing;

-- MIGRATION: profile signup fields (safe to re-run on existing projects)
alter table profiles add column if not exists area_name text;
alter table profiles add column if not exists duration_lived text;
alter table profiles add column if not exists is_current_resident boolean default false;
alter table profiles add column if not exists onboarding_status text default 'pending';
alter table profiles drop column if exists bill_file_name;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_onboarding_status_check'
  ) then
    alter table profiles add constraint profiles_onboarding_status_check
      check (onboarding_status in ('pending', 'email_confirm', 'complete'));
  end if;
end $$;
