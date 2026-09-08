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
  function whatsappURL(items) {
    if (!items.length) return null;
    const summary = quote(items);
    const lines = items.map((item) => '- ' + item.cantidad + ' × ' + item.nombre +
      (item.marca ? ' · ' + item.marca : '') + (item.sabor ? ' · ' + item.sabor : '') +
      (item.formato ? ' (' + item.formato + ')' : '') + ': ' +
      (item.precio > 0 ? money(item.precio * item.cantidad) : 'Precio a confirmar'));
    return 'https://wa.me/' + config.contacto.whatsapp + '?text=' + encodeURIComponent([
      'Hola ProteínaSmart 👋 Quiero consultar este pedido:', ...lines,
      (summary.hasUnpricedItems ? 'Subtotal de productos con precio: ' : 'Subtotal de referencia: ') + money(summary.subtotal),
      ...(summary.hasUnpricedItems ? ['Hay productos con precio a confirmar.'] : []),
      summary.shippingLabel,
      'Confirmemos disponibilidad, presentaciones, precio final y plazo de entrega antes de comprar.',
    ].join('\n'));
  }
  // Fails closed even if a flag changes. Enable only with a reviewed backend.
  const bancard = Object.freeze({ enabled: false, createPayment() { throw new Error('Bancard no está habilitado.'); } });
  window.PS_CHECKOUT = Object.freeze({ quote, whatsappURL, providers: Object.freeze({ bancard }) });
})();
