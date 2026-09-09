'use server';

import { supabaseAdminRequest } from '../../lib/supabaseAdmin';

type InterestState = { status: 'idle' | 'success' | 'error'; message: string };

export const estadoInicialInteres: InterestState = { status: 'idle', message: '' };

/** Registra una señal liviana de interés sin crear una reserva. */
export async function registrarInteres(
  _prevState: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const productId = formData.get('product_id');
  const telefono = formData.get('telefono');

  if (
    typeof productId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId) ||
    typeof telefono !== 'string' ||
    telefono.trim().length < 8
  ) {
    return { status: 'error', message: 'Ingresá un WhatsApp válido.' };
  }

  try {
    await supabaseAdminRequest('product_interest', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ product_id: productId, telefono: telefono.trim() }),
    });
    return { status: 'success', message: 'Te avisamos cuando llegue.' };
  } catch {
    return { status: 'error', message: 'No pudimos guardar el aviso. Probá de nuevo.' };
  }
}
