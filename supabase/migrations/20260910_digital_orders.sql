-- ProteinaSmart: ordenes digitales (Fase 2 - tripwire "Hoja de Ruta 90 Dias",
-- Gs 49.000) y su pago via Bancard vPOS (Compra Simple / single_buy). Tabla
-- independiente de orders/delivery_details/invoices -- este producto digital
-- no tiene envio ni facturacion manual, se paga online.

create extension if not exists pgcrypto;

create table if not exists public.digital_orders (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  status text not null default 'pending',
  -- Token de acceso publico para /ruta/[token]. Se genera aparte del id
  -- (uuid) a proposito: separa el identificador interno del que viaja en
  -- la URL publica.
  token text not null default encode(gen_random_bytes(24), 'hex'),
  -- shop_process_id: identificador que ProteinaSmart le manda a Bancard en
  -- cada operacion (single_buy / confirm / rollback). Bancard exige un
  -- entero definido por el comercio -- bigserial da uno unico y creciente
  -- sin coordinacion adicional. No estaba en el pedido original, pero sin
  -- el no hay integracion posible con vPOS.
  shop_process_id bigserial not null,
  amount integer not null default 49000,
  -- process_id: lo devuelve Bancard al crear el single_buy -- hace falta
  -- para montar el iframe de bancard-checkout-js en el frontend.
  process_id text,
  confirmed_at timestamptz,
  -- Payload crudo del ultimo "single_buy confirm" que mando Bancard, para
  -- poder auditar/depurar un pago sin depender solo de status.
  bancard_response jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint digital_orders_phone_no_vacio check (btrim(phone) <> ''),
  constraint digital_orders_status_valido
    check (status in ('pending', 'paid', 'failed', 'rolled_back')),
  constraint digital_orders_amount_positivo check (amount > 0),
  constraint digital_orders_token_unico unique (token),
  constraint digital_orders_shop_process_id_unico unique (shop_process_id)
);

create index if not exists digital_orders_status_idx on public.digital_orders(status);
create index if not exists digital_orders_created_at_idx on public.digital_orders(created_at desc);

alter table public.digital_orders enable row level security;

-- Sin politicas para anon/authenticated a proposito: toda la escritura y
-- lectura pasa por Route Handlers server-side con la service role key
-- (web/app/api/checkout, web/app/api/bancard/confirm, web/app/ruta/[token]),
-- mismo patron que orders/delivery_details/invoices en
-- 20260908_metodos_entrega.sql.
drop policy if exists "digital orders solo servicio" on public.digital_orders;
create policy "digital orders solo servicio"
  on public.digital_orders for all
  to service_role
  using (true) with check (true);

grant usage on schema public to service_role;
grant all on public.digital_orders to service_role;
