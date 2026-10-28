/* =========================================================
   ProteinaSmart - carrito
   Estado inmutable con persistencia local.
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'proteinasmart:carrito:v1';
  const MAX_QUANTITY = 99;
  const quantity = (value) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(value) || 1)));

  /**
   * Valida el tramo mayorista de un producto. Se acepta solo si realmente
   * baja el precio unitario a partir de una cantidad alcanzable: un tramo que
   * no ahorra nada, que encarece o que pide mas de MAX_QUANTITY se descarta
   * en lugar de mostrarse, porque un "precio mayorista" que no se puede
   * alcanzar o que no ahorra es peor que no tener ninguno.
   * @param {unknown} mayorista Tramo declarado por el catalogo.
   * @param {number} precioBase Precio de lista ya normalizado.
   * @returns {PSTramoMayorista | null} Tramo valido o null.
   */
  function normalizarMayorista(mayorista, precioBase) {
    if (!mayorista || typeof mayorista !== 'object') return null;
    const desde = Number(/** @type {any} */ (mayorista).desde);
    const precio = Number(/** @type {any} */ (mayorista).precio);
    if (!Number.isSafeInteger(desde) || desde < 2 || desde > MAX_QUANTITY) return null;
    if (!Number.isSafeInteger(precio) || precio <= 0) return null;
    if (precioBase <= 0 || precio >= precioBase) return null;
    return { desde, precio };
  }

  /**
   * Normaliza un item externo al contrato interno del carrito.
   * @param {Record<string, any>} producto Producto del catalogo.
   * @param {number} [cantidad=1] Cantidad solicitada.
   * @returns {PSCartItem} Item inmutable del carrito.
   */
  function normalizarItem(producto, cantidad) {
    const precio = Number.isSafeInteger(producto.precio) && producto.precio > 0 ? producto.precio : 0;
    return {
      id: String(producto.id),
      nombre: producto.nombre,
      formato: producto.formato || producto.unidad || 'unidad',
      marca: producto.verificado?.marca ? producto.marca || '' : '',
      sabor: producto.verificado?.sabor ? producto.sabor || '' : '',
      verificado: { marca: producto.verificado?.marca === true, sabor: producto.verificado?.sabor === true },
      precio,
      mayorista: normalizarMayorista(producto.mayorista, precio),
      cantidad: quantity(cantidad),
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
   * @returns {Array<PSCartItem>} Items validos persistidos.
   */
  function leerPersistencia() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.reduce((state, item) => reducer(state, { type: 'AGREGAR', producto: item, cantidad: item?.cantidad }), []) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Persiste una copia serializable del estado del carrito.
   * @param {Array<PSCartItem>} items Items actuales.
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
   * @param {Array<PSCartItem>} estado Estado actual.
   * @param {Object} accion Accion del dominio.
   * @returns {Array<PSCartItem>} Nuevo estado.
   */
  function reducer(estado, accion) {
    switch (accion.type) {
      case 'AGREGAR': {
        if (!accion.producto || typeof accion.producto.id !== 'string' || !accion.producto.id || typeof accion.producto.nombre !== 'string') return estado;
        const item = normalizarItem(accion.producto, accion.cantidad);
        const existe = estado.find((actual) => actual.id === item.id);
        return existe
          ? estado.map((actual) => actual.id === item.id
            ? { ...item, cantidad: quantity(actual.cantidad + item.cantidad) }
            : actual)
          : [...estado, item];
      }
      case 'ELIMINAR':
        return estado.filter((item) => item.id !== accion.id);
      case 'ACTUALIZAR_CANTIDAD':
        if (!Number.isFinite(accion.cantidad)) return estado;
        return accion.cantidad <= 0
          ? estado.filter((item) => item.id !== accion.id)
          : estado.map((item) => item.id === accion.id
            ? { ...item, cantidad: quantity(accion.cantidad) }
            : item);
      case 'LIMPIAR':
        return [];
      default:
        return estado;
    }
  }

  /**
   * Precio unitario vigente de un item: el del tramo mayorista si la cantidad
   * lo alcanza, el de lista si no. Es la unica fuente de ese calculo -- la UI
   * y el checkout la reusan para no derivar el descuento por su cuenta.
   * @param {PSCartItem} item Item del carrito.
   * @returns {number} Precio unitario en guaranies.
   */
  function precioUnitario(item) {
    return item.mayorista && item.cantidad >= item.mayorista.desde ? item.mayorista.precio : item.precio;
  }

  /**
   * Cuantas unidades faltan para alcanzar el tramo mayorista de un item.
   * @param {PSCartItem} item Item del carrito.
   * @returns {number} Unidades faltantes; 0 si no aplica o ya se alcanzo.
   */
  function faltanParaMayorista(item) {
    if (!item.mayorista || item.cantidad >= item.mayorista.desde) return 0;
    return item.mayorista.desde - item.cantidad;
  }

  /**
   * Calcula el total entero en guaranies, sin formato de presentacion.
   * Aplica el tramo mayorista por item cuando la cantidad lo alcanza.
   * @param {Array<PSCartItem>} items Items del carrito.
   * @returns {number} Total en guaranies.
   */
  function total(items) {
    return items.reduce((acumulado, item) => acumulado + precioUnitario(item) * item.cantidad, 0);
  }

  /**
   * Ahorro en guaranies que los tramos mayoristas ya aplicaron al carrito.
   * @param {Array<PSCartItem>} items Items del carrito.
   * @returns {number} Ahorro en guaranies; 0 si ningun tramo esta activo.
   */
  function ahorroMayorista(items) {
    return items.reduce((acumulado, item) => acumulado + (item.precio - precioUnitario(item)) * item.cantidad, 0);
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

  window.PS_CART = { dispatch, getState, subscribe, reducer, total, precioUnitario, faltanParaMayorista, ahorroMayorista, normalizarMayorista, MAX_QUANTITY };
})();
