/* =========================================================
   Exportador de catálogo para Sana Life PY (encomshop)
   Lee js/catalog.js (fuente única) y emite:
     - docs/sana-life-py/catalogo-import.csv  (carga a la tienda)
     - tabla de revisión por consola

   Desde la revisión de octubre de 2026, js/catalog.js ya guarda el PRECIO
   FINAL con el envío incluido, así que el recargo por defecto es 0 — volver
   a sumar 30000 acá duplicaría el traslado. El parámetro queda para el caso
   de querer un margen distinto en este canal.
     node scripts/sana-life-export.mjs            # sin recargo extra
     node scripts/sana-life-export.mjs 15000      # 15000 extra por unidad
   ========================================================= */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const RECARGO = Number.parseInt(process.argv[2] ?? '0', 10);
if (!Number.isInteger(RECARGO) || RECARGO < 0) {
  throw new Error('El recargo tiene que ser un entero de guaraníes (ej: 30000).');
}

/* Base pública de las imágenes del catálogo actual. Hotlink: sirve para
   publicar rápido, conviene re-subir los archivos a la tienda destino. */
const IMG_BASE = 'https://www.proteinasmart.com/images/';

/* Sin comparable paraguayo. En octubre de 2026 glutamina y nootrópico
   consiguieron uno (ver el comentario de js/catalog.js) y salieron de esta
   lista; estos tres siguen anclados contra el propio catálogo. En los cinco
   falta el costo del proveedor. */
const PRECIO_ESTIMADO = new Set([
  'barras-keto', 'sustituto-comida', 'endulzante-monkfruit',
]);

/* Imágenes cuya etiqueta visible no coincide con la ficha (ver images/README.md).
   Las dos primeras traen precio impreso distinto en el envase. */
const IMAGEN_CON_PRECIO_IMPRESO = new Set(['vitamina-d3-k2', 'nootropico-focus']);

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(resolve(root, 'js/catalog.js'), 'utf8'), sandbox);
const catalogo = sandbox.window.PS_CATALOG;
if (!Array.isArray(catalogo) || catalogo.length === 0) {
  throw new Error('No se pudo leer window.PS_CATALOG desde js/catalog.js');
}

const CATEGORIAS = Object.fromEntries(
  sandbox.window.PS_CATEGORIAS.map((c) => [c.id, c.nombre]),
);
const OBJETIVOS = Object.fromEntries(
  sandbox.window.PS_OBJETIVOS.map((o) => [o.id, o.nombre]),
);

const gs = (n) => 'Gs ' + n.toLocaleString('es-PY').replaceAll(',', '.');

const filas = catalogo.map((p) => {
  const precioFinal = p.precio > 0 ? p.precio + RECARGO : 0;
  const antesFinal = p.precioAntes > 0 ? p.precioAntes + RECARGO : 0;
  return {
    sku: p.id,
    nombre: p.nombre,
    categoria: CATEGORIAS[p.categoria] ?? p.categoria,
    formato: p.formato,
    precioBase: p.precio,
    precioFinal,
    antesFinal,
    recargoPct: p.precio > 0 ? (RECARGO / p.precio) * 100 : null,
    resumen: p.resumen,
    protocolo: p.protocolo ?? '',
    complemento: p.complemento ?? '',
    objetivos: (p.objetivos ?? []).map((o) => OBJETIVOS[o] ?? o).join(' | '),
    imagen: p.imagen ? IMG_BASE + p.imagen.replace(/^images\//, '') : '',
    stock: p.stock === true ? 'si' : p.stock === false ? 'no' : 'a confirmar',
    estimado: PRECIO_ESTIMADO.has(p.id),
    precioImpreso: IMAGEN_CON_PRECIO_IMPRESO.has(p.id),
  };
});

/* ---- CSV (columnas genéricas: sirven para WooCommerce/Shopify y para
   cargar a mano en el panel de la tienda) ---- */
const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
};
const COLUMNAS = [
  'SKU', 'Nombre', 'Categoria', 'Formato', 'Precio_PYG', 'Precio_anterior_PYG',
  'Descripcion_corta', 'Protocolo', 'Complemento_sugerido', 'Objetivos',
  'Imagen_URL', 'Stock', 'Precio_a_validar',
];
const csv = [
  COLUMNAS.join(','),
  ...filas.map((f) => [
    f.sku, f.nombre, f.categoria, f.formato,
    f.precioFinal || '', f.antesFinal || '',
    f.resumen, f.protocolo, f.complemento, f.objetivos,
    f.imagen, f.stock, f.estimado ? 'SI' : 'no',
  ].map(esc).join(',')),
].join('\n') + '\n';

const destino = resolve(root, 'docs/sana-life-py/catalogo-import.csv');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, csv, 'utf8');

/* ---- Tabla de revisión ---- */
const w = [26, 34, 13, 13, 8];
const pad = (s, n) => String(s).padEnd(n).slice(0, n);
console.log(`\nRecargo aplicado: ${gs(RECARGO)} por unidad\n`);
console.log([pad('SKU', w[0]), pad('Producto', w[1]), pad('Base', w[2]), pad('Publicar', w[3]), pad('Recargo', w[4])].join(' '));
console.log('-'.repeat(w.reduce((a, b) => a + b + 1, 0)));
for (const f of filas) {
  console.log([
    pad(f.sku, w[0]), pad(f.nombre, w[1]),
    pad(gs(f.precioBase), w[2]), pad(gs(f.precioFinal), w[3]),
    pad(f.recargoPct.toFixed(1) + '%', w[4]),
    f.estimado ? '· precio estimado' : '',
    f.precioImpreso ? '· foto con precio impreso distinto' : '',
    f.imagen ? '' : '· SIN FOTO',
  ].join(' ').trimEnd());
}

const pcts = filas.map((f) => f.recargoPct);
console.log(`\nProductos: ${filas.length}`);
console.log(`Recargo relativo: min ${Math.min(...pcts).toFixed(1)}% · max ${Math.max(...pcts).toFixed(1)}%`);
console.log(`Sin foto: ${filas.filter((f) => !f.imagen).length} · precio estimado: ${filas.filter((f) => f.estimado).length}`);
console.log(`\nCSV: ${destino}\n`);
