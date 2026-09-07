import { createClient } from '@supabase/supabase-js';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  unidad_medida: string;
  etiquetas: string[];
  imagen_url?: string | null;
};

const imagenFallback =
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80';

async function obtenerProductos(): Promise<Producto[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return [];
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Producto[];
}

export default async function Home() {
  const productos = await obtenerProductos();

  return (
    <main className="min-h-screen bg-[#f4f7f2] pb-28 text-slate-950">
      <header className="border-b border-emerald-950/10 bg-[#123c32] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Proteina Smart · Asunción y Gran Asunción
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Alimentos funcionales de alta densidad nutricional
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/80">
            Proteína real, productos frescos y opciones keto seleccionadas para comer mejor todos los días.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Catálogo semanal
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Elegí tu próxima compra</h2>
        </div>

        {productos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Catálogo en actualización</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-600">
              Estamos preparando los productos frescos de esta semana. Volvé pronto para descubrir la selección disponible.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                id={producto.id}
                nombre={producto.nombre}
                precio={producto.precio}
                unidad={producto.unidad_medida}
                etiquetas={producto.etiquetas ?? []}
                imagenUrl={producto.imagen_url ?? imagenFallback}
              />
            ))}
          </div>
        )}
      </section>

      <FloatingCart />
    </main>
  );
}
