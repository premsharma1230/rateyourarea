-- Run in Supabase SQL Editor on an EXISTING RateYourArea project
-- Adds signup step 2 & 3 profile columns (safe to re-run)

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
