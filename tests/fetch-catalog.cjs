const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/data-source.js'), 'utf8');

const filaRemota = {
  id: 77, nombre: 'Proteína remota', unidad_medida: '1 kg',
  precio: 250000, categoria: 'proteinas', objetivos: ['masa'],
};
const CREDENCIALES = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'test-anon-key' };
const CATALOGO_LOCAL = [{ id: 'local-1', nombre: 'Local' }];

function montar(overrides = {}) {
  const eventos = [];
  const context = vm.createContext({
    window: {
      PS_CONFIG: overrides.config ?? CREDENCIALES,
      PS_CATALOG: CATALOGO_LOCAL,
      dispatchEvent: (event) => eventos.push(event),
    },
    URL, AbortController, setTimeout, clearTimeout,
    CustomEvent: class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } },
    fetch: overrides.fetch ?? (async () => ({ ok: true, json: async () => [filaRemota] })),
  });
  vm.runInContext(source, context);
  return { window: context.window, eventos };
}

test('sin credenciales (flat o anidado) usa el catalogo local sin red', async () => {
  for (const config of [undefined, {}, { supabaseUrl: CREDENCIALES.supabaseUrl }, { supabase: { url: '', anonKey: '' } }]) {
    const { window } = montar({ config, fetch: () => assert.fail('no deberia pedir red') });
    assert.equal(await window.fetchCatalog(), window.PS_CATALOG);
  }
});

test('config anidada legacy (PS_CONFIG.supabase.url/anonKey) sigue funcionando', async () => {
  let headers;
  const { window } = montar({
    config: { supabase: { url: CREDENCIALES.supabaseUrl, anonKey: 'legacy-anon' } },
    fetch: async (_url, options) => { headers = options.headers; return { ok: true, json: async () => [filaRemota] }; },
  });
  const catalogo = await window.fetchCatalog();
  assert.equal(headers.apikey, 'legacy-anon');
  assert.equal(headers.Authorization, 'Bearer legacy-anon');
  assert.notEqual(catalogo, window.PS_CATALOG);
});

test('sb_publishable_ solo manda apikey; la anon key legacy manda apikey + Bearer', async () => {
  let headersPublishable, headersLegacy;
  await montar({
    config: { supabaseUrl: CREDENCIALES.supabaseUrl, supabaseAnonKey: 'sb_publishable_abc' },
    fetch: async (_u, o) => { headersPublishable = o.headers; return { ok: true, json: async () => [filaRemota] }; },
  }).window.fetchCatalog();
  await montar({
    fetch: async (_u, o) => { headersLegacy = o.headers; return { ok: true, json: async () => [filaRemota] }; },
  }).window.fetchCatalog();
  assert.equal(headersPublishable.apikey, 'sb_publishable_abc');
  assert.equal(headersPublishable.Authorization, undefined);
  assert.equal(headersLegacy.apikey, CREDENCIALES.supabaseAnonKey);
  assert.equal(headersLegacy.Authorization, 'Bearer ' + CREDENCIALES.supabaseAnonKey);
});

test('la request va a /rest/v1/productos con select y orden por nombre', async () => {
  let urlPedida;
  await montar({ fetch: async (url) => { urlPedida = url; return { ok: true, json: async () => [filaRemota] }; } }).window.fetchCatalog();
  assert.equal(urlPedida, 'https://example.supabase.co/rest/v1/productos?select=*&order=nombre.asc');
});

test('normaliza una fila valida al contrato de PS_CATALOG', async () => {
  const { window } = montar({ fetch: async () => ({ ok: true, json: async () => [filaRemota] }) });
  const catalogo = await window.fetchCatalog();
  assert.equal(catalogo[0].id, '77');
  assert.equal(catalogo[0].nombre, 'Proteína remota');
  assert.equal(catalogo[0].formato, '1 kg');
  assert.equal(catalogo[0].precio, 250000);
  assert.equal(catalogo[0].categoria, 'proteinas');
  assert.deepEqual(catalogo[0].objetivos, ['masa']);
  assert.equal(catalogo[0].stock, null);
  // deepEqual entre un objeto creado dentro del vm.Context (otro realm) y
  // uno del realm del test puede fallar por prototipo aunque luzcan iguales;
  // se compara por contenido en vez de por referencia/prototipo.
  assert.equal(Object.keys(catalogo[0].verificado).length, 0);
});

