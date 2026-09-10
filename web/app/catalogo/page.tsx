import { createClient } from '@supabase/supabase-js';
import FloatingCart from '../../components/FloatingCart';
import ProductCard from '../../components/ProductCard';
import { negocio, whatsappUrl } from '../../lib/negocio';
import { PREVENTA_COPY, PREVENTA_DIAS_PLAZO } from '../../lib/preventa';

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  unidad_medida: string;
  etiquetas: string[];
  imagen_url?: string | null;
  proveedor: string | null;
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

function DisciplinaIcon({ tipo }: { tipo: 'keto' | 'lowCarb' | 'habitos' | 'neuro' }) {
  const common = { className: 'h-9 w-9 text-emerald-600', viewBox: '0 0 32 32', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true } as const;
  if (tipo === 'keto') return <svg {...common}><path d="M16 28C9 24 6 18 7 10c5 1 8 4 9 8 1-7 4-11 10-13 1 9-2 17-10 23Z" stroke="currentColor" strokeWidth="2" /></svg>;
  if (tipo === 'lowCarb') return <svg {...common}><path d="M6 24h20M9 20l4-5 4 3 6-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="m21 9 3-1-1 3-1-1-1 1Z" fill="currentColor" /></svg>;
  if (tipo === 'habitos') return <svg {...common}><path d="M8 17a8 8 0 1 0 2-6M8 7v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  return <svg {...common}><path d="M12 7a4 4 0 0 0-4 4 4 4 0 0 0 1 7 4 4 0 0 0 4 7h2V7h-3Zm8 0a4 4 0 0 1 4 4 4 4 0 0 1-1 7 4 4 0 0 1-4 7h-2V7h3Z" stroke="currentColor" strokeWidth="2" /><path d="M12 12h3m-3 5h3m5-5h-3m3 5h-3" stroke="currentColor" strokeWidth="2" /></svg>;
}

export default async function CatalogoPage() {
  const productos = await obtenerProductos();
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: negocio.faq.map((item) => ({
      '@type': 'Question',
      name: item.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
    })),
  };

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
        <div className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Modelo de preventa</p>
          <p className="mt-2 max-w-3xl text-lg leading-8">{PREVENTA_COPY}</p>
        </div>
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
                proveedor={producto.proveedor ?? ''}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white px-6 py-16 sm:px-8" id="filosofia">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">La tesis</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Cuatro disciplinas, un mismo criterio de compra</h2>
            <p className="mt-4 text-slate-600">No vendemos el suplemento de moda. Seleccionamos lo que resiste el cruce entre metabolismo, composición corporal, hábito sostenible y función cerebral.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ['keto', 'Cetogénica', 'Carga glucémica mínima y energía desde grasas buenas.'],
              ['lowCarb', 'Low carb', 'Más saciedad y proteína de calidad, sin exceso de azúcar.'],
              ['habitos', 'Healthy habits', 'Formatos simples y protocolos que entran en tu semana real.'],
              ['neuro', 'Neuroplasticidad', 'Omega 3, magnesio, colina y creatina para foco y recuperación.'],
            ].map(([tipo, titulo, texto]) => (
              <article key={titulo} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <DisciplinaIcon tipo={tipo as 'keto' | 'lowCarb' | 'habitos' | 'neuro'} />
                <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8" id="confianza">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Por qué ProteinaSmart</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Un marketplace con criterio, no una góndola más</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Te ayudamos a decidir qué tomar, cuándo, con qué combinarlo y qué no necesitás comprar.</p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li><strong>Selección curada.</strong> Cada producto tiene un uso claro.</li>
              <li><strong>Asesoramiento incluido.</strong> Armamos el protocolo antes de que gastes.</li>
              <li><strong>Operación formal.</strong> {negocio.operacion.facturacion}.</li>
              <li><strong>Trato directo.</strong> Hablás con {negocio.contacto.responsable}.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-900 p-5 text-white"><strong className="text-3xl">24h</strong><p className="mt-1 text-sm text-emerald-100">Entrega en Gran Asunción</p></div>
            <div className="rounded-2xl bg-emerald-100 p-5 text-emerald-950"><strong className="text-3xl">RUC</strong><p className="mt-1 text-sm">{negocio.contacto.ruc}</p></div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-semibold">{negocio.operacion.horario}</p><p className="mt-1 text-sm text-slate-600">{negocio.operacion.envioInterior}</p></div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 px-6 py-16 text-white sm:px-8" id="como-reservar">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Sin fricción</p>
          <h2 className="mt-2 text-3xl font-bold">Reservás en tres pasos</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div><span className="text-emerald-300">01</span><h3 className="mt-3 text-xl font-bold">Reservás</h3><p className="mt-2 text-emerald-100/75">Elegís tus productos y completás tus datos de entrega.</p></div>
            <div><span className="text-emerald-300">02</span><h3 className="mt-3 text-xl font-bold">Confirmamos disponibilidad</h3><p className="mt-2 text-emerald-100/75">Te escribimos por WhatsApp para confirmar stock, precio final y plazo.</p></div>
            <div><span className="text-emerald-300">03</span><h3 className="mt-3 text-xl font-bold">Traemos y entregamos</h3><p className="mt-2 text-emerald-100/75">Coordinamos el pedido. Plazo estimado: {PREVENTA_DIAS_PLAZO} días desde la confirmación.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-100 px-6 py-14 text-center" id="asesoria">
        <h2 className="text-3xl font-bold text-emerald-950">¿Querés ayuda para elegir?</h2>
        <p className="mx-auto mt-3 max-w-xl text-emerald-950/75">Escribinos y te orientamos según tu objetivo y presupuesto.</p>
        <a href={whatsappUrl('Hola ProteinaSmart, ayudame a elegir un producto.')} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white transition hover:bg-emerald-900">Hablar por WhatsApp</a>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8" id="faq">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Preguntas frecuentes</p>
          <h2 className="mt-2 text-3xl font-bold">Lo que más nos consultan</h2>
        </div>
        <div className="mt-8 space-y-3">
          {negocio.faq.map((item) => (
            <details key={item.pregunta} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold">{item.pregunta}</summary>
              <p className="mt-3 leading-7 text-slate-600">{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>
      <footer className="bg-slate-950 px-6 py-12 text-slate-300 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <p className="text-xl font-bold text-white">Proteina<span className="text-emerald-400">Smart</span></p>
            <p className="mt-3 max-w-xs text-sm leading-6">{negocio.descripcion}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white">Contacto</h2>
            <a className="mt-3 block text-sm hover:text-emerald-300" href={`tel:+${negocio.contacto.whatsapp}`}>{negocio.contacto.telefonoLocal}</a>
            <a className="mt-2 block text-sm hover:text-emerald-300" href={`mailto:${negocio.contacto.email}`}>{negocio.contacto.email}</a>
            <p className="mt-2 text-sm">{negocio.contacto.ciudad}</p>
          </div>
          <div>
            <h2 className="font-semibold text-white">Datos comerciales</h2>
            <p className="mt-3 text-sm">{negocio.contacto.responsable}</p>
            <p className="mt-2 text-sm">RUC {negocio.contacto.ruc}</p>
            <p className="mt-2 text-sm">{negocio.operacion.horario}</p>
            <p className="mt-2 text-sm">{negocio.operacion.facturacion}</p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs leading-6 text-slate-400">
          <p>{negocio.legal.disclaimer}</p>
          <p className="mt-3">© 2026 {negocio.marca} · {negocio.contacto.ciudad}</p>
        </div>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FloatingCart />
    </main>
  );
}
