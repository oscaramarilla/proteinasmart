# Imágenes del catálogo

Carpeta servida junto al sitio (`https://www.proteinasmart.com/images/...`).
`js/main.js` acepta rutas `images/...` y URLs HTTPS en el campo `imagen` de
cada producto.

## Archivos recibidos y revisión visual (9 de septiembre de 2026)

La carpeta real es `images/`, no `image/`. Se conservaron los nombres recibidos.
Los archivos se inspeccionaron visualmente antes de vincularlos; no se copiaron
marcas, sabores, certificaciones ni datos nutricionales al catálogo. Las imágenes
vinculadas se muestran como **referenciales**, con `imagenReferencial: true`:
la fotografía, las etiquetas y la presentación final requieren confirmación del proveedor.

| Producto (`id`) | Archivo vinculado | Observación |
|---|---|---|
| `whey-isolate-2lb` | `wheyptrotein.webp` | Coincide 2 lb; imagen indica 29 tomas y ficha 27 servicios. |
| `proteina-vegana` | `proteinavegetal.webp` | Coincide 1 kg; imagen indica unas 33 tomas y ficha 30 servicios. |
| `creatina-mono` | `creatinamonohidratada.webp` | Coincide 300 g; no se infiere cantidad de servicios de la imagen. |
| `pre-entreno` | `preentrenopowerboost.webp` | Coinciden 300 g y unas 30 tomas. |
| `sustituto-comida` | `akmuerzosmart.webp` | Coincide 1 kg; no se infiere cantidad de servicios. |
| `omega-3` | `omega3.webp` | Coinciden 120 cápsulas; el lote visible vence en septiembre de 2026, confirmar lote vigente. |
| `magnesio-glicinato` | `magnesio.webp` | Coinciden 120 cápsulas. |
| `eaa-bcaa` | `aminoacidos.webp` | Envase de 300 g frente a ficha de 400 g. Vinculada tras revisión manual del negocio (9 sep 2026) pese a la discrepancia. |
| `glutamina` | `lglutamina.webp` | Coinciden 300 g / 60 servicios. Etiqueta visible con vencimiento en diciembre de 2025 — confirmar lote vigente antes de reusar en otro canal. |
| `aceite-mct` | `aceitedecocomct.webp` | Coincide 500 ml. Etiqueta visible con vencimiento en diciembre de 2025 — confirmar lote vigente. |
| `barras-keto` | `barrasketo.webp` | Etiqueta declara 3 g de carbohidratos netos frente a ficha de 2 g. Vinculada tras revisión manual del negocio (9 sep 2026) pese a la discrepancia. |
| `endulzante-monkfruit` | `eritritolyfrutosdelbosque.webp` | Envase de 500 g frente a ficha de 250 g (el doble). Vinculada tras revisión manual del negocio (9 sep 2026) pese a la discrepancia. |
| `vitamina-d3-k2` | `vitaminade3yk2.webp` | Imagen indica 60 cápsulas / Gs 300.000 frente a ficha de 90 / Gs 145.000 — parece otro SKU. Vinculada de todos modos por decisión del negocio (9 sep 2026) tras revisión manual. |
| `nootropico-focus` | `nootropico.webp` | Otra fórmula (cafeína, bacopa, ginkgo) y precio Gs 350.000 frente a L-teanina + colina / Gs 195.000 — parece otro producto. Vinculada de todos modos por decisión del negocio (9 sep 2026) tras revisión manual. |

Estas catorce imágenes WebP pesan entre 17 KB y 75 KB cada una. Los dos
productos restantes mantienen `imagen: ''` y el diseño tipográfico:

| Producto | Archivo disponible | Motivo para no vincularlo todavía |
|---|---|---|
| Whey concentrada | `wheyconcetrate.webp` | Envase de 2 lb / 28 servicios frente a ficha de 5 lb / 68. |
| Colágeno | Ninguno | No se recibió un archivo correspondiente. |

`creatina.webp` es una alternativa de 300 g que declara unas 60 tomas frente a
los 100 servicios del catálogo; se eligió `creatinamonohidratada.webp`.
`asesoria.webp`, `clienteobjetivo.webp` y `embudo.webp` no corresponden a un SKU.

**Nota sobre `vitaminade3yk2.webp` y `nootropico.webp`:** a diferencia de las
demás, estas dos difieren del producto en precio y (la segunda) en fórmula
completa, no solo en peso o vencimiento visible. El negocio las revisó
manualmente y decidió vincularlas igual (9 sep 2026); si se corrige el precio
o la composición del producto más adelante, revisar si la foto sigue
correspondiendo.

## Convención para futuras imágenes

- Preferir **nombre del archivo = `id` del producto** en `js/catalog.js`.
  Ej.: `whey-isolate-2lb` → `whey-isolate-2lb.webp`.
- **Formato:** WebP, fondo blanco o liso, ~800×800 px, calidad 75–80,
  objetivo < 100 KB por archivo.
- **Activación:** en `js/catalog.js`, agregar al producto
  `imagen: 'images/NOMBRE-DEL-ID.webp'`. Vacío = fallback tipográfico.
- Mantener `imagenReferencial: true` mientras no se confirme que la imagen
  corresponde exactamente a la presentación ofrecida.
- Si una imagen falta o da 404, la tarjeta vuelve sola al diseño
  tipográfico (fallback ya implementado en `main.js`).

## Migración futura (Dossier §8)

Cuando se active el panel de carga con Supabase, las fotos pasan a un bucket
público de Supabase Storage y el campo `imagen` (columna `productos.imagen`)
pasa a guardar la URL pública del bucket. Mientras tanto, esta carpeta es la
fuente de las fotos.
