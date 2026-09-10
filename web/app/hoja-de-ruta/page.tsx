import Link from 'next/link';
import type { Metadata } from 'next';
import BancardCheckout from '../../components/BancardCheckout';
import { ETIQUETA_OBJETIVO, OBJETIVOS, type Objetivo } from '../../lib/quiz';

export const metadata: Metadata = {
  title: 'Hoja de Ruta 90 Días | ProteinaSmart',
};

function esObjetivo(valor: string | undefined): valor is Objetivo {
  return typeof valor === 'string' && (OBJETIVOS as readonly string[]).includes(valor);
}

export default async function HojaDeRutaPage({
  searchParams,
}: {
  searchParams: Promise<{ segmento?: string }>;
}) {
  const { segmento } = await searchParams;
  const objetivo = esObjetivo(segmento) ? segmento : null;

  return (
    <main className="quiz-shell min-h-screen">
      <div className="mx-auto max-w-xl px-6 py-20">
        <p className="quiz-eyebrow">Hoja de Ruta 90 Días</p>
        <h1 className="quiz-titulo mt-4">
          {objetivo
            ? `Tu protocolo para ${ETIQUETA_OBJETIVO[objetivo].toLowerCase()}, en 90 días`
            : 'Tu Hoja de Ruta de 90 días'}
        </h1>
        <p className="quiz-subtitulo mt-4">
          Ya recibimos tus respuestas. En breve te escribimos por WhatsApp con el protocolo
          gratis y el detalle de la Hoja de Ruta completa (Gs 49.000).
        </p>
        <div className="mt-8">
          <BancardCheckout />
        </div>
        <Link href="/" className="quiz-volver mt-8 inline-block">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
