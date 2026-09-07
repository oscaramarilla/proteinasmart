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

Sigue el principio `Configuración define / Dominio decide / Servicios ejecutan / Presentación muestra`:

| Archivo | Rol |
|---|---|
| `js/config.js` | **Configuración.** Contacto, WhatsApp, envíos, pagos, tracking, endpoint del formulario. |
| `js/catalog.js` | **Datos.** Array de productos + categorías + objetivos. Es el "backend" del catálogo. |
| `js/main.js` | **Dominio y servicios.** Filtros, render, armado del mensaje de WhatsApp, formulario, tracking. |
| `index.html` | **Presentación.** Estructura semántica, SEO y datos estructurados (Store + FAQPage). |
| `css/styles.css` | Identidad visual, animaciones y responsive. |

El HTML **no tiene datos de contacto hardcodeados**: los inyecta `main.js` desde `config.js`
mediante atributos `data-cfg`, `data-wa`, `data-tel` y `data-mail`.

```
proteinasmart/
├── index.html
├── css/styles.css
├── js/
│   ├── config.js     ← empezá acá
│   ├── catalog.js    ← productos y precios
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
  stock: true,
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

## SEO

- Title, description, canonical y Open Graph orientados a `proteína + Paraguay`.
- JSON-LD `Store` (teléfono, ciudad, horario, medios de pago) y `FAQPage`.
- HTML semántico, sin frameworks: LCP y CLS bajos por construcción.
- Sin scripts de terceros salvo que se activen explícitamente.

**Próximos pasos sugeridos:** landings por categoría (`/proteinas`, `/keto`), blog con
contenido de intención informativa (guías de suplementación) y `Product` schema por
producto cuando el catálogo pase a base de datos.

---

## Roadmap

- [x] Imágenes reales de producto con fallback tipográfico
- [x] Landings por disciplina mediante URLSearchParams y rewrites de Vercel
- [x] Migración híbrida del catálogo a Supabase con fallback local
- [x] Carrito multi-producto persistente con resumen único a WhatsApp
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
