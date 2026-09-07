-- ProteinaSmart: esquema base para Supabase/PostgreSQL
-- Ejecutar en el SQL Editor de Supabase.

create extension if not exists pgcrypto;

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  creado_en timestamptz not null default timezone('utc', now()),
  constraint categorias_nombre_no_vacio check (btrim(nombre) <> ''),
  constraint categorias_slug_formato check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categorias_slug_unico unique (slug)
);

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio integer not null,
  unidad_medida text not null,
  proveedor text,
  es_refrigerado boolean not null default false,
  etiquetas text[] not null default '{}'::text[],
  categoria_id uuid references public.categorias(id) on delete set null,
  creado_en timestamptz not null default timezone('utc', now()),
  actualizado_en timestamptz not null default timezone('utc', now()),
  constraint productos_nombre_no_vacio check (btrim(nombre) <> ''),
  constraint productos_precio_no_negativo check (precio >= 0),
  constraint productos_unidad_no_vacia check (btrim(unidad_medida) <> '')
);

-- Contrato extendido del catalogo Vanilla. Estas alteraciones son aditivas y
-- permiten ejecutar el esquema sobre una tabla productos ya existente.
alter table public.productos add column if not exists marca text;
alter table public.productos add column if not exists formato text;
alter table public.productos add column if not exists categoria text;
alter table public.productos add column if not exists objetivos text[] not null default '{}'::text[];
alter table public.productos add column if not exists disciplinas text[] not null default '{}'::text[];
alter table public.productos add column if not exists resumen text;
alter table public.productos add column if not exists imagen text;
alter table public.productos add column if not exists stock boolean not null default true;
alter table public.productos add column if not exists protocolo text;
alter table public.productos add column if not exists complemento text;
alter table public.productos add column if not exists dosis text;
alter table public.productos add column if not exists momento text;
alter table public.productos add column if not exists duracion text;

create table if not exists public.pedidos_whatsapp (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  telefono text not null,
  total integer not null,
  items_json jsonb not null,
  estado_entrega text not null default 'pendiente',
  fecha_pedido timestamptz not null default timezone('utc', now()),
  constraint pedidos_cliente_no_vacio check (btrim(cliente_nombre) <> ''),
  constraint pedidos_telefono_no_vacio check (btrim(telefono) <> ''),
  constraint pedidos_total_no_negativo check (total >= 0),
  constraint pedidos_items_array check (jsonb_typeof(items_json) = 'array'),
  constraint pedidos_estado_valido check (estado_entrega in ('pendiente', 'enviado'))
);

create index if not exists productos_categoria_id_idx
  on public.productos(categoria_id);

create index if not exists productos_etiquetas_idx
  on public.productos using gin(etiquetas);

create index if not exists productos_disciplinas_idx
  on public.productos using gin(disciplinas);

create index if not exists pedidos_fecha_pedido_idx
  on public.pedidos_whatsapp(fecha_pedido desc);

-- RLS: el catálogo puede consultarse desde el frontend con la anon key.
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.pedidos_whatsapp enable row level security;

drop policy if exists "categorias lectura publica" on public.categorias;
create policy "categorias lectura publica"
  on public.categorias
  for select
  to anon, authenticated
  using (true);

drop policy if exists "productos lectura publica" on public.productos;
create policy "productos lectura publica"
  on public.productos
  for select
  to anon, authenticated
  using (true);

-- El checkout web puede crear un pedido, pero no puede leerlo, modificarlo
-- ni eliminarlo. La gestión posterior debe hacerse desde un entorno seguro.
drop policy if exists "pedidos whatsapp insercion anonima" on public.pedidos_whatsapp;
create policy "pedidos whatsapp insercion anonima"
  on public.pedidos_whatsapp
  for insert
  to anon
  with check (
    btrim(cliente_nombre) <> ''
    and btrim(telefono) <> ''
    and total >= 0
    and jsonb_typeof(items_json) = 'array'
    and estado_entrega = 'pendiente'
  );

-- Permisos explícitos para el API de Supabase.
grant usage on schema public to anon, authenticated;
grant select on public.categorias, public.productos to anon, authenticated;
grant insert on public.pedidos_whatsapp to anon;
