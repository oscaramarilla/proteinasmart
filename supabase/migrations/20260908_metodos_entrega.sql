-- ProteinaSmart: paso de entrega del checkout (metodos, ciudades, encomiendas,
-- ordenes y facturacion manual). Ejecutar en el SQL Editor de Supabase
-- despues de schema.sql y de las migraciones previas.
--
-- Decision: orders es la tabla buena; pedidos_whatsapp queda deprecada.
-- Su historial se copia a orders en el mismo id, para que
-- seguimientos_pendientes.pedido_id (repuntado a orders) siga siendo
-- valido para las filas migradas.
--
-- El corte de escrituras de pedidos_whatsapp (revocar su policy de insert
-- anonimo) NO esta en este archivo a proposito -- ver
-- 20260908_deprecar_pedidos_whatsapp.sql, que se aplica por separado
-- despues del cutover, para no cortarle las ventas al sitio estatico
-- legacy si sigue atendiendo trafico cuando se aplique esta migracion.
--
-- pedidos_whatsapp.id y orders.id son ambos `uuid` (ver schema.sql linea
-- ~17 y la definicion de orders mas abajo) -- el backfill que reutiliza el
-- id no tiene conflicto de tipos.

create extension if not exists pgcrypto;

-- =============================================================
-- 1. shipping_methods: catalogo de metodos de entrega (editable).
-- =============================================================
create table if not exists public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  copy text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint shipping_methods_code_no_vacio check (btrim(code) <> ''),
  constraint shipping_methods_code_unico unique (code),
  constraint shipping_methods_label_no_vacio check (btrim(label) <> '')
);

-- Placeholders [DIRECCIÓN] / [X] a cargo del usuario -- no tocar aca.
insert into public.shipping_methods (code, label, enabled, sort_order, copy)
values
  (
    'pickup',
    'Retiro en el local',
    true,
    1,
    'Retirá en nuestro local: [DIRECCIÓN], a [X] cuadras de la Terminal de Ómnibus de Asunción y cerca del Mercado de Abasto.'
  ),
  (
    'delivery_metro',
    'Envío en Gran Asunción',
    true,
    2,
    'Envío sin costo en Gran Asunción.'
  ),
  (
    'encomienda_puerta',
    'Encomienda — puerta a puerta',
    true,
    3,
    'Despachamos el mismo día — estamos al lado de la Terminal de Ómnibus.'
  ),
  (
    'encomienda_agencia',
    'Encomienda — retiro en agencia',
    true,
    4,
    'Despachamos el mismo día — estamos al lado de la Terminal de Ómnibus.'
  )
on conflict (code) do nothing;

-- =============================================================
-- 2. metro_cities: ciudades con envío propio sin costo (editable).
--    Lista exacta de CLAUDE.md, sin agregados.
-- =============================================================
create table if not exists public.metro_cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint metro_cities_name_no_vacio check (btrim(name) <> ''),
  constraint metro_cities_name_unico unique (name)
);

insert into public.metro_cities (name)
values
  ('Asunción'),
  ('Fernando de la Mora'),
  ('San Lorenzo'),
  ('Lambaré'),
  ('Luque'),
  ('Mariano Roque Alonso'),
  ('Ñemby'),
  ('San Antonio'),
  ('Villa Elisa'),
  ('Limpio'),
  ('Capiatá')
on conflict (name) do nothing;

-- =============================================================
-- 3. courier_companies: empresas de encomienda (editable, sin API).
-- =============================================================
create table if not exists public.courier_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint courier_companies_name_no_vacio check (btrim(name) <> ''),
  constraint courier_companies_name_unico unique (name)
);

-- TODO: confirmar lista. Sembradas para que los dos metodos de encomienda
-- tengan opciones seleccionables desde el dia uno; reemplazar por los
-- nombres reales de las empresas con las que se trabaja.
insert into public.courier_companies (name, sort_order)
values
  ('[Reemplazar] Empresa de encomienda 1', 1),
  ('[Reemplazar] Empresa de encomienda 2', 2),
  ('[Reemplazar] Empresa de encomienda 3', 3)
on conflict (name) do nothing;

