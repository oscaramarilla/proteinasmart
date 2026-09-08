const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup(raw = null, blocked = false, shippingFee = null) {
  let saved = raw;
  const context = vm.createContext({ window: { PS_CONFIG: { contacto: { whatsapp: '595985864209' }, checkout: { shippingFee } } }, localStorage: {
    getItem() { if (blocked) throw Error('blocked'); return saved; },
    setItem(_key, value) { if (blocked) throw Error('blocked'); saved = value; },
  } });
  for (const file of ['cart.js', 'checkout.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
  return { cart: context.window.PS_CART, checkout: context.window.PS_CHECKOUT, saved: () => saved };
}
const whey = { id: 'whey', nombre: 'Proteína & cacao', formato: '2 lb', precio: 330000 };
const creatine = { id: 'creatina', nombre: 'Creatina', precio: 235000 };
test('add, increment, decrement, remove and immutable snapshots', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: whey });
  const before = cart.getState();
  cart.dispatch({ type: 'AGREGAR', producto: whey });
  cart.dispatch({ type: 'AGREGAR', producto: creatine });
  assert.equal(cart.getState().total, 895000);
  assert.equal(before.items[0].cantidad, 1);
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'whey', cantidad: 1 });
  assert.equal(cart.getState().total, 565000);
  cart.dispatch({ type: 'ELIMINAR', id: 'creatina' });
  assert.equal(cart.getState().total, 330000);
  cart.dispatch({ type: 'ELIMINAR', id: 'whey' });
  assert.equal(cart.getState().items.length, 0);
});
test('WhatsApp quote and reload preserve selection; shipping unknown is not free', () => {
  const { cart, checkout, saved } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: whey, cantidad: 2 });
  const before = saved();
  const url = new URL(checkout.whatsappURL(cart.getState().items));
  assert.equal(url.pathname, '/595985864209');
  assert.match(url.searchParams.get('text'), /2 × Proteína & cacao/);
  assert.match(url.searchParams.get('text'), /Gs 660\.000/);
  assert.match(url.searchParams.get('text'), /Envío a confirmar/);
  assert.equal(checkout.quote(cart.getState().items).total, null);
  assert.equal(saved(), before);
  assert.equal(setup(saved()).cart.getState().total, 660000);
});
test('unpriced items do not imply a complete subtotal or free product', () => {
  const { cart, checkout } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: { ...whey, precio: 0 } });
  const quote = checkout.quote(cart.getState().items);
  assert.equal(quote.hasUnpricedItems, true);
  assert.equal(quote.total, null);
  assert.match(decodeURIComponent(checkout.whatsappURL(cart.getState().items)), /Precio a confirmar/);
});
test('configured shipping and explicit zero are distinct from unknown', () => {
  assert.equal(setup(null, false, 20000).checkout.quote([whey]).shippingLabel, 'Envío: Gs 20.000');
  assert.equal(setup(null, false, 0).checkout.quote([]).shippingFee, 0);
  assert.equal(setup(null, false, -1).checkout.quote([]).shippingFee, null);
});
test('invalid storage and blocked storage do not break cart', () => {
  for (const raw of ['invalid', '{}', '[null,{},42]', '[]']) assert.equal(setup(raw).cart.getState().total, 0);
  const { cart } = setup(null, true);
  cart.dispatch({ type: 'AGREGAR', producto: whey });
  assert.equal(cart.getState().total, 330000);
});
test('quantity bounds, invalid actions and persisted rows are normalized', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: whey, cantidad: Infinity });
  assert.equal(cart.getState().items[0].cantidad, 99);
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'whey', cantidad: NaN });
  assert.equal(cart.getState().items[0].cantidad, 99);
  const restored = setup(JSON.stringify([{ ...whey, precio: -5, cantidad: -3 }])).cart.getState();
  assert.equal(restored.items[0].cantidad, 1);
  assert.equal(restored.total, 0);
});
test('empty cart has no WhatsApp destination and Bancard fails closed', () => {
  const { checkout } = setup();
  assert.equal(checkout.whatsappURL([]), null);
  assert.equal(checkout.providers.bancard.enabled, false);
  assert.throws(() => checkout.providers.bancard.createPayment(), /no está habilitado/);
});

test('verified brand and flavor survive persistence, unverified metadata stays hidden', () => {
  const { cart, saved } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: { ...whey, marca: 'Test fixture', sabor: 'Test flavor', verificado: { marca: true, sabor: true } } });
  const restored = setup(saved()).cart.getState().items[0];
  assert.equal(restored.marca, 'Test fixture');
  assert.equal(restored.sabor, 'Test flavor');
  cart.dispatch({ type: 'AGREGAR', producto: { ...creatine, marca: 'Unverified' } });
  assert.equal(cart.getState().items[1].marca, '');
});
