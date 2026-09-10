'use server';

import { supabaseAdminRequest } from '../lib/supabaseAdmin';
import {
  DIETAS,
  FRECUENCIAS,
  OBJETIVOS,
  PRESUPUESTOS,
  segmentoDesdeRespuestas,
  type Dieta,
  type Frecuencia,
  type Objetivo,
  type Presupuesto,
  type QuizLeadState,
} from '../lib/quiz';

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === 'string' ? valor.trim() : '';
}

export async function enviarQuizLead(
  _prevState: QuizLeadState,
  formData: FormData,
): Promise<QuizLeadState> {
  const objetivo = texto(formData, 'objetivo');
  const frecuencia = texto(formData, 'frecuencia');
  const dieta = texto(formData, 'dieta');
  const presupuesto = texto(formData, 'presupuesto');
  const whatsapp = texto(formData, 'whatsapp');

  // No confiar en el estado del quiz en el cliente: revalidar que las
  // cuatro respuestas sean valores conocidos antes de guardar nada.
  if (!(OBJETIVOS as readonly string[]).includes(objetivo)) {
    return { status: 'error', error: 'Elegí un objetivo válido.' };
  }
  if (!(FRECUENCIAS as readonly string[]).includes(frecuencia)) {
    return { status: 'error', error: 'Elegí una frecuencia válida.' };
  }
  if (!(DIETAS as readonly string[]).includes(dieta)) {
    return { status: 'error', error: 'Elegí una dieta válida.' };
  }
  if (!(PRESUPUESTOS as readonly string[]).includes(presupuesto)) {
    return { status: 'error', error: 'Elegí un presupuesto válido.' };
  }
  if (whatsapp.length < 8) {
    return { status: 'error', error: 'Ingresá un WhatsApp válido.' };
  }

  const respuestas = {
    objetivo: objetivo as Objetivo,
    frecuencia: frecuencia as Frecuencia,
    dieta: dieta as Dieta,
    presupuesto: presupuesto as Presupuesto,
  };

  // Fire-and-forget: si Supabase falla igual dejamos avanzar al usuario a la
  // vista de la Fase 2 -- mismo criterio de resiliencia que js/pedidos.js en
  // el sitio vanilla (una venta/lead no depende de que este insert funcione).
  try {
    await supabaseAdminRequest('quiz_leads', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        whatsapp_phone: whatsapp,
        objetivo: respuestas.objetivo,
        frecuencia: respuestas.frecuencia,
        dieta: respuestas.dieta,
        presupuesto: respuestas.presupuesto,
      }),
    });
  } catch {
    // Silencioso a proposito -- ver comentario arriba.
  }

  const segmento = segmentoDesdeRespuestas(respuestas);
  return { status: 'success', redirectTo: `/hoja-de-ruta?segmento=${segmento}` };
}
