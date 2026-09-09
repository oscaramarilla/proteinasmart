const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'js/catalog.js'), 'utf8'), context);
const CATALOGO = context.window.PS_CATALOG;

test('exactamente 7 productos tienen imagen verificada, con archivo real en disco', () => {
  const conImagen = CATALOGO.filter((p) => p.imagen);
  assert.equal(conImagen.length, 7);
  for (const producto of conImagen) {
    assert.equal(producto.verificado.imagen, true, producto.id + ' deberia estar marcado verificado.imagen');
    assert.match(producto.imagen, /^images\//, producto.id + ' debe apuntar a la carpeta images/');
    const ruta = path.join(root, producto.imagen);
    assert.ok(fs.existsSync(ruta), producto.imagen + ' no existe en disco');
    assert.ok(fs.statSync(ruta).size < 100000, producto.imagen + ' deberia pesar menos de 100 KB');
  }
});

test('los productos con discrepancia entre foto y ficha quedan sin imagen y sin verificar', () => {
  const sinImagen = [
    'whey-concentrada-5lb', 'colageno-hidrolizado', 'eaa-bcaa', 'glutamina',
    'aceite-mct', 'barras-keto', 'endulzante-monkfruit', 'vitamina-d3-k2', 'nootropico-focus',
  ];
  for (const id of sinImagen) {
    const producto = CATALOGO.find((p) => p.id === id);
    assert.ok(producto, id + ' deberia existir en el catalogo');
    assert.equal(producto.imagen, '');
    assert.equal(producto.verificado.imagen, false);
  }
});

test('las 7 imagenes verificadas cumplen el patron que main.js exige para renderizar <img>', () => {
  // Misma condicion que cardHTML() en js/main.js: no se re-ejecuta el DOM
  // completo del sitio, se verifica que los datos satisfacen su gate.
  const patronMainJs = /^(https:\/\/|\.?\/?(?:assets|images|img)\/)/;
  for (const producto of CATALOGO.filter((p) => p.verificado.imagen)) {
    assert.ok(patronMainJs.test(producto.imagen), producto.id + ': ' + producto.imagen + ' no matchea el patron de cardHTML');
  }
  for (const producto of CATALOGO.filter((p) => !p.verificado.imagen)) {
    assert.equal(producto.imagen, '', producto.id + ' no deberia tener imagen sin estar verificado');
  }
});
