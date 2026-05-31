-- What the reviewer is rating within the selected area (society, sector, flat, etc.)
alter table reviews
  add column if not exists review_target_type text check (
    review_target_type in ('society', 'sector', 'pg', 'flat', 'locality')
  ),
  add column if not exists review_target_name text;
