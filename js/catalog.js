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
     stock       → true | false
   ========================================================= */

window.PS_CATALOG = [
  /* ---------------- PROTEÍNAS ---------------- */
  {
    id: 'whey-isolate-2lb',
    nombre: 'Whey Protein Isolate',
    marca: '',
    categoria: 'proteinas',
    formato: '2 lb · 27 servicios',
    precio: 420000,
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
    precio: 690000,
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
    precio: 395000,
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
    precio: 210000,
    precioAntes: 245000,
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
    precio: 185000,
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
    precio: 265000,
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
    precio: 295000,
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
    precio: 190000,
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
    precio: 160000,
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
    precio: 340000,
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
    precio: 95000,
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
    precio: 175000,
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
    precio: 145000,
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
    precio: 130000,
    precioAntes: 0,
    objetivos: ['belleza', 'energia'],
    badge: '',
    resumen: 'Hueso, inmunidad y testosterona. El déficit más común y más barato de corregir.',
    stock: true,
  },
  {
    id: 'nootropico-focus',
    nombre: 'Nootrópico Focus (L-teanina + colina)',
    marca: '',
    categoria: 'longevidad',
    formato: '60 cápsulas',
    precio: 210000,
    precioAntes: 0,
    objetivos: ['foco'],
    badge: 'Nuevo',
    resumen: 'Concentración sostenida sin ansiedad ni bajón posterior.',
    stock: true,
  },
];

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
