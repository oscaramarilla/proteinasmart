# Carga de catálogo en Sana Life PY (encomshop)

Fuente única: `js/catalog.js` del repo. Regenerar con:

```bash
node scripts/sana-life-export.mjs 30000   # el argumento es el recargo por unidad
```

Salida: `docs/sana-life-py/catalogo-import.csv` (16 productos) y la tabla de
revisión por consola. El copy de entrega está en `copy-entrega.html`.

## 1. Precios con recargo de Gs 30.000 por unidad

| SKU | Producto | Base | Publicar | Recargo |
|---|---|---|---|---|
| whey-isolate-2lb | Whey Protein Isolate | 330.000 | **360.000** | 9,1 % |
| whey-concentrada-5lb | Whey Protein Concentrada | 450.000 | **480.000** | 6,7 % |
| proteina-vegana | Proteína Vegetal (arveja + arroz) | 265.000 | **295.000** | 11,3 % |
| colageno-hidrolizado | Colágeno Hidrolizado + Vitamina C | 215.000 | **245.000** | 14,0 % |
| creatina-mono | Creatina Monohidratada Micronizada | 235.000 | **265.000** | 12,8 % |
| pre-entreno | Pre-Entreno sin azúcar | 255.000 | **285.000** | 11,8 % |
| eaa-bcaa | Aminoácidos Esenciales (EAA) | 185.000 | **215.000** | 16,2 % |
| glutamina | L-Glutamina | 145.000 | **175.000** | 20,7 % |
| aceite-mct | Aceite MCT C8/C10 | 185.000 | **215.000** | 16,2 % |
| barras-keto | Barras Keto (caja x 12) | 145.000 | **175.000** | 20,7 % |
| sustituto-comida | Sustituto de Comida Low Carb | 295.000 | **325.000** | 10,2 % |
| endulzante-monkfruit | Endulzante Monk Fruit + Eritritol | 89.000 | **119.000** | 33,7 % |
| omega-3 | Omega 3 Ultra (EPA/DHA) | 169.000 | **199.000** | 17,8 % |
| magnesio-glicinato | Magnesio Glicinato | 165.000 | **195.000** | 18,2 % |
| vitamina-d3-k2 | Vitamina D3 + K2 | 145.000 | **175.000** | 20,7 % |
| nootropico-focus | Nootrópico Focus (L-teanina + colina) | 195.000 | **225.000** | 15,4 % |

El colágeno es el único con precio tachado: `precioAntes` 255.000 → **285.000**.

## 2. Decisiones tomadas y riesgos abiertos

### a) El recargo es por unidad, pero el envío es por pedido

Gs 30.000 fijos por unidad distorsionan en los dos extremos:

- **Carrito de 4 unidades** → cobra Gs 120.000 de envío por **una sola**
  entrega. Castiga justo el pedido que conviene (ticket alto) y empuja al
  cliente a comprar de a uno.
- **Una unidad barata al interior** → el endulzante sube 33,7 % y aporta
  Gs 30.000 para cubrir un flete que casi nunca cuesta eso.

El recargo rinde solo si `flete del pedido ≤ 30.000 × unidades del pedido`.
El caso que pierde plata es el pedido de una unidad al interior.

**Recomendación:** mantener el recargo como posicionamiento de precio
(el catálogo queda "todo incluido", que es el efecto buscado), pero declarar
el envío gratis **a nivel pedido**, no por unidad, y poner un piso para el
interior (ej.: encomienda sin costo desde Gs 300.000 de compra). Así el
carrito de 4 no paga 4 veces el mismo envío.

### b) Flete de encomienda: DECIDIDO — variante A, flete absorbido

**Decisión del negocio (10 oct 2026):** el precio publicado cubre el flete a
cualquier punto del país. `copy-entrega.html` publica solo ese bloque.

Queda registrado el riesgo que se aceptó con los ojos abiertos: con flete
absorbido, el pedido de **una unidad barata al interior** pierde plata (el
endulzante aporta Gs 30.000 de recargo contra un flete que rara vez cuesta
eso). Es el caso a vigilar, no un impedimento para publicar.

**Métrica a seguir desde el primer mes:** flete realmente pagado por pedido
contra `30.000 × unidades del pedido`. Si el promedio se pasa, hay dos
palancas que **no** obligan a retocar los precios ya publicados:

1. Piso de compra para encomienda sin costo al interior (ej. desde
   Gs 250.000 — con el recargo aplicado, casi todo el catálogo lo alcanza
   con una sola unidad).
2. Subir el recargo solo en los SKU livianos y baratos, donde el flete pesa
   más sobre el ticket.

**Divergencia a tener presente:** esta decisión aplica a Sana Life PY. El
checkout de `web/` mantiene la regla opuesta (*el total de la orden nunca
incluye flete de encomienda*). Hoy no hay conflicto porque son canales
distintos; si alguna vez se unifican, hay que decidir cuál regla gana.

### c) Asunción no está en el Departamento Central

Asunción es capital y distrito autónomo: administrativamente **no integra**
el Departamento Central. "Envío gratis en el Departamento Central" deja
afuera, literalmente, el mercado más grande. El copy dice
**"Asunción y Gran Asunción (Departamento Central)"**.

### d) Promesas que no se pueden sostener

- **"Entrega en el día"**: imposible por encomienda al interior, y es la
  promesa que `docs/tienda-primera-tanda.md` registra como retirada del
  sitio por falta de respaldo. Lo controlable es el **despacho**:
  "pedidos confirmados antes de las 14:00 se despachan el mismo día".
- **"Entregamos resultados"**: con suplementos es una promesa de resultado
  de salud. `AGENTS.md` lo prohíbe (los suplementos no son medicamentos).
  Reemplazado por el valor de servicio, que sí es verificable.
- **"Las mejores empresas"**: superlativo sin respaldo. Cuando definas las
  encomiendas con las que operás, nombralas: "Enviamos por X, Y y Z" vende
  más y se puede sostener.

### e) Precios estimados y fotos que no cierran

- **5 precios sin relevamiento** (glutamina, barras keto, sustituto de
  comida, endulzante, nootrópico): el comentario de `js/catalog.js` los marca
  como estimados pendientes de proveedor. Sumarles 30.000 arrastra el error.
  Están marcados `Precio_a_validar=SI` en el CSV.
- **2 productos sin foto**: whey concentrada 5 lb y colágeno.
- **2 fotos con precio impreso distinto** al que vas a publicar:
  `vitaminade3yk2.webp` (etiqueta Gs 300.000 vs. publicar 175.000) y
  `nootropico.webp` (etiqueta Gs 350.000 y otra fórmula vs. publicar
  225.000). Publicarlas invita a la disputa en el checkout.

## 3. Imágenes

El CSV apunta a `https://www.proteinasmart.com/images/...` (hotlink). Sirve
para publicar rápido; conviene re-subir los archivos al storage de la tienda
para no depender del deploy de proteinasmart.com.
