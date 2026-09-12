# ProteínaSmart — Ficha técnica de admisión de producto (Checklist DINAVISA)

**Programa Proveedores Smart · Cross-docking local · Asunción y Gran Asunción**

> Documento de campo para la visita presencial. Releva los 5–10 SKUs piloto de
> cada comercio y alimenta la migración `20260911_proveedores_smart.sql`.
> La ficha NO es un documento legal: es la fuente de verificación técnica que
> después cierra el Convenio Marco y su Anexo de Productos y Precios.

---

## A. Datos del comercio

| Campo | Valor | Mapeo schema |
|---|---|---|
| Razón social | | `proveedores.razon_social` |
| Nombre fantasia | | `proveedores.nombre_fantasia` |
| RUC | | `proveedores.ruc` (único) |
| Contacto nombre | | `proveedores.contacto_nombre` |
| WhatsApp | | `proveedores.telefono_whatsapp` |
| Email | | `proveedores.email` |
| Dirección | | `proveedores.direccion` |
| **Zona normalizada** | `villa_morra / san_martin / mariscal_lopez / lambare / asuncion_centro / zona_norte / otra` | `proveedores.zona` (check constraint) |
| Horario de atención | | `proveedores.horario_atencion` |
| Habilitación municipal | ☐ Sí ☐ No (N.ª de habilitación): | `proveedores.habilitacion_municipal` |
| Registro/Notificación DINAVISA | ☐ Sí ☐ No (N.º): | `proveedores.habilitacion_dinavisa` |
| Estado | `prospecto / piloto_activo / activo / inactivo / suspendido` | `proveedores.estado` |
| Notas operativas (ruta de recolección, horarios, encargado) | | `proveedores.notas_operativas` |

### Lógica de zona (clustering logístico)
El valor de `zona` determina la agrupación de la ruta de recolección del
repartidor antes de la entrega al cliente final:

- **Eje Villa Morra / San Martín / Mariscal López** → 1 agrupación.
- **Lambaré / Asunción centro** → 2.ª agrupación.
- **Zona Norte** → 3.ª agrupación (solo si el piloto la alcanza).
- `otra` → evaluación manual por distancia entre proveedores.
---

## B. Por cada SKU del piloto (completar una fila por producto)

Al menos un SKU por cada rol que el comercio quiera ofrecer. Campos alineados
con `web/lib/products.ts` y `web/lib/product-commercial-data.ts`.

| Campo | Valor | Mapeo schema / web |
|---|---|---|
| Referencia interna (id) | | `productos.id` |
| Nombre comercial | | `products.name` |
| Marca | | `products.brand` |
| Rol en catálogo | `PROTEIN_GAP / COLLAGEN / CREATINE / EAA / RECOVERY_AMINO / PRE_WORKOUT / MCT / LOW_CARB_SNACK / MEAL_REPLACEMENT / SWEETENER / OMEGA3 / MAGNESIUM / VITAMIN_D_K / NOOTROPIC` | `products.roles` |
| Categoría | `proteinas / creatina / rendimiento / keto / longevidad` | `products.category` |
| Presentación | | `products.presentation` |
| **N.º R.S.P. / Notificación DINAVISA** | | `productos.sanitary_register` |
| **Vencimiento R.S.P.** | AAAA-MM-DD | `productos.sanitary_register_expiry` |
| **Importador oficial** | | `products.importer` |
| **Distribuidor local** | | `products.distributor` (o `supplier`) |
| **Lote en sitio** | | `products.lot` |
| **Vencimiento del lote** | AAAA-MM-DD (debe ser futuro) | `products.expirationDate` |
| **Precio retail (PGC)** | entero, sin puntos | `products.price` / `priceStatus` |
| **Costo B2B (PGC)** | entero, sin puntos — **confidencial** | `producto_costos.supplier_cost` (tabla service-role) |
| Stock observado | `in_stock / low_stock / out_of_stock / on_request / pending_confirmation` | `products.stockStatus` + `stockQuantity` |
| Presentación: unidades | | `products.servings` |
| Porción estándar | | `products.servingSize` |
| Proteína por porción (si aplica) | | `products.proteinPerServing` |
| Ingredientes (foto etiqueta) | | `products.ingredients` + evidencia |
| **Fulfillment** | `store_pickup` (retiro en tienda) / `supplier_dispatch` (despacha el proveedor) / `external_courier` (encomienda) | `productos.fulfillment_type` |

