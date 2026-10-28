/* =========================================================
   ProteínaSmart — catalog.js
   DATOS DEL CATÁLOGO. Agregá, sacá o editá productos acá.
   La presentación se arma sola desde este array.

   Campos:
     id          → identificador único (sin espacios)
     nombre      → cómo se muestra en la tarjeta
     marca       → opcional; si queda vacío no se muestra
     categoria   → 'proteinas' | 'deportivos' | 'keto' | 'longevidad'
     formato     → presentación (peso, cápsulas, ml)
     precio      → en guaraníes, sin puntos (0 = "consultar")
     precioAntes → opcional, para mostrar precio tachado
     mayorista   → opcional: { desde: N, precio: P } -- a partir de N unidades
                   del MISMO producto, cada unidad sale P. El carrito lo
                   aplica solo si P < precio y 2 <= N <= 99; un tramo que no
                   ahorra o que no se puede alcanzar se descarta en silencio
                   (js/cart.js, normalizarMayorista). Dejarlo sin definir
                   mientras no se conozca el costo del proveedor: un precio
                   por volumen fijado sin ese piso puede vender bajo costo.
     objetivos   → ['masa','definicion','belleza','foco','energia']
     badge       → etiqueta corta opcional ('Más vendido', 'Nuevo'…)
     resumen     → una línea, beneficio concreto
     stock       → true | false | null (desconocido)
     verificado  → indicadores por campo; activar solo con evidencia del proveedor

   PRECIOS — el campo `precio` es el PRECIO FINAL AL CLIENTE: ya incluye
   el envío a todo el país (ver operacion/checkout en js/config.js). No
   sumarle flete en ninguna vista.

   Revisión de octubre de 2026: se trasladó el costo de entrega al precio
   de lista (+Gs 30.000 por unidad sobre la base de septiembre) al pasar a
   envío incluido. Decisión del negocio; el recargo es parejo en los once
   productos con relevamiento de mercado.

   Base de septiembre de 2026 — relevamiento de mercado Paraguay.
   Fuentes: suplementosasuncion.com.py (gama económica/media) y
   vitaminshoppeparaguay.com.py (gama premium importada).
   Referencias relevadas:
     Whey 1 kg gama económica ......... Gs 140.000 – 200.000
     Whey isolate 1 kg ................ Gs 200.000 (Growth) – 360.000 (ENA True Made)
     Whey isolate premium ............. Gs 299.000 (22 tomas) – 525.000 (45 tomas)
     Creatina 300 g ................... Gs 170.000 – 300.000 (premium 295.000)
     Pre-entreno (C4) ................. Gs 260.000 – 285.000
     BCAA/EAA 280 g ................... Gs 140.000 – 150.000
     Colágeno hidrolizado + C, 30 tomas Gs 255.000
     Omega 3 (120–200 caps) ........... Gs 149.000 – 200.000
     Magnesio glicinato 120 caps ...... Gs 199.000
     Vitamina D3 + K2, 60 caps ........ Gs 155.000
     Aceite MCT 710 ml ................ Gs 255.000
   Posicionamiento elegido: por debajo de la gama premium importada y por
   encima de la gama económica — coherente con "marketplace con criterio".

   Los cinco que no tenían relevamiento se fijaron en octubre de 2026 para
   conversión, no por recargo parejo. Dos consiguieron comparable paraguayo:
     glutamina 300 g ...... GLUTADOP 300 g a Gs 220.000 (suplementosasuncion).
                            Publicamos 175.000: 20 % abajo del comparable.
     nootrópico 60 caps ... L-teanina 100 mg 60 caps a Gs 180.165 web
                            (farmaoliva.com.py). Publicamos 199.000 — la
                            colina justifica la diferencia; los 225.000 que
                            salían del recargo parejo no se sostenían contra
                            un comparable visible más barato.
   Los otros tres se anclaron contra el propio catálogo y los umbrales de
   precio, SIN comparable paraguayo (siguen siendo estimados):
     barras keto x12 ...... 169.000 (14.083 por barra)
     sustituto de comida .. 299.000 (14.950 por comida; abajo de 300.000)
     endulzante 250 g ..... 99.000 — excepción deliberada al recargo parejo:
                            con +30.000 quedaba en 119.000 y cruzaba los
                            100.000, que en un producto de góndola frena la
                            compra. Absorbe 10.000 de envío, no 30.000, así
                            que conviene venderlo como complemento del
                            carrito y no como pedido suelto al interior.
   FALTA EN LOS CINCO: el costo del proveedor. Sin ese piso no se puede
   afirmar que estos precios dejan margen — validar antes de escalar pauta.
   ========================================================= */