-- =============================================================
-- 4. orders: orden general. shipping_method_code y datos fiscales son
--    obligatorios para toda orden nativa del checkout (origen='checkout');
--    las filas migradas desde pedidos_whatsapp (origen='legacy') no los
--    tenian, y quedan exentas de esa regla via el CHECK de mas abajo.
--
--    compra_realizada es un eje independiente de estado: estado describe
--    el ciclo del pedido de cara al cliente (pendiente/confirmado/
--    entregado/cancelado); compra_realizada describe si ya se repuso el
--    stock comprandolo al mayorista. Un pedido puede estar 'entregado' y
--    seguir necesitando reposicion -- por eso no se mezclan en el mismo
--    campo. El Dashboard de Compras (marcarComoComprado en
--    web/app/admin/page.tsx) solo toca estas dos columnas.
-- =============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  total integer not null,
  items_json jsonb not null,
  estado text not null default 'pendiente',
  compra_realizada boolean not null default false,
  compra_realizada_en timestamptz,
  origen text not null default 'checkout',
  idempotency_key text,
  shipping_method_code text not null references public.shipping_methods(code),
  fiscal_document_type text,
  fiscal_document_number text,
  fiscal_business_name text,
  fiscal_email text,
  seguimiento_25dias_enviado boolean not null default false,
  seguimiento_enviado_en timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint orders_customer_name_no_vacio check (btrim(customer_name) <> ''),
  constraint orders_phone_no_vacio check (btrim(phone) <> ''),
  constraint orders_total_no_negativo check (total >= 0),
  constraint orders_items_array check (jsonb_typeof(items_json) = 'array'),
  constraint orders_estado_valido
    check (estado in ('pendiente', 'confirmado', 'entregado', 'cancelado')),
  constraint orders_origen_valido check (origen in ('checkout', 'legacy')),
  constraint orders_idempotency_key_unico unique (idempotency_key),
  constraint orders_fiscal_document_type_valido
    check (fiscal_document_type is null or fiscal_document_type in ('RUC', 'CI')),
  constraint orders_fiscal_completo_si_checkout check (
    origen <> 'checkout' or (
      fiscal_document_type is not null
      and btrim(coalesce(fiscal_document_number, '')) <> ''
      and btrim(coalesce(fiscal_business_name, '')) <> ''
      and btrim(coalesce(fiscal_email, '')) <> ''
    )
  )
);

create index if not exists orders_shipping_method_idx
  on public.orders(shipping_method_code);

create index if not exists orders_created_at_idx
  on public.orders(created_at desc);

create index if not exists orders_estado_idx
  on public.orders(estado);

create index if not exists orders_compra_pendiente_idx
  on public.orders (created_at)
  where compra_realizada = false;

create index if not exists orders_seguimiento_25dias_idx
  on public.orders (created_at)
  where seguimiento_25dias_enviado = false;

-- =============================================================
-- 5. delivery_details: campos condicionales por metodo, una fila por
--    orden. Que campos son obligatorios segun el metodo se valida en el
--    Server Action -- Postgres no puede expresar un CHECK que dependa de
--    una columna de otra tabla (orders.shipping_method_code).
-- =============================================================
create table if not exists public.delivery_details (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  third_party_name text,
  third_party_ci text,
  address text,
  city text,
  reference text,
  department text,
  destination_city_agency text,
  recipient_ci text,
  courier_company_id uuid references public.courier_companies(id),
  created_at timestamptz not null default timezone('utc', now()),
  constraint delivery_details_order_unico unique (order_id)
);

-- =============================================================
-- 6. invoices: facturacion manual. ManualInvoiceIssuer
--    (web/lib/invoicing/) crea una fila pending_manual por cada orden
--    nueva del checkout. /admin/facturas la transiciona a issued o void.
-- =============================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  mode text not null default 'manual',
  status text not null default 'pending_manual',
  numero text,
  timbrado text,
  issued_at timestamptz,
  issued_by text,
  scan_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint invoices_order_unico unique (order_id),
  constraint invoices_mode_valido check (mode in ('manual', 'electronic')),
  constraint invoices_status_valido check (status in ('pending_manual', 'issued', 'void')),
  constraint invoices_issued_requiere_datos check (
    status <> 'issued' or (
      btrim(coalesce(numero, '')) <> ''
      and btrim(coalesce(timbrado, '')) <> ''
      and issued_at is not null
      and btrim(coalesce(issued_by, '')) <> ''
    )
  )
);

create index if not exists invoices_status_idx on public.invoices(status);

-- =============================================================
-- 7. Backfill: copiar el historico de pedidos_whatsapp a orders,
--    conservando el mismo id (para que seguimientos_pendientes.pedido_id
--    siga siendo valido despues de repuntar su FK mas abajo). metodo de
--    entrega por defecto 'pickup' (dato que pedidos_whatsapp no tenia).
--    on conflict (id) do nothing hace esto seguro de re-ejecutar.
-- =============================================================
insert into public.orders (
  id, customer_name, phone, total, items_json, estado, origen,
  shipping_method_code, seguimiento_25dias_enviado, seguimiento_enviado_en,
  created_at
)
select
  id,
  cliente_nombre,
  telefono,
  total,
  items_json,
  case estado_entrega when 'enviado' then 'entregado' else 'pendiente' end,
  'legacy',
  'pickup',
  seguimiento_25dias_enviado,
  seguimiento_enviado_en,
  fecha_pedido
from public.pedidos_whatsapp
on conflict (id) do nothing;

