/* =========================================================
   ProteinaSmart — pedidos.js
   PERSISTENCIA DE PEDIDOS (refuerzo, nunca bloqueo).
   Cuando el checkout de WhatsApp se confirma, registra el pedido
   en Supabase si la config remota esta disponible. Si Supabase falla,
   la venta sigue por WhatsApp igual: nunca dependemos de la nube..
   ========================================================= */
(() => {
  'use strict';

  const CFG = window.PS_CONFIG || {};
  const supabaseConfig = CFG.supabase || {};

  /**
   * Normaliza los items del carrito al contrato de pedidos_whatsapp,
   * incluyendo protocolo y complemento para el seguimiento automatico..
   * @param {Array<Object>} items Items del carrito..
   * @returns {Array<Object>} Items compatibles con el dashboard y la edge function..
   */
  function normalizarItems(items) {
    return items.map((item) => ({
      id: String(item.id || ''),
      nombre: item.nombre || '',
      cantidad: Math.floor(Number(item.cantidad) || 1),
      unidad: item.formato || item.unidad || 'unidad',
      precio: Number.isInteger(item.precio) ? item.precio : 0,
      proveedor: item.proveedor || '',
      protocolo: item.protocolo || '',
      complemento: item.complemento || '',
    }));
  }

  /**
   * Intenta persistir el pedido en Supabase REST. Fail-silent: la venta
   * jamas depende de este paso..
   * @param {Object} detail Detalle del evento ps:pedido..
   * @returns {Promise<void>}
   */
  async function registrarPedido(detail) {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) return;
    try {
      const payload = {
        cliente_nombre: 'Cliente WhatsApp',
        telefono: (CFG.contacto && CFG.contacto.whatsapp) || '',
        total: Number.isInteger(detail.total) ? detail.total : 0,
        items_json: normalizarItems(detail.items || []),
        estado_entrega: 'pendiente',
      };
      const res = await fetch(supabaseConfig.url + '/rest/v1/pedidos_whatsapp', {
        method: 'POST',
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: 'Bearer ' + supabaseConfig.anonKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok && res.status !== 201) {
        console.warn('[pedidos] no se persistio el pedido (' + res.status + '): el checkout continua por WhatsApp.');
      }
    } catch (e) {
      // Silencio total: la persistencia es un refuerzo, nunca un requisito..
    }
  }

  window.addEventListener('ps:pedido', (event) => {
    registrarPedido((/** @type {CustomEvent} */ (event)).detail);
  });
})();