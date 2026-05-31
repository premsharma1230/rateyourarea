-- Optional: copy signup fields from auth.users raw_user_meta_data into profiles
-- Run in Supabase SQL Editor if you want profiles rows created automatically on signup.
-- The app works without this: getProfile() falls back to user_metadata when no profiles row exists.

/*
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id,
    full_name,
    area_name,
    area_slug,
    pincode,
    duration_lived,
    is_current_resident,
    resident_since,
    onboarding_status
  )
  values (
    new.id,
    meta->>'full_name',
    meta->>'area_name',
    meta->>'area_slug',
    meta->>'pincode',
    meta->>'duration_lived',
    coalesce((meta->>'is_current_resident')::boolean, false),
    meta->>'resident_since',
    'complete'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    area_name = excluded.area_name,
    area_slug = excluded.area_slug,
    pincode = excluded.pincode,
    duration_lived = excluded.duration_lived,
    is_current_resident = excluded.is_current_resident,
    resident_since = excluded.resident_since,
    onboarding_status = excluded.onboarding_status;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_profile on auth.users;
create trigger on_auth_user_created_sync_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
*/
