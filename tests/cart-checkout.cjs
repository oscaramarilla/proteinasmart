const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = (name) => fs.readFileSync(path.join(__dirname, '..', 'js', name), 'utf8');

test('cart quantities, removal, invalid values and persistence', () => {
  let saved;
  const context = vm.createContext({ window: {}, localStorage: {
    getItem: () => saved, setItem: (_, value) => { saved = value; },
  } });
  vm.runInContext(read('catalog.js') + read('cart.js'), context);
  const cart = context.window.PS_CART;
  const catalog = context.window.PS_CATALOG;
  for (const id of ['whey-isolate-2lb', 'creatina-mono']) {
    cart.dispatch({ type: 'AGREGAR', producto: catalog.find((p) => p.id === id) });
  }
  assert.equal(cart.getState().total, 565000);
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'whey-isolate-2lb', cantidad: 2 });
  assert.equal(cart.getState().total, 895000);
  for (const cantidad of [NaN, Infinity, 1.5]) {
    cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'whey-isolate-2lb', cantidad });
    assert.equal(cart.getState().total, 895000);
  }
  vm.runInContext(read('cart.js'), context);
  assert.equal(context.window.PS_CART.getState().total, 895000);
  cart.dispatch({ type: 'ELIMINAR', id: 'creatina-mono' });
  assert.equal(cart.getState().total, 660000);
  cart.dispatch({ type: 'ELIMINAR', id: 'whey-isolate-2lb' });
  assert.equal(cart.getState().items.length, 0);
});

test('WhatsApp draft contains only selected products and distinguishes shipping', () => {
  const source = read('main.js');
  const fn = source.slice(source.indexOf('  function waCarrito('), source.indexOf('  function renderCarrito('));
  const context = vm.createContext({ waLink: (text) => text, money: (n) => String(n) });
  vm.runInContext(fn, context);
  const items = [
    { nombre: 'Whey', formato: '2 lb', precio: 330000, cantidad: 1 },
    { nombre: 'Creatina', formato: '300 g', precio: 235000, cantidad: 1 },
  ];
  const draft = context.waCarrito(items, 565000);
  assert.match(draft, /1x Whey/);
  assert.match(draft, /1x Creatina/);
  assert.match(draft, /referencial.*565000/);
  assert.match(draft, /No incluido en el subtotal/);
  assert.match(draft, /Total final: pendiente/);
  assert.doesNotMatch(draft, /5 g|EAA|30 d/);
  assert.match(context.waCarrito([{ ...items[0], precio: 0 }], 0), /subtotal es parcial/);
  assert.ok(!source.includes("new CustomEvent('ps:pedido'"));
  assert.ok(!source.includes("type: 'LIMPIAR'"));
});
