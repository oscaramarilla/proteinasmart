import Link from 'next/link';
import AutoRefresh from '../../../components/AutoRefresh';
import { obtenerUrlFirmadaHojaDeRuta } from '../../../lib/hojaDeRutaStorage';
import { supabaseAdminRequest } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type DigitalOrder = { status: string };

async function obtenerOrden(token: string): Promise<DigitalOrder | null> {
  const ordenes = await supabaseAdminRequest<DigitalOrder[]>(
    `digital_orders?select=status&token=eq.${encodeURIComponent(token)}`,
  );
  return ordenes[0] ?? null;
}

export default async function RutaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const orden = await obtenerOrden(token);

  if (!orden) {
    return (
      <main className="quiz-shell min-h-screen">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="quiz-eyebrow">Hoja de Ruta 90 Días</p>
          <h1 className="quiz-titulo mt-4">No encontramos este enlace</h1>
          <p className="quiz-subtitulo mt-4">Verificá el link o volvé a intentar la compra.</p>
          <Link href="/hoja-de-ruta" className="quiz-volver mt-8 inline-block">
            ← Volver
          </Link>
        </div>
      </main>
    );
  }

  if (orden.status === 'pending') {
    return (
      <main className="quiz-shell min-h-screen">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="quiz-eyebrow">Hoja de Ruta 90 Días</p>
          <h1 className="quiz-titulo mt-4">Confirmando tu pago…</h1>
          <p className="quiz-subtitulo mt-4">
            Esto puede tardar unos segundos. Esta página se actualiza sola.
          </p>
          <AutoRefresh segundos={4} />
        </div>
      </main>
    );
  }

  if (orden.status !== 'paid') {
    return (
      <main className="quiz-shell min-h-screen">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="quiz-eyebrow">Hoja de Ruta 90 Días</p>
          <h1 className="quiz-titulo mt-4">Tu pago no pudo procesarse</h1>
          <p className="quiz-subtitulo mt-4">No se realizó ningún cobro. Podés volver a intentarlo.</p>
          <Link href="/hoja-de-ruta" className="quiz-cta mt-8 inline-block">
            Volver a intentar
          </Link>
        </div>
      </main>
    );
  }

  const urlFirmada = await obtenerUrlFirmadaHojaDeRuta();

  return (
    <main className="quiz-shell min-h-screen">
      <div className="mx-auto max-w-xl px-6 py-20">
        <p className="quiz-eyebrow">Hoja de Ruta 90 Días</p>
        <h1 className="quiz-titulo mt-4">¡Pago confirmado!</h1>
        <p className="quiz-subtitulo mt-4">Descargá tu Hoja de Ruta de 90 días.</p>
        {urlFirmada ? (
          <a href={urlFirmada} className="quiz-cta mt-8 inline-block">
            Descargar mi Hoja de Ruta (PDF)
          </a>
        ) : (
          <p className="quiz-error mt-6">
            El PDF todavía no está cargado. Escribinos por WhatsApp y te lo enviamos mientras tanto.
          </p>
        )}
      </div>
    </main>
  );
}
