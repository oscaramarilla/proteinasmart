const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/catalog.js'), 'utf8');
const remote = {
  id: 'remoto-1', nombre: 'Proteína remota', unidad_medida: '1 kg',
  precio: 250000, categoria: 'proteinas', objetivos: ['masa'],
};
const config = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'public-anon-test-key' };

function setup(options = {}) {
  const context = vm.createContext({
    window: { PS_CONFIG: config }, URL, AbortController, setTimeout, clearTimeout,
    fetch: async () => ({ ok: true, json: async () => [remote] }),
    ...options,
  });
  vm.runInContext(source, context);
  return context;
}

test('missing credentials use the local catalog without a network request', async () => {
  const context = setup({ fetch: () => assert.fail('No network request expected') });
  for (const configuration of [undefined, {}, { supabaseUrl: config.supabaseUrl }, {
    supabaseUrl: config.supabaseUrl,
    supabase: { url: 'https://legacy.supabase.co', anonKey: 'legacy-key' },
  }]) {
    context.window.PS_CONFIG = configuration;
    assert.equal(await context.window.fetchCatalog(), context.window.PS_CATALOG);
  }
  vm.runInContext(fs.readFileSync(path.join(root, 'js/config.js'), 'utf8'), context);
  assert.equal(context.window.PS_CONFIG.supabaseUrl, '');
  assert.equal(context.window.PS_CONFIG.supabaseAnonKey, '');
  assert.equal(await context.window.fetchCatalog(), context.window.PS_CATALOG);
});

test('native REST request normalizes commercial fields without claiming stock', async () => {
  let request;
  const context = setup({ fetch: async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => [{
      ...remote, id: 123, precio: '250000', formato: '1 kg · 30 servicios',
      descripcion: 'Descripción', objetivos: ['masa', null, 42], disciplinas: null,
      precio_actualizado: '2026-09-09', etiqueta_nutricional: 'Etiqueta recibida',
      imagen: 'images/wheyptrotein.webp', imagen_referencial: true,
    }] };
  } });
  const catalog = await context.window.fetchCatalog();
  assert.notEqual(catalog, context.window.PS_CATALOG);
  assert.equal(request.url, 'https://example.supabase.co/rest/v1/productos?select=*&order=nombre.asc');
  assert.equal(request.options.headers.apikey, config.supabaseAnonKey);
  assert.equal(request.options.headers.Authorization, 'Bearer ' + config.supabaseAnonKey);
  assert.equal(request.options.signal.aborted, false);
  assert.equal(catalog[0].id, '123');
  assert.equal(catalog[0].precio, 250000);
  assert.equal(catalog[0].formato, '1 kg · 30 servicios');
  assert.equal(catalog[0].resumen, 'Descripción');
  assert.equal(catalog[0].precioActualizado, '2026-09-09');
  assert.equal(catalog[0].etiquetaNutricional, 'Etiqueta recibida');
  assert.equal(catalog[0].imagenReferencial, true);
  assert.deepEqual(Array.from(catalog[0].objetivos), ['masa']);
  assert.equal(catalog[0].disciplinas.length, 0);
  assert.equal(catalog[0].disponibilidad, 'sin-confirmar');
  assert.equal(catalog[0].stock, undefined);
  assert.equal(context.window.PS_CATALOG.length, 16);
});

test('legacy configuration remains usable and publishable keys only use apikey', async () => {
  let headers;
  const context = setup({
    window: { PS_CONFIG: { supabase: { url: config.supabaseUrl + '/', anonKey: 'sb_publishable_test' } } },
    fetch: async (_, options) => {
      headers = options.headers;
      return { ok: true, json: async () => [{ ...remote, stock: false, disponibilidad: 'disponible' }] };
    },
  });
  const catalog = await context.window.fetchCatalog();
  assert.equal(headers.apikey, 'sb_publishable_test');
  assert.equal(headers.Authorization, undefined);
  assert.equal(catalog[0].formato, '1 kg');
  assert.equal(catalog[0].disponibilidad, 'agotado');
});

