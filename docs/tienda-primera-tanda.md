# Tienda de la raíz: primera tanda

## Alcance e instrucciones

Se revisaron README.md, la configuración de Vercel y la ubicación de instrucciones antes de editar. El único AGENTS.md está dentro de web/ y aplica al proyecto Next.js; no se modificó web/. Esta entrega conserva HTML/CSS/JS sin dependencias ni build.

## Comportamiento

- Portada solicitada, catálogo primero, objetivo, compra/confianza y entregas, asesoría y FAQ. Filosofía resumida dentro de confianza.
- Categoría y objetivo combinables, contador de resultados, limpiar filtros y enlaces compartibles. Las URL antiguas de disciplina siguen funcionando mediante equivalencias de categoría.
- Carrito modal con cantidades 1–99, eliminar, estado vacío, subtotal de referencia y envío separado. Persistencia en la misma clave local para conservar carritos existentes; datos dañados no rompen la página.
- Abrir WhatsApp solo prepara una consulta. No vacía el carrito, no emite ps:pedido, no registra compra/pago y no carga pedidos.js. El seguimiento automático anterior deja de originarse desde este clic; solo corresponde reactivarlo desde una confirmación comercial verificada.
- Se retiraron las insignias promocionales y las promesas de disponibilidad, entrega en el día, originalidad y protocolos automáticos que no tienen respaldo en estos registros.

## Recursos pendientes

Los 16 registros de js/catalog.js carecen de fotos de producto, marca, sabor y evidencia de stock. El repositorio solo incluye og-image.png (y una copia en Claude outputs/), una imagen social, más SVG del scaffolding de web/. Ninguno sirve como foto real de un producto.

Para cada ID se necesita una ficha del proveedor: SKU y marca, presentación exacta, sabor cuando aplique, foto del envase con permiso de uso, etiqueta nutricional, disponibilidad con fecha y precio de venta validado.

| ID | Presentación existente, de referencia |
|---|---|
| whey-isolate-2lb | 2 lb · 27 servicios |
| whey-concentrada-5lb | 5 lb · 68 servicios |
| proteina-vegana | 1 kg · 30 servicios |
| colageno-hidrolizado | 300 g · 30 servicios |
| creatina-mono | 300 g · 100 servicios |
| pre-entreno | 300 g · 30 servicios |
| eaa-bcaa | 400 g · 40 servicios |
| glutamina | 300 g · 60 servicios |
| aceite-mct | 500 ml |
| barras-keto | 12 u · 2 g carbos netos |
| sustituto-comida | 1 kg · 20 servicios |
| endulzante-monkfruit | 250 g |
| omega-3 | 120 cápsulas |
| magnesio-glicinato | 120 cápsulas |
| vitamina-d3-k2 | 90 cápsulas |
| nootropico-focus | 60 cápsulas |

Los importes siguen siendo referencias del catálogo previo, no precios actualizados ni confirmados. Su propio comentario identifica cinco precios estimados pendientes de proveedor: barras keto, sustituto de comida, endulzante monk fruit, nootrópico y glutamina. No se añadieron reseñas, certificaciones ni formación del asesor.

También faltan tarifas y plazos por zona. checkout.shippingFee queda null: «Envío a confirmar». Un cero solo debe configurarse si el negocio verifica que esa tarifa corresponde.

## Carga de información verificada

Cada fila admite marca, formato, sabor, imagen y stock, acompañados por verificado: { marca, formato, sabor, imagen, stock }. Marcar cada booleano true solo después de comprobar su fuente; registrar la evidencia y fecha junto al cambio del catálogo. La adaptación remota conserva esos indicadores y trata un stock ausente como desconocido. No habilitar fotos genéricas, insignias ni datos inferidos. Las presentaciones existentes se muestran como referencias hasta confirmarlas.

## Bancard: estructura, sin cobros

js/checkout.js separa cotización (currency PYG, subtotal, shippingFee, total) y proveedor. El total queda null si falta una tarifa o algún precio. providers.bancard.enabled siempre es false y createPayment falla explícitamente; no hay SDK, secretos, endpoint ni botón de cobro.

La próxima integración necesita backend para validar SKU/precios/stock, calcular envío, crear una orden pendiente y generar la transacción Bancard con credenciales del servidor. Debe verificar la confirmación del proveedor de forma autenticada e idempotente antes de marcar paid. La URL de retorno o un clic del cliente no pueden confirmar un pago. Primero integrar y probar en sandbox; la habilitación real queda fuera de esta tanda.

## Verificación reproducible

Ejecutar desde la raíz: `node --test tests/cart.test.cjs` y `python -m http.server 8765 --bind 127.0.0.1`. Chequeo JavaScript con la versión del lockfile: `npm exec --yes --package=typescript@5.9.3 -- tsc -p jsconfig.json`.

Pruebas de dominio: altas y cantidades, eliminación, snapshots inmutables, persistencia/recarga, almacenamiento bloqueado/corrupto, producto sin precio, envío desconocido/configurado/cero, límites y proveedor Bancard deshabilitado.

Pruebas Chrome: portada y catálogo de escritorio 1440×900; móvil 390×844 y 320×740; dos productos, +/−, eliminación, vacío, filtros combinados y limpiar. Abrir el enlace de WhatsApp y recargar conservó el carrito; no se envió un mensaje. El clic solo abre una pestaña con la selección preparada. Las ocho pruebas de dominio y el chequeo JavaScript con TypeScript 5.9.3 pasan.
