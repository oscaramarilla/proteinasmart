import { revalidatePath } from 'next/cache';
import { supabaseAdminRequest } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type InvoiceEmbebida = {
  id: string;
  status: string;
  numero: string | null;
  timbrado: string | null;
  issued_at: string | null;
  issued_by: string | null;
};

type OrdenFacturable = {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  shipping_method_code: string;
  estado: string;
  fiscal_document_type: string | null;
  fiscal_document_number: string | null;
  fiscal_business_name: string | null;
  created_at: string;
  // PostgREST puede devolver esto como array o como objeto único según
  // cómo detecte la relación 1:1 (invoices.order_id es unique) -- se
  // normaliza con invoiceDeOrden() antes de usarlo.
  invoices: InvoiceEmbebida[] | InvoiceEmbebida | null;
};

function invoiceDeOrden(orden: OrdenFacturable): InvoiceEmbebida | null {
  const valor = orden.invoices;
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

async function obtenerOrdenesPorFacturar(): Promise<
  { orden: OrdenFacturable; factura: InvoiceEmbebida | null }[]
> {
  // Partir de orders (no de invoices): si ManualInvoiceIssuer falló al
  // crear la fila pending_manual, la orden no tiene NINGÚN registro en
  // invoices, y una consulta que arranca desde invoices nunca la vería.
  // Con el LEFT JOIN por defecto de PostgREST (sin !inner), la orden
  // aparece igual, con invoices en null/[].
  const ordenes = await supabaseAdminRequest<OrdenFacturable[]>(
    'orders?select=id,customer_name,phone,total,shipping_method_code,estado,fiscal_document_type,fiscal_document_number,fiscal_business_name,created_at,invoices(id,status,numero,timbrado,issued_at,issued_by)&estado=neq.cancelado&order=created_at.asc',
  );

  return ordenes
    .map((orden) => ({ orden, factura: invoiceDeOrden(orden) }))
    .filter(({ factura }) => !factura || factura.status === 'pending_manual');
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-PY', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(fecha),
  );
}

function formatearMonto(monto: number) {
  return new Intl.NumberFormat('es-PY').format(monto);
}

export async function marcarFacturaEmitida(formData: FormData) {
  'use server';

  const orderId = formData.get('orderId');
  const invoiceId = formData.get('invoiceId');
  const numero = formData.get('numero');
  const timbrado = formData.get('timbrado');
  const issuedBy = formData.get('issuedBy');

  if (
    typeof orderId !== 'string' ||
    typeof numero !== 'string' ||
    typeof timbrado !== 'string' ||
    typeof issuedBy !== 'string' ||
    !numero.trim() ||
    !timbrado.trim() ||
    !issuedBy.trim()
  ) {
    return;
  }

  const datosEmision = {
    status: 'issued',
    numero: numero.trim(),
    timbrado: timbrado.trim(),
    issued_by: issuedBy.trim(),
    issued_at: new Date().toISOString(),
  };

  if (typeof invoiceId === 'string' && invoiceId) {
    await supabaseAdminRequest(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(datosEmision),
    });
  } else {
    // La orden nunca tuvo fila en invoices (ManualInvoiceIssuer falló en el
    // checkout) -- se crea directamente ya emitida, en vez de pasar por
    // pending_manual primero.
    await supabaseAdminRequest('invoices', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ order_id: orderId, mode: 'manual', ...datosEmision }),
    });
  }

  revalidatePath('/admin/facturas');
}

export async function anularFactura(formData: FormData) {
  'use server';

  const orderId = formData.get('orderId');
  const invoiceId = formData.get('invoiceId');
  if (typeof orderId !== 'string') {
    return;
  }

  if (typeof invoiceId === 'string' && invoiceId) {
    await supabaseAdminRequest(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'void' }),
    });
  } else {
    await supabaseAdminRequest('invoices', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ order_id: orderId, mode: 'manual', status: 'void' }),
    });
  }

  revalidatePath('/admin/facturas');
}

const ETIQUETAS_METODO: Record<string, string> = {
  pickup: 'Retiro en el local',
  delivery_metro: 'Envío en Gran Asunción',
  encomienda_puerta: 'Encomienda — puerta a puerta',
  encomienda_agencia: 'Encomienda — retiro en agencia',
};

export default async function FacturasPendientesPage() {
  const filas = await obtenerOrdenesPorFacturar();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-slate-500">
            <a href="/admin" className="hover:underline">
              Dashboard de Compras
            </a>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Facturas pendientes
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Órdenes sin factura cargada, incluidas las que no tienen ningún registro en{' '}
            <code>invoices</code> (el checkout no pudo crearlo). Emisión manual — cargá numero y
            timbrado cuando factures fuera del sistema.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Entrega
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Datos fiscales
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado factura
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Emitir / anular
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={7}>
                      No hay facturas pendientes.
                    </td>
                  </tr>
                ) : (
                  filas.map(({ orden, factura }) => (
                    <tr className="align-top" key={orden.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                        {formatearFecha(orden.created_at)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <p className="font-semibold text-slate-900">{orden.customer_name}</p>
                        <p className="text-sm text-slate-500">{orden.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {ETIQUETAS_METODO[orden.shipping_method_code] ??
                          orden.shipping_method_code}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <p>{orden.fiscal_business_name}</p>
                        <p className="text-sm text-slate-500">
                          {orden.fiscal_document_type} {orden.fiscal_document_number}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {factura ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                            Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-200">
                            Sin registro de factura
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-emerald-700">
                        {formatearMonto(orden.total)} Gs
                      </td>
                      <td className="px-6 py-4">
                        <div className="ml-auto flex max-w-sm flex-col gap-2">
                          <form action={marcarFacturaEmitida} className="flex flex-wrap gap-2">
                            <input type="hidden" name="orderId" value={orden.id} />
                            <input type="hidden" name="invoiceId" value={factura?.id ?? ''} />
                            <input
                              type="text"
                              name="numero"
                              placeholder="Número"
                              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              required
                            />
                            <input
                              type="text"
                              name="timbrado"
                              placeholder="Timbrado"
                              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              required
                            />
                            <input
                              type="text"
                              name="issuedBy"
                              placeholder="Emitido por"
                              className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              required
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                              Marcar emitida
                            </button>
                          </form>
                          <form action={anularFactura}>
                            <input type="hidden" name="orderId" value={orden.id} />
                            <input type="hidden" name="invoiceId" value={factura?.id ?? ''} />
                            <button
                              type="submit"
                              className="text-sm font-semibold text-red-600 hover:underline"
                            >
                              Anular
                            </button>
                          </form>
                        </div>
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
