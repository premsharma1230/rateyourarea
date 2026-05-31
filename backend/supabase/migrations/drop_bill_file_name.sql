-- Run in Supabase SQL Editor on an EXISTING RateYourArea project
-- Removes unused bill upload column from profiles (safe to re-run)

alter table profiles drop column if exists bill_file_name;
