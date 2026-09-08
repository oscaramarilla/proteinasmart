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
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(burger.classList.contains('open')));
      navLinks.classList.toggle('open');
    });
    $$('a', navLinks).forEach((a) =>
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      })
    );
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

  const paramsIniciales = new URLSearchParams(window.location.search);
  const legacy = { keto: 'keto', 'low-carb': 'keto', 'healthy-habits': 'todos', neuroplasticidad: 'longevidad' };
  const categoriaInicial = paramsIniciales.get('categoria') || legacy[paramsIniciales.get('disciplina')];
  const objetivoInicial = paramsIniciales.get('objetivo');
  let filtroCategoria = CATEGORIAS.some((c) => c.id === categoriaInicial) ? categoriaInicial : 'todos';
  let filtroObjetivo = OBJETIVOS.some((o) => o.id === objetivoInicial) ? objetivoInicial : null;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

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
  }

  function cardHTML(p) {
    const verified = p.verificado || {};
    const marca = verified.marca && p.marca ? '<span class="card-brand">' + escapeHTML(p.marca) + '</span>' : '';
    const sabor = verified.sabor && p.sabor ? '<span class="card-format">Sabor: ' + escapeHTML(p.sabor) + '</span>' : '';
    const agotado = verified.stock && p.stock === false;
    const disponibilidad = verified.stock && typeof p.stock === 'boolean' ? (p.stock ? 'Disponible' : 'Sin stock') : 'Disponibilidad a confirmar';
    // Solo recursos con procedencia verificada; nunca dibujar un envase ficticio.
    const imagen = verified.imagen && typeof p.imagen === 'string' && /^(https:\/\/|\.?\/?(?:assets|images|img)\/)/.test(p.imagen) ? p.imagen : '';
    const imagenHTML = imagen
      ? '<div class="card-image"><img src="' + escapeHTML(imagen) + '" alt="' + escapeHTML(p.nombre) + '" loading="lazy" /></div>'
      : '<div class="card-image card-image-fallback"><span>Foto del producto<br><small>pendiente</small></span></div>';
    return '<article class="product-card' + (agotado ? ' is-out' : '') + '">' + imagenHTML +
      '<div class="card-top">' + marca + '<h3>' + escapeHTML(p.nombre) + '</h3>' +
      '<span class="card-format">' + (verified.formato ? 'Presentación: ' : 'Presentación de referencia: ') + escapeHTML(p.formato || 'A confirmar') + '</span>' + sabor + '</div>' +
      '<p class="card-availability">' + disponibilidad + '</p>' +
      '<div class="card-foot"><div class="card-price"><small>Precio de referencia</small><strong>' + money(p.precio) + '</strong></div>' +
      '<button class="btn btn-primary btn-sm" type="button" data-cart-add="' + escapeHTML(p.id) + '"' + (agotado ? ' disabled' : '') + '>' + (agotado ? 'Sin stock' : 'Agregar al carrito') + '</button></div></article>';
  }

  function renderCatalogo() {
    if (!grid) return;
    const items = CATALOG.filter((p) => {
      const okCat = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const okObj =
        !filtroObjetivo || (p.objetivos || []).indexOf(filtroObjetivo) !== -1;
      return okCat && okObj;
    });

    grid.innerHTML = items.map(cardHTML).join('');
    $('#catalogCount').textContent = items.length + ' productos';
    if (emptyState) emptyState.hidden = items.length > 0;
    observeReveals(grid);
    // sin animación diferida en re-render: se muestran de una
    requestAnimationFrame(() => $$('.product-card', grid).forEach((c) => c.classList.add('visible')));
  }

  function renderFiltros() {
    if (!filtros) return;
    filtros.innerHTML = CATEGORIAS.map(
      (c) =>
        '<button class="chip' + (c.id === filtroCategoria ? ' active' : '') + '" data-cat="' +
        c.id + '" aria-pressed="' + (c.id === filtroCategoria) + '"><span>' + c.icono + '</span>' + c.nombre + '</button>'
    ).join('');

    $$('.chip', filtros).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.chip', filtros).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filtroCategoria = btn.dataset.cat;
        sincronizarURL();
        renderFiltros();
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
      btn.addEventListener('click', () => {
        const isActive = btn.classList.contains('active');
        $$('.goal-card', objetivosWrap).forEach((b) => b.classList.remove('active'));
        if (isActive) {
          filtroObjetivo = null;
        } else {
          btn.classList.add('active');
          filtroObjetivo = btn.dataset.goal;
        }
        filtroCategoria = 'todos';
        if (filtros) {
          $$('.chip', filtros).forEach((b) => b.classList.remove('active'));
          const todos = $('.chip[data-cat="todos"]', filtros);
          if (todos) todos.classList.add('active');
        }
        sincronizarURL();
        renderFiltros();
        renderCatalogo();
        const dest = $('#catalogo');
        if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  const goalSelect = $('#catalogGoal');
  goalSelect.innerHTML += OBJETIVOS.map((o) => '<option value="' + o.id + '">' + o.nombre + '</option>').join('');
  function syncGoalControls() {
    const select = $('#catalogGoal');
    if (select) select.value = filtroObjetivo || '';
    $$('.goal-card').forEach((button) => {
      const active = button.dataset.goal === filtroObjetivo;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  goalSelect.addEventListener('change', () => {
    filtroObjetivo = goalSelect.value || null;
    sincronizarURL();
    renderCatalogo();
  });
  $('#clearFilters').addEventListener('click', () => {
    filtroCategoria = 'todos'; filtroObjetivo = null;
    sincronizarURL(); renderFiltros(); renderCatalogo();
  });
  syncGoalControls();
  renderFiltros();
  renderCatalogo();
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
        contenedor.classList.add('card-image-fallback');
        contenedor.innerHTML = '<span>Foto del producto<br><small>pendiente</small></span>';
      },
      true
    );
  }

  document.addEventListener('click', (event) => {
    const add = /** @type {HTMLElement | null} */ ((/** @type {Element} */ (event.target)).closest('[data-cart-add]'));
    if (!add || !window.PS_CART) return;
    const producto = CATALOG.find((item) => item.id === add.dataset.cartAdd);
    if (producto && !(producto.verificado?.stock && producto.stock === false)) {
      window.PS_CART.dispatch({ type: 'AGREGAR', producto });
      $('#cartStatus').textContent = producto.nombre + ' agregado al carrito.';
    }
  });

  window.addEventListener('ps:catalogo-remoto', (event) => {
    const detalle = (/** @type {CustomEvent} */ (event)).detail;
    CATALOG = detalle;
    renderCatalogo();
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
