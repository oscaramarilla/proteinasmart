const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const catalogContext = vm.createContext({ window: {} });
vm.runInContext(read('js/catalog.js'), catalogContext);
const CATALOGO_REAL = catalogContext.window.PS_CATALOG;

// Corre solo la seccion de generacion de schema de main.js (SITIO_URL,
// productoSchema, renderSchemaProductos), con un CATALOG y un <script>
// mock inyectados -- no levanta el resto del sitio (nav, carrito, forms).
function montarSchema(catalog) {
  const scriptNode = { textContent: '' };
  const context = vm.createContext({
    CATALOG: catalog,
    $: (selector) => (selector === '#productSchema' ? scriptNode : null),
  });
  const source = read('js/main.js');
  const start = source.indexOf('  const SITIO_URL =');
  const end = source.indexOf('  function renderCatalogo(');
  assert.ok(start >= 0 && end > start, 'la seccion de schema de producto debe existir en main.js');
  vm.runInContext(source.slice(start, end) + '\n  this.renderSchemaProductos = renderSchemaProductos;\n  this.productoSchema = productoSchema;', context);
  context.renderSchemaProductos();
  return { nodos: JSON.parse(scriptNode.textContent), productoSchema: context.productoSchema };
}

test('genera un nodo Product por cada producto del catalogo real, sin lista duplicada a mano', () => {
  const { nodos } = montarSchema(CATALOGO_REAL);
  assert.equal(nodos.length, CATALOGO_REAL.length);
});

test('cada nodo tiene los campos minimos que schema.org exige para Product', () => {
  const { nodos } = montarSchema(CATALOGO_REAL);
  for (const nodo of nodos) {
    assert.equal(nodo['@context'], 'https://schema.org');
    assert.equal(nodo['@type'], 'Product');
    assert.equal(typeof nodo.name, 'string');
    assert.ok(nodo.name.length > 0);
    assert.equal(nodo.offers['@type'], 'Offer');
    assert.equal(typeof nodo.offers.price, 'number');
    assert.equal(nodo.offers.priceCurrency, 'PYG');
    assert.equal(typeof nodo.offers.url, 'string');
  }
});

test('el precio es el valor numerico sin "Gs" ni puntos de miles', () => {
  const { productoSchema } = montarSchema(CATALOGO_REAL);
  const nodo = productoSchema({ id: 'x', nombre: 'Producto', precio: 330000 });
  assert.equal(nodo.offers.price, 330000);
  assert.doesNotMatch(JSON.stringify(nodo.offers.price), /Gs|\./);
});

test('description se omite cuando el producto no tiene resumen', () => {
  const { productoSchema } = montarSchema(CATALOGO_REAL);
  assert.equal(productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, resumen: 'Beneficio concreto.' }).description, 'Beneficio concreto.');
  const sinResumen = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000 });
  assert.equal('description' in sinResumen, false);
});

test('image se omite si no hay imagen verificada; nunca rellena con placeholder', () => {
  const { productoSchema } = montarSchema(CATALOGO_REAL);
  const sinImagen = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, imagen: '', verificado: { imagen: false } });
  assert.equal('image' in sinImagen, false);
  const conImagenNoVerificada = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, imagen: 'images/foo.webp', verificado: { imagen: false } });
  assert.equal('image' in conImagenNoVerificada, false);
  const conImagenVerificada = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, imagen: 'images/foo.webp', verificado: { imagen: true } });
  assert.equal(conImagenVerificada.image, 'https://www.proteinasmart.com/images/foo.webp');
});

test('availability se omite sin stock verificado; solo declara InStock/OutOfStock con verificado.stock', () => {
  const { productoSchema } = montarSchema(CATALOGO_REAL);
  const sinVerificar = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, stock: true, verificado: {} });
  assert.equal('availability' in sinVerificar.offers, false);
  const disponible = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, stock: true, verificado: { stock: true } });
  assert.equal(disponible.offers.availability, 'https://schema.org/InStock');
  const agotado = productoSchema({ id: 'x', nombre: 'Producto', precio: 1000, stock: false, verificado: { stock: true } });
  assert.equal(agotado.offers.availability, 'https://schema.org/OutOfStock');
});

test('ningun producto del catalogo real tiene availability hoy (stock nunca verificado todavia)', () => {
  const { nodos } = montarSchema(CATALOGO_REAL);
  for (const nodo of nodos) assert.equal('availability' in nodo.offers, false);
});

test('url apunta al ancla del producto en la home (id="producto-<id>" ya presente en cardHTML)', () => {
  const { nodos } = montarSchema(CATALOGO_REAL);
  for (let i = 0; i < nodos.length; i++) {
    assert.equal(nodos[i].offers.url, 'https://www.proteinasmart.com/#producto-' + CATALOGO_REAL[i].id);
  }
  assert.match(read('js/main.js'), /id="producto-'\s*\+\s*escapeHTML\(p\.id\)/);
});

test('cada nodo generado es JSON valido de punta a punta (JSON.stringify + JSON.parse)', () => {
  const { nodos } = montarSchema(CATALOGO_REAL);
  for (const nodo of nodos) assert.deepEqual(JSON.parse(JSON.stringify(nodo)), nodo);
});
