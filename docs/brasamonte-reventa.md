# Revender BRASA MONTE en ProteínaSmart — estudio

Fecha: 28 de octubre de 2026. Datos de producto y precio tomados de lo que
publica brasamonte.com (no se pudo acceder al sitio desde el entorno de
trabajo: el dominio no está habilitado en la red de la sesión, así que todo
lo de acá viene de lo que pasó el negocio).

## 1. Lo primero: hoy no hay derecho de reventa

Ser **delivery rider** en Brasa Monte no otorga derecho a revender su
producto. Son dos cosas distintas y conviene no mezclarlas:

- **Comprar y revender producto genuino** es, en general, lícito: quien
  compra una unidad puede volver a venderla.
- **Usar la marca, el logo, las fotos y los textos de BRASA MONTE** en una
  tienda propia requiere permiso. Sin eso no se puede armar la ficha de
  producto: justamente lo que haría vendible al producto.

Y hay un tema laboral aparte del comercial: montar un canal de venta sobre
el producto del empleador, usando lo que se conoce desde adentro, sin
avisar, es la clase de cosa que termina costando el trabajo **y** la
relación comercial. El camino corto acá es también el camino seguro:
**pedir una reunión y proponer ser revendedor/distribuidor por escrito.**

Lo que hay que conseguir, y alcanza con un documento simple:

1. Lista de precios mayorista (o % de descuento sobre PVP).
2. Permiso escrito para usar nombre, logo y fotos en proteinasmart.com.
3. Condiciones: pedido mínimo, plazo de reposición, forma de pago.
4. Qué pasa con producto que no se vende antes del vencimiento.

## 2. La aritmética dice que la reventa suelta no cierra

Precios al público de Brasa Monte, con envío gratis a todo el país en
24–48 h (hasta 3 días al interior):

| Producto | PVP Brasa Monte |
|---|---|
| Carne Seca Original / Tipo Cecina · 75 g | 39.000 |
| Carne Seca Original / Tipo Cecina · 200 g | 99.000 |
| Ghee · 200 ml | 49.000 |
| 2 × 200 g (+ Ghee 100 ml de regalo) | 198.000 |

ProteínaSmart publica con **envío incluido**: +Gs 30.000 por unidad. Si se
revende como producto suelto:

| Producto | Brasa Monte directo | ProteínaSmart | Sobreprecio |
|---|---|---|---|
| Carne seca 75 g | 39.000 | 69.000 | **+77 %** |
| Carne seca 200 g | 99.000 | 129.000 | **+30 %** |
| Ghee 200 ml | 49.000 | 79.000 | **+61 %** |

El cliente compara en diez segundos y compra directo: más barato y le llega
antes. **La reventa suelta está muerta antes de empezar.**

Peor todavía: el envío se come el margen aunque haya descuento mayorista.
Sobre el paquete de 200 g a 99.000:

| Descuento mayorista | Costo | Margen bruto | Margen tras los 30.000 de envío |
|---|---|---|---|
| 25 % | 74.250 | 24.750 | **−5.250** |
| 30 % | 69.300 | 29.700 | **−300** |
| 35 % | 64.350 | 34.650 | **+4.650** |
| 40 % | 59.400 | 39.600 | +9.600 |

Hace falta un 35 % de descuento solo para empatar. Vender de a una unidad
suelta no es un negocio.

## 3. Lo que sí cierra: complemento de carrito, no producto suelto

El envío ya está pagado por el producto principal del pedido. Una carne seca
de 99.000 sumada a un whey de 360.000 **no agrega costo de envío**: el mismo
paquete, la misma encomienda, el mismo viaje.

En ese modelo el margen bruto es el margen neto:

- Con 30 % de descuento → **29.700 por paquete de 200 g**, vendiendo al
  mismo precio que Brasa Monte (99.000). Sin objeción de precio posible:
  cuesta lo mismo que en el sitio de ellos.
- Y el ticket promedio sube ~27 % sobre un carrito de 360.000.

Esto además no compite con Brasa Monte: les trae pedidos de un cliente que
ya estaba comprando otra cosa.

### Dónde entra cada producto en el catálogo actual

Usando el campo `complemento` que ya existe en `js/catalog.js`:

| Producto del catálogo | Complemento a ofrecer | Por qué |
|---|---|---|
| `whey-isolate-2lb`, `proteina-vegana` | Carne seca 200 g | Proteína de comida real para los días sin batido |
| `aceite-mct` | Ghee 200 ml | Las dos grasas del protocolo keto; uso directo en cocina |
| `barras-keto` | Carne seca 75 g | Mismo rol de snack, 0 g de azúcar, sin la barra procesada |
| `sustituto-comida` | Carne seca 200 g | Proteína entera para acompañar el reemplazo |

