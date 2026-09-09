const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = JSON.parse(read('vercel.json'));
const categories = ['proteinas', 'keto', 'longevidad', 'deportivos'];
const disciplines = ['low-carb', 'healthy-habits', 'neuroplasticidad'];

// Run the site's routing code with a minimal metadata DOM, without network or packages.
function routing(url) {
  const nodes = new Map();
  const node = (values) => ({
    ...values,
    setAttribute(name, value) { this[name] = value; },
  });
  nodes.set('meta[name="description"]', node({ content: 'Descripción general' }));
  nodes.set('link[rel="canonical"]', node({ href: 'https://www.proteinasmart.com/' }));
  for (const name of ['og:title', 'og:description', 'og:url']) {
    nodes.set('meta[property="' + name + '"]', node({ content: '' }));
  }
  const document = { title: 'ProteínaSmart · inicio' };
  const window = {
    location: new URL(url, 'https://www.proteinasmart.com'),
    history: {
      replaceState(_state, _title, next) {
        window.location = new URL(next, window.location);
      },
    },
  };
  const context = vm.createContext({ window, document, URL, URLSearchParams, $: (selector) => nodes.get(selector) });
  vm.runInContext(read('js/catalog.js'), context);
  context.CATEGORIAS = window.PS_CATEGORIAS;
  context.OBJETIVOS = window.PS_OBJETIVOS;
  const source = read('js/main.js');
  const start = source.indexOf('  const DISCIPLINAS =');
  const end = source.indexOf('  function escapeHTML(');
  assert.ok(start >= 0 && end > start, 'routing section must be present');
  vm.runInContext(source.slice(start, end) + `
    window.routes = {
      getState: () => ({ categoria: filtroCategoria, objetivo: filtroObjetivo, disciplina: filtroDisciplina }),
      setState: (categoria, objetivo = null, disciplina = 'todos') => {
        filtroCategoria = categoria;
        filtroObjetivo = objetivo;
        filtroDisciplina = disciplina;
      },
      sync: sincronizarURL,
      metadata: actualizarMetadatos,
    };
  `, context);
  return { routes: window.routes, window, document, nodes };
}

test('Vercel category and discipline routes resolve to an existing HTML entry point', () => {
  const sources = config.rewrites.map((rule) => rule.source);
  assert.equal(new Set(sources).size, sources.length, 'rewrite sources must be unique');
  for (const [parameter, values] of [['categoria', categories], ['disciplina', disciplines]]) {
    for (const value of values) {
      const rule = config.rewrites.find((item) => item.source === '/' + value);
      assert.ok(rule, 'missing rewrite: /' + value);
      const target = new URL(rule.destination, 'https://www.proteinasmart.com');
      assert.equal(target.pathname, '/index.html');
      assert.equal(target.searchParams.get(parameter), value);
      assert.ok(fs.existsSync(path.join(root, target.pathname)), 'rewrite target must exist');
    }
  }
  // Explicit .html destinations should not be stripped by cleanUrls redirects.
  assert.equal(config.cleanUrls, false);
});

test('query and clean category URLs select the same category and metadata', () => {
  for (const category of categories) {
    const queryPage = routing('/?categoria=' + category);
    const cleanPage = routing('/' + category);
    for (const page of [queryPage, cleanPage]) {
      const state = page.routes.getState();
      assert.equal(state.categoria, category);
      assert.equal(state.disciplina, 'todos', 'category paths must not add a hidden discipline filter');
      page.routes.metadata();
      assert.notEqual(page.document.title, 'ProteínaSmart · inicio');
      assert.notEqual(page.nodes.get('meta[name="description"]').content, 'Descripción general');
      assert.equal(page.nodes.get('link[rel="canonical"]').href, 'https://www.proteinasmart.com/' + category);
      assert.equal(page.nodes.get('meta[property="og:title"]').content, page.document.title);
    }
    assert.equal(cleanPage.document.title, queryPage.document.title);
  }
});

test('explicit query overrides category pathname and unknown filters safely reset', () => {
  const page = routing('/keto?categoria=proteinas');
  assert.equal(page.routes.getState().categoria, 'proteinas');
  assert.equal(page.routes.getState().disciplina, 'todos');
  for (const category of ['todos', 'invalid', '']) {
    assert.equal(routing('/keto?categoria=' + category).routes.getState().categoria, 'todos');
  }
  const unknown = routing('/?categoria=inexistente&objetivo=inexistente&disciplina=inexistente');
  assert.equal(unknown.routes.getState().categoria, 'todos');
  assert.equal(unknown.routes.getState().objetivo, null);
  assert.equal(unknown.routes.getState().disciplina, 'todos');
});

test('existing discipline routes work and explicit discipline query wins', () => {
  for (const discipline of disciplines) {
    const page = routing('/' + discipline);
    assert.equal(page.routes.getState().categoria, 'todos');
    assert.equal(page.routes.getState().disciplina, discipline);
  }
  assert.equal(routing('/low-carb?disciplina=healthy-habits').routes.getState().disciplina, 'healthy-habits');
  assert.equal(routing('/proteinas?disciplina=keto').routes.getState().disciplina, 'keto');
});

test('clearing a category preserves attribution and hash without restoring path filters on reload', () => {
  const page = routing('/keto?utm_source=instagram&objetivo=masa#catalogo');
  page.routes.metadata();
  page.routes.setState('todos');
  page.routes.sync();
  page.routes.metadata();
  assert.equal(page.window.location.pathname, '/');
  assert.equal(page.window.location.searchParams.get('utm_source'), 'instagram');
  for (const key of ['categoria', 'objetivo', 'disciplina']) {
    assert.equal(page.window.location.searchParams.has(key), false);
  }
  assert.equal(page.window.location.hash, '#catalogo');
  const reloaded = routing(page.window.location.href);
  assert.equal(reloaded.routes.getState().categoria, 'todos');
  assert.equal(reloaded.routes.getState().disciplina, 'todos');
  assert.equal(page.document.title, 'ProteínaSmart · inicio');
  assert.equal(page.nodes.get('meta[name="description"]').content, 'Descripción general');
  assert.equal(page.nodes.get('link[rel="canonical"]').href, 'https://www.proteinasmart.com/');
});

test('changing a filter on a discipline landing survives refresh', () => {
  const page = routing('/low-carb?utm_campaign=septiembre#catalogo');
  page.routes.setState('deportivos', 'masa', 'todos');
  page.routes.sync();
  const reloaded = routing(page.window.location.href);
  assert.equal(reloaded.routes.getState().categoria, 'deportivos');
  assert.equal(reloaded.routes.getState().objetivo, 'masa');
  assert.equal(reloaded.routes.getState().disciplina, 'todos');
  assert.equal(page.window.location.searchParams.get('utm_campaign'), 'septiembre');
});