test('invalid, empty, duplicate, unavailable and corrupt responses preserve local data', async () => {
  const invalidBodies = [
    [], null, { error: 'unavailable' }, [null], [remote, null], [remote, remote],
    [{ ...remote, id: undefined }], [{ ...remote, nombre: '' }],
    [{ ...remote, precio: null }], [{ ...remote, precio: -1 }],
    [{ ...remote, precio: 1.5 }], [{ ...remote, precio: Infinity }],
    [{ ...remote, precio: Number.MAX_SAFE_INTEGER + 1 }],
    [{ ...remote, categoria: 'invalid' }], [{ ...remote, unidad_medida: null }],
  ];
  const fetchers = invalidBodies.map((body) => async () => ({ ok: true, json: async () => body }));
  fetchers.push(
    async () => { throw new TypeError('Offline'); },
    async () => ({ ok: false, json: () => assert.fail('HTTP failure should not parse JSON') }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Bad JSON'); } }),
  );
  for (const fetch of fetchers) {
    const context = setup({ fetch });
    assert.equal(await context.window.fetchCatalog(), context.window.PS_CATALOG);
  }
  for (const url of ['not a URL', 'http://example.supabase.co']) {
    const context = setup({
      window: { PS_CONFIG: { ...config, supabaseUrl: url } },
      fetch: () => assert.fail('Invalid URL must not be requested'),
    });
    assert.equal(await context.window.fetchCatalog(), context.window.PS_CATALOG);
  }
});

test('timeout aborts a hanging request or JSON body and clears the timer', async () => {
  for (const hangingBody of [false, true]) {
    let expire, signal, cleared;
    const context = setup({
      setTimeout: (callback, delay) => { assert.equal(delay, 4000); expire = callback; return 123; },
      clearTimeout: (id) => { cleared = id; },
      fetch: async (_, options) => {
        signal = options.signal;
        if (hangingBody) return { ok: true, json: () => new Promise(() => {}) };
        return new Promise(() => {});
      },
    });
    const result = context.window.fetchCatalog();
    expire();
    assert.equal(await result, context.window.PS_CATALOG);
    assert.equal(signal.aborted, true);
    assert.equal(cleared, 123);
  }
});

test('hybrid source publishes one remote event and none when using local fallback', async () => {
  const adapter = fs.readFileSync(path.join(root, 'js/data-source.js'), 'utf8');
  for (const enabled of [false, true]) {
    const events = [];
    const context = setup({
      window: { PS_CONFIG: enabled ? config : {}, dispatchEvent: (event) => events.push(event) },
      CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    });
    await vm.runInContext(adapter, context);
    assert.equal(events.length, enabled ? 1 : 0);
    if (enabled) {
      assert.equal(events[0].type, 'ps:catalogo-remoto');
      assert.equal(events[0].detail[0].id, remote.id);
    }
  }
  assert.doesNotMatch(adapter, /https:\/\/|createClient|import\s/);
});

test('mapped images exist; mismatched, expired and absent assets retain typography', () => {
  const { window } = setup();
  const mapped = window.PS_CATALOG.filter((product) => product.imagen);
  assert.equal(mapped.length, 7);
  for (const product of window.PS_CATALOG) {
    assert.equal(typeof product.imagen, 'string');
    if (product.imagen) {
      assert.equal(fs.existsSync(path.join(root, product.imagen)), true, product.imagen);
      assert.equal(product.imagenReferencial, true);
      assert.ok(fs.statSync(path.join(root, product.imagen)).size < 100000);
    }
  }
  const fallbackIds = ['whey-concentrada-5lb', 'colageno-hidrolizado', 'eaa-bcaa',
    'glutamina', 'aceite-mct', 'barras-keto', 'endulzante-monkfruit', 'vitamina-d3-k2', 'nootropico-focus'];
  for (const id of fallbackIds) assert.equal(window.PS_CATALOG.find((product) => product.id === id).imagen, '');
});
