<div align="center">

# ProteínaSmart

### Proteína inteligente — tu marketplace de proteínas para la salud, la belleza y la longevidad

**Cetogénica · Low carb · Healthy habits · Neuroplasticidad**

![status](https://img.shields.io/badge/status-live-2ee88a?style=flat-square)
![stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-b8f26a?style=flat-square)
![deploy](https://img.shields.io/badge/deploy-Vercel-000?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-8b7cf6?style=flat-square)

</div>

---

## Qué es

Sitio comercial de **proteinasmart.com**: catálogo de proteínas y suplementos con checkout
por WhatsApp, selector guiado por objetivo y captación de leads para asesoría nutricional.

El posicionamiento no es "tienda de suplementos". Es un **marketplace con criterio**: cada
producto entra al catálogo porque resiste el cruce de cuatro disciplinas — alimentación
cetogénica, enfoque low carb, hábitos sostenibles y neuroplasticidad.

> Sin dependencias, sin build. HTML + CSS + JavaScript vanilla sobre Vercel.

---

## Arquitectura

La primera tanda de mejoras de la tienda publicada está documentada en
[docs/tienda-primera-tanda.md](docs/tienda-primera-tanda.md), incluyendo recursos pendientes,
pruebas y preparación de Bancard. El catálogo local contiene referencias pendientes de
validación del proveedor; no hay fotos individuales de producto verificadas en el repositorio.

Sigue el principio `Configuración define / Dominio decide / Servicios ejecutan / Presentación muestra`:

| Archivo | Rol |
|---|---|
| `js/config.js` | **Configuración.** Contacto, WhatsApp, envíos, pagos, tracking, endpoint del formulario. |
| `js/catalog.js` | **Datos.** Array de productos + categorías + objetivos. Es el "backend" del catálogo. |
| `js/main.js` | **Dominio y servicios.** Filtros, render, armado del mensaje de WhatsApp, formulario, tracking. |
| `js/cart.js` | **Estado del carrito.** Reducer inmutable con persistencia en localStorage y total en guaraníes. |
| `js/cart-ui.js` | **Carrito visible.** Listado, cantidades, eliminación, subtotal y consulta por WhatsApp. |
| `js/checkout.js` | **Cotización y proveedores.** Envío separado y Bancard deshabilitado. |
| `js/data-source.js` | **Fuente híbrida.** Catálogo remoto desde Supabase(CDN ESM) con fallback inmediato al array local. |
| `index.html` | **Presentación.** Estructura semántica, SEO y datos estructurados(Store + FAQPage). |
| `css/styles.css` | Identidad visual, animaciones y responsive. |

El HTML **no tiene datos de contacto hardcodeados**: los inyecta `main.js` desde `config.js`
mediante atributos `data-cfg`, `data-wa`, `data-tel` y `data-mail`.

```
proteinasmart/
├── index.html
├── css/styles.css
├── js/
│   ├── config.js     ← empezá acá
│   ├── catalog.js    ← productos y precios（protocolos por producto）
│   ├── cart.js       ← carrito multi-producto（localStorage）
│   ├── data-source.js ← catálogo híbrido Supabase → fallback local
│   └── main.js
├── vercel.json
└── README.md
```

---

## Tareas frecuentes

### Agregar o editar un producto

Abrí `js/catalog.js` y sumá un objeto al array `PS_CATALOG`:

```js
{
  id: 'whey-isolate-2lb',
  nombre: 'Whey Protein Isolate',
  marca: '',                       // vacío = no se muestra
  categoria: 'proteinas',          // proteinas | deportivos | keto | longevidad
  formato: '2 lb · 27 servicios',
  precio: 420000,                  // en guaraníes, sin puntos. 0 = "Consultar"
  precioAntes: 0,                  // opcional, muestra precio tachado
  objetivos: ['masa', 'definicion'],
  badge: 'Más vendido',
  resumen: 'Beneficio concreto en una línea.',
  imagen: '',                      // URL opcional; vacío = fallback tipográfico
  stock: null,                    // null = desconocido; verificar antes de publicar disponibilidad
  sabor: '',
  verificado: { marca: false, formato: false, sabor: false, imagen: false, stock: false },
}
```

El precio se formatea solo (`Gs 420.000`) y el botón de WhatsApp arma el mensaje con
nombre, formato y precio.

### Cambiar teléfono, RUC o condiciones de envío

Todo vive en `js/config.js`. El número de WhatsApp va en formato internacional sin `+`
ni espacios: `595985864209`.

### Activar analítica

En `js/config.js`, completá `tracking.ga4` y/o `tracking.metaPixel`. Si quedan vacíos,
no se carga ningún script de terceros (mejor Core Web Vitals y menos cookies).

### Conectar el formulario de asesoría

Por defecto, si `formEndpoint` está vacío el formulario **abre WhatsApp con el mensaje
armado** — cero infraestructura y cero leads perdidos. Cuando quieras persistirlos,
poné una URL (Formspree, n8n, Supabase Edge Function) en `config.formEndpoint` y el
POST se envía como JSON.

---

## Correr en local

```bash
python -m http.server 8000
# o
npx serve .
```

---

## Automatización: seguimiento a 25 días

**Estado de la tienda de la raíz:** abrir WhatsApp ya no emite `ps:pedido` ni carga
`js/pedidos.js`. Un clic no demuestra una compra. La infraestructura descrita abajo se
conserva como referencia, pero requiere una confirmación comercial verificada antes de
volver a conectarse al recorrido de compra.

La palanca de mayor ROI del negocio (Dossier §6)) automatizada con la infraestructura que ya tenés:

```
checkout de WhatsApp (js/main.js)
      │   dispatchea ps:pedido
      ▼
js/pedidos.js — registra el pedido en Supabase (pedidos_whatsapp)
      │   fallback silencioso: si Supabase falla, la venta sigue igual.

      ▼
Edge Function seguimiento-25-dias (supabase/edge-functions/)
      │   busca pedidos de hace ~25 dias sin seguimiento,
      │   arma el mensaje protocolizado (marketing/08) y envia por WhatsApp.

      ▼
pg_cron (09:00 diario: supabase/migrations/20260907_seguimiento_25dias.sql）
      │
      ├─ Sin telefono valido de cliente → seguimientos_pendientes
      └─ Enviado OK → seguimiento_25dias_enviado = true
```

### Pasos de deploy

1. **Subir la edge function:**

   ```bash
   supabase functions deploy seguimiento-25-dias --no-verify-jwt
   ```

   > Nota: si preferís mantener `verify_jwt = true` (recomendado), primero configirá los
   > secrets y después deploy normal; el cron ya pasa el service key en el header.



2. **Configurar secrets** (reemplazá los valores):

   ```bash
   supabase secrets set WHATSAPP_PROVIDER=evolution
   supabase secrets set WHATSAPP_API_URL=https://tu-evolution.evo.ws
   supabase secrets set WHATSAPP_API_KEY=tu_api_key
   supabase secrets set WHATSAPP_INSTANCE=tu_instancia
   # Para Meta Cloud API:
   # supabase secrets set WHATSAPP_PROVIDER=meta
   # supabase secrets set WHATSAPP_PHONE_ID=phone_number_id
   # supabase secrets set WHATSAPP_TOKEN=token_meta
   # Opcional:
   # supabase secrets set NUMERO_WHATSAPP_NEGOCIO=595985864209
   # Modo seguro: WHATSAPP_DRY_RUN=true (default) solo reporta sin enviar.

   # Para ACTIVAR el envio real:
   supabase secrets set WHATSAPP_DRY_RUN=false
   ```

3. **Correr la migración** en el SQL Editor (`supabase/migrations/20260907_seguimiento_25dias.sql`) y reemplazar los dos placeholders (`REEMPLAZAR_PROYECTO`, `REEMPLAZAR_SERVICE_ROLE_KEY`).

4. **Conectar js/config.js y web/.env.local** con tus credenciales reales de Supabase (nunca se commitean; ver `.gitignore`).

> **Limitación actual:** el checkout web abre `wa.me` sin capturar el número del comprador, así que el pedido registra el teléfono de la empresa como referencia y el seguimiento cae en `seguimientos_pendientes`. El siguiente paso es capturar el número en el checkout o enriquecerlo con el webhook entrante de WhatsApp (Evolution/Meta), y el envío se vuelve 100% automático.



---

## SEO

- Title, description, canonical y Open Graph orientados a `proteína + Paraguay`.
- JSON-LD `Store` (teléfono, ciudad, horario, medios de pago) y `FAQPage`.
- HTML semántico, sin frameworks: LCP y CLS bajos por construcción.
- Sin scripts de terceros salvo que se activen explícitamente.

**Próximos pasos sugeridos:** landings por categoría (`/proteinas`, `/keto`), blog con
contenido de intención informativa (guías de suplementación) y `Product` schema por
producto cuando el catálogo pase a base de datos.

---

## ProteínaSmart 2.0 (app Next.js)

La implementación en curso vive en `web/` y no reemplaza el sitio vanilla de
la raíz hasta un cutover explícito. Incluye fichas estáticas en
`/productos/[slug]`, `/como-verificamos` y el flujo `/quiz` →
`/quiz/resultado`. La arquitectura, modelo de datos, estándar científico,
analytics y reposición están documentados en `docs/`.

Antes de conectar Supabase, aplicá las migraciones versionadas en orden y
completá únicamente las variables indicadas en `.env.example`. No hay datos de
stock, trazabilidad ni nutrición inventados: los campos faltantes se presentan
como pendientes de confirmar.

## Roadmap

- [ ] Cargar fotos reales verificadas (soporte de imágenes y fallback disponibles)
- [x] Landings por disciplina mediante URLSearchParams y rewrites de Vercel
- [x] Migración híbrida del catálogo a Supabase con fallback local
- [x] Carrito multi-producto persistente con resumen único a WhatsApp
- [ ] Automatización del seguimiento a 25 días (edge function + cron listos; falta conectar WhatsApp y capturar el teléfono del cliente)
- [ ] Panel de carga del catálogo (dashboard Next.js en `web/app/admin`; falta conectar credenciales)
- [ ] Pasarela de pago local (Bancard / Pagopar)

---

## Contacto comercial

**Oscar Amarilla** · 0985 864 209 · RUC 4499507-5 · Asunción, Paraguay

---

## Licencia

MIT.

<div align="center">

Infraestructura digital por **[AYCweb](https://aycweb.com)**

</div>
