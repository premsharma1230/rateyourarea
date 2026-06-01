-- Google Maps scrape / CSV import fields for areas
alter table areas
  add column if not exists category text,
  add column if not exists address text,
  add column if not exists rating float check (rating between 0 and 5),
  add column if not exists reviews_count integer default 0,
  add column if not exists hours text,
  add column if not exists top_review text,
  add column if not exists maps_url text;
