# Reventa Sana Life PY: qué cargar y qué combo arma cada nicho

Fecha: 28 de octubre de 2026. Precios tomados del listado publicado por
Sana Life Py (tienda de suplementos a pocas cuadras de la fábrica de
BRASA MONTE). No se pudo acceder al sitio desde el entorno de trabajo: el
dominio no está habilitado en la red de la sesión.

## 1. La advertencia que vale para toda esta operación

**Los precios de Sana Life son de góndola, no costos de compra.** Si
compramos ahí al precio publicado y revendemos con cualquier descuento,
perdemos plata antes de contar embalaje, cobro y publicidad.

Es el mismo hallazgo que con BRASA MONTE (`docs/brasamonte-reventa.md`), y
lleva a la misma conclusión: **la unidad suelta no cierra, el combo sí.**

### Por qué el combo cambia la aritmética

El envío se paga **por pedido**, no por unidad. Un combo reparte ese costo
entre dos o tres productos, así que necesita mucho menos descuento para dar
positivo:

| Combo | Precio | Unid. | Descuento mínimo para no perder | Neto con 20 % de descuento |
|---|---:|---:|---:|---:|
| Smart Feeding | 247.000 | 3 | 14,2 % | +14.400 |
| Smart Ruta | 367.000 | 3 | 9,5 % | +38.400 |
| Smart Calma | 425.000 | 2 | 8,2 % | +50.000 |
| Smart Glow | 440.000 | 2 | 8,0 % | +53.000 |
| Smart Mujer | 450.000 | 3 | 7,8 % | +55.000 |
| Smart Inicio | 470.000 | 2 | 7,4 % | +59.000 |
| Smart Foco | 488.000 | 3 | 7,2 % | +62.600 |
| Smart Hombre | 545.000 | 3 | 6,4 % | +74.000 |
| Smart 40+ | 569.000 | 3 | 6,2 % | +78.800 |
| Smart Cut | 790.000 | 3 | 4,4 % | +123.000 |
| Smart Muscle | 840.000 | 3 | 4,2 % | +133.000 |

Asume Gs 35.000 de costo de despacho por pedido. Un **20 % de descuento
mayorista alcanza para que los once den positivo**; abajo del 15 % los dos
combos más baratos empiezan a apretar.

**Lo que hay que conseguir: un descuento de compra, aunque sea del 15 al
20 %.** Con eso toda la estructura funciona. Sin eso, nada de esto se
publica con precio.

## 2. Qué se cargó y qué se dejó afuera

Del listado de ~100 productos se cargaron **8**. El criterio fue abrir
nichos que hoy no podemos atender, no engrosar el catálogo.

### Cargados

| SKU | Producto | Marca | Precio | Nicho que abre |
|---|---|---|---:|---|
| `multivitaminico-hombre` | Opti-Men ×90 | Optimum Nutrition | 250.000 | Base diaria masculina |
| `multivitaminico-mujer` | Opti-Women ×60 | Optimum Nutrition | 180.000 | Base diaria femenina |
| `vitamina-c` | Vitamina C 1000 ×100 | NOW | 150.000 | Entrada de bajo precio |
| `zinc` | Zinc 50 mg ×100 | NOW | 120.000 | El producto más barato del catálogo |
| `ashwagandha` | KSM-66 ×60 | Horbaach | 230.000 | Estrés y descanso |
| `melena-leon` | Melena de león, 113 serv. | Nutricost | 250.000 | Cognitivo / estudio |
| `whey-economica` | Wheyshake 900 g | LanderFit | 270.000 | Gimnasio de entrada |
| `creatina-economica` | Creatina 60 serv. | Nutrex | 200.000 | Gimnasio de entrada |

### Descartados por compliance

`AGENTS.md` es explícito: los suplementos no son medicamentos, no se
comparan como tratamiento. Estos productos lo incumplen **en el nombre**,
así que no se cargaron:

- **LanderFit GLP-1** — nombra una clase de fármaco (semaglutida). Vender un
  suplemento así implica acción farmacológica. Es el caso más grave.
- **Lipo 6 Intense**, **Liporevolución**, **CLA 2000** — quemadores.
- **Berberina** — se comercializa como "Ozempic natural".
- **Reumacetin**, **Menopause Support**, **Candida Support**,
  **MegaMen Diabetic Support** — los nombres implican tratar una condición.

Si el negocio quiere venderlos igual, es una decisión suya, pero habría que
cambiarles el nombre público y el resumen, y aun así el riesgo queda.

### Descartados por redundancia

La mayor parte del listado duplica lo que ya está: nueve creatinas, cinco
colágenos, tres omega 3, cinco magnesios, tres D3+K2. No agregan nicho, solo
decisiones para el cliente. Si más adelante se quiere ofrecer alternativa de
marca o de precio dentro de una misma categoría, conviene hacerlo con el
tramo por volumen o con una variante, no con SKU sueltos que compiten entre sí.

## 3. Los seis combos nuevos y a quién le hablan

| Combo | Precio | Nicho | Por qué cierra |
|---|---:|---|---|
| **Smart Inicio** | 470.000 | Arranca en el gimnasio | Proteína y creatina, lo único con evidencia fuerte, al menor precio posible |
| **Smart Mujer** | 450.000 | Mujer, base diaria | Multivitamínico formulado + los dos micronutrientes que más faltan |
| **Smart Hombre** | 545.000 | Hombre, base diaria | Multivitamínico + D3/K2 + zinc |
| **Smart Calma** | 425.000 | Entrena bien, duerme mal | Ashwagandha y magnesio, sin prometer resultado |
| **Smart Ruta** | 367.000 | Ruta, obra, turno largo | Proteína que viaja sin heladera, envasada al vacío |
| **Smart Foco** | 488.000 | Estudio y trabajo de escritorio | Nootrópico, melena de león y un snack de proteína entera |

**Smart Ruta es el que más lejos puede llegar.** Es el único que no compite
con ninguna farmacia ni suplementera: le habla al camionero, al que trabaja
en obra y al que pasa el día afuera. Y es 100 % producto BRASA MONTE, que es
justo lo que conviene mostrarle a la marca cuando se pida la lista mayorista.

## 4. Antes de publicar

1. **Conseguir el precio de compra.** Es la única variable que falta y la que
   define si todo esto gana o pierde. Apuntar a 15–20 %.
2. **Confirmar stock, sabores y vencimientos** de los 8 SKU nuevos.
3. **Fotos con permiso de uso.** Los 12 productos de reventa están publicados
   con el fallback tipográfico.
4. **Verificar las marcas contra la etiqueta.** El listado de origen traía
   "AminoEnergy" bajo Nutrex (es de Optimum Nutrition), y "Glycinate" y
   "Bisglicinato" de Carlyle parecen el mismo producto listado dos veces.
5. **Medir por combo**, no por producto: cuál se vende, cuánto deja, y recién
   ahí decidir cuál promocionar.
