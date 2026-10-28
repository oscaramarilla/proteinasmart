/* Tramo mayorista del carrito: el precio unitario baja a partir de una
   cantidad, y un tramo que no ahorra o no se puede alcanzar se descarta. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function setup(shippingFee = 0) {
  let saved = null;
  const context = vm.createContext({
    window: { PS_CONFIG: { contacto: { whatsapp: '595985864209' }, checkout: { shippingFee } } },
    localStorage: { getItem() { return saved; }, setItem(_k, v) { saved = v; } },
  });
  for (const file of ['cart.js', 'checkout.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
  }
  return { cart: context.window.PS_CART, checkout: context.window.PS_CHECKOUT, saved: () => saved };
}

// Precio de lista 39.000 y tramo de 30.000 a partir de 6 unidades.
const jerky = { id: 'jerky', nombre: 'Carne seca', formato: '50 g', precio: 39000, mayorista: { desde: 6, precio: 30000 } };
const liso = { id: 'liso', nombre: 'Producto sin tramo', precio: 100000 };

test('abajo del tramo cobra lista; alcanzado cobra mayorista', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: jerky, cantidad: 5 });
  assert.equal(cart.getState().total, 195000, '5 x 39.000');
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'jerky', cantidad: 6 });
  assert.equal(cart.getState().total, 180000, '6 x 30.000: el tramo baja el total aunque suba la cantidad');
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'jerky', cantidad: 10 });
  assert.equal(cart.getState().total, 300000, '10 x 30.000');
});

test('precioUnitario, faltantes y ahorro son coherentes con el total', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: jerky, cantidad: 4 });
  let item = cart.getState().items[0];
  assert.equal(cart.precioUnitario(item), 39000);
  assert.equal(cart.faltanParaMayorista(item), 2);
  assert.equal(cart.ahorroMayorista([item]), 0);
  cart.dispatch({ type: 'ACTUALIZAR_CANTIDAD', id: 'jerky', cantidad: 6 });
  item = cart.getState().items[0];
  assert.equal(cart.precioUnitario(item), 30000);
  assert.equal(cart.faltanParaMayorista(item), 0);
  assert.equal(cart.ahorroMayorista([item]), 54000, '6 x 9.000 de diferencia');
});

test('un tramo invalido se descarta en vez de mostrarse', () => {
  const { cart } = setup();
  const casos = [
    ['sin ahorro', { desde: 6, precio: 39000 }],
    ['mas caro', { desde: 6, precio: 50000 }],
    ['desde 1', { desde: 1, precio: 30000 }],
    ['desde 0', { desde: 0, precio: 30000 }],
    ['arriba del maximo', { desde: 100, precio: 30000 }],
    ['precio 0', { desde: 6, precio: 0 }],
    ['precio negativo', { desde: 6, precio: -1 }],
    ['no entero', { desde: 6.5, precio: 30000 }],
    ['basura', 'mayorista'],
    ['nulo', null],
  ];
  for (const [etiqueta, mayorista] of casos) {
    cart.dispatch({ type: 'LIMPIAR' });
    cart.dispatch({ type: 'AGREGAR', producto: { ...jerky, mayorista }, cantidad: 10 });
    const item = cart.getState().items[0];
    assert.equal(item.mayorista, null, `tramo "${etiqueta}" deberia descartarse`);
    assert.equal(cart.getState().total, 390000, `tramo "${etiqueta}" no debe tocar el total`);
  }
});

test('un producto sin precio no toma tramo, y uno sin tramo no cambia', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: { id: 'x', nombre: 'Sin precio', precio: 0, mayorista: { desde: 2, precio: 1000 } }, cantidad: 5 });
  assert.equal(cart.getState().items[0].mayorista, null, 'sin precio de lista no hay tramo del que descontar');
  assert.equal(cart.getState().total, 0);
  cart.dispatch({ type: 'LIMPIAR' });
  cart.dispatch({ type: 'AGREGAR', producto: liso, cantidad: 7 });
  assert.equal(cart.getState().total, 700000);
  assert.equal(cart.faltanParaMayorista(cart.getState().items[0]), 0);
});

test('el tramo sobrevive la persistencia y llega al mensaje de WhatsApp', () => {
  const primero = setup();
  primero.cart.dispatch({ type: 'AGREGAR', producto: jerky, cantidad: 6 });
  const persistido = primero.saved();

  const segundo = setup();
  const context = vm.createContext({
    window: { PS_CONFIG: { contacto: { whatsapp: '595985864209' }, checkout: { shippingFee: 0 } } },
    localStorage: { getItem() { return persistido; }, setItem() {} },
  });
  for (const file of ['cart.js', 'checkout.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
  }
  const recargado = context.window.PS_CART.getState();
  assert.equal(recargado.items[0].mayorista.desde, 6, 'el tramo tiene que sobrevivir la recarga');
  assert.equal(recargado.total, 180000, 'y seguir aplicandose despues de recargar');

  const url = new URL(segundo.checkout.whatsappURL(recargado.items, {}));
  const texto = url.searchParams.get('text');
  assert.match(texto, /180\.000/, 'el mensaje tiene que llevar el total con el tramo aplicado');
});

test('el total del carrito mezcla items con y sin tramo', () => {
  const { cart } = setup();
  cart.dispatch({ type: 'AGREGAR', producto: jerky, cantidad: 6 });
  cart.dispatch({ type: 'AGREGAR', producto: liso, cantidad: 1 });
  assert.equal(cart.getState().total, 280000, '6 x 30.000 + 1 x 100.000');
  assert.equal(cart.ahorroMayorista(cart.getState().items), 54000);
});
