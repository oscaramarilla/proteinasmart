import { revalidatePath } from 'next/cache';
import { supabaseAdminRequest } from '../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Pedido = {
  id: string;
  items_json: unknown;
};

type PedidoItem = {
  proveedor: string;
  producto?: string;
  nombre?: string;
  cantidad: number;
  unidad?: string;
  unidad_medida?: string;
};

type CompraConsolidada = {
  proveedor: string;
  producto: string;
  cantidad: number;
  unidad: string;
  pedidoIds: string[];
};

type ComprasPorProveedor = Record<
  string,
  Record<string, CompraConsolidada>
>;

type InteresProducto = { product_id: string };
type ProductoInteres = { id: string; nombre: string };

async function obtenerPedidosPendientes(): Promise<Pedido[]> {
  // Join a delivery_details: orders es la tabla viva (pedidos_whatsapp
  // quedó deprecada, ver supabase/migrations/20260908_metodos_entrega.sql).
  // compra_realizada es independiente de estado: un pedido puede estar
  // 'entregado' y seguir necesitando reposición. Se excluyen los
  // cancelados porque esos no van a comprarse.
  return supabaseAdminRequest<Pedido[]>(
    'orders?select=id,items_json,delivery_details(city,address,courier_company_id)&compra_realizada=eq.false&estado=neq.cancelado',
  );
}

function leerItems(value: unknown): PedidoItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is PedidoItem => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const posibleItem = item as Partial<PedidoItem>;
    return (
      typeof posibleItem.proveedor === 'string' &&
      typeof posibleItem.cantidad === 'number' &&
      (typeof posibleItem.producto === 'string' ||
        typeof posibleItem.nombre === 'string')
    );
  });
}

function consolidarCompras(pedidos: Pedido[]): CompraConsolidada[] {
  const porProveedor = pedidos.reduce<ComprasPorProveedor>(
    (acumulado, pedido) => {
      leerItems(pedido.items_json).forEach((item) => {
        const proveedor = item.proveedor.trim();
        const producto = (item.producto ?? item.nombre ?? '').trim();
        const unidad = (item.unidad ?? item.unidad_medida ?? 'unidad').trim();
        const claveProducto = `${producto.toLocaleLowerCase()}::${unidad.toLocaleLowerCase()}`;

        if (!proveedor || !producto || item.cantidad <= 0) {
          return;
        }

        acumulado[proveedor] ??= {};
        acumulado[proveedor][claveProducto] ??= {
          proveedor,
          producto,
          cantidad: 0,
          unidad,
          pedidoIds: [],
        };

        const compra = acumulado[proveedor][claveProducto];
        compra.cantidad += item.cantidad;

        if (!compra.pedidoIds.includes(pedido.id)) {
          compra.pedidoIds.push(pedido.id);
        }
      });

      return acumulado;
    },
    {},
  );

  return Object.values(porProveedor)
    .flatMap((productos) => Object.values(productos))
    .sort((a, b) =>
      `${a.proveedor} ${a.producto}`.localeCompare(`${b.proveedor} ${b.producto}`),
    );
}

function formatearCantidad(cantidad: number) {
  return new Intl.NumberFormat('es-PY', {
    maximumFractionDigits: 2,
  }).format(cantidad);
}

async function obtenerRankingIntereses() {
  const [intereses, productos] = await Promise.all([
    supabaseAdminRequest<InteresProducto[]>('product_interest?select=product_id'),
    supabaseAdminRequest<ProductoInteres[]>('productos?select=id,nombre'),
  ]);
  const nombres = new Map(productos.map((producto) => [producto.id, producto.nombre]));
  const conteos = new Map<string, number>();
  intereses.forEach(({ product_id }) => conteos.set(product_id, (conteos.get(product_id) ?? 0) + 1));

  return Array.from(conteos.entries())
    .map(([productId, cantidad]) => ({
      nombre: nombres.get(productId) ?? 'Producto eliminado',
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export async function marcarComoComprado(formData: FormData) {
  'use server';

  const rawIds = formData.get('pedidoIds');
  if (typeof rawIds !== 'string') {
    return;
  }

  let pedidoIds: unknown;
  try {
    pedidoIds = JSON.parse(rawIds);
  } catch {
    return;
  }

  if (!Array.isArray(pedidoIds)) {
    return;
  }

  const ids = pedidoIds.filter(
    (id): id is string =>
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
  );

  if (ids.length === 0) {
    return;
  }

  // compra_realizada es un eje aparte de estado: describe si ya se repuso
  // el stock, no el ciclo del pedido de cara al cliente.
  await supabaseAdminRequest(`orders?id=in.(${ids.join(',')})`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      compra_realizada: true,
      compra_realizada_en: new Date().toISOString(),
    }),
  });

  revalidatePath('/admin');
}

export default async function DashboardComprasPage() {
  const [pedidos, rankingIntereses] = await Promise.all([
    obtenerPedidosPendientes(),
    obtenerRankingIntereses(),
  ]);
  const compras = consolidarCompras(pedidos);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-slate-500">
            <a href="/admin/facturas" className="hover:underline">
              Facturas pendientes
            </a>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Operaciones · Jueves
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard de Compras
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Consolidado de productos pendientes para preparar las compras a proveedores mayoristas.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-bold text-emerald-950">Interés liviano por producto</h2>
          <p className="mt-1 text-sm text-emerald-900/70">Ranking de personas que pidieron aviso cuando llegue.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rankingIntereses.length === 0 ? (
              <p className="text-sm text-emerald-900/70">Todavía no hay señales registradas.</p>
            ) : (
              rankingIntereses.map((item) => (
                <div key={item.nombre} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{item.nombre}</span>
                  <strong className="text-emerald-700">{item.cantidad}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Proveedor
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cantidad total
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {compras.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={4}>
                      No hay pedidos pendientes para consolidar.
                    </td>
                  </tr>
                ) : (
                  compras.map((compra) => (
                    <tr className="align-middle" key={`${compra.proveedor}-${compra.producto}-${compra.unidad}`}>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                        {compra.proveedor}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{compra.producto}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-700">
                        {formatearCantidad(compra.cantidad)} {compra.unidad}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={marcarComoComprado}>
                          <input
                            type="hidden"
                            name="pedidoIds"
                            value={JSON.stringify(compra.pedidoIds)}
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-[0.98]"
                          >
                            Marcar como Comprado
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
