# ProteínaSmart 2.0 — arquitectura

El sitio desplegado permanece en la raíz vanilla. `web/` es la aplicación Next.js 16 con App Router preparada para el cutover: las páginas de catálogo y producto son Server Components; el Quiz es el único flujo interactivo.

La transición parte de `web/lib/products.ts`. Replica los 16 ítems publicados y omite atributos no verificados. Supabase debe convertirse en su fuente de verdad una vez aplicada la migración `20260910_proteinasmart_2_0.sql` y cargados los datos comprobados.

Flujo: Smart Quiz → resultado sin datos clínicos en URL de WhatsApp → confirmación comercial → pedido → uso por producto → reposición. No se debe publicar precio, stock o trazabilidad si no fueron confirmados.
