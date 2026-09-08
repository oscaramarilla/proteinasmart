-- ProteinaSmart: cierre de pedidos_whatsapp a escrituras nuevas.
--
-- Separado de 20260908_metodos_entrega.sql a proposito: el sitio estatico
-- legacy (js/pedidos.js) todavia postea pedidos anonimos a esta tabla. Si
-- ese sitio sigue atendiendo trafico real, aplicar esto corta el registro
-- de esas ventas (siguen yendo por WhatsApp igual -- js/pedidos.js es
-- fail-silent por diseño -- pero dejan de quedar en Supabase).
--
-- Aplicar SOLO despues del cutover: cuando el sitio estatico este apagado,
-- redirigido al checkout nuevo, o cuando se confirme que ya no recibe
-- trafico de checkout.

drop policy if exists "pedidos whatsapp insercion anonima" on public.pedidos_whatsapp;
revoke insert on public.pedidos_whatsapp from anon;
