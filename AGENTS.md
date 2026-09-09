# AGENTS.md — Contexto del repositorio para agentes de código

Leé esto completo antes de hacer cambios. Si algo de acá contradice una
instrucción puntual del usuario, gana la instrucción puntual.

## Qué es

**ProteínaSmart** — marketplace de proteínas y suplementos de Paraguay
(proteinasmart.com). No compite por precio: vende *criterio de compra*
(qué tomar, cuándo, con qué combinarlo). El documento de negocio es
`DOSSIER_PREMIUM.md`.

Hay **dos aplicaciones** en este repo:

1. **Sitio vanilla (raíz del repo):** `index.html` + `css/` + `js/`.
   Sin build, sin dependencias. Es lo que está desplegado en Vercel
   (deploy automático de la raíz). Catálogo con checkout por WhatsApp,
   selector por objetivo, carrito en localStorage.
2. **App Next.js (`web/`):** catálogo sobre Supabase, `/checkout`,
   `/admin`, facturación manual. En desarrollo (cutover).

## Arquitectura del sitio vanilla (regla de oro)

`Configuración define / Dominio decide / Servicios ejecutan / Presentación muestra`

| Archivo | Rol |
|---|---|
| `js/config.js` | Contacto, WhatsApp, envíos, pagos, tracking, `formEndpoint` |
| `js/catalog.js` | Array `PS_CATALOG` + categorías + objetivos + asesoría por producto |
| `js/data-source.js` | Fuente híbrida: catálogo Supabase (CDN ESM) con fallback inmediato al local |
| `js/cart.js` | Reducer inmutable, persistencia en localStorage, total en guaraníes enteros |
| `js/checkout.js` / `js/pedidos.js` | Checkout WhatsApp y registro de pedido en Supabase (`pedidos_whatsapp`), con fallback silencioso |
| `js/main.js` | Filtros, render, armado del mensaje, formulario, tracking |
| `index.html` | Presentación semántica + SEO + datos estructurados (Store + FAQPage) |

El HTML no tiene datos de contacto hardcodeados: los inyecta `main.js`
desde `config.js` vía `data-cfg` / `data-wa` / `data-tel` / `data-mail`.

## Comandos

```bash
# Tests (node:test, sin dependencias)
node --test tests/

# Chequeo de sintaxis de cada JS editado
node --check js/main.js   # (y cada archivo tocado)

# Chequeo de tipos de la raíz (usa el tsc del workspace de web/)
node web/node_modules/typescript/bin/tsc -p jsconfig.json

# Servidor local del sitio vanilla
python -m http.server 8000

# App Next.js
cd web && npm run dev      # build / lint igual con build / lint
```

## Supabase

- `supabase/schema.sql` — tablas (`productos`, `orders`, `pedidos_whatsapp`…).
- `supabase/seed.sql` — carga inicial del catálogo.
- `supabase/migrations/` — migraciones idempotentes (`if not exists`).
- `supabase/edge-functions/seguimiento-25-dias/` — Deno. Fuera del runtime
  de Supabase `tsc` reporta errores ambientales de Deno (globals, imports
  `deno.land` / `npm:`); lo que no se tolera son errores de sintaxis (TS1xxx).
- **Las credenciales NUNCA se commitean** (ver `.gitignore`: `.env*`).

## Convenciones de contenido (no negociables)

- Español rioplatense (voseo: "elegís", "pedí", "entrenás").
- Precios en guaraníes enteros, sin puntos, en el código (`420000`).
- **Compliance:** los suplementos no son medicamentos. No prometer
  resultados de salud, no dar dosis médicas, no comparar como "tratamiento".
  Los resúmenes de producto van neutralizados ("Consultá la composición y
  la etiqueta del fabricante…"). El checkout confirma composición, etiqueta,
  stock y precio antes de cobrar.
- Sin promesas de envío no confirmadas (precio/plazo van "a cotizar").
- Campo `imagen` de producto: solo URLs HTTPS o rutas `images/...`
  (validado por regex en `main.js`). Vacío = fallback tipográfico; si la
  imagen da 404, la tarjeta vuelve sola al fallback (no mostrar íconos rotos).
- Imágenes del catálogo: WebP, ~800×800 px, < 100 KB, nombre = `id` del
  producto. Convención completa en `images/README.md`.

## Pendientes conocidos (no reinventar)

- Migración de entrega/facturación manual en `web/` (ver notas en `CLAUDE.md`).
- Carrito de `web/` sin `persist` + clave de idempotencia por request
  (riesgo de órdenes duplicadas) — ver notas en `CLAUDE.md`.
- Landings por categoría (`/proteinas`, `/keto`, `/longevidad`) — Dossier §8.
- Fotos reales de producto (las tarjetas usan fallback tipográfico hoy).

## Antes de terminar

1. `node --test tests/` en verde.
2. `node --check` de cada JS editado.
3. `tsc -p jsconfig.json` sin errores nuevos.
4. Si tocaste la app `web/`: `npm run build` dentro de `web/`.