window.PS_CATALOG = [
  /* ---------------- PROTEÍNAS ---------------- */
  {
    id: 'whey-isolate-2lb',
    nombre: 'Whey Protein Isolate',
    marca: '',
    categoria: 'proteinas',
    formato: '2 lb · 27 servicios',
    precio: 360000,
    precioAntes: 0,
    objetivos: ['masa', 'definicion'],
    badge: 'Más vendido',
    resumen: '27 g de proteína por scoop, sin lactosa y con carga glucémica mínima.',
    stock: true,
  },
  {
    id: 'whey-concentrada-5lb',
    nombre: 'Whey Protein Concentrada',
    marca: '',
    categoria: 'proteinas',
    formato: '5 lb · 68 servicios',
    precio: 480000,
    precioAntes: 0,
    objetivos: ['masa'],
    badge: '',
    resumen: 'El mejor costo por gramo de proteína para volumen sostenido.',
    stock: true,
  },
  {
    id: 'proteina-vegana',
    nombre: 'Proteína Vegetal (arveja + arroz)',
    marca: '',
    categoria: 'proteinas',
    formato: '1 kg · 30 servicios',
    precio: 295000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Perfil de aminoácidos completo, sin lácteos ni gluten. Digestión liviana.',
    stock: true,
  },
  {
    id: 'colageno-hidrolizado',
    nombre: 'Colágeno Hidrolizado + Vitamina C',
    marca: '',
    categoria: 'proteinas',
    formato: '300 g · 30 servicios',
    precio: 245000,
    precioAntes: 285000,
    objetivos: ['belleza'],
    badge: 'Belleza & longevidad',
    resumen: 'Péptidos tipo I y III para piel, cabello, uñas y articulaciones.',
    stock: true,
  },

  /* ---------------- DEPORTIVOS ---------------- */
  {
    id: 'creatina-mono',
    nombre: 'Creatina Monohidratada Micronizada',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 100 servicios',
    precio: 265000,
    precioAntes: 0,
    objetivos: ['masa', 'foco', 'energia'],
    badge: 'Base de todo',
    resumen: 'El suplemento con más evidencia: fuerza, masa magra y función cognitiva.',
    stock: true,
  },
  {
    id: 'pre-entreno',
    nombre: 'Pre-Entreno sin azúcar',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 30 servicios',
    precio: 285000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: '',
    resumen: 'Cafeína, beta-alanina y citrulina. Cero carbohidratos, apto keto.',
    stock: true,
  },
  {
    id: 'eaa-bcaa',
    nombre: 'Aminoácidos Esenciales (EAA)',
    marca: '',
    categoria: 'deportivos',
    formato: '400 g · 40 servicios',
    precio: 215000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Protege masa muscular durante el ayuno y los déficits calóricos.',
    stock: true,
  },
  {
    id: 'glutamina',
    nombre: 'L-Glutamina',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 60 servicios',
    precio: 175000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Recuperación muscular e integridad intestinal en entrenamientos exigentes.',
    stock: true,
  },

  /* ---------------- KETO / LOW CARB ---------------- */
  {
    id: 'aceite-mct',
    nombre: 'Aceite MCT C8/C10',
    marca: '',
    categoria: 'keto',
    formato: '500 ml',
    precio: 215000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: 'Keto esencial',
    resumen: 'Energía cetónica inmediata sin picos de insulina. Ideal en el café matinal.',
    stock: true,
  },
  {
    id: 'barras-keto',
    nombre: 'Barras Keto (caja x 12)',
    marca: '',
    categoria: 'keto',
    formato: '12 u · 2 g carbos netos',
    precio: 169000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Snack real para cortar el hambre sin romper la cetosis.',
    stock: true,
  },
  {
    id: 'sustituto-comida',
    nombre: 'Sustituto de Comida Low Carb',
    marca: '',
    categoria: 'keto',
    formato: '1 kg · 20 servicios',
    precio: 299000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Comida completa en 400 kcal: proteína, grasas buenas y fibra.',
    stock: true,
  },
  {
    id: 'endulzante-monkfruit',
    nombre: 'Endulzante Monk Fruit + Eritritol',
    marca: '',
    categoria: 'keto',
    formato: '250 g',
    precio: 99000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Cero índice glucémico, sin regusto. Reemplazo directo del azúcar.',
    stock: true,
  },

  /* ---------------- LONGEVIDAD / NOOTRÓPICOS ---------------- */
  {
    id: 'omega-3',
    nombre: 'Omega 3 Ultra (EPA/DHA)',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 199000,
    precioAntes: 0,
    objetivos: ['foco', 'belleza'],
    badge: 'Neuroplasticidad',
    resumen: 'DHA de alta concentración: membrana neuronal, memoria y antiinflamación.',
    stock: true,
  },
  {
    id: 'magnesio-glicinato',
    nombre: 'Magnesio Glicinato',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 195000,
    precioAntes: 0,
    objetivos: ['foco', 'energia'],
    badge: '',
    resumen: 'Sueño profundo y recuperación nerviosa. La forma que sí se absorbe.',
    stock: true,
  },
  {
    id: 'vitamina-d3-k2',
    nombre: 'Vitamina D3 + K2',
    marca: '',
    categoria: 'longevidad',
    formato: '90 cápsulas',
    precio: 175000,
    precioAntes: 0,
    objetivos: ['belleza', 'energia'],
    badge: '',
    resumen: 'Hueso, inmunidad y testosterona. El déficit más común y más barato de corregir.',
    stock: true,
  },
  /* ---------------- ALIMENTACIÓN REAL (reventa BRASA MONTE) ----------------
     Productos de terceros que ProteínaSmart revende. A diferencia del resto
     del catálogo, acá la marca SÍ está verificada: es el dato que se anuncia.
     Precio = PVP de BRASA MONTE, sin recargo: igualamos su precio para que no
     haya objeción, y el envío lo absorbe el carrito que ya lo paga.
     OJO con la vida útil: la carne seca declara 2 a 4 semanas en etiqueta, así
     que esto va contra pedido, nunca con stock comprado. Ver
     docs/brasamonte-reventa.md.
     Por eso `verificado.stock` queda en false como en todo el catálogo: no
     hay inventario propio que respalde un InStock en los datos estructurados.
     Se activa recién cuando haya reposición confirmada por escrito. */
  {
    id: 'carne-seca-original-200',
    nombre: 'Carne Seca Original (Beef Jerky)',
    marca: 'BRASA MONTE',
    categoria: 'proteinas',
    formato: '200 g · marinado',
    precio: 99000,
    precioAntes: 0,
    objetivos: ['masa', 'definicion'],
    badge: 'Comida real',
    resumen: 'Carne de res del Chaco marinada y secada, lista para comer. Cero azúcar.',
    stock: true,
    verificado: { marca: true, formato: true },
  },
  {
    id: 'carne-seca-cecina-200',
    nombre: 'Carne Seca Tipo Cecina',
    marca: 'BRASA MONTE',
    categoria: 'proteinas',
    formato: '200 g · solo carne y sal',
    precio: 99000,
    precioAntes: 0,
    objetivos: ['masa', 'definicion'],
    badge: '',
    resumen: 'Dos ingredientes: carne y sal. Sin marinar, sin conservantes, cero azúcar.',
    stock: true,
    verificado: { marca: true, formato: true },
  },
  {
    id: 'carne-seca-original-75',
    nombre: 'Carne Seca Original (Beef Jerky)',
    marca: 'BRASA MONTE',
    categoria: 'proteinas',
    formato: '75 g · marinado',
    precio: 39000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'El formato para probar o llevar al entrenamiento. Cero azúcar.',
    stock: true,
    verificado: { marca: true, formato: true },
  },
  {
    id: 'ghee-brasamonte',
    nombre: 'Ghee (manteca clarificada)',
    marca: 'BRASA MONTE',
    categoria: 'keto',
    formato: '200 ml',
    precio: 49000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: 'Keto esencial',
    resumen: 'Manteca pura sin sólidos lácteos. Para cocinar y freír, sin lactosa.',
    stock: true,
    verificado: { marca: true, formato: true },
  },

  {
    id: 'nootropico-focus',
    nombre: 'Nootrópico Focus (L-teanina + colina)',
    marca: '',
    categoria: 'longevidad',
    formato: '60 cápsulas',
    precio: 199000,
    precioAntes: 0,
    objetivos: ['foco'],
    badge: 'Nuevo',
    resumen: 'Concentración sostenida sin ansiedad ni bajón posterior.',
    stock: true,
  },
];

