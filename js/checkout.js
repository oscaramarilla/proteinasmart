/* WhatsApp is an inquiry, never proof of purchase or payment.
   Bancard must create and verify transactions on a server; no client secrets. */
(function () {
  'use strict';
  const config = window.PS_CONFIG || {};
  const money = (value) => 'Gs ' + value.toLocaleString('es-PY');
  function quote(items) {
    const fee = config.checkout?.shippingFee;
    const shippingFee = Number.isSafeInteger(fee) && fee >= 0 ? fee : null;
    const subtotal = window.PS_CART.total(items);
    const hasUnpricedItems = items.some((item) => item.precio <= 0);
    return { currency: 'PYG', subtotal, hasUnpricedItems, shippingFee,
      shippingLabel: shippingFee === null ? 'Envío a confirmar' : 'Envío: ' + money(shippingFee),
      total: hasUnpricedItems || shippingFee === null ? null : subtotal + shippingFee };
  }
  function whatsappURL(items, preferencias) {
    if (!items.length) return null;
    const prefs = preferencias || {};
    const summary = quote(items);
    const lineas = items.map((item, index) => (index + 1) + '. ' + item.nombre +
      (item.formato ? ' (' + item.formato + ')' : '') + ' — ' +
      (item.precio > 0 ? money(item.precio * item.cantidad) : 'Precio a confirmar') +
      (item.cantidad > 1 ? ' (x' + item.cantidad + ')' : ''));
    return 'https://wa.me/' + config.contacto.whatsapp + '?text=' + encodeURIComponent([
      '¡Hola, ProteínaSmart! 🌿',
      'Quiero consultar e iniciar mi pedido desde la web para el objetivo: ' +
        (prefs.objetivo || 'Por definir con el asesor') + ' ✨',
      '',
      '📋 MI SELECCIÓN DE PRODUCTOS:', ...lineas,
      '',
      '💰 TOTAL ESTIMADO: ' + money(summary.subtotal) +
        (summary.hasUnpricedItems ? ' (parcial: hay productos con precio a confirmar)' : ''),
      '',
      '🚚 DATOS PARA LA ENTREGA:',
      '• Ciudad/Zona: ' + (prefs.zona || 'Por confirmar'),
      '• Método preferido: Envío a domicilio',
      '',
      'Confirmemos disponibilidad, presentaciones y precio final antes de comprar. ' + summary.shippingLabel + '.',
      'Quedo atento a sus indicaciones sobre la dosis, modo de uso y si me recomiendan sumar algún complemento para este protocolo.',
    ].join('\n'));
  }
  // Fails closed even if a flag changes. Enable only with a reviewed backend.
  const bancard = Object.freeze({ enabled: false, createPayment() { throw new Error('Bancard no está habilitado.'); } });
  window.PS_CHECKOUT = Object.freeze({ quote, whatsappURL, providers: Object.freeze({ bancard }) });
})();
