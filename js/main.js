/* =========================================================
   Paraguay Future Invest — main.js
   Interactions: nav, counters, reveal, particles, i18n
   ========================================================= */

(function () {
  'use strict';

  /* ---------- CONFIG — reemplazá con tu número real ---------- */
  const WA_NUMBER = '595XXXXXXXXX'; // ej: 595981123456

  /* ---------- Navbar scroll state + progress bar ---------- */
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    revealObs.observe(el);
  });

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(eased * target);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
  document.querySelectorAll('.stat-num, .mini-num').forEach((el) => counterObs.observe(el));

  /* ---------- Tech grid animation ---------- */
  const techGrid = document.getElementById('techGrid');
  if (techGrid) {
    const total = 36;
    for (let i = 0; i < total; i++) {
      const c = document.createElement('div');
      c.className = 'cell';
      techGrid.appendChild(c);
    }
    const cells = techGrid.querySelectorAll('.cell');
    setInterval(() => {
      cells.forEach((c) => c.classList.remove('on'));
      const n = 6 + Math.floor(Math.random() * 6);
      for (let i = 0; i < n; i++) {
        cells[Math.floor(Math.random() * cells.length)].classList.add('on');
      }
    }, 700);
  }

  /* ---------- Lead form → n8n Webhook ---------- */
  const form = document.getElementById('leadForm');
  const note = document.getElementById('formNote');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // IMPORTANTE: Reemplaza esta URL con la URL de producción de tu Webhook en n8n
  const N8N_WEBHOOK_URL = 'https://TU-DOMINIO-N8N.com/webhook/landing-leads'; 

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Cambiar estado del botón a cargando
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      note.style.color = '#fff'; // Resetear color
      note.textContent = 'Procesando tu solicitud...';

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            sector: data.sector,
            source: 'Landing Page PFI',
            timestamp: new Date().toISOString()
          }),
        });

        if (response.ok) {
          // Éxito
          note.style.color = '#15c47e'; // Verde éxito
          note.textContent = '✓ ¡Dossier enviado! Revisa tu bandeja de entrada (y spam).';
          form.reset();
        } else {
          // Error del servidor (ej. 500)
          throw new Error('Respuesta del servidor no fue OK');
        }
      } catch (error) {
        // Error de red o CORS
        console.error('Error al enviar el lead:', error);
        note.style.color = '#f5c542'; // Amarillo/Naranja advertencia
        note.textContent = '⚠ Hubo un problema al enviar. Por favor, intenta de nuevo o contáctanos directamente.';
      } finally {
        // Restaurar botón
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Lightweight i18n (ES/EN) ---------- */
  const i18n = {
    en: {
      'Energía': 'Energy',
      'Agroindustria': 'Agribusiness',
      'Tecnología': 'Technology',
      'Logística': 'Logistics',
      'Real Estate': 'Real Estate',
      'Invertir': 'Invest',
    },
  };
  const langButtons = document.querySelectorAll('.lang-toggle button');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const originalNav = Array.from(navAnchors).map((a) => a.textContent);
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      langButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      navAnchors.forEach((a, i) => {
        const orig = originalNav[i];
        a.textContent = lang === 'en' && i18n.en[orig] ? i18n.en[orig] : orig;
      });
    });
  });

  /* ---------- Particle background ---------- */
  const canvas = document.getElementById('bg-canvas');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const COLORS = ['#f5c542', '#15c47e', '#4f8cff'];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(70, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        // connect lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 14000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.c;
            ctx.globalAlpha = 0.08 * (1 - dist / 14000);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    resize();
    draw();
  }
})();