Categoría sugerida: `keto` para los dos (0 g de azúcar, alto en grasa/proteína).
Objetivos: `definicion` y `masa` para la carne seca; `energia` y `foco` para el ghee.

## 4. El obstáculo operativo más serio: 2 a 4 semanas de vida útil

La etiqueta declara **2 a 4 semanas** para la carne seca (el ghee dura meses
en heladera). Es el dato que más condiciona todo:

- **No se puede tener stock.** Comprar 50 paquetes y venderlos en dos meses
  es tirar plata: vencen antes.
- El modelo tiene que ser **pedido contra pedido** (se compra a Brasa Monte
  cuando entra la orden) o **consignación**.
- El motor de elegibilidad de `web/` ya bloquea producto vencido por
  `expirationDate`, así que el lote y el vencimiento son campos obligatorios
  por cada tanda, no datos de una sola vez.
- Esto choca con el "despacho el mismo día antes de las 14:00" que
  ProteínaSmart publica hoy: habría que coordinar reposición diaria con
  Brasa Monte, o excluir estos SKU de esa promesa.

## 5. El argumento para convencerlos (y es bueno)

Brasa Monte entrega **puerta a puerta, de a un pedido**, con repartidores, y
no tiene punto de retiro. Cada venta les cuesta una entrega.

Vendiéndole a ProteínaSmart, venden unidades **sin pagar esa entrega**: el
paquete viaja dentro de un pedido que ya se estaba despachando. El descuento
mayorista que les pidas se paga solo con el costo de delivery que se ahorran.

Argumentos de apoyo:

- ProteínaSmart entrega a todo el país con seis encomiendas y factura con
  RUC: acceso a clientes que Brasa Monte hoy atiende de a uno.
- El cliente de suplementos es exactamente su público: alto en proteína,
  0 g de azúcar, keto.
- Como rider, conocés su operación de entrega: sabés cuánto les cuesta cada
  pedido. Ese es tu argumento más fuerte, y el único que nadie más les puede
  llevar.

## 6. Qué datos pedirles para poder publicar

Esto sale de los campos que el repo ya exige (`web/lib/products.ts` y el
motor de `web/lib/product-eligibility.ts`). Sin esto la ficha queda en
borrador y no se publica:

| Dato | Campo | Nota |
|---|---|---|
| Marca | `brand` | "BRASA MONTE" |
| Presentación | `presentation` | 75 g / 200 g / Ghee 200 ml |
| Tamaño de porción y porciones | `servingSize`, `servings` | Hoy no está publicado |
| Proteína por porción | `proteinPerServing` | Dicen 72 g — confirmar si es por paquete de 200 g |
| Ingredientes + evidencia | `ingredients`, `ingredientsEvidenceUrl` | Cecina declara 2 ingredientes |
| Tabla nutricional + evidencia | `nutritionalInfo`, `nutritionEvidenceUrl` | Foto legible de la etiqueta |
| Proveedor | `supplier` | BRASA MONTE E.A.S. |
| Lote y vencimiento | `lot`, `expirationDate` | **Por tanda**, no una sola vez |
| Evidencia de autenticidad | `authenticityEvidence` | Factura de compra a Brasa Monte |
| Foto con permiso de uso | `imageUrl` | Por escrito, no de palabra |
| Precio y stock confirmados | `priceStatus`, `stockStatus` | Lista mayorista |

## 7. Plan recomendado

1. **Reunión con Brasa Monte.** Llevar la propuesta de la sección 5. Pedir
   lo de la sección 1 por escrito.
2. **Arrancar en consignación o pedido contra pedido**, nunca con stock
   comprado: la vida útil de 2–4 semanas no lo permite.
3. **Publicar solo como complemento**, al mismo precio que Brasa Monte, en
   la ficha de los productos de la tabla de la sección 3.
4. **Medir ocho semanas**: cuántos carritos suman carne seca, y cuánto sube
   el ticket promedio. Recién ahí discutir volumen y mejor descuento.
5. **No publicar la ficha** hasta tener la columna completa de la sección 6.

## 8. Lo que este PR deja listo

Nada de esto publica producto de Brasa Monte — no hay autorización todavía.
Lo que queda construido es la capacidad que el plan necesita:

- **Precio por volumen** (`mayorista: { desde, precio }` en `js/catalog.js`):
  el carrito baja el precio unitario a partir de N unidades, lo muestra en la
  tarjeta, avisa cuánto falta para alcanzarlo y descuenta el ahorro. Es el
  mecanismo con el que se venden packs de carne seca el día que se autorice.
  Queda sin valores: fijar un precio por volumen sin conocer el costo del
  proveedor es vender a ciegas.
- **Canal mayorista** (`#mayoristas` en el sitio): capta al revendedor,
  gimnasio o dietética que quiere lista de precios. Sirve para el catálogo
  propio desde hoy, sin depender de Brasa Monte.
