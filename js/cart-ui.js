(function () {
  'use strict';
  const cart = window.PS_CART;
  const checkout = window.PS_CHECKOUT;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = (value) => 'Gs ' + value.toLocaleString('es-PY');
  const bar = document.createElement('aside');
  bar.className = 'cart-bar'; bar.id = 'cartBar'; bar.hidden = true;
  bar.setAttribute('aria-label', 'Resumen del carrito');
  const dialog = document.createElement('dialog');
  dialog.className = 'cart-dialog'; dialog.id = 'cartDialog';
  dialog.setAttribute('aria-labelledby', 'cartTitle');
  const objetivos = window.PS_OBJETIVOS || [];
  dialog.innerHTML = '<div class="cart-heading"><div><span class="kicker">Tu selección</span><h2 id="cartTitle">Revisá tu carrito</h2></div><button class="cart-close" type="button" aria-label="Cerrar carrito">×</button></div>' +
    '<div id="cartItems"></div><div id="cartTotals"></div>' +
    '<div class="cart-preferences">' +
    '<label>Objetivo<select id="cartGoal"><option value="">Por definir con el asesor</option>' +
    objetivos.map((o) => '<option value="' + escapeHTML(o.nombre) + '">' + escapeHTML(o.nombre) + '</option>').join('') +
    '</select></label>' +
    '<label>Ciudad / zona<input type="text" id="cartZone" placeholder="Ej.: Asunción / Gran Asunción" maxlength="80"></label>' +
    '</div>' +
    '<p class="cart-note">Confirmamos disponibilidad y precio final por WhatsApp. Abrir el enlace no confirma una compra ni realiza un pago. Tu carrito se conserva.</p>' +
    '<p class="cart-message-preview" id="cartMessage"></p>' +
    '<a class="btn btn-primary cart-checkout" id="cartCheckout" target="_blank" rel="noopener">Enviar pedido por WhatsApp</a>' +
    '<button class="btn btn-ghost" type="button" data-cart-close>Seguir eligiendo</button>';
  const status = document.createElement('p');
  status.id = 'cartStatus'; status.className = 'sr-only'; status.setAttribute('role', 'status');
  document.body.append(bar, dialog, status);
  let returnFocus;
  function close() { dialog.close(); }
  dialog.addEventListener('close', () => {
    document.body.classList.remove('cart-open');
    if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus();
    else {
      const fallback = document.querySelector('#cartBar:not([hidden]) [data-cart-open]') || document.querySelector('#burger');
      const desktop = document.querySelector('#navLinks [data-cart-open]');
      (/** @type {HTMLElement} */ (fallback.getClientRects().length ? fallback : desktop)).focus();
    }
  });
  dialog.querySelector('.cart-close').addEventListener('click', close);
  dialog.querySelector('[data-cart-close]').addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
  function render(state) {
    const count = state.items.reduce((sum, item) => sum + item.cantidad, 0);
    const quote = checkout.quote(state.items);
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; });
    document.body.classList.toggle('has-cart', count > 0);
    bar.hidden = !count;
    bar.innerHTML = '<div class="cart-summary"><strong>' + count + ' producto(s)</strong><small>Subtotal de referencia: ' + money(quote.subtotal) + (quote.hasUnpricedItems ? ' + precios a confirmar' : '') + '</small></div><button type="button" class="btn btn-primary btn-sm" data-cart-open>Ver carrito</button>';
    const active = /** @type {HTMLElement | null} */ (document.activeElement);
    const focusId = active?.dataset?.item;
    const focusAction = active?.dataset?.action;
    dialog.querySelector('#cartItems').innerHTML = state.items.length ? '<ul class="cart-items">' + state.items.map((item) => {
      const id = escapeHTML(item.id); const name = escapeHTML(item.nombre);
      return '<li class="cart-item"><div><h3>' + name + '</h3><p>' + escapeHTML([item.marca, item.formato, item.sabor].filter(Boolean).join(' · ')) + '</p><small>' + (item.precio ? money(item.precio) + ' por unidad · referencia' : 'Precio a confirmar') + '</small></div><div class="cart-item-controls">' +
        '<div class="quantity-controls"><button type="button" data-action="minus" data-item="' + id + '" aria-label="Restar una unidad de ' + name + '"' + (item.cantidad === 1 ? ' disabled' : '') + '>−</button><output aria-label="Cantidad de ' + name + '">' + item.cantidad + '</output><button type="button" data-action="plus" data-item="' + id + '" aria-label="Sumar una unidad de ' + name + '"' + (item.cantidad >= cart.MAX_QUANTITY ? ' disabled' : '') + '>+</button></div><strong>' + (item.precio ? money(item.precio * item.cantidad) : 'A confirmar') + '</strong><button class="remove-item" type="button" data-action="remove" data-item="' + id + '" aria-label="Eliminar ' + name + '">Eliminar</button></div></li>';
    }).join('') + '</ul>' : '<p class="cart-empty">Tu carrito está vacío. Agregá productos del catálogo para preparar tu consulta.</p>';
    dialog.querySelector('#cartTotals').innerHTML = state.items.length ? '<div class="cart-totals"><p><span>' + (quote.hasUnpricedItems ? 'Subtotal con precio conocido' : 'Subtotal de referencia') + '</span><strong>' + money(quote.subtotal) + '</strong></p>' + (quote.hasUnpricedItems ? '<p>Hay productos con precio a confirmar.</p>' : '') + '<p>' + escapeHTML(quote.shippingLabel) + '</p><small>Costo y plazo según destino. ' + (quote.shippingFee === null ? 'El subtotal no incluye envío.' : '') + '</small></div>' : '';
    const link = /** @type {HTMLAnchorElement} */ (dialog.querySelector('#cartCheckout'));
    link.hidden = !count;
    const goal = /** @type {HTMLSelectElement} */ (dialog.querySelector('#cartGoal'));
    const zone = /** @type {HTMLInputElement} */ (dialog.querySelector('#cartZone'));
    const url = checkout.whatsappURL(state.items, { objetivo: goal?.value, zona: zone?.value });
    if (url) link.href = url; else link.removeAttribute('href');
    const preview = dialog.querySelector('#cartMessage');
    if (preview) preview.textContent = url ? new URL(url).searchParams.get('text') : '';
    if (focusId) {
      const replacement = Array.from(dialog.querySelectorAll('button[data-item]')).find((el) => (/** @type {HTMLButtonElement} */ (el)).dataset.item === focusId && (/** @type {HTMLButtonElement} */ (el)).dataset.action === focusAction && !(/** @type {HTMLButtonElement} */ (el)).disabled);
      (/** @type {HTMLButtonElement} */ (replacement || dialog.querySelector('.cart-close'))).focus();
    }
  }
  document.addEventListener('click', (event) => {
    const opener = (/** @type {Element} */ (event.target)).closest('[data-cart-open]');
    if (opener) {
      returnFocus = opener;
      document.querySelector('#navLinks')?.classList.remove('open');
      document.querySelector('#burger')?.classList.remove('open');
      document.querySelector('#burger')?.setAttribute('aria-expanded', 'false');
      dialog.showModal(); document.body.classList.add('cart-open');
      return;
    }
    const button = /** @type {HTMLButtonElement | null} */ ((/** @type {Element} */ (event.target)).closest('[data-action][data-item]'));
    if (!button || !dialog.contains(button)) return;
    const item = cart.getState().items.find((entry) => entry.id === button.dataset.item);
    if (!item) return;
    if (button.dataset.action === 'remove') cart.dispatch({ type: 'ELIMINAR', id: item.id });
    else cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: item.id, cantidad: item.cantidad + (button.dataset.action === 'plus' ? 1 : -1) });
    status.textContent = 'Carrito actualizado. Subtotal de referencia: ' + money(cart.getState().total);
  });
  dialog.querySelector('#cartGoal').addEventListener('change', () => render(cart.getState()));
  dialog.querySelector('#cartZone').addEventListener('input', () => render(cart.getState()));
  // No ps:pedido, purchase event, database write or cart reset on link activation.
  cart.subscribe(render); render(cart.getState());
})();
