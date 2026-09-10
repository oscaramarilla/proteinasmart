// Datos y copy del Smart Quiz. Mismo patron que negocio.ts: valores fijos,
// sin dependencias externas, reusables tanto en el quiz (Fase 1) como en las
// landings por objetivo (Fase 3).

export const OBJETIVOS = ['masa', 'grasa', 'belleza', 'foco'] as const;
export type Objetivo = (typeof OBJETIVOS)[number];

export const ETIQUETA_OBJETIVO: Record<Objetivo, string> = {
  masa: 'Ganar masa',
  grasa: 'Bajar grasa',
  belleza: 'Belleza',
  foco: 'Foco',
};

export const FRECUENCIAS = ['0', '1-2', '3-5', '6+'] as const;
export type Frecuencia = (typeof FRECUENCIAS)[number];

export const ETIQUETA_FRECUENCIA: Record<Frecuencia, string> = {
  '0': 'No entreno todavía',
  '1-2': '1 a 2 veces por semana',
  '3-5': '3 a 5 veces por semana',
  '6+': '6 o más veces por semana',
};

export const DIETAS = ['tradicional', 'low-carb', 'plant-based'] as const;
export type Dieta = (typeof DIETAS)[number];

export const ETIQUETA_DIETA: Record<Dieta, string> = {
  tradicional: 'Tradicional',
  'low-carb': 'Low carb',
  'plant-based': 'Plant based',
};

export const PRESUPUESTOS = ['menos-300', '300-600', 'mas-600'] as const;
export type Presupuesto = (typeof PRESUPUESTOS)[number];

export const ETIQUETA_PRESUPUESTO: Record<Presupuesto, string> = {
  'menos-300': 'Menos de Gs 300.000',
  '300-600': 'Gs 300.000 – 600.000',
  'mas-600': 'Más de Gs 600.000',
};

export type RespuestasQuiz = {
  objetivo: Objetivo;
  frecuencia: Frecuencia;
  dieta: Dieta;
  presupuesto: Presupuesto;
};

// Segmento resultante: hoy es simplemente el objetivo (masa/grasa/belleza/
// foco). Fase 3 lo cruza con genero/otras senales para elegir la landing de
// SEO; por ahora alcanza para precargar copy en /hoja-de-ruta.
export function segmentoDesdeRespuestas(respuestas: RespuestasQuiz): Objetivo {
  return respuestas.objetivo;
}

// Vive aca y no en app/actions.ts porque un archivo 'use server' solo puede
// exportar funciones async -- exportar esta constante desde ahi rompe el
// build de Next ("A 'use server' file can only export async functions").
export type QuizLeadState = {
  status: 'idle' | 'error' | 'success';
  error?: string;
  redirectTo?: string;
};

export const estadoInicialQuizLead: QuizLeadState = { status: 'idle' };
