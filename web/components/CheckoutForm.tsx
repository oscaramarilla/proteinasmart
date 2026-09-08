'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { procesarCheckout, estadoInicialCheckout } from '../app/checkout/actions';
import {
  CAMPOS_REQUERIDOS_POR_METODO,
  ES_METODO_ENCOMIENDA,
  FLETE_DISCLAIMER,
  TIPOS_DOCUMENTO,
  type CampoEntrega,
  type ShippingMethodCode,
} from '../lib/checkoutEntrega';
import { useCartStore } from '../lib/useCartStore';

export type ShippingMethodOption = { code: string; label: string; copy: string | null };
export type CourierCompanyOption = { id: string; name: string };

type CheckoutFormProps = {
  metodos: ShippingMethodOption[];
  ciudades: string[];
  empresas: CourierCompanyOption[];
  // Generada por el Server Component (checkout/page.tsx) por cada request
  // -- no en el cliente -- para que el mismo valor quede embebido en el
  // HTML servido y la hidratación no dispare un mismatch.
  idempotencyKey: string;
};

function campoVisible(metodo: ShippingMethodCode, campo: CampoEntrega) {
  return CAMPOS_REQUERIDOS_POR_METODO[metodo].includes(campo);
}

export default function CheckoutForm({
  metodos,
  ciudades,
  empresas,
  idempotencyKey,
}: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const limpiarCarrito = useCartStore((state) => state.limpiarCarrito);
  const [state, formAction, pending] = useActionState(procesarCheckout, estadoInicialCheckout);
  const [metodo, setMetodo] = useState<ShippingMethodCode>(
    (metodos[0]?.code as ShippingMethodCode) ?? 'pickup',
  );
  const [retiraTercero, setRetiraTercero] = useState(false);

  useEffect(() => {
    if (state.status === 'success') {
      limpiarCarrito();
    }
    // limpiarCarrito es estable (zustand): no hace falta en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">¡Pedido registrado!</h2>
        <p className="mt-2 text-slate-600">Confirmá por WhatsApp para coordinar el pago.</p>
        <a
          href={state.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#20bd5a]"
        >
          Confirmar por WhatsApp
        </a>
        <div className="mt-4">
          <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-300 bg-white p-6 text-center">
        <p className="text-slate-600">Tu carrito está vacío.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const precioFormateado = new Intl.NumberFormat('es-PY').format(total);
  const esEncomienda = ES_METODO_ENCOMIENDA[metodo];

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tus datos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" name="customer_name" error={state.errors.customer_name} />
          <Campo label="Teléfono / WhatsApp" name="phone" error={state.errors.phone} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Método de entrega</h2>
        {state.errors.shipping_method_code && (
          <p className="mt-1 text-sm text-red-600">{state.errors.shipping_method_code}</p>
        )}
        <div className="mt-4 space-y-3">
          {metodos.map((opcion) => (
            <label
              key={opcion.code}
              className={`block cursor-pointer rounded-xl border p-4 transition ${
                metodo === opcion.code ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="shipping_method_code"
                  value={opcion.code}
                  checked={metodo === opcion.code}
                  onChange={() => setMetodo(opcion.code as ShippingMethodCode)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-900">{opcion.label}</p>
                  {opcion.copy && <p className="mt-1 text-sm text-slate-600">{opcion.copy}</p>}
                  {ES_METODO_ENCOMIENDA[opcion.code as ShippingMethodCode] && (
                    <p className="mt-1 text-sm font-semibold text-amber-700">{FLETE_DISCLAIMER}</p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Datos de entrega</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {metodo === 'pickup' && (
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={retiraTercero}
                  onChange={(evento) => setRetiraTercero(evento.target.checked)}
                />
                Retira otra persona en mi nombre
              </label>
              {retiraTercero && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Campo
                    label="Nombre de quien retira"
                    name="third_party_name"
                    error={state.errors.third_party_name}
                  />
                  <Campo
                    label="CI de quien retira"
                    name="third_party_ci"
                    error={state.errors.third_party_ci}
                  />
                </div>
              )}
            </div>
          )}

          {campoVisible(metodo, 'address') && (
            <Campo label="Dirección" name="address" error={state.errors.address} />
          )}

          {campoVisible(metodo, 'city') &&
            (metodo === 'delivery_metro' ? (
              <CampoSelect
                label="Ciudad"
                name="city"
                opciones={ciudades}
                error={state.errors.city}
              />
            ) : (
              <Campo label="Ciudad" name="city" error={state.errors.city} />
            ))}

          {campoVisible(metodo, 'reference') && (
            <Campo
              label="Referencia de ubicación"
              name="reference"
              error={state.errors.reference}
            />
          )}

          {campoVisible(metodo, 'department') && (
            <Campo label="Departamento" name="department" error={state.errors.department} />
          )}

          {campoVisible(metodo, 'destination_city_agency') && (
            <Campo
              label="Ciudad / agencia de destino"
              name="destination_city_agency"
              error={state.errors.destination_city_agency}
            />
          )}

          {campoVisible(metodo, 'recipient_ci') && (
            <Campo
              label="CI del destinatario"
              name="recipient_ci"
              error={state.errors.recipient_ci}
            />
          )}

          {campoVisible(metodo, 'courier_company_id') && (
            <CampoSelectEmpresa empresas={empresas} error={state.errors.courier_company_id} />
          )}
        </div>

        {esEncomienda && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {FLETE_DISCLAIMER}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Datos de facturación</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-slate-700">Tipo de documento</span>
            <div className="mt-2 flex gap-4">
              {TIPOS_DOCUMENTO.map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="fiscal_document_type"
                    value={tipo}
                    defaultChecked={tipo === 'RUC'}
                  />
                  {tipo}
                </label>
              ))}
            </div>
            {state.errors.fiscal_document_type && (
              <p className="mt-1 text-sm text-red-600">{state.errors.fiscal_document_type}</p>
            )}
          </div>
          <Campo
            label="Número de documento"
            name="fiscal_document_number"
            error={state.errors.fiscal_document_number}
          />
          <Campo
            label="Razón social"
            name="fiscal_business_name"
            error={state.errors.fiscal_business_name}
          />
          <Campo
            label="Email"
            name="fiscal_email"
            type="email"
            error={state.errors.fiscal_email}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item.id}>
              {item.cantidad}x {item.nombre} ({item.unidad})
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xl font-bold text-slate-950">{precioFormateado} Gs</p>
        {esEncomienda && (
          <p className="mt-1 text-xs text-slate-500">No incluye flete de encomienda.</p>
        )}
      </section>

      {state.errors.items && <p className="text-sm text-red-600">{state.errors.items}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? 'Enviando...' : 'Confirmar pedido'}
      </button>
    </form>
  );
}

function Campo({
  label,
  name,
  error,
  type = 'text',
}: {
  label: string;
  name: string;
  error?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function CampoSelect({
  label,
  name,
  opciones,
  error,
}: {
  label: string;
  name: string;
  opciones: string[];
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
      >
        <option value="" disabled>
          Elegí una ciudad
        </option>
        {opciones.map((ciudad) => (
          <option key={ciudad} value={ciudad}>
            {ciudad}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function CampoSelectEmpresa({
  empresas,
  error,
}: {
  empresas: CourierCompanyOption[];
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">Empresa de encomienda</span>
      <select
        name="courier_company_id"
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
      >
        <option value="" disabled>
          Elegí una empresa
        </option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
