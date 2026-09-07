-- ProteinaSmart: seguimiento de recompra a 25 dias.
-- Ejecutar despues de schema.sql y antes de configurar el cron.

alter table public.pedidos_whatsapp
  add column if not exists seguimiento_25dias_enviado boolean not null default false;

alter table public.pedidos_whatsapp
  add column if not exists seguimiento_enviado_en timestamptz;

create index if not exists pedidos_seguimiento_25dias_idx
  on public.pedidos_whatsapp (fecha_pedido)
  where seguimiento_25dias_enviado = false;

create table if not exists public.seguimientos_pendientes (
  id bigint generated always as identity primary key,
  pedido_id uuid references public.pedidos_whatsapp(id) on delete cascade,
  items_json jsonb not null,
  protocolo text,
  total integer not null,
  estado text not null default 'pendiente',
  creado_en timestamptz not null default timezone('utc', now()),
  constraint seguimientos_pendientes_items_array check (jsonb_typeof(items_json) = 'array'),
  constraint seguimientos_pendientes_pedido_unico unique (pedido_id)
);

alter table public.seguimientos_pendientes enable row level security;
drop policy if exists "seguimientos solo servicio" on public.seguimientos_pendientes;
create policy "seguimientos solo servicio"
  on public.seguimientos_pendientes
  for all to service_role
  using (true)
  with check (true);

grant usage on schema public to service_role;
grant all on public.seguimientos_pendientes to service_role;

-- Habilitar extensiones desde el SQL Editor si tu proyecto las permite.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- No ejecutar hasta reemplazar TU_PROYECTO y TU_SERVICE_ROLE_KEY con secretos.
-- select cron.schedule(
--   'seguimiento-25-dias-diario', '0 9 * * *',
--   $$ select net.http_post(
--     url := 'https://TU_PROYECTO.supabase.co/functions/v1/seguimiento-25-dias',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer TU_SERVICE_ROLE_KEY'
--     ),
--     body := '{}'::jsonb
--   ); $$
-- );
