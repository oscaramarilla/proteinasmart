-- Señal liviana de demanda: no requiere RUC, dirección ni reserva.
-- Ejecutar por separado después de las migraciones existentes.

create table if not exists public.product_interest (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.productos(id) on delete cascade,
  telefono text not null,
  creado_en timestamptz not null default timezone('utc', now()),
  constraint product_interest_telefono_no_vacio check (btrim(telefono) <> '')
);

create index if not exists product_interest_product_id_idx
  on public.product_interest(product_id);

create index if not exists product_interest_creado_en_idx
  on public.product_interest(creado_en desc);

alter table public.product_interest enable row level security;

drop policy if exists "product interest insercion anonima" on public.product_interest;
create policy "product interest insercion anonima"
  on public.product_interest
  for insert
  to anon, authenticated
  with check (btrim(telefono) <> '');

grant usage on schema public to anon, authenticated;
grant insert on public.product_interest to anon, authenticated;
-- No se concede SELECT al cliente; el ranking se consulta con service_role en /admin.
