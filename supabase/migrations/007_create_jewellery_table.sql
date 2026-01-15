-- Create jewellery table

create table if not exists public.jewellery (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),

  metal_type_purity text,
  gross_weight_grams numeric(10,3),
  gemstone_type text,
  carat_weight numeric(10,2),
  cut_and_shape text,
  color_and_clarity text,

  report_number text,
  report_date date,
  authorized_seal_signature text,

  images text[],
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists jewellery_is_active_idx on public.jewellery (is_active);
create index if not exists jewellery_created_at_idx on public.jewellery (created_at);
