/* Combos: el precio sale de la suma de los componentes y un combo con un
   componente roto no se publica. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const fuente = fs.readFileSync(path.join(__dirname, '../js/catalog.js'), 'utf8');

function cargar(src = fuente) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(src, context);
  return context.window;
}

const { PS_CATALOG, PS_COMBOS } = cargar();

test('cada combo cuesta exactamente la suma de sus componentes', () => {
  assert.ok(PS_COMBOS.length > 0, 'tiene que haber combos publicados');
  for (const combo of PS_COMBOS) {
    const suma = combo.items.reduce((total, item) => total + item.precio, 0);
    assert.equal(combo.precio, suma, `${combo.nombre}: precio distinto de la suma`);
  }
});

test('todo componente de un combo existe en el catalogo y tiene precio', () => {
  for (const combo of PS_COMBOS) {
    assert.ok(combo.items.length >= 2, `${combo.nombre}: un combo de un solo producto no es un combo`);
    for (const item of combo.items) {
      assert.ok(PS_CATALOG.some((p) => p.id === item.id), `${combo.nombre}: ${item.id} no esta en el catalogo`);
      assert.ok(item.precio > 0, `${combo.nombre}: ${item.id} sin precio`);
    }
  }
});

test('los combos no tienen ids ni componentes repetidos', () => {
  const ids = PS_COMBOS.map((combo) => combo.id);
  assert.equal(new Set(ids).size, ids.length, 'hay ids de combo repetidos');
  for (const combo of PS_COMBOS) {
    const componentes = combo.items.map((item) => item.id);
    assert.equal(new Set(componentes).size, componentes.length, `${combo.nombre}: componente repetido`);
  }
});

test('un combo con un componente inexistente no se publica', () => {
  const roto = fuente.replace("'creatina-mono', 'eaa-bcaa'", "'creatina-mono', 'producto-que-no-existe'");
  assert.notEqual(roto, fuente, 'el reemplazo de prueba no encontro el componente');
  const { PS_COMBOS: combos } = cargar(roto);
  assert.ok(!combos.some((combo) => combo.id === 'smart-muscle'), 'smart-muscle deberia caerse entero');
  assert.ok(combos.some((combo) => combo.id === 'smart-cut'), 'los demas combos no deberian verse afectados');
});

test('un combo con un componente sin precio no se publica', () => {
  // El endulzante es componente de Smart Feeding: si queda en 0 ("consultar"),
  // el combo no puede publicar un precio.
  const roto = fuente.replace(/(id: 'endulzante-monkfruit',[\s\S]{0,400}?precio: )\d+/, '$10');
  assert.notEqual(roto, fuente, 'el reemplazo de prueba no encontro el precio');
  const { PS_COMBOS: combos } = cargar(roto);
  assert.ok(!combos.some((combo) => combo.id === 'smart-feeding'), 'smart-feeding deberia caerse');
});

test('marca declarada y marca verificada van siempre juntas', () => {
  // Invariante: los productos de reventa son los unicos con marca, y en
  // ellos la marca es el dato que se anuncia, asi que va verificada. El
  // catalogo propio no tiene marca y por lo tanto no la verifica. No se
  // admite ninguna de las dos combinaciones intermedias.
  const conMarca = PS_CATALOG.filter((p) => p.marca);
  assert.ok(conMarca.length > 0, 'tiene que haber productos de reventa');
  for (const producto of conMarca) {
    assert.equal(producto.verificado.marca, true, `${producto.id}: declara marca pero no la verifica`);
    assert.ok(producto.precio > 0, `${producto.id}: sin precio`);
  }
  for (const producto of PS_CATALOG.filter((p) => !p.marca)) {
    assert.equal(producto.verificado.marca, false, `${producto.id}: verifica una marca que no declara`);
  }
});

test('ningun producto declara stock verificado: no hay inventario propio', () => {
  // Respalda el invariante de schema-productos.cjs (nunca se publica
  // availability): si algun dia se activa, que sea una decision explicita
  // y no un descuido al cargar un producto nuevo.
  for (const producto of PS_CATALOG) {
    assert.equal(producto.verificado.stock, false, `${producto.id}: declara stock verificado`);
  }
});

test('el combo con co-marca la declara y usa productos de esa marca', () => {
  const conComarca = PS_COMBOS.filter((combo) => combo.coMarca);
  assert.ok(conComarca.length > 0, 'Smart Feeding tiene que declarar la co-marca');
  for (const combo of conComarca) {
    assert.ok(
      combo.items.some((item) => item.marca === combo.coMarca),
      `${combo.nombre}: anuncia ${combo.coMarca} pero no incluye ningun producto de esa marca`,
    );
  }
});
