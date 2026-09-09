const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// catalog.js define PS_CATEGORIAS/PS_OBJETIVOS con sintaxis JS (comillas
// simples, claves sin comillas) -- no es JSON. Se ejecuta una vez en un
// contexto minimo para obtener los valores reales, en vez de duplicarlos
// a mano y arriesgar que se desincronicen.
const catalogContext = vm.createContext({ window: {} });
vm.runInContext(read('js/catalog.js'), catalogContext);
const { PS_CATEGORIAS: CATEGORIAS_REALES, PS_OBJETIVOS: OBJETIVOS_REALES } = catalogContext.window;

// Corre la seccion de routing/metadatos de main.js con un DOM minimo, sin
// levantar el resto del sitio (nav, reveal, tracking, formulario de leads).
function montarPagina(url) {
  const nodes = new Map();
  const node = (content) => ({
    content, href: content,
    getAttribute(name) { return this[name]; },
    setAttribute(name, value) { this[name] = value; },
  });
  nodes.set('meta[name="description"]', node('Descripción general'));
  nodes.set('link[rel="canonical"]', node('https://www.proteinasmart.com/'));
  nodes.set('meta[property="og:title"]', node(''));
  nodes.set('meta[property="og:description"]', node(''));
  nodes.set('meta[property="og:url"]', node(''));
  nodes.set('meta[name="twitter:title"]', node(''));
  nodes.set('meta[name="twitter:description"]', node(''));
  const document = { title: 'ProteínaSmart — Proteína inteligente | Marketplace de proteínas y suplementos en Paraguay' };
  const window = {
    location: new URL(url, 'https://www.proteinasmart.com'),
    history: { replaceState(_s, _t, next) { window.location = new URL(next, window.location); } },
  };
  const context = vm.createContext({
    window, document, URL, URLSearchParams,
    $: (selector) => nodes.get(selector),
    CATEGORIAS: CATEGORIAS_REALES,
    OBJETIVOS: OBJETIVOS_REALES,
    syncGoalControls: () => {},
  });
  const source = read('js/main.js');
  const start = source.indexOf('  const paramsIniciales =');
  const end = source.indexOf('  function cardHTML(');
  assert.ok(start >= 0 && end > start, 'la seccion de routing/metadatos debe existir en main.js');
  vm.runInContext(source.slice(start, end) + `
    window.routing = {
      getState: () => ({ categoria: filtroCategoria, objetivo: filtroObjetivo }),
      setState: (categoria) => { filtroCategoria = categoria; },
      sync: sincronizarURL,
      metadata: actualizarMetadatos,
    };
  `, context);
  return { routing: window.routing, window, document, nodes };
}

test('cada categoria valida cambia titulo, descripcion, canonical y OG', () => {
  for (const categoria of ['proteinas', 'deportivos', 'keto', 'longevidad']) {
    const page = montarPagina('/?categoria=' + categoria);
    assert.equal(page.routing.getState().categoria, categoria);
    page.routing.metadata();
    assert.notEqual(page.document.title, 'ProteínaSmart — Proteína inteligente | Marketplace de proteínas y suplementos en Paraguay');
    assert.match(page.document.title, /ProteínaSmart/);
    assert.notEqual(page.nodes.get('meta[name="description"]').content, 'Descripción general');
    assert.equal(page.nodes.get('link[rel="canonical"]').href, 'https://www.proteinasmart.com/' + categoria);
    assert.equal(page.nodes.get('meta[property="og:title"]').content, page.document.title);
    assert.equal(page.nodes.get('meta[property="og:url"]').content, 'https://www.proteinasmart.com/' + categoria);
  }
});

test('categoria invalida o ausente conserva los metadatos originales', () => {
  for (const url of ['/', '/?categoria=inexistente']) {
    const page = montarPagina(url);
    assert.equal(page.routing.getState().categoria, 'todos');
    page.routing.metadata();
    assert.equal(page.document.title, 'ProteínaSmart — Proteína inteligente | Marketplace de proteínas y suplementos en Paraguay');
    assert.equal(page.nodes.get('meta[name="description"]').content, 'Descripción general');
    assert.equal(page.nodes.get('link[rel="canonical"]').href, 'https://www.proteinasmart.com/');
  }
});

test('el legacy ?disciplina= sigue resolviendo a una categoria y actualiza metadatos', () => {
  const page = montarPagina('/?disciplina=neuroplasticidad');
  assert.equal(page.routing.getState().categoria, 'longevidad');
  page.routing.metadata();
  assert.match(page.document.title, /Longevidad/i);
});

test('limpiar el filtro restaura los metadatos originales', () => {
  const page = montarPagina('/?categoria=keto');
  page.routing.metadata();
  assert.notEqual(page.document.title, 'ProteínaSmart — Proteína inteligente | Marketplace de proteínas y suplementos en Paraguay');
  page.routing.setState('todos');
  page.routing.metadata();
  assert.equal(page.document.title, 'ProteínaSmart — Proteína inteligente | Marketplace de proteínas y suplementos en Paraguay');
  assert.equal(page.nodes.get('meta[name="description"]').content, 'Descripción general');
});
