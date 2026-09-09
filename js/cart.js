/* =========================================================
   ProteinaSmart - carrito
   Estado inmutable con persistencia local.
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'proteinasmart:carrito:v1';

  /**
   * Normaliza un item externo al contrato interno del carrito.
   * @param {Object} producto Producto del catalogo.
   * @param {number} [cantidad=1] Cantidad solicitada.
   * @returns {Object} Item inmutable del carrito.
   */
  function normalizarItem(producto, cantidad) {
    return {
      id: String(producto.id),
      nombre: String(producto.nombre),
      formato: String(producto.formato || producto.unidad || 'unidad'),
      precio: Number.isSafeInteger(producto.precio) && producto.precio >= 0 ? producto.precio : 0,
      cantidad: Number.isFinite(Number(cantidad)) ? Math.min(999, Math.max(1, Math.floor(Number(cantidad) || 1))) : 1,
      categoria: producto.categoria || '',
      protocolo: producto.protocolo || producto.categoria || 'Asesoría personalizada',
      complemento: producto.complemento || 'Asesoría de uso personalizada',
      dosis: producto.dosis || 'Seguir la porción indicada en el envase.',
      momento: producto.momento || 'Coordinar según objetivo y rutina.',
      duracion: producto.duracion || '30 días de consistencia antes de evaluar el protocolo.',
    };
  }

  /**
   * Lee el carrito persistido sin romper la experiencia si localStorage falla.
   * @returns {Array<Object>} Items validos persistidos.
   */
  function leerPersistencia() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item === 'object' &&
        (typeof item.id === 'string' || typeof item.id === 'number') &&
        String(item.id).trim() && typeof item.nombre === 'string' && item.nombre.trim())
        .reduce((estado, item) => reducer(estado, { type: 'AGREGAR', producto: item, cantidad: item.cantidad }), []);
    } catch (error) {
      return [];
    }
  }

  /**
   * Persiste una copia serializable del estado del carrito.
   * @param {Array<Object>} items Items actuales.
   * @returns {void}
   */
  function guardarPersistencia(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // La compra sigue funcionando aunque el navegador bloquee storage.
    }
  }

  /**
   * Reduce una accion a un nuevo estado sin mutar el anterior.
   * @param {Array<Object>} estado Estado actual.
   * @param {Object} accion Accion del dominio.
   * @returns {Array<Object>} Nuevo estado.
   */
  function reducer(estado, accion) {
    switch (accion.type) {
      case 'AGREGAR': {
        const item = normalizarItem(accion.producto, accion.cantidad);
        const existe = estado.find((actual) => actual.id === item.id);
        return existe
          ? estado.map((actual) => actual.id === item.id
            ? { ...item, cantidad: Math.min(999, actual.cantidad + item.cantidad) }
            : actual)
          : [...estado, item];
      }
      case 'ELIMINAR':
        return estado.filter((item) => item.id !== accion.id);
      case 'ACTUALIZAR_CANTIDAD':
        if (!Number.isSafeInteger(accion.cantidad) || accion.cantidad > 999) return estado;
        return accion.cantidad <= 0
          ? estado.filter((item) => item.id !== accion.id)
          : estado.map((item) => item.id === accion.id
            ? { ...item, cantidad: Math.floor(accion.cantidad) }
            : item);
      case 'LIMPIAR':
        return [];
      case 'SINCRONIZAR_CATALOGO':
        return estado.map((item) => {
          const producto = accion.productos.find((p) => String(p.id) === item.id);
          return producto ? normalizarItem(producto, item.cantidad) : item;
        });
      default:
        return estado;
    }
  }

  /**
   * Calcula el total entero en guaranies, sin formato de presentacion.
   * @param {Array<Object>} items Items del carrito.
   * @returns {number} Total en guaranies.
   */
  function total(items) {
    return items.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
  }

  let items = leerPersistencia();
  const listeners = new Set();

  /**
   * Notifica cambios y persiste el estado resultante.
   * @param {Object} accion Accion del dominio.
   * @returns {void}
   */
  function dispatch(accion) {
    items = reducer(items, accion);
    guardarPersistencia(items);
    listeners.forEach((listener) => listener(getState()));
  }

  /**
   * Devuelve una instantanea inmutable del carrito.
   * @returns {Object} Estado publico del carrito.
   */
  function getState() {
    return { items: items.map((item) => ({ ...item })), total: total(items) };
  }

  /**
   * Suscribe una funcion a cambios del carrito.
   * @param {Function} listener Callback de cambios.
   * @returns {Function} Funcion para cancelar la suscripcion.
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.PS_CART = { dispatch, getState, subscribe, reducer, total };
})();
