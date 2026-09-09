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
     objetivos   → ['masa','definicion','belleza','foco','energia']
     badge       → etiqueta corta opcional ('Más vendido', 'Nuevo'…)
     resumen     → una línea, beneficio concreto
     stock       → true | false | null (desconocido)
     verificado  → indicadores por campo; activar solo con evidencia del proveedor

   PRECIOS — relevamiento de mercado Paraguay, septiembre 2026.
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
   SIN DATO DE MERCADO (estimados, validar con proveedor): barras keto,
   sustituto de comida, endulzante monk fruit, nootrópico focus, glutamina.
   ========================================================= */

window.PS_CATALOG = [
  /* ---------------- PROTEÍNAS ---------------- */
  {
    id: 'whey-isolate-2lb',
    nombre: 'Whey Protein Isolate',
    marca: '',
    categoria: 'proteinas',
    formato: '2 lb · 27 servicios',
    precio: 330000,
    precioAntes: 0,
    objetivos: ['masa', 'definicion'],
    badge: 'Más vendido',
    resumen: '27 g de proteína por scoop, sin lactosa y con carga glucémica mínima.',
    stock: null,
  },
  {
    id: 'whey-concentrada-5lb',
    nombre: 'Whey Protein Concentrada',
    marca: '',
    categoria: 'proteinas',
    formato: '5 lb · 68 servicios',
    precio: 450000,
    precioAntes: 0,
    objetivos: ['masa'],
    badge: '',
    resumen: 'El mejor costo por gramo de proteína para volumen sostenido.',
    stock: null,
  },
  {
    id: 'proteina-vegana',
    nombre: 'Proteína Vegetal (arveja + arroz)',
    marca: '',
    categoria: 'proteinas',
    formato: '1 kg · 30 servicios',
    precio: 265000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Perfil de aminoácidos completo, sin lácteos ni gluten. Digestión liviana.',
    stock: null,
  },
  {
    id: 'colageno-hidrolizado',
    nombre: 'Colágeno Hidrolizado + Vitamina C',
    marca: '',
    categoria: 'proteinas',
    formato: '300 g · 30 servicios',
    precio: 215000,
    precioAntes: 255000,
    objetivos: ['belleza'],
    badge: 'Belleza & longevidad',
    resumen: 'Péptidos tipo I y III para piel, cabello, uñas y articulaciones.',
    stock: null,
  },

  /* ---------------- DEPORTIVOS ---------------- */
  {
    id: 'creatina-mono',
    nombre: 'Creatina Monohidratada Micronizada',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 100 servicios',
    precio: 235000,
    precioAntes: 0,
    objetivos: ['masa', 'foco', 'energia'],
    badge: 'Base de todo',
    resumen: 'El suplemento con más evidencia: fuerza, masa magra y función cognitiva.',
    stock: null,
  },
  {
    id: 'pre-entreno',
    nombre: 'Pre-Entreno sin azúcar',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 30 servicios',
    precio: 255000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: '',
    resumen: 'Cafeína, beta-alanina y citrulina. Cero carbohidratos, apto keto.',
    stock: null,
  },
  {
    id: 'eaa-bcaa',
    nombre: 'Aminoácidos Esenciales (EAA)',
    marca: '',
    categoria: 'deportivos',
    formato: '400 g · 40 servicios',
    precio: 185000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Protege masa muscular durante el ayuno y los déficits calóricos.',
    stock: null,
  },
  {
    id: 'glutamina',
    nombre: 'L-Glutamina',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 60 servicios',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Recuperación muscular e integridad intestinal en entrenamientos exigentes.',
    stock: null,
  },

  /* ---------------- KETO / LOW CARB ---------------- */
  {
    id: 'aceite-mct',
    nombre: 'Aceite MCT C8/C10',
    marca: '',
    categoria: 'keto',
    formato: '500 ml',
    precio: 185000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: 'Keto esencial',
    resumen: 'Energía cetónica inmediata sin picos de insulina. Ideal en el café matinal.',
    stock: null,
  },
  {
    id: 'barras-keto',
    nombre: 'Barras Keto (caja x 12)',
    marca: '',
    categoria: 'keto',
    formato: '12 u · 2 g carbos netos',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Snack real para cortar el hambre sin romper la cetosis.',
    stock: null,
  },
  {
    id: 'sustituto-comida',
    nombre: 'Sustituto de Comida Low Carb',
    marca: '',
    categoria: 'keto',
    formato: '1 kg · 20 servicios',
    precio: 295000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Comida completa en 400 kcal: proteína, grasas buenas y fibra.',
    stock: null,
  },
  {
    id: 'endulzante-monkfruit',
    nombre: 'Endulzante Monk Fruit + Eritritol',
    marca: '',
    categoria: 'keto',
    formato: '250 g',
    precio: 89000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Cero índice glucémico, sin regusto. Reemplazo directo del azúcar.',
    stock: null,
  },

  /* ---------------- LONGEVIDAD / NOOTRÓPICOS ---------------- */
  {
    id: 'omega-3',
    nombre: 'Omega 3 Ultra (EPA/DHA)',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 169000,
    precioAntes: 0,
    objetivos: ['foco', 'belleza'],
    badge: 'Neuroplasticidad',
    resumen: 'DHA de alta concentración: membrana neuronal, memoria y antiinflamación.',
    stock: null,
  },
  {
    id: 'magnesio-glicinato',
    nombre: 'Magnesio Glicinato',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 165000,
    precioAntes: 0,
    objetivos: ['foco', 'energia'],
    badge: '',
    resumen: 'Sueño profundo y recuperación nerviosa. La forma que sí se absorbe.',
    stock: null,
  },
  {
    id: 'vitamina-d3-k2',
    nombre: 'Vitamina D3 + K2',
    marca: '',
    categoria: 'longevidad',
    formato: '90 cápsulas',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['belleza', 'energia'],
    badge: '',
    resumen: 'Hueso, inmunidad y testosterona. El déficit más común y más barato de corregir.',
    stock: null,
  },
  {
    id: 'nootropico-focus',
    nombre: 'Nootrópico Focus (L-teanina + colina)',
    marca: '',
    categoria: 'longevidad',
    formato: '60 cápsulas',
    precio: 195000,
    precioAntes: 0,
    objetivos: ['foco'],
    badge: 'Nuevo',
    resumen: 'Concentración sostenida sin ansiedad ni bajón posterior.',
    stock: null,
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
};

window.PS_CATALOG = window.PS_CATALOG.map((producto) => {
  const imagenVerificada = PS_IMAGENES_VERIFICADAS[producto.id];
  return {
    ...producto,
    imagen: imagenVerificada || producto.imagen || '',
    sabor: '',
    verificado: { marca: false, formato: false, sabor: false, stock: false, imagen: !!imagenVerificada },
    ...(PS_ASESORIA_POR_PRODUCTO[producto.id] || {}),
  };
});

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
