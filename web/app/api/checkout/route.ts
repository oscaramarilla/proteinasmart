import { NextResponse } from 'next/server';
import { crearSingleBuy } from '../../../lib/bancard';
import { supabaseAdminRequest } from '../../../lib/supabaseAdmin';

const MONTO_HOJA_DE_RUTA = 49000;

type DigitalOrderCreada = { id: string; token: string; shop_process_id: number };

// Endpoint del tripwire digital: crea la orden pendiente y arranca el
// single_buy de Bancard. Devuelve process_id (para el iframe de
// bancard-checkout-js) y token (para /ruta/[token] una vez pagado). El pago
// en si no se confirma aca -- eso llega por separado en
// web/app/api/bancard/confirm.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

  if (phone.length < 8) {
    return NextResponse.json({ error: 'Ingresá un WhatsApp válido.' }, { status: 400 });
  }

  const [orden] = await supabaseAdminRequest<DigitalOrderCreada[]>('digital_orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ phone, amount: MONTO_HOJA_DE_RUTA }),
  });

  const origin = new URL(request.url).origin;

  const resultado = await crearSingleBuy({
    shopProcessId: orden.shop_process_id,
    amount: MONTO_HOJA_DE_RUTA,
    description: 'Hoja de Ruta 90 Dias - ProteinaSmart',
    returnUrl: `${origin}/ruta/${orden.token}`,
    cancelUrl: `${origin}/hoja-de-ruta`,
  });

  if (!resultado.ok) {
    await supabaseAdminRequest(`digital_orders?id=eq.${orden.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'failed' }),
    });
    return NextResponse.json({ error: 'No pudimos iniciar el pago. Probá de nuevo.' }, { status: 502 });
  }

  await supabaseAdminRequest(`digital_orders?id=eq.${orden.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ process_id: resultado.processId }),
  });

  return NextResponse.json({ processId: resultado.processId, token: orden.token });
}
