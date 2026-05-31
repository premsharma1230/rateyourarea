-- Display name snapshot for logged-in (non-anonymous) reviews
alter table reviews add column if not exists reviewer_display_name text;