/* Propiedad visual normalizada: una URL vacia activa el fallback tipografico. */
/* Asesoría por producto(Regla de Venta del Dossier): cada item sabe su protocolo
   y su complemento natural para el upsell en el checkout de WhatsApp. */
const PS_ASESORIA_POR_PRODUCTO = {
  'whey-isolate-2lb': { protocolo: 'Ganar masa', complemento: 'Creatina + EAA' },
  'whey-concentrada-5lb': { protocolo: 'Ganar masa', complemento: 'Creatina + EAA' },
  'proteina-vegana': { protocolo: 'Bajar grasa / Definir', complemento: 'EAA + Aceite MCT' },
  'colageno-hidrolizado': { protocolo: 'Belleza & longevidad', complemento: 'Omega 3 + Vitamina D3+K2' },
  'creatina-mono': { protocolo: 'Ganar masa', complemento: 'Whey Protein + EAA' },
  'pre-entreno': { protocolo: 'Energía sostenida', complemento: 'Aceite MCT + Vitamina D3+K2' },
  'eaa-bcaa': { protocolo: 'Bajar grasa / Definir', complemento: 'Whey Isolate o Proteína Vegetal + MCT' },
  'glutamina': { protocolo: 'Recuperación muscular', complemento: 'Whey Protein + Creatina' },
  'aceite-mct': { protocolo: 'Energía sostenida', complemento: 'Vitamina D3+K2 + Pre-entreno' },
  'barras-keto': { protocolo: 'Keto / Low carb', complemento: 'Aceite MCT + Sustituto de Comida' },
  'sustituto-comida': { protocolo: 'Keto / Low carb', complemento: 'Aceite MCT + Proteína Vegetal' },
  'endulzante-monkfruit': { protocolo: 'Keto / Low carb', complemento: 'Aceite MCT + Barras Keto' },
  'omega-3': { protocolo: 'Foco y claridad mental', complemento: 'Magnesio Glicinato + Nootrópico Focus' },
  'magnesio-glicinato': { protocolo: 'Foco y claridad mental', complemento: 'Omega 3 + Nootrópico Focus' },
  'vitamina-d3-k2': { protocolo: 'Energía sostenida', complemento: 'Aceite MCT + Omega 3' },
  'nootropico-focus': { protocolo: 'Foco y claridad mental', complemento: 'Omega 3 + Magnesio Glicinato' },
  'carne-seca-original-200': { protocolo: 'Alimentación real', complemento: 'Whey Protein + Aceite MCT' },
  'carne-seca-cecina-200': { protocolo: 'Alimentación real', complemento: 'Whey Protein + Aceite MCT' },
  'carne-seca-original-75': { protocolo: 'Alimentación real', complemento: 'Barras Keto + Aceite MCT' },
  'ghee-brasamonte': { protocolo: 'Keto / Low carb', complemento: 'Aceite MCT + Endulzante Monk Fruit' },
};

