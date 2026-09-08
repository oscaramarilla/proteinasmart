'use client';

import { useActionState } from 'react';
import {
  estadoInicialInteres,
  registrarInteres,
} from '../app/intereses/actions';

type ProductInterestFormProps = { productId: string };

export default function ProductInterestForm({ productId }: ProductInterestFormProps) {
  const [state, formAction, pending] = useActionState(
    registrarInteres,
    estadoInicialInteres,
  );

  if (state.status === 'success') {
    return <p className="mt-3 text-sm font-semibold text-emerald-700">{state.message}</p>;
  }

  return (
    <form action={formAction} className="mt-3 border-t border-slate-100 pt-3">
      <input type="hidden" name="product_id" value={productId} />
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor={`interest-${productId}`}>
        Avisame cuando llegue
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`interest-${productId}`}
          name="telefono"
          type="tel"
          placeholder="Tu WhatsApp"
          autoComplete="tel"
          required
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Guardando...' : 'Avisame'}
        </button>
      </div>
      {state.status === 'error' && <p className="mt-2 text-xs text-red-600">{state.message}</p>}
    </form>
  );
}
