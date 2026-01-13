-- Add new gem specification fields (text inputs)
-- Keeps existing legacy columns for compatibility, but makes new columns available.

alter table if exists public.gems
  add column if not exists identification text,
  add column if not exists weight_carats text,
  add column if not exists shape_and_cut text,
  add column if not exists dimensions text,
  add column if not exists treatments text;

-- Ensure inserts work even if category isn't provided by the app.
-- Use a safe default that should satisfy older check constraints.
alter table if exists public.gems
  alter column category set default 'Other';

update public.gems
set category = 'Other'
where category is null;

-- Optional: add lightweight indexes for common search/filter fields
create index if not exists gems_origin_idx on public.gems (origin);
create index if not exists gems_is_active_idx on public.gems (is_active);