/* Fotos reales recibidas y auditadas contra la ficha de cada producto (peso,
   servicios, vencimiento visible en la etiqueta) -- ver images/README.md
   para el detalle de cada coincidencia y de los 12 productos que quedaron
   sin imagen por discrepancia con la ficha. Solo estas 7 pasan la
   verificacion; el resto queda en imagen:'' con verificado.imagen:false y
   usa el fallback tipografico ya existente en cardHTML/main.js. */
const PS_IMAGENES_VERIFICADAS = {
  'whey-isolate-2lb': 'images/wheyptrotein.webp',
  'proteina-vegana': 'images/proteinavegetal.webp',
  'creatina-mono': 'images/creatinamonohidratada.webp',
  'pre-entreno': 'images/preentrenopowerboost.webp',
  'sustituto-comida': 'images/akmuerzosmart.webp',
  'omega-3': 'images/omega3.webp',
  'magnesio-glicinato': 'images/magnesio.webp',
  // Confirmadas por revision manual del negocio (9 sep 2026) pese a la
  // discrepancia de peso/precio/formula que habia frenado el pase anterior
  // -- ver images/README.md para el detalle de cada caso.
  'eaa-bcaa': 'images/aminoacidos.webp',
  'glutamina': 'images/lglutamina.webp',
  'aceite-mct': 'images/aceitedecocomct.webp',
  'barras-keto': 'images/barrasketo.webp',
  'endulzante-monkfruit': 'images/eritritolyfrutosdelbosque.webp',
  'vitamina-d3-k2': 'images/vitaminade3yk2.webp',
  'nootropico-focus': 'images/nootropico.webp',
};

