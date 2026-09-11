import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { negocio, whatsappUrl } from '../../../lib/negocio';
import { obtenerLanding, OBJETIVOS_LANDINGS } from '../../../lib/objetivosLandings';
import { SMART_STACKS } from '../../../lib/smartStacks';

// Solo estas 10 landings existen -- un slug fuera de esta lista da 404 en
// vez de generarse al vuelo (no es una landing genérica por CMS).
export const dynamicParams = false;

export function generateStaticParams() {
  return OBJETIVOS_LANDINGS.map((landing) => ({ slug: landing.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = obtenerLanding(slug);
  if (!landing) return {};

  const url = `${negocio.dominio}/objetivos/${slug}`;

  return {
    title: landing.metaTitle,
    description: landing.metaDescription,
    alternates: { canonical: `/objetivos/${slug}` },
    openGraph: {
      title: landing.metaTitle,
      description: landing.metaDescription,
      url,
      siteName: negocio.marca,
      locale: 'es_PY',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: landing.metaTitle,
      description: landing.metaDescription,
    },
  };
}

export default async function ObjetivoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const landing = obtenerLanding(slug);
  if (!landing) notFound();

  const stack = SMART_STACKS[landing.skuId];
  const url = `${negocio.dominio}/objetivos/${slug}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: stack.nombre,
    description: landing.metaDescription,
    brand: { '@type': 'Brand', name: negocio.marca },
    url,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PYG',
      lowPrice: stack.rangoPrecio.desde,
      highPrice: stack.rangoPrecio.hasta,
      availability: 'https://schema.org/InStock',
      url,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: negocio.dominio },
      { '@type': 'ListItem', position: 2, name: 'Objetivos', item: `${negocio.dominio}/objetivos` },
      { '@type': 'ListItem', position: 3, name: stack.nombre, item: url },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f4f7f2] pb-24 text-slate-950">
      <header className="border-b border-emerald-950/10 bg-[#123c32] text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {stack.nombre} · Proteina Smart
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{landing.h1}</h1>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <p className="text-lg leading-8 text-slate-700">{landing.intro}</p>

        <div className="mt-10 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Qué incluye {stack.nombre}
          </p>
          <dl className="mt-4 space-y-4 text-slate-700">
            <div>
              <dt className="font-semibold text-slate-900">Núcleo</dt>
              <dd className="mt-1">{stack.nucleo}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Complemento</dt>
              <dd className="mt-1">{stack.complemento}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Cómo se toma</dt>
              <dd className="mt-1">{stack.timing}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-slate-500">
            Rango de referencia: {stack.rangoPrecioTexto}. Precio final, stock y composición se
            confirman por WhatsApp antes de cobrar.
          </p>
        </div>

        <div className="mt-8">
          <a
            href={whatsappUrl(landing.whatsappMensaje)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white transition hover:bg-emerald-900"
          >
            Pedir {stack.nombre} por WhatsApp
          </a>
        </div>

        <p className="mt-10 text-xs leading-6 text-slate-500">{negocio.legal.disclaimer}</p>

        <p className="mt-6 text-sm">
          <Link href="/catalogo" className="font-semibold text-emerald-700 hover:underline">
            Ver todo el catálogo
          </Link>
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
