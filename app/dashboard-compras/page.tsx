import { revalidatePath } from 'next/cache';

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

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return { url, key };
}

async function obtenerPedidosPendientes(): Promise<Pedido[]> {
  const { url, key } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: 'id,items_json',
    estado_entrega: 'eq.pendiente',
  });

  const response = await fetch(
    `${url}/rest/v1/pedidos_whatsapp?${query.toString()}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('No se pudieron obtener los pedidos pendientes.');
  }

  return response.json();
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

  const { url, key } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/pedidos_whatsapp?id=in.(${ids.join(',')})`,
    {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ estado_entrega: 'enviado' }),
    },
  );

  if (!response.ok) {
    throw new Error('No se pudieron marcar los pedidos como comprados.');
  }

  revalidatePath('/dashboard-compras');
}

export default async function DashboardComprasPage() {
  const pedidos = await obtenerPedidosPendientes();
  const compras = consolidarCompras(pedidos);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
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
