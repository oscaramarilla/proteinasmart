type ProductCardProps = {
  nombre: string;
  precio: number;
  unidad: string;
  etiquetas: string[];
  imagenUrl: string;
};

const badgeStyles: Record<string, string> = {
  organico: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  keto: 'bg-blue-100 text-blue-800 ring-blue-200',
  fresco: 'bg-sky-100 text-sky-800 ring-sky-200',
};

function getBadgeStyle(etiqueta: string) {
  const key = etiqueta
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return badgeStyles[key] ?? 'bg-slate-100 text-slate-700 ring-slate-200';
}

export default function ProductCard({
  nombre,
  precio,
  unidad,
  etiquetas,
  imagenUrl,
}: ProductCardProps) {
  const precioFormateado = new Intl.NumberFormat('es-PY').format(precio);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imagenUrl}
          alt={nombre}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {etiquetas.length > 0 && (
          <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
            {etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset ${getBadgeStyle(etiqueta)}`}
              >
                {etiqueta}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold leading-tight text-slate-900">
          {nombre}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Por {unidad}</p>

        <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
          {precioFormateado} <span className="text-base font-semibold text-slate-600">Gs</span>
        </p>

        <button
          type="button"
          className="mt-auto w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
