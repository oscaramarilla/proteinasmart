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

  function waProducto(p) {
    const base = (CFG.mensajes && CFG.mensajes.pedidoPrefijo) || 'Hola, quiero pedir:';
    return waLink(
      base + ' *' + p.nombre + '* (' + p.formato + ') — ' + money(p.precio) +
      '. ¿Tenés stock disponible?'
    );
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
      navLinks.classList.toggle('open');
    });
    $$('a', navLinks).forEach((a) =>
      a.addEventListener('click', () => {
        burger.classList.remove('open');
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

  /* ================= CONTADORES ================= */

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  $$('.stat-num').forEach((el) => counterObs.observe(el));

  /* ================= CATÁLOGO ================= */

  const grid = $('#catalogGrid');
  const filtros = $('#catalogFilters');
  const emptyState = $('#catalogEmpty');

  const DISCIPLINAS = [
    { id: 'todos', nombre: 'Todas las disciplinas' },
    { id: 'keto', nombre: 'Cetogénica' },
    { id: 'low-carb', nombre: 'Low Carb' },
    { id: 'healthy-habits', nombre: 'Healthy Habits' },
    { id: 'neuroplasticidad', nombre: 'Neuroplasticidad' },
  ];

  // Estado inicial desde la URL: los filtros son compartibles e indexables
  // (ej.: ?categoria=keto, ?objetivo=foco o ?disciplina=low-carb).
  const paramsIniciales = new URLSearchParams(window.location.search);
  const categoriaInicial = paramsIniciales.get('categoria');
  const objetivoInicial = paramsIniciales.get('objetivo');
  const disciplinaInicial = paramsIniciales.get('disciplina');
  let filtroCategoria = CATEGORIAS.some((c) => c.id === categoriaInicial) ? categoriaInicial : 'todos';
  let filtroObjetivo = OBJETIVOS.some((o) => o.id === objetivoInicial) ? objetivoInicial : null;
  let filtroDisciplina = DISCIPLINAS.some((d) => d.id === disciplinaInicial) ? disciplinaInicial : 'todos';

  /**
   * Devuelve las disciplinas declaradas o inferidas para un producto local.
   * @param {Object} producto Producto del catálogo.
   * @returns {Array<string>} Identificadores de disciplina.
   */
  function disciplinasDe(producto) {
    if (Array.isArray(producto.disciplinas) && producto.disciplinas.length) return producto.disciplinas;
    const mapa = {
      keto: ['keto', 'low-carb'],
      deportivos: ['healthy-habits'],
      proteinas: ['healthy-habits', 'low-carb'],
      longevidad: ['neuroplasticidad', 'healthy-habits'],
    };
    return mapa[producto.categoria] || [];
  }

  /**
   * Sincroniza la URL sin recargar para reflejar los filtros activos (categoria, objetivo y disciplina).
   * @returns {void}
   */
  function sincronizarURL() {
    const params = new URLSearchParams();
    if (filtroCategoria !== 'todos') params.set('categoria', filtroCategoria);
    if (filtroObjetivo) params.set('objetivo', filtroObjetivo);
    if (filtroDisciplina !== 'todos') params.set('disciplina', filtroDisciplina);
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
  }

  function cardHTML(p) {
    const antes =
      p.precioAntes && p.precioAntes > p.precio
        ? '<span class="price-was">' + money(p.precioAntes) + '</span>'
        : '';
    const badge = p.badge ? '<span class="card-badge">' + p.badge + '</span>' : '';
    const marca = p.marca ? '<span class="card-brand">' + p.marca + '</span>' : '';
    const agotado = p.stock === false;
    const disciplinas = Array.isArray(p.disciplinas) && p.disciplinas.length
      ? p.disciplinas
      : disciplinasDe(p);
    const disciplinaBadge = disciplinas[0]
      ? '<span class="discipline-badge discipline-' + disciplinas[0] + '">' + disciplinas[0].replace('-', ' ') + '</span>'
      : '';

    const imagen = p.imagen || '';
    const imagenHTML = imagen
      ? '<div class="card-image"><img src="' + imagen + '" alt="" loading="lazy" /></div>'
      : '<div class="card-image card-image-fallback" aria-hidden="true"><span>Proteína<br><strong>Smart</strong></span></div>';

    return (
      '<article class="product-card reveal' + (agotado ? ' is-out' : '') + '" data-cat="' + p.categoria + '">' +
      badge +
      disciplinaBadge +
      imagenHTML +
      '<div class="card-top">' + marca +
      '<h3>' + p.nombre + '</h3>' +
      '<span class="card-format">' + p.formato + '</span>' +
      '</div>' +
      '<p class="card-sum">' + p.resumen + '</p>' +
      '<div class="card-foot">' +
      '<div class="card-price">' + antes + '<strong>' + money(p.precio) + '</strong></div>' +
      (agotado
        ? '<span class="btn btn-disabled">Sin stock</span>'
        : '<button class="btn btn-primary btn-sm" type="button" data-cart-add="' + p.id + '">Agregar al carrito</button>') +
      '</div>' +
      '</article>'
    );
  }

  function renderCatalogo() {
    if (!grid) return;
    const items = CATALOG.filter((p) => {
      const okCat = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const okObj =
        !filtroObjetivo || (p.objetivos || []).indexOf(filtroObjetivo) !== -1;
      const okDisciplina = filtroDisciplina === 'todos' || disciplinasDe(p).indexOf(filtroDisciplina) !== -1;
      return okCat && okObj && okDisciplina;
    });

    grid.innerHTML = items.map(cardHTML).join('');
    if (emptyState) emptyState.hidden = items.length > 0;
    observeReveals(grid);
    // sin animación diferida en re-render: se muestran de una
    requestAnimationFrame(() => $$('.product-card', grid).forEach((c) => c.classList.add('visible')));
  }

  const disciplineFilters = $('#disciplineFilters');
  function renderDisciplineFilters() {
    if (!disciplineFilters) return;
    disciplineFilters.innerHTML = DISCIPLINAS.map((disciplina) =>
      '<button class="chip' + (disciplina.id === filtroDisciplina ? ' active' : '') + '" data-discipline="' + disciplina.id + '">' + disciplina.nombre + '</button>'
    ).join('');
    $$('.chip', disciplineFilters).forEach((btn) => btn.addEventListener('click', () => {
      filtroDisciplina = btn.dataset.discipline;
      sincronizarURL();
      $$('.chip', disciplineFilters).forEach((chip) => chip.classList.toggle('active', chip === btn));
      renderCatalogo();
    }));
  }

  function renderFiltros() {
    if (!filtros) return;
    filtros.innerHTML = CATEGORIAS.map(
      (c) =>
        '<button class="chip' + (c.id === filtroCategoria ? ' active' : '') + '" data-cat="' +
        c.id + '"><span>' + c.icono + '</span>' + c.nombre + '</button>'
    ).join('');

    $$('.chip', filtros).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.chip', filtros).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filtroCategoria = btn.dataset.cat;
        sincronizarURL();
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
        renderCatalogo();
        const dest = $('#catalogo');
        if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  renderFiltros();
  renderDisciplineFilters();
  renderCatalogo();
/* ================= FALLBACK VISUAL (404) ================= */
  // Si una imagen falla (404 o red lenta), la tarjeta vuelve sola al
  // diseno tipografico premium sin romper el layout ni mostrar iconos rotos.
  if (grid) {
    grid.addEventListener(
      'error',
      (e) => {
        const img = e.target;
        if (img.tagName !== 'IMG') return;
        const contenedor = img.closest('.card-image');
        if (!contenedor) return;
        contenedor.classList.add('card-image-fallback');
        contenedor.innerHTML = '<span>Proteína<br><strong>Smart</strong></span>';
      },
      true
    );
  }

  /**
   * Detecta el protocolo de venta que corresponde al carrito(Regla de Venta del Dossier).
   * Nunca devuelve null: todo pedido propone protocolo con complemento, dosis,
   * momento del dia y duracion minima — asi el ticket promedio sube con el upsell natural.
   * @param {Array<Object>} items Items del carrito.
   * @returns {{ nombre: string, complemento: string, uso: string }}
   */
  function detectarProtocolo(items) {
    const normalizar = (s) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const ids = items.map((item) => normalizar(String(item.id || '')));
    const nombres = items.map((item) => normalizar(item.nombre || ''));
    const tiene = (clave) =>
      ids.some((id) => id.indexOf(clave) !== -1) || nombres.some((n) => n.indexOf(clave) !== -1);

    // 1) Whey + Creatina → Ganar masa(ejemplo del Roadmap: Whey Isolate + Creatina..
    if (tiene('creatina') && (tiene('whey') || tiene('proteina'))) {
      return {
        nombre: 'Ganar masa (Whey + Creatina)',
        complemento: 'EAA: protege la masa durante el déficit calórico',
        uso: 'Creatina: 5 g al día (ideal post-entreno); Whey post-entreno o desayuno.Mínimo 30 días.',
      };
    }

    // 2) Colágeno → Belleza & longevidad(regla obligatoria de protocolo..
    if (tiene('colageno')) {
      return {
        nombre: 'Belleza & longevidad (Colágeno + Vitamina C)',
        complemento: 'Omega 3 + Vitamina D3+K2: piel, pelo, articulaciones y hueso',
        uso: 'Colágeno en ayunas o post-entreno, diario.. Mínimo 30 días continuos.',
      };
    }

    // 3) Omega 3 + Magnesio → Foco y claridad mental
    if (tiene('omega') && tiene('magnesio')) {


      return {
        nombre: 'Foco y claridad mental(Omega 3 + Magnesio Glicinato)',
        complemento: 'Nootrópico Focus o Creatina: concentración sostenida sin bajón',
        uso: 'Omega 3 con la comida principal; magnesio de noche.Mínimo 30 días.',
      };
    }

    // 4) MCT + D3+K2 → Energía sostenida
    if (tiene('mct') && tiene('vitamina')) {

      return {
        nombre: 'Energía sostenida (MCT + Vitamina D3+K2)',
        complemento: 'Pre-entreno sin azúcar: energía sin picos de insulina',
        uso: 'MCT en la mañana (café bulletproof); D3+K2 con la comida principal.Mínimo 30 días.',
      };
    }

    // 5) Proteína + EAA → Bajar grasa / Definir
    if ((tiene('whey') || tiene('proteina')) && tiene('eaa')) {

      return {
        nombre: 'Bajar grasa / Definir(Proteína + EAA)',
        complemento: 'MCT o Sustituto de Comida Low Carb: saciedad sin carbos',
        uso: 'Proteína en desayuno y post-entreno; EAA en ayuno o cardio.Mínimo 30 días.',
      };
    }

    // 6) Keto / Low carb cuando el carrito ya es de esa disciplina
    if (tiene('barras') || tiene('sustituto') || tiene('endulzante')) {

      return {
        nombre: 'Keto / Low carb',
        complemento: 'Aceite MCT o Proteína Vegetal: saciedad y energía cetónica',
        uso: 'Snack/sustituto como comida principal; MCT en el café matinal.Mínimo 30 días.',
      };
    }

    // 7) MCT solo → Energía sostenida
    if (tiene('mct')) {

      return {
        nombre: 'Energía sostenida(Aceite MCT + Vitamina D3+K2)',
        complemento: 'Vitamina D3+K2: absorción, inmunidad y energía celular',
        uso: 'MCT en la mañana(15 ml en el café); D3+K2 con la comida principal.Mínimo 30 días.',
      };
    }

    // 8) Omega 3, Magnesio o Nootrópico solos → Foco y claridad
    if (tiene('omega') || tiene('magnesio') || tiene('nootropico')) {

      return {
        nombre: 'Foco y claridad mental(Omega 3 + Magnesio Glicinato)',
        complemento: 'El otro del par + Nootrópico Focus: sinergia neuronal',
        uso: 'Omega 3 con comida; magnesio o nootrópico de noche.Mínimo 30 días.',
      };
    }

    // 9) Creatina sola → Ganar masa(se propone la Whey..
    if (tiene('creatina')) {

      return {
        nombre: 'Ganar masa(Creatina + Whey)',
        complemento: 'Whey Protein: la proteína que sostiene la síntesis muscular',
        uso: 'Creatina 5 g diarios + proteína post-entreno o desayuno.Mínimo 30 días.',
      };
    }

    // 10) Whey o Proteína sola → Ganar masa(se propone la Creatina — ejemplo del Roadmap.)
    if (tiene('whey') || tiene('proteina')) {

      return {
        nombre: 'Ganar masa(Whey + Creatina)',
        complemento: 'Creatina Monohidratada: el suplemento con más evidencia para fuerza y masa magra',
        uso: 'Whey post-entreno o desayuno; creatina 5 g diarios.Mínimo 30 días.',
      };
    }

    // 11) EAA solo → Bajar grasa(se propone la base proteica..
    if (tiene('eaa')) {

      return {
        nombre: 'Bajar grasa / Definir(EAA + Proteína)',
        complemento: 'Whey Isolate o Proteína Vegetal:la base proteica del protocolo',
        uso: 'EAA en ayuno o durante el cardio; proteína post-entreno.Mínimo 30 días.',
      };
    }

    // 12) Cualquier otro combo → asesoría personalizada(protocolo a medida..
    return {
      nombre: 'Asesoría personalizada(protocolo según tu objetivo)',
      complemento: 'Te confirmamos el complemento exacto y su dosis para tu caso',
      uso: 'Dosis, momento del día y duración mínima(30 días)personalizados.',
    };
  }

  /**
   * Construye el checkout multi-producto con protocolo y asesoría de uso..
   * Aplica la Regla de Venta: nunca un producto suelto sin su protocolo sugerido..
   * @param {Array<Object>} items Items del carrito..
   * @param {number} importe Total entero en guaraníes..
   * @returns {string} URL de WhatsApp..
   */
  function waCarrito(items, importe) {
    const lineas = items.map((item) => '- ' + item.cantidad + 'x ' + item.nombre + ' (' + item.formato + ')');
    const protocolo = detectarProtocolo(items);
    const complemento = protocolo.complemento;
    const uso = protocolo.uso;
    const mensaje = [
      'Hola ProteínaSmart 👋 Quiero confirmar mi pedido:',
      'Protocolo: *' + protocolo.nombre + '*',
      'Producto base + complemento:',
      ...lineas,
      'Complemento sugerido: ' + complemento + '.',
      'Guía de uso:', uso,
      'Duración mínima del protocolo: 30 días.',
      'Precio total: ' + money(importe) + '.',
      '¿Podemos coordinar la asesoría y el envío?',
      'Los suplementos no son medicamentos ni reemplazan una alimentación variada o el consejo de un profesional de la salud.',
    ].join('\n');
    return waLink(mensaje);
  }

  /**
   * Renderiza la barra flotante y sus acciones desde el estado global.
   * @param {Object} state Estado público del carrito.
   * @returns {void}
   */
  function renderCarrito(state) {
    let bar = $('#cartBar');
    if (!state.items.length) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement('aside');
      bar.id = 'cartBar';
      bar.className = 'cart-bar';
      bar.setAttribute('role', 'status');
      bar.setAttribute('aria-live', 'polite');
      document.body.appendChild(bar);
    }
    const cantidad = state.items.reduce((sum, item) => sum + item.cantidad, 0);
    bar.innerHTML = '<div class="cart-summary"><span class="cart-kicker">Tu selección está lista</span><span><strong>' + cantidad + '</strong> producto(s) · <strong>' + money(state.total) + '</strong></span><small class="cart-ethics">Confirmamos stock, forma de pago y envío por WhatsApp.</small></div>' +
      '<button class="btn btn-primary btn-sm" type="button" data-cart-checkout>Pedir por WhatsApp</button>';
  }

  if (window.PS_CART) {
    window.PS_CART.subscribe(renderCarrito);
    renderCarrito(window.PS_CART.getState());
  }

  document.addEventListener('click', (event) => {
    const add = event.target.closest('[data-cart-add]');
    if (add && window.PS_CART) {
      const producto = CATALOG.find((item) => item.id === add.dataset.cartAdd);
      if (producto) {
        window.PS_CART.dispatch({ type: 'AGREGAR', producto });
        add.classList.add('is-added');
        add.textContent = 'Agregado ✓';
        window.setTimeout(() => {
          add.classList.remove('is-added');
          add.textContent = 'Agregar al carrito';
        }, 1500);
      }
      return;
    }
    const checkout = event.target.closest('[data-cart-checkout]');
    if (checkout && window.PS_CART) {
      const state = window.PS_CART.getState();
      window.open(waCarrito(state.items, state.total), '_blank', 'noopener');
      window.dispatchEvent(new CustomEvent('ps:pedido', {
        detail: { items: state.items, total: state.total },
      }));
      window.PS_CART.dispatch({ type: 'LIMPIAR' });
    }
  });

  window.addEventListener('ps:catalogo-remoto', (event) => {
    CATALOG = event.detail;
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
      const data = Object.fromEntries(new FormData(form).entries());
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
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
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
    const pedido = e.target.closest('[data-track="pedido"]');
    if (pedido) {
      const id = pedido.dataset.id;
      track('pedido_whatsapp', { producto: id });
      if (typeof gtag !== 'undefined') gtag('event', 'begin_checkout', { item_id: id });
      if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', { content_ids: [id] });
      return;
    }

    // Cualquier otro CTA que abre WhatsApp
    const wa = e.target.closest('[data-wa]');
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
