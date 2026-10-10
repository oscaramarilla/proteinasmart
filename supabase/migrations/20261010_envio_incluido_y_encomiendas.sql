-- ProteinaSmart: envio incluido en el precio + empresas de encomienda reales.
-- Ejecutar en el SQL Editor de Supabase despues de
-- 20260908_metodos_entrega.sql. Idempotente: se puede re-ejecutar.
--
-- Contexto: en octubre de 2026 el negocio paso a envio incluido -- el costo
-- de entrega se traslado al precio de lista de cada producto (+Gs 30.000 por
-- unidad sobre la base de septiembre, ver el comentario de js/catalog.js).
-- Esta migracion alinea los textos de los metodos de entrega y reemplaza los
-- placeholders de courier_companies por las empresas reales.
--
-- NO toca el metodo 'pickup': su copy tiene los placeholders [DIRECCION] /
-- [X] que quedaron a cargo del negocio en la migracion anterior.

-- =============================================================
-- 1. courier_companies: empresas reales.
--    La lista no es exhaustiva ("y muchos mas" segun el negocio): se puede
--    seguir agregando filas sin tocar codigo.
-- =============================================================
insert into public.courier_companies (name, sort_order)
values
  ('Transruta', 1),
  ('Paraná Express', 2),
  ('La Guaireña', 3),
  ('TSI Transportadora San Ignacio', 4),
  ('La Misionera', 5),
  ('Occidental Express', 6)
on conflict (name) do update
  set sort_order = excluded.sort_order,
      active = true;

-- Los placeholders sembrados en 20260908 ya no van. Las ordenes viejas pueden
-- referenciarlos via delivery_details.courier_company_id, asi que no se borran
-- a ciegas: se borra solo lo que nadie referencia y el resto se desactiva
-- (la policy de lectura publica filtra por active = true, asi que dejan de
-- aparecer en el selector de todos modos).
update public.courier_companies c
  set active = false
  where c.name like '[Reemplazar]%'
    and exists (
      select 1 from public.delivery_details d where d.courier_company_id = c.id
    );

delete from public.courier_companies c
  where c.name like '[Reemplazar]%'
    and not exists (
      select 1 from public.delivery_details d where d.courier_company_id = c.id
    );

-- =============================================================
-- 2. shipping_methods: el copy tiene que decir que el envio ya esta
--    incluido en el precio. Solo se actualizan los tres metodos de envio;
--    'pickup' queda intacto.
-- =============================================================
update public.shipping_methods
  set copy = 'Envío gratis a tu puerta, ya incluido en el precio de cada producto.'
  where code = 'delivery_metro';

update public.shipping_methods
  set copy = 'Envío incluido en el precio: despachamos por encomienda a tu domicilio, a cualquier ciudad del país, sin costo adicional. Despachamos el mismo día los pedidos confirmados antes de las 14:00 — estamos al lado de la Terminal de Ómnibus.'
  where code = 'encomienda_puerta';

update public.shipping_methods
  set copy = 'Envío incluido en el precio: despachamos por encomienda a la agencia que elijas, en cualquier ciudad del país, sin costo adicional. Despachamos el mismo día los pedidos confirmados antes de las 14:00 — estamos al lado de la Terminal de Ómnibus.'
  where code = 'encomienda_agencia';

-- =============================================================
-- Verificacion -- correr dentro de BEGIN; ... ; ROLLBACK; para revisar.
-- =============================================================

-- -- Esperado: las 6 empresas reales, activas, sin ningun '[Reemplazar]' activo.
-- select name, active, sort_order
-- from public.courier_companies
-- order by active desc, sort_order;

-- -- Esperado: 0 filas.
-- select count(*) as placeholders_activos
-- from public.courier_companies
-- where name like '[Reemplazar]%' and active = true;

-- -- Esperado: ningun copy de envio con "a confirmar" / "a cotizar".
-- select code, copy from public.shipping_methods order by sort_order;
