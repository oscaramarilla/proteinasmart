'use client';

import Link from 'next/link';
import { useCartStore } from '../lib/useCartStore';

export default function FloatingCart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const cantidadTotal = items.reduce((acumulado, item) => acumulado + item.cantidad, 0);

  if (items.length === 0) {
    return null;
  }

  const precioFormateado = new Intl.NumberFormat('es-PY').format(total);

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-slate-950 px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.18)] sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">
            {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
          <p className="text-lg font-bold">{precioFormateado} Gs</p>
        </div>
        <Link
          href="/checkout"
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] sm:px-6"
        >
          Continuar con el pedido
        </Link>
      </div>
    </aside>
  );
}