-- Repuntar seguimientos_pendientes a orders ahora que el backfill garantiza
-- que cada pedido_id existente tiene una fila correspondiente en orders.
alter table public.seguimientos_pendientes
  drop constraint if exists seguimientos_pendientes_pedido_id_fkey;

alter table public.seguimientos_pendientes
  add constraint seguimientos_pendientes_pedido_id_fkey
  foreign key (pedido_id) references public.orders(id) on delete cascade;

-- pedidos_whatsapp sigue aceptando inserts anonimos despues de este
-- archivo -- a proposito. Ver 20260908_deprecar_pedidos_whatsapp.sql.

-- =============================================================
-- RLS
-- =============================================================
alter table public.shipping_methods enable row level security;
alter table public.metro_cities enable row level security;
alter table public.courier_companies enable row level security;
alter table public.orders enable row level security;
alter table public.delivery_details enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "shipping methods lectura publica" on public.shipping_methods;
create policy "shipping methods lectura publica"
  on public.shipping_methods for select
  to anon, authenticated
  using (enabled = true);

drop policy if exists "shipping methods solo servicio escribe" on public.shipping_methods;
create policy "shipping methods solo servicio escribe"
  on public.shipping_methods for all
  to service_role
  using (true) with check (true);

drop policy if exists "metro cities lectura publica" on public.metro_cities;
create policy "metro cities lectura publica"
  on public.metro_cities for select
  to anon, authenticated
  using (active = true);

drop policy if exists "metro cities solo servicio escribe" on public.metro_cities;
create policy "metro cities solo servicio escribe"
  on public.metro_cities for all
  to service_role
  using (true) with check (true);

drop policy if exists "courier companies lectura publica" on public.courier_companies;
create policy "courier companies lectura publica"
  on public.courier_companies for select
  to anon, authenticated
  using (active = true);

drop policy if exists "courier companies solo servicio escribe" on public.courier_companies;
create policy "courier companies solo servicio escribe"
  on public.courier_companies for all
  to service_role
  using (true) with check (true);

-- orders/delivery_details/invoices: sin politicas para anon/authenticated a
-- proposito. El checkout inserta con la service role key desde el Server
-- Action (web/app/checkout/actions.ts), nunca directo desde el navegador,
-- porque la validacion de campos obligatorios por metodo vive en TypeScript.
drop policy if exists "orders solo servicio" on public.orders;
create policy "orders solo servicio"
  on public.orders for all
  to service_role
  using (true) with check (true);

drop policy if exists "delivery details solo servicio" on public.delivery_details;
create policy "delivery details solo servicio"
  on public.delivery_details for all
  to service_role
  using (true) with check (true);

drop policy if exists "invoices solo servicio" on public.invoices;
create policy "invoices solo servicio"
  on public.invoices for all
  to service_role
  using (true) with check (true);

-- =============================================================
-- Permisos
-- =============================================================
grant usage on schema public to anon, authenticated, service_role;
grant select on public.shipping_methods, public.metro_cities, public.courier_companies
  to anon, authenticated;
grant all on public.shipping_methods, public.metro_cities, public.courier_companies,
  public.orders, public.delivery_details, public.invoices
  to service_role;

-- =============================================================
-- Verificacion (dry run) -- pensado para correr todo este archivo dentro
-- de BEGIN; ... ; ROLLBACK; y revisar estos conteos antes de comitear.
-- Descomentar el bloque para usarlo.
-- =============================================================

-- -- Filas en pedidos_whatsapp antes del backfill (referencia).
-- select count(*) as pedidos_whatsapp_total from public.pedidos_whatsapp;

-- -- Filas en orders despues del backfill: deberia ser >= pedidos_whatsapp_total
-- -- (>= porque tambien puede haber ordenes 'checkout' si esto se corre
-- -- despues de que el checkout nuevo ya genero trafico).
-- select count(*) as orders_total from public.orders;
-- select count(*) as orders_legacy from public.orders where origen = 'legacy';
-- select count(*) as orders_checkout from public.orders where origen = 'checkout';

-- -- Todo pedidos_whatsapp.id debe existir en orders.id despues del backfill.
-- select count(*) as pedidos_whatsapp_sin_migrar
-- from public.pedidos_whatsapp pw
-- where not exists (select 1 from public.orders o where o.id = pw.id);

-- -- delivery_details e invoices solo existen para ordenes 'checkout'
-- -- (el backfill no crea filas ahi -- pedidos_whatsapp nunca tuvo esos datos).
-- select count(*) as delivery_details_total from public.delivery_details;
-- select count(*) as invoices_total from public.invoices;

-- -- Ningun seguimientos_pendientes.pedido_id debe quedar huerfano despues
-- -- de repuntar la FK a orders. Esperado: 0 filas.
-- select sp.id, sp.pedido_id
-- from public.seguimientos_pendientes sp
-- where not exists (select 1 from public.orders o where o.id = sp.pedido_id);
