/* =========================================================
   ProteínaSmart — data-source.js
   Fuente hibrida: intenta el catalogo remoto de Supabase via REST nativo
   (fetch, sin libreria de cliente) y cae de inmediato al array local
   PS_CATALOG ante credenciales ausentes, URL invalida, timeout, red
   caida o una respuesta que no se pueda interpretar como catalogo.
   ========================================================= */

const SUPABASE_FETCH_TIMEOUT_MS = 4000;
const CATEGORIAS_VALIDAS = ['proteinas', 'deportivos', 'keto', 'longevidad'];

/**
 * Resuelve URL y anon/publishable key desde la config, aceptando tanto las
 * claves planas (supabaseUrl/supabaseAnonKey) como la forma anidada legacy
 * (supabase.url/supabase.anonKey). Sin credenciales o con una URL que no
 * es https valida, no hay fuente remota.
 * @param {Object} config PS_CONFIG.
 * @returns {{url: string, anonKey: string}|null}
 */
function resolverCredencialesSupabase(config) {
  const cfg = config || {};
  const legacy = cfg.supabase || {};
  const url = cfg.supabaseUrl || legacy.url || '';
  const anonKey = cfg.supabaseAnonKey || legacy.anonKey || '';
  if (!url || !anonKey) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  return { url: url.replace(/\/+$/, ''), anonKey };
}

/**
 * Convierte una fila de la tabla productos al contrato de PS_CATALOG.
 * Descarta la fila (devuelve null) si falta un dato esencial o el precio
 * no es un entero valido -- nunca inventa disponibilidad ni precio.
 * @param {Object} fila Fila devuelta por Supabase.
 * @returns {Object|null}
 */
function adaptarProducto(fila) {
  if (!fila || typeof fila !== 'object') return null;
  const id = fila.id;
  const nombre = typeof fila.nombre === 'string' ? fila.nombre.trim() : '';
  if (id === undefined || id === null || !nombre) return null;
  const precioNumerico = typeof fila.precio === 'string' ? Number(fila.precio) : fila.precio;
  if (!Number.isInteger(precioNumerico) || precioNumerico < 0 || precioNumerico > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  return {
    id: String(id),
    nombre,
    marca: typeof fila.marca === 'string' ? fila.marca : '',
    categoria: CATEGORIAS_VALIDAS.includes(fila.categoria) ? fila.categoria : 'todos',
    formato: typeof fila.unidad_medida === 'string' && fila.unidad_medida ? fila.unidad_medida : 'unidad',
    precio: precioNumerico,
    precioAntes: Number.isInteger(fila.precio_antes) ? fila.precio_antes : 0,
    objetivos: Array.isArray(fila.objetivos) ? fila.objetivos.filter((o) => typeof o === 'string') : [],
    disciplinas: Array.isArray(fila.disciplinas) ? fila.disciplinas.filter((d) => typeof d === 'string') : [],
    badge: typeof fila.badge === 'string' ? fila.badge : '',
    resumen: typeof fila.descripcion === 'string' && fila.descripcion ? fila.descripcion : 'Producto seleccionado por ProteinaSmart.',
    sabor: typeof fila.sabor === 'string' ? fila.sabor : '',
    imagen: typeof fila.imagen === 'string' ? fila.imagen : '',
    stock: typeof fila.stock === 'boolean' ? fila.stock : null,
    verificado: fila.verificado && typeof fila.verificado === 'object' ? fila.verificado : {},
  };
}

/**
 * Pide productos a la API REST de Supabase con fetch nativo. sb_publishable_
 * keys solo llevan apikey; las anon key legacy llevan ademas Authorization
 * Bearer. Aborta a los 4 s para no dejar la carga colgada en redes lentas.
 * @param {string} url Base de Supabase (sin barra final).
 * @param {string} anonKey Anon o publishable key.
 * @returns {Promise<Array<Object>|null>}
 */
async function solicitarProductos(url, anonKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
  try {
    const headers = { apikey: anonKey };
    if (!anonKey.startsWith('sb_publishable_')) headers.Authorization = 'Bearer ' + anonKey;
    const respuesta = await fetch(url + '/rest/v1/productos?select=*&order=nombre.asc', {
      headers,
      signal: controller.signal,
    });
    if (!respuesta.ok) return null;
    const datos = await respuesta.json();
    return Array.isArray(datos) ? datos : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Catalogo hibrido: remoto si hay credenciales y la respuesta es utilizable,
 * el array local PS_CATALOG en cualquier otro caso (sin credenciales, URL
 * invalida, timeout, red caida, JSON invalido o filas todas descartadas).
 * @returns {Promise<Array<Object>>}
 */
async function fetchCatalog() {
  const credenciales = resolverCredencialesSupabase(window.PS_CONFIG);
  if (!credenciales) return window.PS_CATALOG;

  const filas = await solicitarProductos(credenciales.url, credenciales.anonKey);
  if (!filas || filas.length === 0) return window.PS_CATALOG;

  const vistos = new Set();
  const productos = filas
    .map(adaptarProducto)
    .filter((producto) => producto && !vistos.has(producto.id) && vistos.add(producto.id));

  return productos.length > 0 ? productos : window.PS_CATALOG;
}

window.fetchCatalog = fetchCatalog;

/**
 * Publica el catalogo remoto solo cuando fetchCatalog() efectivamente
 * devolvio uno (no el array local por identidad de referencia).
 * @returns {Promise<void>}
 */
async function iniciarFuenteHibrida() {
  const catalogo = await fetchCatalog();
  if (catalogo !== window.PS_CATALOG) {
    window.dispatchEvent(new CustomEvent('ps:catalogo-remoto', { detail: catalogo }));
  }
}

iniciarFuenteHibrida();