test('una fila invalida entre varias no descarta las filas validas del mismo response', async () => {
  const { window } = montar({ fetch: async () => ({ ok: true, json: async () => [filaRemota, null] }) });
  const catalogo = await window.fetchCatalog();
  assert.equal(catalogo.length, 1);
  assert.equal(catalogo[0].id, '77');
});

test('URL invalida o no-https no dispara ninguna request', async () => {
  for (const url of ['no es una url', 'http://example.supabase.co']) {
    const { window } = montar({ config: { supabaseUrl: url, supabaseAnonKey: 'x' }, fetch: () => assert.fail('no deberia pedir red') });
    assert.equal(await window.fetchCatalog(), window.PS_CATALOG);
  }
});

test('respuestas invalidas, vacias, corruptas o con filas invalidas conservan el catalogo local', async () => {
  const cuerpos = [
    [], null, { error: 'no disponible' }, [null],
    [{ ...filaRemota, id: undefined }], [{ ...filaRemota, nombre: '' }],
    [{ ...filaRemota, precio: null }], [{ ...filaRemota, precio: -1 }],
    [{ ...filaRemota, precio: 1.5 }], [{ ...filaRemota, precio: Infinity }],
    [{ ...filaRemota, precio: Number.MAX_SAFE_INTEGER + 1 }],
  ];
  for (const body of cuerpos) {
    const { window } = montar({ fetch: async () => ({ ok: true, json: async () => body }) });
    assert.equal(await window.fetchCatalog(), window.PS_CATALOG);
  }
  const { window: w1 } = montar({ fetch: async () => { throw new TypeError('offline'); } });
  assert.equal(await w1.fetchCatalog(), w1.PS_CATALOG);
  const { window: w2 } = montar({ fetch: async () => ({ ok: false, json: () => assert.fail('no deberia leer el body si !ok') }) });
  assert.equal(await w2.fetchCatalog(), w2.PS_CATALOG);
  const { window: w3 } = montar({ fetch: async () => ({ ok: true, json: async () => { throw new SyntaxError('json invalido'); } }) });
  assert.equal(await w3.fetchCatalog(), w3.PS_CATALOG);
});

test('filas duplicadas por id se deduplican', async () => {
  const { window } = montar({ fetch: async () => ({ ok: true, json: async () => [filaRemota, { ...filaRemota }] }) });
  const catalogo = await window.fetchCatalog();
  assert.equal(catalogo.length, 1);
});

test('un request colgado se aborta a los 4000 ms y limpia el timer', async () => {
  let expirar, señal, limpiado;
  const context = vm.createContext({
    window: { PS_CONFIG: CREDENCIALES, PS_CATALOG: CATALOGO_LOCAL, dispatchEvent: () => {} },
    URL, AbortController, CustomEvent: class {},
    setTimeout: (cb, ms) => { assert.equal(ms, 4000); expirar = cb; return 99; },
    clearTimeout: (id) => { limpiado = id; },
    fetch: (_url, options) => {
      señal = options.signal;
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('AbortError')));
      });
    },
  });
  vm.runInContext(source, context);
  const resultado = context.window.fetchCatalog();
  expirar();
  assert.equal(await resultado, context.window.PS_CATALOG);
  assert.equal(señal.aborted, true);
  assert.equal(limpiado, 99);
});

test('fuente hibrida publica ps:catalogo-remoto solo cuando hay catalogo remoto real', async () => {
  const conCredenciales = montar({ fetch: async () => ({ ok: true, json: async () => [filaRemota] }) });
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(conCredenciales.eventos.length, 1);
  assert.equal(conCredenciales.eventos[0].type, 'ps:catalogo-remoto');
  assert.equal(conCredenciales.eventos[0].detail[0].id, '77');

  const sinCredenciales = montar({ config: {}, fetch: () => assert.fail('no deberia pedir red') });
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(sinCredenciales.eventos.length, 0);
});

test('no depende de ninguna libreria externa ni import remoto', () => {
  assert.doesNotMatch(source, /import\s|createClient|cdn\.jsdelivr|unpkg\.com/);
});
