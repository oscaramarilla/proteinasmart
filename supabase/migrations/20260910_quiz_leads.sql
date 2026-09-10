-- ProteinaSmart: leads del Smart Quiz (Fase 1 del embudo Home -> Hoja de
-- Ruta). Tabla independiente de orders/delivery_details/invoices -- el
-- checkout de preventa (/checkout) no la toca.

create extension if not exists pgcrypto;

create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  whatsapp_phone text not null,
  objetivo text not null,
  frecuencia text not null,
  dieta text not null,
  presupuesto text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint quiz_leads_whatsapp_no_vacio check (btrim(whatsapp_phone) <> ''),
  constraint quiz_leads_objetivo_valido
    check (objetivo in ('masa', 'grasa', 'belleza', 'foco')),
  constraint quiz_leads_frecuencia_valida
    check (frecuencia in ('0', '1-2', '3-5', '6+')),
  constraint quiz_leads_dieta_valida
    check (dieta in ('tradicional', 'low-carb', 'plant-based')),
  constraint quiz_leads_presupuesto_valido
    check (presupuesto in ('menos-300', '300-600', 'mas-600'))
);

create index if not exists quiz_leads_created_at_idx
  on public.quiz_leads(created_at desc);

alter table public.quiz_leads enable row level security;

-- Sin politica de lectura/escritura para anon/authenticated a proposito: el
-- insert ocurre server-side con la service role key (web/app/actions.ts),
-- mismo patron que orders/delivery_details/invoices en
-- 20260908_metodos_entrega.sql.
drop policy if exists "quiz leads solo servicio" on public.quiz_leads;
create policy "quiz leads solo servicio"
  on public.quiz_leads for all
  to service_role
  using (true) with check (true);

grant usage on schema public to service_role;
grant all on public.quiz_leads to service_role;
