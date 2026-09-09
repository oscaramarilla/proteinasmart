# Imágenes del catálogo

Carpeta servida junto al sitio (`https://www.proteinasmart.com/images/...`).
`js/main.js` acepta rutas `images/...` y URLs HTTPS en el campo `imagen` de
cada producto.

## Convención

- **Nombre del archivo = `id` del producto** en `js/catalog.js`.
  Ej.: `whey-isolate-2lb` → `whey-isolate-2lb.webp`.
- **Formato:** WebP, fondo blanco o liso, ~800×800 px, calidad 75–80,
  objetivo < 100 KB por archivo.
- **Activación:** en `js/catalog.js`, agregar al producto
  `imagen: 'images/NOMBRE-DEL-ID.webp'`. Vacío = fallback tipográfico.
- Si una imagen falta o da 404, la tarjeta vuelve sola al diseño
  tipográfico (fallback ya implementado en `main.js`).

## Migración futura (Dossier §8)

Cuando se active el panel de carga con Supabase, las fotos pasan a un bucket
público de Supabase Storage y el campo `imagen` (columna `productos.imagen`)
pasa a guardar la URL pública del bucket. Mientras tanto, esta carpeta es la
fuente de las fotos.