window.PS_CATALOG = window.PS_CATALOG.map((producto) => {
  const imagenVerificada = PS_IMAGENES_VERIFICADAS[producto.id];
  return {
    ...producto,
    imagen: imagenVerificada || producto.imagen || '',
    sabor: '',
    // Por defecto nada esta verificado: un indicador solo se activa si el
    // producto lo declara con evidencia (ver AGENTS.md). La imagen es la
    // excepcion: la decide PS_IMAGENES_VERIFICADAS, no el producto.
    verificado: {
      marca: producto.verificado?.marca === true,
      formato: producto.verificado?.formato === true,
      sabor: producto.verificado?.sabor === true,
      stock: producto.verificado?.stock === true,
      imagen: !!imagenVerificada,
    },
    ...(PS_ASESORIA_POR_PRODUCTO[producto.id] || {}),
  };
});

/* =========================================================
   COMBOS (Smart Stacks comprables)
   El precio NO se escribe acá: se suma de los componentes en
   window.PS_COMBOS_RESUELTOS, así un cambio de precio del catálogo nunca
   deja un combo desactualizado. Si un componente no existe o no tiene
   precio, el combo se descarta entero en vez de publicarse incompleto.
   ========================================================= */
const PS_COMBOS_DEF = [
  {
    id: 'smart-muscle',
    nombre: 'Smart Muscle',
    bajada: 'La base para acompañar un plan de fuerza: proteína suficiente, creatina diaria y aminoácidos.',
    objetivo: 'masa',
    componentes: ['whey-isolate-2lb', 'creatina-mono', 'eaa-bcaa'],
  },
  {
    id: 'smart-cut',
    nombre: 'Smart Cut',
    bajada: 'Proteína y saciedad para sostener el déficit. Sin quemadores ni promesas.',
    objetivo: 'definicion',
    componentes: ['whey-isolate-2lb', 'aceite-mct', 'eaa-bcaa'],
  },
  {
    id: 'smart-40',
    nombre: 'Smart 40+',
    bajada: 'Los tres déficits más comunes después de los 40, corregidos con lo que tiene más evidencia.',
    objetivo: 'energia',
    componentes: ['omega-3', 'magnesio-glicinato', 'vitamina-d3-k2'],
  },
  {
    id: 'smart-glow',
    nombre: 'Smart Glow',
    bajada: 'Base diaria para piel, pelo, uñas y articulaciones. El colágeno ya trae la vitamina C.',
    objetivo: 'belleza',
    componentes: ['colageno-hidrolizado', 'magnesio-glicinato'],
  },
  {
    id: 'smart-feeding',
    nombre: 'Smart Feeding',
    coMarca: 'BRASA MONTE',
    bajada: 'Alimentación real baja en carbohidratos: grasa buena para cocinar, proteína entera para el día y el endulzante que reemplaza al azúcar.',
    objetivo: 'definicion',
    componentes: ['ghee-brasamonte', 'carne-seca-cecina-200', 'endulzante-monkfruit'],
  },
];

/* Resuelve cada combo contra el catálogo ya normalizado. Un combo con un
   componente faltante o sin precio no se publica: un pack con un hueco es
   peor que no ofrecerlo. */
window.PS_COMBOS = PS_COMBOS_DEF.reduce((publicables, combo) => {
  const items = /** @type {Array<Record<string, any>>} */ ([]);
  for (const id of combo.componentes) {
    const item = window.PS_CATALOG.find((producto) => producto.id === id);
    // Un componente que falta o que quedo sin precio tumba el combo entero.
    if (!item || !(item.precio > 0)) return publicables;
    items.push(item);
  }
  const precio = items.reduce((suma, item) => suma + item.precio, 0);
  return publicables.concat({ ...combo, items, precio });
}, /** @type {Array<PSCombo>} */ ([]));

/* Categorías: título y descripción de cada filtro */
window.PS_CATEGORIAS = [
  { id: 'todos', nombre: 'Todo el catálogo', icono: '◆' },
  { id: 'proteinas', nombre: 'Proteínas', icono: '🥛' },
  { id: 'deportivos', nombre: 'Deportivos', icono: '🏋️' },
  { id: 'keto', nombre: 'Keto / Low carb', icono: '🥑' },
  { id: 'longevidad', nombre: 'Salud & Longevidad', icono: '🧠' },
];

/* Objetivos del selector guiado */
window.PS_OBJETIVOS = [
  { id: 'masa', nombre: 'Ganar masa muscular', icono: '💪' },
  { id: 'definicion', nombre: 'Bajar grasa / definir', icono: '🔥' },
  { id: 'belleza', nombre: 'Piel, pelo y articulaciones', icono: '✨' },
  { id: 'foco', nombre: 'Foco y claridad mental', icono: '🧠' },
  { id: 'energia', nombre: 'Energía sostenida', icono: '⚡' },
];
