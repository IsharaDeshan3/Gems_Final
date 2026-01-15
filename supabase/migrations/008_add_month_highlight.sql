-- Add monthly highlight flag for Gems and Jewellery

alter table if exists public.gems
  add column if not exists is_month_highlight boolean not null default false;

alter table if exists public.jewellery
  add column if not exists is_month_highlight boolean not null default false;

alter table if exists public.jwellery
  add column if not exists is_month_highlight boolean not null default false;

create index if not exists gems_is_month_highlight_idx on public.gems (is_month_highlight);
create index if not exists jewellery_is_month_highlight_idx on public.jewellery (is_month_highlight);
create index if not exists jwellery_is_month_highlight_idx on public.jwellery (is_month_highlight);
