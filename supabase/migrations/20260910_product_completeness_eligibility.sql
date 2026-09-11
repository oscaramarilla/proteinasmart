-- Campos operativos para completitud y elegibilidad. Migración aditiva.
alter table public.productos add column if not exists price_status text not null default 'pending_confirmation';
alter table public.productos add column if not exists recommendation_status text not null default 'MANUAL_REVIEW';
alter table public.productos add column if not exists image_verified boolean not null default false;
alter table public.productos add column if not exists flavor text;
alter table public.productos add column if not exists serving_size text;
alter table public.productos add column if not exists nutritional_info jsonb;
alter table public.productos add column if not exists supplier text;
alter table public.productos add column if not exists authenticity_evidence jsonb not null default '[]'::jsonb;
alter table public.productos drop constraint if exists productos_stock_status_valido;
alter table public.productos add constraint productos_stock_status_valido check (stock_status is null or stock_status in ('in_stock', 'low_stock', 'on_request', 'out_of_stock', 'pending_confirmation'));
alter table public.productos drop constraint if exists productos_price_status_valido;
alter table public.productos add constraint productos_price_status_valido check (price_status in ('confirmed', 'pending_confirmation'));
alter table public.productos drop constraint if exists productos_recommendation_status_valido;
alter table public.productos add constraint productos_recommendation_status_valido check (recommendation_status in ('PRIMARY_ELIGIBLE', 'OPTIONAL_ELIGIBLE', 'CATALOG_ONLY', 'MANUAL_REVIEW'));
alter table public.productos drop constraint if exists productos_authenticity_evidence_array;
alter table public.productos add constraint productos_authenticity_evidence_array check (jsonb_typeof(authenticity_evidence) = 'array');
