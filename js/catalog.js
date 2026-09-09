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
     imagen      → ruta del archivo; vacío conserva el diseño tipográfico
     imagenReferencial → muestra aviso de presentación pendiente de confirmar
     stock       → true | false

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
    imagen: 'images/wheyptrotein.webp',
    imagenReferencial: true,
    nombre: 'Whey Protein Isolate',
    marca: '',
    categoria: 'proteinas',
    formato: '2 lb · 27 servicios',
    precio: 330000,
    precioAntes: 0,
    objetivos: ['masa', 'definicion'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'whey-concentrada-5lb',
    imagen: '', // El archivo recibido muestra 2 lb; esta ficha es de 5 lb.
    nombre: 'Whey Protein Concentrada',
    marca: '',
    categoria: 'proteinas',
    formato: '5 lb · 68 servicios',
    precio: 450000,
    precioAntes: 0,
    objetivos: ['masa'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'proteina-vegana',
    imagen: 'images/proteinavegetal.webp',
    imagenReferencial: true,
    nombre: 'Proteína Vegetal (arveja + arroz)',
    marca: '',
    categoria: 'proteinas',
    formato: '1 kg · 30 servicios',
    precio: 265000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'colageno-hidrolizado',
    imagen: '', // No se recibió una imagen correspondiente a este producto.
    nombre: 'Colágeno Hidrolizado + Vitamina C',
    marca: '',
    categoria: 'proteinas',
    formato: '300 g · 30 servicios',
    precio: 215000,
    precioAntes: 0,
    objetivos: ['belleza'],
    badge: 'Belleza & longevidad',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },

  /* ---------------- DEPORTIVOS ---------------- */
  {
    id: 'creatina-mono',
    imagen: 'images/creatinamonohidratada.webp',
    imagenReferencial: true,
    nombre: 'Creatina Monohidratada Micronizada',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 100 servicios',
    precio: 235000,
    precioAntes: 0,
    objetivos: ['masa', 'foco', 'energia'],
    badge: 'Base de todo',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'pre-entreno',
    imagen: 'images/preentrenopowerboost.webp',
    imagenReferencial: true,
    nombre: 'Pre-Entreno sin azúcar',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 30 servicios',
    precio: 255000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'eaa-bcaa',
    imagen: '', // El envase recibido muestra 300 g; esta ficha es de 400 g.
    nombre: 'Aminoácidos Esenciales (EAA)',
    marca: '',
    categoria: 'deportivos',
    formato: '400 g · 40 servicios',
    precio: 185000,
    precioAntes: 0,
    objetivos: ['definicion', 'masa'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'glutamina',
    imagen: '', // La imagen recibida muestra un vencimiento en diciembre de 2025.
    nombre: 'L-Glutamina',
    marca: '',
    categoria: 'deportivos',
    formato: '300 g · 60 servicios',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },

  /* ---------------- KETO / LOW CARB ---------------- */
  {
    id: 'aceite-mct',
    imagen: '', // La imagen recibida muestra un vencimiento en diciembre de 2025.
    nombre: 'Aceite MCT C8/C10',
    marca: '',
    categoria: 'keto',
    formato: '500 ml',
    precio: 185000,
    precioAntes: 0,
    objetivos: ['energia', 'foco'],
    badge: 'Keto esencial',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'barras-keto',
    imagen: '', // El envase muestra 3 g de carbos netos; la ficha declara 2 g.
    nombre: 'Barras Keto (caja x 12)',
    marca: '',
    categoria: 'keto',
    formato: '12 u · 2 g carbos netos',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'sustituto-comida',
    imagen: 'images/akmuerzosmart.webp',
    imagenReferencial: true,
    nombre: 'Sustituto de Comida Low Carb',
    marca: '',
    categoria: 'keto',
    formato: '1 kg · 20 servicios',
    precio: 295000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'endulzante-monkfruit',
    imagen: '', // La imagen recibida es de 500 g; esta ficha es de 250 g.
    nombre: 'Endulzante Monk Fruit + Eritritol',
    marca: '',
    categoria: 'keto',
    formato: '250 g',
    precio: 89000,
    precioAntes: 0,
    objetivos: ['definicion'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },

  /* ---------------- LONGEVIDAD / NOOTRÓPICOS ---------------- */
  {
    id: 'omega-3',
    imagen: 'images/omega3.webp',
    imagenReferencial: true,
    nombre: 'Omega 3 Ultra (EPA/DHA)',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 169000,
    precioAntes: 0,
    objetivos: ['foco', 'belleza'],
    badge: 'Neuroplasticidad',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'magnesio-glicinato',
    imagen: 'images/magnesio.webp',
    imagenReferencial: true,
    nombre: 'Magnesio Glicinato',
    marca: '',
    categoria: 'longevidad',
    formato: '120 cápsulas',
    precio: 165000,
    precioAntes: 0,
    objetivos: ['foco', 'energia'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'vitamina-d3-k2',
    imagen: '', // La imagen muestra 60 cápsulas y otro precio; la ficha es de 90.
    nombre: 'Vitamina D3 + K2',
    marca: '',
    categoria: 'longevidad',
    formato: '90 cápsulas',
    precio: 145000,
    precioAntes: 0,
    objetivos: ['belleza', 'energia'],
    badge: '',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
    stock: true,
  },
  {
    id: 'nootropico-focus',
    imagen: '', // La imagen recibida declara otra composición y otro precio.
    nombre: 'Nootrópico Focus (L-teanina + colina)',
    marca: '',
    categoria: 'longevidad',
    formato: '60 cápsulas',
    precio: 195000,
    precioAntes: 0,
    objetivos: ['foco'],
    badge: 'Nuevo',
    resumen: 'Consultá la composición y la etiqueta del fabricante antes de elegir.',
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
};

window.PS_CATALOG = window.PS_CATALOG.map((producto) => ({
  disponibilidad: 'sin-confirmar',
  precioActualizado: '',
  fabricante: '',
  sabor: '',
  etiquetaNutricional: '',
  ...producto,
  imagen: producto.imagen || '',
  ...(PS_ASESORIA_POR_PRODUCTO[producto.id] || {}),
}));

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

/* Fuente híbrida: el array local se renderiza antes de iniciar esta consulta.
   REST nativo; el límite de tiempo incluye la descarga y lectura del JSON. */
(function configurarFuenteCatalogo() {
  const catalogoLocal = window.PS_CATALOG;
  const categorias = new Set(window.PS_CATEGORIAS.map(({ id }) => id));
  const estados = new Set(['disponible', 'bajo-pedido', 'agotado', 'sin-confirmar']);
  const texto = (valor) => typeof valor === 'string' ? valor.trim() : '';
  const lista = (valor) => Array.isArray(valor) ? valor.filter((item) => typeof item === 'string') : [];

  /** Normaliza los nombres de columnas del esquema existente, sin inferir stock.
   * @param {Record<string, any>} producto
   * @returns {Record<string, any>|null}
   */
  function adaptarProducto(producto) {
    if (!producto || typeof producto !== 'object' || Array.isArray(producto)) return null;
    const id = typeof producto.id === 'string' ? producto.id.trim()
      : Number.isSafeInteger(producto.id) ? String(producto.id) : '';
    const nombre = texto(producto.nombre);
    const formato = texto(producto.formato) || texto(producto.unidad_medida);
    const categoria = texto(producto.categoria);
    const precio = typeof producto.precio === 'string' && /^\d+$/.test(producto.precio)
      ? Number(producto.precio) : producto.precio;
    if (!id || !nombre || !formato || !categorias.has(categoria)
      || !Number.isSafeInteger(precio) || precio < 0) return null;

    return {
      ...producto,
      id, nombre, formato, categoria, precio,
      precioAntes: Number.isSafeInteger(producto.precioAntes) && producto.precioAntes > 0 ? producto.precioAntes : 0,
      marca: texto(producto.marca),
      fabricante: texto(producto.fabricante),
      sabor: texto(producto.sabor),
      badge: texto(producto.badge),
      resumen: texto(producto.resumen) || texto(producto.descripcion),
      imagen: texto(producto.imagen),
      imagenReferencial: producto.imagenReferencial === true || producto.imagen_referencial === true,
      objetivos: lista(producto.objetivos),
      disciplinas: lista(producto.disciplinas),
      stock: typeof producto.stock === 'boolean' ? producto.stock : undefined,
      disponibilidad: producto.stock === false ? 'agotado'
        : estados.has(producto.disponibilidad) ? producto.disponibilidad : 'sin-confirmar',
      precioActualizado: texto(producto.precioActualizado) || texto(producto.precio_actualizado),
      etiquetaNutricional: texto(producto.etiquetaNutricional) || texto(producto.etiqueta_nutricional),
    };
  }

  /** Devuelve productos remotos válidos o la misma referencia al catálogo local.
   * No modifica PS_CATALOG: siempre queda disponible como respaldo inmediato.
   * @returns {Promise<Array<Record<string, any>>>}
   */
  window.fetchCatalog = async function fetchCatalog() {
    const config = window.PS_CONFIG || {};
    const anterior = config.supabase || {};
    // Una configuración plana parcial no se mezcla con otro proyecto antiguo.
    const usarPlanas = Boolean(texto(config.supabaseUrl) || texto(config.supabaseAnonKey));
    const url = texto(usarPlanas ? config.supabaseUrl : anterior.url);
    const clave = texto(usarPlanas ? config.supabaseAnonKey : anterior.anonKey);
    if (!url || !clave || typeof fetch !== 'function') return catalogoLocal;

    let temporizador;
    try {
      const endpoint = new URL(url);
      const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
      if (endpoint.protocol !== 'https:' && !(esLocal && endpoint.protocol === 'http:')) return catalogoLocal;
      endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/rest/v1/productos';
      endpoint.search = 'select=*&order=nombre.asc';
      endpoint.hash = '';
      const controlador = new AbortController();
      /** @type {Record<string, string>} */
      const headers = { apikey: clave, Accept: 'application/json' };
      // Las claves publishable no son JWT; solo las anon usan Bearer.
      if (!clave.startsWith('sb_publishable_')) headers.Authorization = 'Bearer ' + clave;

      const consulta = (async () => {
        const respuesta = await fetch(endpoint.href, { headers, signal: controlador.signal });
        if (!respuesta.ok) throw new Error('Catálogo no disponible');
        return respuesta.json();
      })();
      const limite = new Promise((_, rechazar) => {
        temporizador = setTimeout(() => {
          controlador.abort();
          rechazar(new Error('Tiempo de consulta agotado'));
        }, 4000);
      });
      const filas = await Promise.race([consulta, limite]);
      if (!Array.isArray(filas) || filas.length === 0) return catalogoLocal;
      const productos = filas.map(adaptarProducto);
      if (productos.some((producto) => !producto)
        || new Set(productos.map((producto) => producto.id)).size !== productos.length) return catalogoLocal;
      return productos;
    } catch (_) {
      return catalogoLocal;
    } finally {
      clearTimeout(temporizador);
    }
  };
})();
