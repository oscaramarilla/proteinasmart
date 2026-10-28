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
    '<label>Ciudad / zona<input type="text" id="cartZone" autocomplete="address-level2" enterkeyhint="done" placeholder="Ej.: Asunción / Gran Asunción" maxlength="80"></label>' +
    '</div>' +
    '<p class="cart-note">Confirmamos composición, etiqueta, disponibilidad y precio final por WhatsApp. Abrir el enlace no confirma una compra ni realiza un pago. Tu carrito se conserva.</p>' +
    '<details class="cart-preview"><summary>Ver mensaje del pedido</summary><p class="cart-message-preview" id="cartMessage"></p></details>' +
    '<p class="sr-only" id="cartUpdateStatus" role="status" aria-live="polite" aria-atomic="true"></p>' +
    '<a class="btn btn-primary cart-checkout" id="cartCheckout" target="_blank" rel="noopener">Enviar pedido por WhatsApp</a>' +
    '<button class="btn btn-ghost" type="button" data-cart-close>Seguir eligiendo</button>';
  const status = document.createElement('p');
  status.id = 'cartStatus'; status.className = 'sr-only'; status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
  document.body.append(bar, dialog, status);
  /** @type {HTMLElement | null} */
  let returnFocus = null;
  let scrollPosition = { x: 0, y: 0 };
  const lockedProperties = ['position', 'top', 'left', 'right', 'width'];
  /** @type {{ property: string, value: string, priority: string }[]} */
  let savedBodyStyles = [];
  const isVisible = (element) => element instanceof HTMLElement && element.isConnected && element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible' && !element.closest('[hidden], [inert]');
  function lockPage() {
    scrollPosition = { x: window.scrollX, y: window.scrollY };
    savedBodyStyles = lockedProperties.map((property) => ({ property, value: document.body.style.getPropertyValue(property), priority: document.body.style.getPropertyPriority(property) }));
    // A fixed body also prevents background scrolling on iOS while the dialog scrolls.
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollPosition.y + 'px';
    document.body.style.left = '-' + scrollPosition.x + 'px';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('cart-open');
  }
  function close() { if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => {
    savedBodyStyles.forEach(({ property, value, priority }) => {
      if (value) document.body.style.setProperty(property, value, priority);
      else document.body.style.removeProperty(property);
    });
    document.body.classList.remove('cart-open');
    const rootStyle = document.documentElement.style;
    const previousScrollBehavior = rootStyle.getPropertyValue('scroll-behavior');
    const previousScrollPriority = rootStyle.getPropertyPriority('scroll-behavior');
    rootStyle.setProperty('scroll-behavior', 'auto', 'important');
    window.scrollTo(scrollPosition.x, scrollPosition.y);
    if (previousScrollBehavior) rootStyle.setProperty('scroll-behavior', previousScrollBehavior, previousScrollPriority);
    else rootStyle.removeProperty('scroll-behavior');
    const target = [returnFocus, document.querySelector('#cartBar:not([hidden]) [data-cart-open]'), document.querySelector('#burger'), document.querySelector('#navLinks [data-cart-open]')].find(isVisible);
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  });
  dialog.querySelector('.cart-close').addEventListener('click', close);
  dialog.querySelector('[data-cart-close]').addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
  /**
   * Empujon al tramo mayorista de un item: confirma el descuento cuando ya
   * esta activo, y dice cuanto falta cuando no. El calculo sale de PS_CART,
   * no se deriva aca.
   * @param {PSCartItem} item Item del carrito.
   * @returns {string} HTML del aviso, o cadena vacia si el item no tiene tramo.
   */
  function tramoItemHTML(item) {
    if (!item.mayorista) return '';
    const faltan = cart.faltanParaMayorista(item);
    if (faltan === 0) return '<small class="cart-wholesale-on">Precio mayorista aplicado</small>';
    return '<small class="cart-wholesale-off">Agregá ' + faltan +
      (faltan === 1 ? ' unidad' : ' unidades') + ' y pagás ' + money(item.mayorista.precio) + ' c/u</small>';
  }

  /**
   * Linea de ahorro por volumen del carrito. No se muestra si ningun tramo
   * esta activo, para no mostrar un "ahorro: Gs 0".
   * @param {Array<PSCartItem>} items Items del carrito.
   * @returns {string} HTML de la linea de ahorro, o cadena vacia.
   */
  function ahorroHTML(items) {
    const ahorro = cart.ahorroMayorista(items);
    return ahorro > 0
      ? '<p class="cart-wholesale-saving"><span>Ahorro por volumen</span><strong>−' + money(ahorro) + '</strong></p>'
      : '';
  }

  function updateCheckout(items) {
    const link = /** @type {HTMLAnchorElement} */ (dialog.querySelector('#cartCheckout'));
    const goal = /** @type {HTMLSelectElement} */ (dialog.querySelector('#cartGoal'));
    const zone = /** @type {HTMLInputElement} */ (dialog.querySelector('#cartZone'));
    const url = checkout.whatsappURL(items, { objetivo: goal.value, zona: zone.value });
    link.hidden = !items.length;
    if (url) link.href = url; else link.removeAttribute('href');
    dialog.querySelector('#cartMessage').textContent = url ? new URL(url).searchParams.get('text') : '';
  }
  function render(state) {
    const count = state.items.reduce((sum, item) => sum + item.cantidad, 0);
    const quote = checkout.quote(state.items);
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; });
    document.body.classList.toggle('has-cart', count > 0);
    bar.hidden = !count;
    bar.innerHTML = '<div class="cart-summary"><strong>' + count + (count === 1 ? ' producto' : ' productos') + '</strong><small>Subtotal de referencia: ' + money(quote.subtotal) + (quote.hasUnpricedItems ? ' + precios a confirmar' : '') + '</small></div><button type="button" class="btn btn-primary btn-sm" data-cart-open aria-haspopup="dialog" aria-controls="cartDialog">Ver carrito</button>';
    const active = /** @type {HTMLElement | null} */ (document.activeElement);
    const focusId = active?.dataset?.item;
    const focusAction = active?.dataset?.action;
    const focusedItem = active?.closest('.cart-item');
    const focusIndex = focusedItem ? Array.from(focusedItem.parentElement.children).indexOf(focusedItem) : -1;
    dialog.querySelector('#cartItems').innerHTML = state.items.length ? '<ul class="cart-items">' + state.items.map((item) => {
      const id = escapeHTML(item.id); const name = escapeHTML(item.nombre);
      return '<li class="cart-item"><div><h3>' + name + '</h3><p>' + escapeHTML([item.marca, item.formato, item.sabor].filter(Boolean).join(' · ')) + '</p><small>' + (item.precio ? money(cart.precioUnitario(item)) + ' por unidad · referencia' : 'Precio a confirmar') + '</small>' + tramoItemHTML(item) + '</div><div class="cart-item-controls">' +
        '<div class="quantity-controls"><button type="button" data-action="minus" data-item="' + id + '" aria-label="Restar una unidad de ' + name + '"' + (item.cantidad === 1 ? ' disabled' : '') + '>−</button><output aria-label="Cantidad de ' + name + '">' + item.cantidad + '</output><button type="button" data-action="plus" data-item="' + id + '" aria-label="Sumar una unidad de ' + name + '"' + (item.cantidad >= cart.MAX_QUANTITY ? ' disabled' : '') + '>+</button></div><strong>' + (item.precio ? money(cart.precioUnitario(item) * item.cantidad) : 'A confirmar') + '</strong><button class="remove-item" type="button" data-action="remove" data-item="' + id + '" aria-label="Eliminar ' + name + '">Eliminar</button></div></li>';
    }).join('') + '</ul>' : '<p class="cart-empty">Tu carrito está vacío. Agregá productos del catálogo para preparar tu consulta.</p>';
    dialog.querySelector('#cartTotals').innerHTML = state.items.length ? '<div class="cart-totals"><p><span>' + (quote.hasUnpricedItems ? 'Subtotal con precio conocido' : 'Subtotal de referencia') + '</span><strong>' + money(quote.subtotal) + '</strong></p>' + (quote.hasUnpricedItems ? '<p>Hay productos con precio a confirmar.</p>' : '') + ahorroHTML(state.items) + '<p>' + escapeHTML(quote.shippingLabel) + '</p><small>' + (quote.shippingFee === null ? 'Costo y plazo según destino. El subtotal no incluye envío.' : quote.shippingFee === 0 ? 'El precio de cada producto ya incluye el envío a todo el país.' : 'Costo y plazo según destino.') + '</small></div>' : '';
    updateCheckout(state.items);
    if (focusId && dialog.open) {
      const buttons = /** @type {HTMLButtonElement[]} */ (Array.from(dialog.querySelectorAll('button[data-item]:not(:disabled)')));
      const sameItem = buttons.filter((button) => button.dataset.item === focusId);
      const removeButtons = buttons.filter((button) => button.dataset.action === 'remove');
      const replacement = sameItem.find((button) => button.dataset.action === focusAction) || sameItem[0] || removeButtons[Math.min(focusIndex, removeButtons.length - 1)];
      (replacement || /** @type {HTMLButtonElement} */ (dialog.querySelector('[data-cart-close]'))).focus({ preventScroll: true });
    }
  }
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const opener = event.target.closest('[data-cart-open]');
    if (opener instanceof HTMLElement) {
      if (dialog.open) return;
      returnFocus = opener;
      document.querySelector('#navLinks')?.classList.remove('open');
      document.querySelector('#burger')?.classList.remove('open');
      document.querySelector('#burger')?.setAttribute('aria-expanded', 'false');
      dialog.querySelector('#cartUpdateStatus').textContent = '';
      lockPage();
      dialog.showModal();
      dialog.scrollTop = 0;
      return;
    }
    const button = /** @type {HTMLButtonElement | null} */ (event.target.closest('[data-action][data-item]'));
    if (!button || button.disabled || !dialog.contains(button)) return;
    const item = cart.getState().items.find((entry) => entry.id === button.dataset.item);
    if (!item) return;
    if (button.dataset.action === 'remove') cart.dispatch({ type: 'ELIMINAR', id: item.id });
    else cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: item.id, cantidad: item.cantidad + (button.dataset.action === 'plus' ? 1 : -1) });
    const nextState = cart.getState();
    const updatedItem = nextState.items.find((entry) => entry.id === item.id);
    const feedback = updatedItem ? item.nombre + ': ' + updatedItem.cantidad + (updatedItem.cantidad === 1 ? ' unidad.' : ' unidades.') : item.nombre + ' eliminado del carrito.';
    dialog.querySelector('#cartUpdateStatus').textContent = feedback + ' Subtotal de referencia: ' + money(nextState.total);
  });
  dialog.querySelector('#cartGoal').addEventListener('change', () => updateCheckout(cart.getState().items));
  dialog.querySelector('#cartZone').addEventListener('input', () => updateCheckout(cart.getState().items));
  document.querySelectorAll('[data-cart-open]').forEach((opener) => {
    opener.setAttribute('aria-haspopup', 'dialog'); opener.setAttribute('aria-controls', 'cartDialog');
  });
  // No ps:pedido, purchase event, database write or cart reset on link activation.
  cart.subscribe(render); render(cart.getState());
})();
