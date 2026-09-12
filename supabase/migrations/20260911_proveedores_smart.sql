-- =============================================================================
-- ProteínaSmart — Programa Proveedores Smart (cross-docking local).
-- Proveedores/comercios adheridos + campos de abastecimiento en productos.
-- Idempotente: CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS,
-- mismo patrón que 20260910_proteinasmart_2_0.sql y
-- 20260910_product_completeness_eligibility.sql.
--
-- Decisiones de diseño (revisar con contabilidad antes de ejecutar):
--   * retail_price NO se agrega: public.productos.precio ya es el precio
--     retail de venta en guaraníes (fields price/priceStatus en web).
--   * supplier_cost NO vive en productos a propósito: public.productos tiene
--     RLS de lectura anónima (es el catálogo público) y el costo B2B es
--     confidencial. Se separa en public.producto_costos con RLS
--     service_role-only, mismo patrón que digital_orders.
--   * stock_status reúsa el enum de web/lib/products.ts (StockStatus):
--     in_stock | low_stock | on_request | out_of_stock | pending_confirmation
-- =============================================================================

create extension if not exists pgcrypto;

-- 1. proveedores: comercios y distribuidores adheridos al programa.
--    RUC único; zona normalizada para el clustering logístico de Asunción.
create table if not exists public.proveedores (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  nombre_fantasia text,
  ruc text not null,
  contacto_nombre text,
  telefono_whatsapp text not null,
  email text,
  direccion text,
  zona text not null,
  horario_atencion text,
  habilitacion_municipal boolean not null default false,
  habilitacion_dinavisa boolean not null default false,
  estado text not null default 'prospecto',
  notas_operativas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint proveedores_razon_social_no_vacia check (btrim(razon_social) <> ''),
  constraint proveedores_ruc_no_vacio check (btrim(ruc) <> ''),
  constraint proveedores_telefono_no_vacio check (btrim(telefono_whatsapp) <> ''),
  constraint proveedores_zona_valida check (
    zona in ('villa_morra', 'san_martin', 'mariscal_lopez', 'lambare', 'asuncion_centro', 'zona_norte', 'otra')
  ),
  constraint proveedores_estado_valido check (
    estado in ('prospecto', 'piloto_activo', 'activo', 'inactivo', 'suspendido')
  ),
  constraint proveedores_ruc_unico unique (ruc)
);

-- 2. Extensión aditiva de productos (una columna por ALTER, patrón del repo).
--    Se mantienen 'proveedor' (text) y 'stock' (boolean) legacy sin tocar.
alter table public.productos add column if not exists supplier_id uuid references public.proveedores(id) on delete set null;
alter table public.productos add column if not exists stock_status text;
alter table public.productos add column if not exists sanitary_register text;
alter table public.productos add column if not exists sanitary_register_expiry date;
alter table public.productos add column if not exists fulfillment_type text not null default 'store_pickup';

-- stock_status: re-afirmar el constraint completo (drop + add) para que
-- ejecutar esta migración sobre cualquier estado previo deje los 5 valores.
alter table public.productos drop constraint if exists productos_stock_status_valido;
alter table public.productos add constraint productos_stock_status_valido check (
  stock_status is null or stock_status in ('in_stock', 'low_stock', 'on_request', 'out_of_stock', 'pending_confirmation')
);

alter table public.productos drop constraint if exists productos_fulfillment_type_valido;
alter table public.productos add constraint productos_fulfillment_type_valido check (
  fulfillment_type in ('store_pickup', 'supplier_dispatch', 'external_courier')
);

-- 3. producto_costos: costos B2B confidenciales, aislados del catálogo público.
create table if not exists public.producto_costos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.productos(id) on delete cascade,
  supplier_id uuid not null references public.proveedores(id) on delete cascade,
  supplier_cost integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint producto_costos_costo_no_negativo check (supplier_cost >= 0),
  constraint producto_costos_producto_proveedor_unico unique (product_id, supplier_id)
);

-- 4. Índices de consulta (convención del repo: <tabla>_<columna>_idx).
create index if not exists productos_supplier_id_idx on public.productos(supplier_id);
create index if not exists productos_stock_status_idx on public.productos(stock_status);
create index if not exists proveedores_zona_idx on public.proveedores(zona);
create index if not exists proveedores_estado_idx on public.proveedores(estado);

-- 5. RLS: proveedores y producto_costos son datos de negocio, no públicos.
alter table public.proveedores enable row level security;
alter table public.producto_costos enable row level security;

drop policy if exists "proveedores solo servicio" on public.proveedores;
create policy "proveedores solo servicio"
  on public.proveedores for all
  to service_role
  using (true) with check (true);

drop policy if exists "producto costos solo servicio" on public.producto_costos;
create policy "producto costos solo servicio"
  on public.producto_costos for all
  to service_role
  using (true) with check (true);

grant usage on schema public to service_role;
grant all on public.proveedores, public.producto_costos to service_role;