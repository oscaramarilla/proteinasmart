// Los 5 "Smart Stacks" (SKUs físicos) detrás de las 10 landings de
// /objetivos/[slug]. Núcleo, complemento, timing y rango de precio salen de
// DOSSIER_PREMIUM.md (secciones 2 "Cliente objetivo" y 4 "Protocolos base")
// -- no son precios inventados para esta fase, son los que ya usa el
// negocio para cotizar por WhatsApp.

export type SmartStackId = 'smart-start' | 'smart-muscle' | 'smart-cut' | 'smart-40-plus' | 'smart-glow';

export type SmartStack = {
  id: SmartStackId;
  nombre: string;
  nucleo: string;
  complemento: string;
  timing: string;
  rangoPrecioTexto: string;
  rangoPrecio: { desde: number; hasta: number };
};

export const SMART_STACKS: Record<SmartStackId, SmartStack> = {
  'smart-start': {
    id: 'smart-start',
    nombre: 'Smart Start',
    nucleo: 'Una base simple para ordenar tu alimentación',
    complemento: 'Un solo suplemento de entrada (magnesio, vitamina D3+K2 o similar, según tu caso)',
    timing: 'Diario, según la recomendación que te armamos por WhatsApp',
    rangoPrecioTexto: 'Gs 130.000 – 200.000',
    rangoPrecio: { desde: 130000, hasta: 200000 },
  },
  'smart-muscle': {
    id: 'smart-muscle',
    nombre: 'Smart Muscle',
    nucleo: 'Whey concentrada + creatina',
    complemento: 'Aminoácidos esenciales (EAA)',
    timing: 'Proteína post-entreno; creatina todos los días (5 g)',
    rangoPrecioTexto: 'Gs 500.000 – 900.000',
    rangoPrecio: { desde: 500000, hasta: 900000 },
  },
  'smart-cut': {
    id: 'smart-cut',
    nombre: 'Smart Cut',
    nucleo: 'Whey isolate o proteína vegetal + EAA',
    complemento: 'MCT o un sustituto de comida bajo en carbohidratos',
    timing: 'Desayuno y post-entreno',
    rangoPrecioTexto: 'Gs 250.000 – 500.000',
    rangoPrecio: { desde: 250000, hasta: 500000 },
  },
  'smart-40-plus': {
    id: 'smart-40-plus',
    nombre: 'Smart 40+',
    nucleo: 'Omega 3 + magnesio glicinato',
    complemento: 'Nootrópico o MCT, según si priorizás foco o energía sostenida',
    timing: 'Omega 3 con la comida; magnesio de noche',
    rangoPrecioTexto: 'Gs 300.000 – 550.000',
    rangoPrecio: { desde: 300000, hasta: 550000 },
  },
  'smart-glow': {
    id: 'smart-glow',
    nombre: 'Smart Glow',
    nucleo: 'Colágeno hidrolizado + vitamina C',
    complemento: 'Omega 3 y vitamina D3+K2',
    timing: 'En ayunas, todos los días',
    rangoPrecioTexto: 'Gs 350.000 – 600.000',
    rangoPrecio: { desde: 350000, hasta: 600000 },
  },
};
