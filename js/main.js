/* =========================================================
   ProteínaSmart — main.js
   DOMINIO decide · SERVICIOS ejecutan · PRESENTACIÓN muestra
   Vanilla JS, sin dependencias ni build.
   ========================================================= */

(function () {
  'use strict';

  const CFG = window.PS_CONFIG || {};
  let CATALOG = window.PS_CATALOG || [];
  const CATEGORIAS = window.PS_CATEGORIAS || [];
  const OBJETIVOS = window.PS_OBJETIVOS || [];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ================= SERVICIOS ================= */

  const money = (n) =>
    n > 0 ? 'Gs ' + n.toLocaleString('es-PY') : 'Consultar';

  function waLink(texto) {
    const num = (CFG.contacto && CFG.contacto.whatsapp) || '';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto);
  }

  /* ================= NAV + SCROLL ================= */

  const navbar = $('#navbar');
  const progress = $('#scrollProgress');

  function onScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const navLinks = $('#navLinks');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (burger && navLinks) {
    const mobileNav = window.matchMedia('(max-width: 900px)');
    function setMenuOpen(open) {
      burger.classList.toggle('open', open);
      navLinks.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    burger.addEventListener('click', (event) => {
      const open = mobileNav.matches && !navLinks.classList.contains('open');
      setMenuOpen(open);
      if (open && event.detail === 0) $('a, button', navLinks)?.focus();
    });
    document.addEventListener('click', (event) => {
      const target = /** @type {Element} */ (event.target);
      if (target.closest('[data-cart-open]') || target.closest('#navLinks a') ||
          (!navLinks.contains(target) && !burger.contains(target))) setMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenuOpen(false);
        burger.focus();
      }
    });
    navLinks.addEventListener('focusout', (event) => {
      const next = /** @type {FocusEvent} */ (event).relatedTarget;
      if (next instanceof Node && !navLinks.contains(next) && !burger.contains(next)) setMenuOpen(false);
    });
    mobileNav.addEventListener('change', () => setMenuOpen(false));
    setMenuOpen(false);
  }

  /* ================= REVEAL ================= */

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  function observeReveals(root) {
    $$('.reveal', root).forEach((el) => revealObs.observe(el));
  }

  /* ================= CATÁLOGO ================= */

  const grid = $('#catalogGrid');
  const filtros = $('#catalogFilters');
  const emptyState = $('#catalogEmpty');
  const searchInput = $('#catalogSearch');
  const clearSearch = $('#clearSearch');

  const paramsIniciales = new URLSearchParams(window.location.search);
  const legacy = { keto: 'keto', 'low-carb': 'keto', 'healthy-habits': 'todos', neuroplasticidad: 'longevidad' };
  const categoriaInicial = paramsIniciales.get('categoria') || legacy[paramsIniciales.get('disciplina')];
  const objetivoInicial = paramsIniciales.get('objetivo');
  let filtroCategoria = CATEGORIAS.some((c) => c.id === categoriaInicial) ? categoriaInicial : 'todos';
  let filtroObjetivo = OBJETIVOS.some((o) => o.id === objetivoInicial) ? objetivoInicial : null;
  let busqueda = '';
  const normalizarBusqueda = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  // Metadatos originales (categoria 'todos'), capturados antes de tocar el
  // DOM, para poder restaurarlos al limpiar filtros.
  const metaDescripcionEl = $('meta[name="description"]');
  const canonicalEl = $('link[rel="canonical"]');
  const ogTituloEl = $('meta[property="og:title"]');
  const ogDescripcionEl = $('meta[property="og:description"]');
  const ogUrlEl = $('meta[property="og:url"]');
  const twTituloEl = $('meta[name="twitter:title"]');
  const twDescripcionEl = $('meta[name="twitter:description"]');
  const metaOriginal = {
    title: document.title,
    description: metaDescripcionEl ? metaDescripcionEl.getAttribute('content') : '',
  };

  function actualizarMetadatos() {
    const categoria = CATEGORIAS.find((c) => c.id === filtroCategoria);
    const canonical = 'https://www.proteinasmart.com/' + (filtroCategoria !== 'todos' ? filtroCategoria : '');
    const titulo = filtroCategoria === 'todos' || !categoria
      ? metaOriginal.title
      : categoria.nombre + ' | ProteínaSmart';
    const descripcion = filtroCategoria === 'todos' || !categoria
      ? metaOriginal.description
      : 'Catálogo de ' + categoria.nombre.toLowerCase() + ' en ProteínaSmart: precios de referencia, ' +
        'asesoramiento real y despacho desde Asunción, Paraguay.';
    document.title = titulo;
    if (metaDescripcionEl) metaDescripcionEl.setAttribute('content', descripcion);
    if (canonicalEl) canonicalEl.setAttribute('href', canonical);
    if (ogTituloEl) ogTituloEl.setAttribute('content', titulo);
    if (ogDescripcionEl) ogDescripcionEl.setAttribute('content', descripcion);
    if (ogUrlEl) ogUrlEl.setAttribute('content', canonical);
    if (twTituloEl) twTituloEl.setAttribute('content', titulo);
    if (twDescripcionEl) twDescripcionEl.setAttribute('content', descripcion);
  }

  function sincronizarURL() {
    const params = new URLSearchParams(window.location.search);
    params.delete('disciplina');
    params.delete('categoria');
    params.delete('objetivo');
    if (filtroCategoria !== 'todos') params.set('categoria', filtroCategoria);
    if (filtroObjetivo) params.set('objetivo', filtroObjetivo);
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    syncGoalControls();
    actualizarMetadatos();
  }

  /**
   * Linea de precio por volumen de una tarjeta. Valida el tramo con la misma
   * regla del carrito (PS_CART.normalizarMayorista) para no mostrar en la
   * vitrina un descuento que el carrito despues no vaya a aplicar.
   * @param {Record<string, any>} p Producto del catalogo.
   * @returns {string} HTML del tramo, o cadena vacia si no hay tramo valido.
   */
  function tramoHTML(p) {
    const tramo = window.PS_CART?.normalizarMayorista?.(p.mayorista, Number(p.precio) || 0);
    if (!tramo) return '';
    return '<p class="card-wholesale">Desde ' + tramo.desde + ' unidades: <strong>' +
      money(tramo.precio) + '</strong> c/u</p>';
  }

  function fallbackProductoHTML(p) {
    const categoria = CATEGORIAS.find((c) => c.id === p.categoria);
    const iniciales = String(p.nombre || 'PS').split(/\s+/).slice(0, 2).map((palabra) => palabra.charAt(0)).join('').toUpperCase();
    return '<span class="card-category">' + escapeHTML(categoria ? categoria.nombre : 'Suplementos') + '</span>' +
      '<strong class="card-monogram">' + escapeHTML(iniciales) + '</strong>';
  }

  function cardHTML(p) {
    const verified = p.verificado || {};
    const marca = verified.marca && p.marca ? '<span class="card-brand">' + escapeHTML(p.marca) + '</span>' : '';
    const sabor = verified.sabor && p.sabor ? '<span class="card-format">Sabor: ' + escapeHTML(p.sabor) + '</span>' : '';
    const agotado = verified.stock && p.stock === false;
    const disponibilidad = verified.stock && typeof p.stock === 'boolean' ? (p.stock ? 'Disponible' : 'Sin stock') : 'Disponibilidad a confirmar';
    // Solo recursos con procedencia verificada; nunca dibujar un envase ficticio.
    const imagen = verified.imagen && typeof p.imagen === 'string' && /^(https:\/\/|images\/)/.test(p.imagen) ? p.imagen : '';
    const imagenHTML = imagen
      ? '<div class="card-image" data-category="' + escapeHTML(p.categoria) + '"><img src="' + escapeHTML(imagen) + '" alt="' + escapeHTML(p.nombre) + '" loading="lazy" decoding="async" width="800" height="800" /></div>'
      : '<div class="card-image card-image-fallback" data-category="' + escapeHTML(p.categoria) + '" aria-hidden="true">' + fallbackProductoHTML(p) + '</div>';
    return '<article id="producto-' + escapeHTML(p.id) + '" class="product-card' + (agotado ? ' is-out' : '') + '">' + imagenHTML +
      '<div class="card-top">' + marca + '<h3>' + escapeHTML(p.nombre) + '</h3>' +
      '<span class="card-format">' + (verified.formato ? 'Presentación: ' : 'Presentación de referencia: ') + escapeHTML(p.formato || 'A confirmar') + '</span>' + sabor + '</div>' +
      '<p class="card-availability">' + disponibilidad + '</p>' +
      tramoHTML(p) +
      '<div class="card-foot"><div class="card-price"><small>Precio de referencia</small><strong>' + money(p.precio) + '</strong></div>' +
      '<button class="btn btn-primary btn-sm" type="button" data-cart-add="' + escapeHTML(p.id) + '" aria-label="' + escapeHTML(agotado ? p.nombre + ': sin stock' : 'Agregar ' + p.nombre + ' al carrito') + '"' + (agotado ? ' disabled' : '') + '>' + (agotado ? 'Sin stock' : 'Agregar') + '</button></div></article>';
  }

  const SITIO_URL = 'https://www.proteinasmart.com/';

  /**
   * Arma el JSON-LD Product de un item, tomando los mismos datos que
   * cardHTML() usa para la tarjeta -- no hay una segunda lista a mano que
   * se pueda desincronizar cuando cambien precios o se agreguen productos.
   * @param {Record<string, any>} p Producto de CATALOG.
   * @returns {Record<string, any>} Nodo Product de schema.org.
   */
  function productoSchema(p) {
    const verified = p.verificado || {};
    const imagen = verified.imagen && typeof p.imagen === 'string' && /^(https:\/\/|images\/)/.test(p.imagen) ? p.imagen : '';
    /** @type {Record<string, any>} */
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.nombre,
      offers: {
        '@type': 'Offer',
        price: p.precio,
        priceCurrency: 'PYG',
        url: SITIO_URL + '#producto-' + p.id,
      },
    };
    if (p.resumen) schema.description = p.resumen;
    if (imagen) schema.image = /^https:\/\//.test(imagen) ? imagen : SITIO_URL + imagen;
    // stock no verificado (el estado por defecto de todo el catalogo hoy) no
    // implica ni InStock ni OutOfStock -- se omite availability en vez de
    // afirmar algo que no se confirmo con el proveedor.
    if (verified.stock && typeof p.stock === 'boolean') {
      schema.offers.availability = p.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    }
    return schema;
  }

  /**
   * Sincroniza el bloque <script id="productSchema"> con el CATALOG actual.
   * Se llama despues de cada render (carga inicial y catalogo remoto) para
   * que los datos estructurados nunca queden desactualizados respecto a lo
   * que se ve en pantalla.
   * @returns {void}
   */
  function renderSchemaProductos() {
    const script = $('#productSchema');
    if (!script) return;
    script.textContent = JSON.stringify(CATALOG.map(productoSchema));
  }

  /**
   * Dibuja los combos publicables. El precio ya viene sumado de los
   * componentes por catalog.js: aca no se recalcula nada.
   * @returns {void}
   */
  function renderCombos() {
    const grid = $('#combosGrid');
    if (!grid) return;
    const combos = window.PS_COMBOS || [];
    if (!combos.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = combos.map((combo) => {
      const coMarca = combo.coMarca
        ? '<span class="combo-comarca">ProteínaSmart + ' + escapeHTML(combo.coMarca) + '</span>'
        : '';
      const lista = combo.items.map((item) =>
        '<li>' + escapeHTML(item.nombre) +
        (item.verificado?.marca && item.marca ? ' <em>' + escapeHTML(item.marca) + '</em>' : '') +
        '<span>' + money(item.precio) + '</span></li>').join('');
      return '<article class="combo-card">' + coMarca +
        '<h3>' + escapeHTML(combo.nombre) + '</h3>' +
        '<p class="combo-bajada">' + escapeHTML(combo.bajada) + '</p>' +
        '<ul class="combo-items">' + lista + '</ul>' +
        '<div class="combo-foot"><div class="combo-price"><small>' + combo.items.length +
        ' productos · envío incluido</small><strong>' + money(combo.precio) + '</strong></div>' +
        '<button class="btn btn-primary btn-sm" type="button" data-combo-add="' +
        escapeHTML(combo.id) + '">Agregar el combo</button></div></article>';
    }).join('');
  }

  function renderCatalogo() {
    if (!grid) return;
    const terminos = normalizarBusqueda(busqueda).split(/\s+/).filter(Boolean);
    const items = CATALOG.filter((p) => {
      const okCat = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const okObj =
        !filtroObjetivo || (p.objetivos || []).indexOf(filtroObjetivo) !== -1;
      const categoria = CATEGORIAS.find((c) => c.id === p.categoria);
      const texto = normalizarBusqueda([p.nombre, p.marca, p.formato, p.categoria, categoria?.nombre].filter(Boolean).join(' '));
      return okCat && okObj && terminos.every((termino) => texto.includes(termino));
    });

    grid.innerHTML = items.map(cardHTML).join('');
    const count = $('#catalogCount');
    if (count) count.textContent = items.length + (items.length === 1 ? ' producto' : ' productos') +
      (filtroCategoria !== 'todos' || filtroObjetivo || terminos.length ? ' de ' + CATALOG.length : '');
    if (emptyState) emptyState.hidden = items.length > 0;
    observeReveals(grid);
    // sin animación diferida en re-render: se muestran de una
    requestAnimationFrame(() => $$('.product-card', grid).forEach((c) => c.classList.add('visible')));
  }

  function syncCategoryControls() {
    if (!filtros) return;
    $$('.chip', filtros).forEach((button) => {
      const active = button.dataset.cat === filtroCategoria;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderFiltros() {
    if (!filtros) return;
    filtros.innerHTML = CATEGORIAS.map(
      (c) =>
        '<button type="button" class="chip" data-cat="' + escapeHTML(c.id) +
        '" aria-pressed="false"><span aria-hidden="true">' + escapeHTML(c.icono) + '</span>' + escapeHTML(c.nombre) + '</button>'
    ).join('');
    syncCategoryControls();
    $$('.chip', filtros).forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroCategoria = btn.dataset.cat;
        sincronizarURL();
        syncCategoryControls();
        renderCatalogo();
      });
    });
  }

  /* ================= SELECTOR POR OBJETIVO ================= */

  const objetivosWrap = $('#objetivoGrid');
  if (objetivosWrap) {
    objetivosWrap.innerHTML = OBJETIVOS.map(
      (o) =>
        '<button class="goal-card reveal' + (o.id === filtroObjetivo ? ' active' : '') + '" data-goal="' + o.id + '">' +
        '<span class="goal-icon">' + o.icono + '</span>' +
        '<span class="goal-name">' + o.nombre + '</span>' +
        '</button>'
    ).join('');

    $$('.goal-card', objetivosWrap).forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isActive = btn.classList.contains('active');
        $$('.goal-card', objetivosWrap).forEach((b) => b.classList.remove('active'));
        if (isActive) {
          filtroObjetivo = null;
        } else {
          btn.classList.add('active');
          filtroObjetivo = btn.dataset.goal;
        }
        filtroCategoria = 'todos';
        sincronizarURL();
        syncCategoryControls();
        renderCatalogo();
        const dest = $('#catalogo');
        if (event.detail === 0) searchInput?.focus({ preventScroll: true });
        if (dest) dest.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      });
    });
  }

  const goalSelect = $('#catalogGoal');
  if (goalSelect) goalSelect.innerHTML += OBJETIVOS.map((o) => '<option value="' + escapeHTML(o.id) + '">' + escapeHTML(o.nombre) + '</option>').join('');
  function syncGoalControls() {
    const select = $('#catalogGoal');
    if (select) select.value = filtroObjetivo || '';
    $$('.goal-card').forEach((button) => {
      const active = button.dataset.goal === filtroObjetivo;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  goalSelect?.addEventListener('change', () => {
    filtroObjetivo = goalSelect.value || null;
    sincronizarURL();
    renderCatalogo();
  });
  function syncSearchControls() {
    if (searchInput) searchInput.value = busqueda;
    if (clearSearch) clearSearch.hidden = !busqueda;
  }
  searchInput?.addEventListener('input', () => {
    busqueda = searchInput.value;
    if (clearSearch) clearSearch.hidden = !busqueda;
    renderCatalogo();
  });
  clearSearch?.addEventListener('click', () => {
    busqueda = '';
    syncSearchControls();
    renderCatalogo();
    searchInput?.focus();
  });
  $('#clearFilters')?.addEventListener('click', () => {
    filtroCategoria = 'todos'; filtroObjetivo = null; busqueda = '';
    syncSearchControls();
    sincronizarURL(); syncCategoryControls(); renderCatalogo();
  });
  syncSearchControls();
  syncGoalControls();
  renderFiltros();
  renderCatalogo();
  renderCombos();
  renderSchemaProductos();
  actualizarMetadatos();
  // Categoria pedida por URL limpia (/proteinas, ?categoria=... o el
  // legacy ?disciplina=...): desplazar directo al catalogo filtrado.
  if (filtroCategoria !== 'todos') {
    requestAnimationFrame(() => $('#catalogo')?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'auto', block: 'start' }));
  }
/* ================= FALLBACK VISUAL (404) ================= */
  // Si una imagen falla (404 o red lenta), la tarjeta vuelve sola al
  // diseno tipografico premium sin romper el layout ni mostrar iconos rotos.
  if (grid) {
    grid.addEventListener(
      'error',
      (e) => {
        const img = (/** @type {Element} */ (e.target));
        if (img.tagName !== 'IMG') return;
        const contenedor = img.closest('.card-image');
        if (!contenedor) return;
        const card = contenedor.closest('.product-card');
        const producto = CATALOG.find((item) => 'producto-' + item.id === card?.id);
        contenedor.classList.add('card-image-fallback');
        contenedor.setAttribute('aria-hidden', 'true');
        contenedor.innerHTML = fallbackProductoHTML(producto || { nombre: img.getAttribute('alt') || 'PS' });
      },
      true
    );
  }

  const addFeedbackTimers = new WeakMap();
  document.addEventListener('click', (event) => {
    const comboAdd = /** @type {HTMLElement | null} */ ((/** @type {Element} */ (event.target)).closest('[data-combo-add]'));
    if (comboAdd && window.PS_CART) {
      const combo = (window.PS_COMBOS || []).find((item) => item.id === comboAdd.dataset.comboAdd);
      if (combo) {
        // Se agregan los componentes sueltos, no un SKU "combo": asi el
        // cliente puede sacar uno sin perder el resto, y el carrito sigue
        // siendo una lista de productos reales que el deposito puede armar.
        combo.items.forEach((producto) => window.PS_CART.dispatch({ type: 'AGREGAR', producto }));
        $('#cartStatus').textContent = combo.nombre + ' agregado al carrito (' + combo.items.length + ' productos).';
      }
      return;
    }
    const add = /** @type {HTMLElement | null} */ ((/** @type {Element} */ (event.target)).closest('[data-cart-add]'));
    if (!add || !window.PS_CART) return;
    const producto = CATALOG.find((item) => item.id === add.dataset.cartAdd);
    if (producto && !(producto.verificado?.stock && producto.stock === false)) {
      window.PS_CART.dispatch({ type: 'AGREGAR', producto });
      const status = $('#cartStatus');
      if (status) status.textContent = producto.nombre + ' agregado al carrito.';
      window.clearTimeout(addFeedbackTimers.get(add));
      add.classList.add('is-added');
      add.textContent = '✓ Agregado';
      add.setAttribute('aria-label', producto.nombre + ' agregado. Agregar otra unidad al carrito');
      addFeedbackTimers.set(add, window.setTimeout(() => {
        add.classList.remove('is-added');
        add.textContent = 'Agregar';
        add.setAttribute('aria-label', 'Agregar ' + producto.nombre + ' al carrito');
        addFeedbackTimers.delete(add);
      }, 1800));
    }
  });

  window.addEventListener('ps:catalogo-remoto', (event) => {
    const detalle = (/** @type {CustomEvent} */ (event)).detail;
    CATALOG = detalle;
    renderCatalogo();
    renderCombos();
    renderSchemaProductos();
  });

  /* ================= DATOS DE CONTACTO EN EL DOM ================= */

  const C = CFG.contacto || {};
  const O = CFG.operacion || {};
  const bind = {
    '[data-cfg="telefono"]': C.telefonoLocal,
    '[data-cfg="email"]': C.email,
    '[data-cfg="ruc"]': C.ruc,
    '[data-cfg="responsable"]': C.responsable,
    '[data-cfg="ciudad"]': C.ciudad,
    '[data-cfg="horario"]': O.horario,
    '[data-cfg="envio-asuncion"]': O.envioAsuncion,
    '[data-cfg="envio-interior"]': O.envioInterior,
    '[data-cfg="despacho"]': O.despacho,
    '[data-cfg="encomiendas"]': Array.isArray(O.encomiendas) ? O.encomiendas.join(' · ') : O.encomiendas,
    '[data-cfg="pagos"]': O.pagos,
    '[data-cfg="facturacion"]': O.facturacion,
  };
  Object.keys(bind).forEach((sel) => {
    if (bind[sel]) $$(sel).forEach((el) => (el.textContent = bind[sel]));
  });

  $$('[data-wa]').forEach((a) => {
    const msg = a.dataset.wa || (CFG.mensajes && CFG.mensajes.consultaGeneral) || 'Hola';
    a.href = waLink(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  $$('[data-tel]').forEach((a) => {
    a.href = 'tel:+' + (C.whatsapp || '');
  });

  $$('[data-mail]').forEach((a) => {
    a.href = 'mailto:' + (C.email || '');
  });

  /* ================= FORMULARIO DE ASESORÍA ================= */

  const form = $('#leadForm');
  const note = $('#formNote');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = /** @type {Record<string, FormDataEntryValue>} */ ({});
      new FormData(form).forEach((valor, clave) => { data[clave] = valor; });
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;

      const resumen =
        'Hola ProteínaSmart 👋 Soy *' + (data.name || '') + '*.\n' +
        'Objetivo: ' + (data.objetivo || '-') + '\n' +
        'Nivel de actividad: ' + (data.nivel || '-') + '\n' +
        (data.mensaje ? 'Detalle: ' + data.mensaje : '');

      // Sin endpoint configurado → el lead va directo a WhatsApp
      if (!CFG.formEndpoint) {
        window.open(waLink(resumen), '_blank', 'noopener');
        if (note) {
          note.classList.add('ok');
          note.textContent = '✓ Te abrimos WhatsApp con tu consulta lista para enviar.';
        }
        return;
      }

      btn.textContent = 'Enviando...';
      btn.disabled = true;
      if (note) { note.classList.remove('ok', 'warn'); note.textContent = 'Procesando tu consulta...'; }

      try {
        const res = await fetch(CFG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            source: 'proteinasmart.com',
            lead_type: 'asesoria_nutricional',
            timestamp: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error('bad response');
        if (note) { note.classList.add('ok'); note.textContent = '✓ Recibimos tu consulta. Te escribimos hoy mismo.'; }
        form.reset();
        if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { objetivo: data.objetivo });
        if (typeof fbq !== 'undefined') fbq('track', 'Lead', { content_name: data.objetivo });
      } catch (err) {
        if (note) {
          note.classList.add('warn');
          note.innerHTML = '⚠ No pudimos enviar el formulario. <a href="' + waLink(resumen) + '" target="_blank" rel="noopener">Escribinos por WhatsApp</a>.';
        }
      } finally {
        btn.textContent = original;
        btn.disabled = false;
      }
    });
  }

  /* ================= AÑO ================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ================= TRACKING OPCIONAL ================= */
  const T = CFG.tracking || {};
  if (T.ga4) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + T.ga4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', T.ga4);
  }
  if (T.metaPixel) {
    /* eslint-disable */
    (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js'));
    fbq('init', T.metaPixel);
    fbq('track', 'PageView');
    /* eslint-enable */
  }

  /* ================= MEDICIÓN DE CONVERSIÓN =================
     La métrica que manda en este negocio es: visitas → clics a WhatsApp.
     Todo clic que abre WhatsApp se registra, venga de una tarjeta de producto,
     de un CTA general o del botón flotante. */

  function track(nombre, props) {
    if (typeof gtag !== 'undefined') gtag('event', nombre, props || {});
    if (typeof fbq !== 'undefined') fbq('trackCustom', nombre, props || {});
    if (typeof window.va === 'function') window.va('event', { name: nombre, data: props || {} });
  }

  document.addEventListener('click', (e) => {
    // Pedido de un producto concreto
    const pedido = (/** @type {HTMLElement | null} */ ((/** @type {Element} */ (e.target)).closest('[data-track="pedido"]')));
    if (pedido) {
      const id = pedido.dataset.id;
      track('pedido_whatsapp', { producto: id });
      if (typeof gtag !== 'undefined') gtag('event', 'begin_checkout', { item_id: id });
      if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', { content_ids: [id] });
      return;
    }

    // Cualquier otro CTA que abre WhatsApp
    const wa = (/** @type {HTMLElement | null} */ ((/** @type {Element} */ (e.target)).closest('[data-wa]')));
    if (wa) {
      const origen = wa.classList.contains('wa-float')
        ? 'boton_flotante'
        : wa.classList.contains('nav-cta')
        ? 'navbar'
        : wa.closest('.hero')
        ? 'hero'
        : wa.closest('.final-cta')
        ? 'cta_final'
        : 'otro';
      track('contacto_whatsapp', { origen: origen });
      if (typeof fbq !== 'undefined') fbq('track', 'Contact', { source: origen });
    }
  });

  // Profundidad de scroll: dice si el catálogo se está viendo o la gente rebota en el hero
  (function () {
    const hitos = [25, 50, 75, 100];
    const vistos = {};
    window.addEventListener(
      'scroll',
      () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h <= 0) return;
        const pct = (window.scrollY / h) * 100;
        hitos.forEach((m) => {
          if (pct >= m && !vistos[m]) {
            vistos[m] = true;
            track('scroll_' + m);
          }
        });
      },
      { passive: true }
    );
  })();

  /* ================= REVEALS INICIALES ================= */
  observeReveals(document);
})();