> **Regla de oro:** ningún campo se completa con datos supuestos. Si no se
> pudo verificar, queda vacío → `pending_confirmation` (misma regla que
> `validateCommercialData` en `web/lib/product-commercial-data.ts`).
> **No inventar fechas ni precios "para llenar".**
---

## C. Evidencia fotográfica mínima (por SKU)

Requerida para el cargo en `authenticityEvidence` (`web/lib/products.ts`):

1. ☐ Foto frontal del envase.
2. ☐ Foto del sello de seguridad (si tiene).
3. ☐ Foto del lote y vencimiento (si están impresos en la etiqueta).
4. ☐ Foto del reverso con ingredientes / info nutricional y datos del importador.
5. ☐ Factura de compra al por mayor (para validar trazabilidad y origen).

Formato: ruta en `/images/...` o URL HTTPS (validado por `hasSafeImageUrl`).
Sin imagen real verificada → el producto no muestra foto (fallback tipográfico).

---

## D. Cumplimiento de etiquetado (checkbox DINAVISA)

Por cada SKU, validar contra el envase físico:

- ☐ Nombre comercial claro y sin promesas de resultado de salud.
- ☐ Lista de ingredientes legible.
- ☐ Composición / información nutricional (o panel de ingredientes activos para suplementos).
- ☐ Nombre y dirección del fabricante.
- ☐ País de origen.
- ☐ Leyendas obligatorias de advertencia (niños, embarazo, lactancia, etc.).
- ☐ Datos del importador/distribuidor en Paraguay.

**Compliance (no negociable):** los suplementos no son medicamentos. No
prometer resultados de salud, no dar dosis médicas, no comparar como
"tratamiento". El texto en la plataforma se neutraliza: *"Consultá la
composición y la etiqueta del fabricante…"*.

---

## E. Veredicto de admisión y términos comerciales

### Veredicto
- ☐ **APTO** — cumple todo lo anterior.
- ☐ **APTO CON CONDICIONES** — detallar: (ej. falta `sanitary_register`, stock solo bajo pedido, faltan fotos…)
- ☐ **NO APTO** — motivo: (ej. vencido, sin registro, etiquetado engañoso…)

Responsable: ______________________________  Fecha: ____________

### Términos comerciales (para el Anexo del Convenio Marco)
- Descuento B2B pactado: ______ % sobre precio retail.
- Condiciones de pago a proveedor: ☐ Contado ☐ Contra entrega ☐ 7 días ☐ Otro:
- Política de devolución por vencimiento/daño: ☐ A cargo del proveedor ☐ Se descuenta de siguiente pago ☐ No aplica
- Observaciones de entrega / horarios de recolección:

---

## Mapeo resumido ficha → migración

| Ficha | SQL (20260911_proveedores_smart.sql) |
|---|---|
| Bloque A | `public.proveedores` (tabla nueva) |
| Bloque B (publicables) | `alter table public.productos add column` (`supplier_id`, `stock_status`, `sanitary_register`, `sanitary_register_expiry`, `fulfillment_type`) |
| Bloque B (confidencial) | `public.producto_costos` (`supplier_cost`, service-role only) |
| Bloque C | `authenticity_evidence` ya existente en `productos` |
| Bloque D | Verificación manual → se marca como verificado en `web` |

> La migración está en `supabase/migrations/20260911_proveedores_smart.sql`,
> **pendiente de revisión contable y de no ejecutar en producción** hasta
> cerrar el flujo DNIT (proveedor → factura B2B a ProteínaSmart → ProteínaSmart
> factura IVA 10 % al consumidor).