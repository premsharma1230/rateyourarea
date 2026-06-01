-- Google Maps fields on areas (for CSV import / PG listings fallback)
alter table areas
  add column if not exists address text,
  add column if not exists rating_google float check (
    rating_google is null or (rating_google >= 0 and rating_google <= 5)
  ),
  add column if not exists reviews_google text,
  add column if not exists maps_url text,
  add column if not exists hours text,
  add column if not exists phone text;
