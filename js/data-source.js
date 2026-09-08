

/**
 * Convierte un producto de Supabase al contrato del catalogo local.
 * @param {Object} producto Fila devuelta por Supabase.
 * @returns {Object} Producto compatible con el render Vanilla.
 */
function adaptarProducto(producto) {
  return {
    ...producto,
    id: String(producto.id),
    nombre: producto.nombre || 'Producto sin nombre',
    formato: producto.unidad_medida || 'unidad',
    precio: Number.isInteger(producto.precio) ? producto.precio : 0,
    resumen: producto.descripcion || 'Producto seleccionado por ProteinaSmart.',
    categoria: producto.categoria || 'todos',
    objetivos: Array.isArray(producto.objetivos) ? producto.objetivos : [],
    disciplinas: Array.isArray(producto.disciplinas) ? producto.disciplinas : [],
    imagen: producto.imagen || '',
    stock: typeof producto.stock === 'boolean' ? producto.stock : null,
    verificado: producto.verificado || {},
  };
}

/**
 * Intenta cargar el catalogo remoto y conserva el fallback local ante cualquier fallo.
 * @returns {Promise<Array<Object>|null>} Catalogo remoto o null si no esta disponible.
 */
async function cargarCatalogoRemoto() {
  const supabaseConfig = (window.PS_CONFIG || {}).supabase || {};
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return null;

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data.map(adaptarProducto);
  } catch (error) {
    return null;
  }
}

/**
 * Publica el catalogo remoto cuando la fuente hibrida esta disponible.
 * @returns {Promise<void>} Resolucion cuando termina el intento.
 */
async function iniciarFuenteHibrida() {
  const remoto = await cargarCatalogoRemoto();
  if (remoto) window.dispatchEvent(new CustomEvent('ps:catalogo-remoto', { detail: remoto }));
}

iniciarFuenteHibrida();
