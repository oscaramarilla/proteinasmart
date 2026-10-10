# Catálogo y entrega — precios de octubre de 2026

Fuente única de precios: `js/catalog.js`. Desde esta revisión, su campo
`precio` es el **precio final al cliente**: ya lleva el envío adentro.

```bash
node scripts/sana-life-export.mjs        # regenera catalogo-import.csv
```

Salida: `catalogo-import.csv` (16 filas, listo para cargar en una tienda) y
una tabla de revisión por consola. El copy de entrega está en
`copy-entrega.html`.

## 1. Precios publicados

Los once con relevamiento de mercado llevan el traslado parejo de Gs 30.000
por unidad sobre la base de septiembre. Los cinco que no tenían relevamiento
se fijaron para conversión, no por recargo parejo.

| SKU | Producto | Base sep. | Publicado | Criterio |
|---|---|---|---|---|
| whey-isolate-2lb | Whey Protein Isolate | 330.000 | **360.000** | +30.000 |
| whey-concentrada-5lb | Whey Protein Concentrada | 450.000 | **480.000** | +30.000 |
| proteina-vegana | Proteína Vegetal | 265.000 | **295.000** | +30.000 |
| colageno-hidrolizado | Colágeno + Vit. C | 215.000 | **245.000** | +30.000 (antes 285.000) |
| creatina-mono | Creatina Monohidratada | 235.000 | **265.000** | +30.000 |
| pre-entreno | Pre-Entreno sin azúcar | 255.000 | **285.000** | +30.000 |
| eaa-bcaa | Aminoácidos EAA | 185.000 | **215.000** | +30.000 |
| glutamina | L-Glutamina | 145.000 | **175.000** | comparable PY 220.000 |
| aceite-mct | Aceite MCT C8/C10 | 185.000 | **215.000** | +30.000 |
| barras-keto | Barras Keto x12 | 145.000 | **169.000** | anclaje interno |
| sustituto-comida | Sustituto de Comida | 295.000 | **299.000** | umbral 300.000 |
| endulzante-monkfruit | Endulzante Monk Fruit | 89.000 | **99.000** | umbral 100.000 |
| omega-3 | Omega 3 Ultra | 169.000 | **199.000** | +30.000 |
| magnesio-glicinato | Magnesio Glicinato | 165.000 | **195.000** | +30.000 |
| vitamina-d3-k2 | Vitamina D3 + K2 | 145.000 | **175.000** | +30.000 |
| nootropico-focus | Nootrópico Focus | 195.000 | **199.000** | comparable PY 180.165 |

### Los dos comparables paraguayos que aparecieron

- **Glutamina 300 g** — GLUTADOP 300 g a Gs 220.000 en suplementosasuncion.com.py,
  mismo formato. Publicar 175.000 deja 20 % de ventaja visible: se mantuvo.
- **Nootrópico 60 caps** — L-teanina 100 mg 60 caps a Gs 180.165 (precio web
  de farmaoliva.com.py). El recargo parejo lo dejaba en 225.000, 25 % arriba
  de un comparable que el cliente encuentra en una búsqueda. Se bajó a
  199.000: la colina justifica estar arriba del comparable, no un 25 %.

### Los tres sin comparable

Anclados contra el propio catálogo y los umbrales de precio. Siguen siendo
estimados (`Precio_a_validar=SI` en el CSV):

- **Barras keto x12 → 169.000** (14.083 por barra).
- **Sustituto de comida → 299.000** (14.950 por comida). Queda abajo de
  300.000, y el argumento de venta es que sale menos que almorzar afuera.
- **Endulzante 250 g → 99.000.** Con +30.000 quedaba en 119.000 y cruzaba los
  100.000, umbral que en un producto de góndola frena la compra.

**Lo que falta en los cinco: el costo del proveedor.** Sin ese piso no se
puede afirmar que estos precios dejan margen. Validar antes de poner pauta.

## 2. Riesgos abiertos

### a) El traslado es por unidad, pero el envío es por pedido

Un carrito de 4 unidades aporta Gs 120.000 de entrega por **una sola**
entrega; un pedido de una unidad barata al interior aporta mucho menos de lo
que cuesta el flete. El traslado rinde si
`flete del pedido ≤ 30.000 × unidades del pedido`.

**Métrica a seguir desde el primer mes:** flete realmente pagado por pedido
contra ese número. Dos palancas si se pasa, sin retocar precios publicados:
piso de compra para encomienda sin costo al interior, o subir el traslado
solo en los SKU livianos y baratos.

El **endulzante a 99.000 absorbe 10.000 de envío, no 30.000**: conviene
venderlo como complemento del carrito, no como pedido suelto al interior.

### b) Flete absorbido — decidido y ya publicado

Decisión del negocio (10 oct 2026): el precio cubre el flete a cualquier
punto del país. Aplicado en `js/config.js` (`checkout.shippingFee: 0`),
en el copy de `index.html` y en los `shipping_methods` de Supabase.

El checkout de `web/` mantiene la regla opuesta (*el total de la orden nunca
incluye flete de encomienda*) porque su flujo es otro. Si se unifican, hay
que decidir cuál gana.

### c) Fotos — lo único que quedó sin resolver

No se pudo bajar ninguna foto: el contenedor de trabajo no alcanza ningún
host HTTP. Estado actual:

| Producto | Estado |
|---|---|
| `colageno-hidrolizado` | sin archivo recibido — fallback tipográfico |
| `whey-concentrada-5lb` | hay `wheyconcetrate.webp`, pero es 2 lb / 28 servicios contra ficha de 5 lb / 68. A Gs 480.000 la discrepancia cae sobre el atributo que explica el precio: no se vinculó |
| `vitamina-d3-k2` | foto con Gs 300.000 impresos contra 175.000 publicados |
| `nootropico-focus` | foto con Gs 350.000 impresos y otra fórmula contra 199.000 publicados |

Las dos últimas están vinculadas por decisión explícita del negocio
(9 sep 2026) y no se cambiaron por cuenta propia, pero la revisión de precios
**agrandó** la brecha. Detalle en `images/README.md`.

## 3. Empresas de encomienda

Cargadas en `courier_companies` por
`supabase/migrations/20261010_envio_incluido_y_encomiendas.sql`, y nombradas
en el sitio desde `operacion.encomiendas` de `js/config.js`:

Transruta · Paraná Express · La Guaireña · TSI Transportadora San Ignacio ·
La Misionera · Occidental Express

La lista no es exhaustiva: se agregan filas en `courier_companies` sin tocar
código. **Verificar la ortografía comercial exacta de cada una** — se
normalizaron acentos y la ñ a partir de los nombres pasados en mayúsculas.

## 4. Imágenes del CSV

El CSV apunta a `https://www.proteinasmart.com/images/...` (hotlink). Sirve
para publicar rápido; conviene re-subir los archivos al storage de la tienda
destino para no depender del deploy de proteinasmart.com.
