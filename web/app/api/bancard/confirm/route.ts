import { NextResponse } from 'next/server';
import { verificarTokenConfirmacion } from '../../../../lib/bancard';
import { supabaseAdminRequest } from '../../../../lib/supabaseAdmin';

type DigitalOrderExistente = { id: string; amount: number };

// "single_buy confirm": la URL que hay que cargar como confirm_url en el
// Portal de Comercios de Bancard. Segun el manual de vPOS, esta llamada
// server-to-server es "el unico medio por el cual el portal tendra la
// certeza de que el usuario completo satisfactoriamente una transaccion" --
// por eso /ruta/[token] nunca marca un pedido como pagado por su cuenta,
// solo lee lo que este endpoint ya confirmo.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const operation = body?.operation;

  if (!operation || typeof operation.shop_process_id === 'undefined') {
    return NextResponse.json({ status: 'error' }, { status: 400 });
  }

  const shopProcessId = operation.shop_process_id as number | string;
  const amount = String(operation.amount ?? '');
  const tokenRecibido = String(operation.token ?? '');

  // No confiar en el contenido del payload sin validar el token: solo
  // Bancard conoce la private_key necesaria para generarlo.
  const tokenValido = verificarTokenConfirmacion({ shopProcessId, amount, tokenRecibido });
  if (!tokenValido) {
    return NextResponse.json({ status: 'error' }, { status: 401 });
  }

  const ordenes = await supabaseAdminRequest<DigitalOrderExistente[]>(
    `digital_orders?select=id,amount&shop_process_id=eq.${encodeURIComponent(String(shopProcessId))}`,
  );
  const orden = ordenes[0];

  if (!orden) {
    return NextResponse.json({ status: 'error' }, { status: 404 });
  }

  const montoEsperado = orden.amount.toFixed(2);
  const aprobado = operation.response === 'S' && operation.response_code === '00';
  const nuevoEstado = aprobado && amount === montoEsperado ? 'paid' : 'failed';

  await supabaseAdminRequest(`digital_orders?id=eq.${orden.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: nuevoEstado,
      confirmed_at: new Date().toISOString(),
      bancard_response: operation,
    }),
  });

  // Bancard exige HTTP 200 con este body exacto dentro de 60s, o marca la
  // confirmacion como invalida en su traza.
  return NextResponse.json({ status: 'success' });
}
