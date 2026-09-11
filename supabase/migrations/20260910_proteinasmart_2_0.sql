-- ProteínaSmart 2.0: extensión aditiva. No elimina ni modifica datos existentes.
alter table public.productos add column if not exists slug text;
alter table public.productos add column if not exists stock_status text;
alter table public.productos add column if not exists stock_quantity integer;
alter table public.productos add column if not exists stock_updated_at timestamptz;
alter table public.productos add column if not exists price_updated_at timestamptz;
alter table public.productos add column if not exists ingredientes text[];
alter table public.productos add column if not exists protein_per_serving numeric;
alter table public.productos add column if not exists servings integer;
alter table public.productos add column if not exists distributor text;
alter table public.productos add column if not exists importer text;
alter table public.productos add column if not exists lot text;
alter table public.productos add column if not exists expiration_date date;
alter table public.productos add column if not exists active boolean not null default true;
create unique index if not exists productos_slug_unico_idx on public.productos(slug) where slug is not null;
alter table public.productos drop constraint if exists productos_stock_status_valido;
alter table public.productos add constraint productos_stock_status_valido check (stock_status is null or stock_status in ('in_stock', 'low_stock', 'on_request', 'out_of_stock'));

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  estimated_min_hours integer, estimated_max_hours integer, min_price integer, max_price integer,
  available boolean not null default false, created_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(), goal text not null, training_frequency text not null,
  training_months integer not null default 0, structured_routine boolean not null default false,
  budget_tier text not null, stack text, safety_status text not null, source text, created_at timestamptz not null default timezone('utc', now()),
  constraint quiz_safety_status_valido check (safety_status in ('OK', 'REVIEW_REQUIRED'))
);
create table if not exists public.product_usage (
  id uuid primary key default gen_random_uuid(), customer_id uuid, product_id uuid references public.productos(id) on delete set null,
  opened_at timestamptz, servings_total numeric, servings_per_day numeric,
  estimated_depletion_date date, reorder_contact_date date, created_at timestamptz not null default timezone('utc', now())
);
alter table public.delivery_zones enable row level security;
alter table public.quiz_results enable row level security;
alter table public.product_usage enable row level security;
