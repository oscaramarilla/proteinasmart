import type { SmartStackId } from './smartStacks';

export type ObjetivoLanding = {
  slug: string;
  skuId: SmartStackId;
  h1: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  whatsappMensaje: string;
};

// 10 intenciones de búsqueda -> 5 Smart Stacks. El SKU se repite a
// propósito (mismo producto y precio); lo que cambia por slug es el H1, la
// intro y el mensaje de WhatsApp, para que la página hable directamente de
// lo que la persona buscó.
export const OBJETIVOS_LANDINGS: ObjetivoLanding[] = [
  {
    slug: 'empezar-gimnasio',
    skuId: 'smart-start',
    h1: 'Recién empezás en el gimnasio: no compres de más',
    intro:
      'Si estás arrancando, no necesitás diez productos distintos. Smart Start es una base simple para ordenar tu alimentación mientras tomás el hábito, con una sola recomendación concreta y sin gastar de más antes de saber qué necesitás.',
    metaTitle: 'Qué suplemento tomar al empezar en el gimnasio | ProteinaSmart',
    metaDescription:
      'Empezás en el gimnasio y no sabés qué suplemento tomar primero. Smart Start es una base simple, sin compras de más, con asesoría por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Estoy empezando en el gimnasio y quiero info sobre Smart Start.',
  },
  {
    slug: 'ganar-masa-hombres',
    skuId: 'smart-muscle',
    h1: 'Ganar masa muscular: la base que funciona',
    intro:
      'Whey concentrada y creatina como núcleo, EAA como complemento post-entreno. Smart Muscle es el protocolo que armamos para hombres que entrenan fuerza con constancia y quieren una recomendación concreta, no la proteína de moda.',
    metaTitle: 'Suplementos para ganar masa muscular (hombres) | ProteinaSmart',
    metaDescription:
      'Proteína + creatina + EAA en un protocolo simple para ganar masa muscular. Asesoría por WhatsApp antes de comprar, sin vueltas.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Quiero ganar masa muscular y me interesa el protocolo Smart Muscle.',
  },
  {
    slug: 'ganar-masa-mujeres',
    skuId: 'smart-muscle',
    h1: 'Ganar masa muscular: proteína y creatina para mujeres que entrenan fuerza',
    intro:
      'La creatina y la proteína no son "para hombres": son la base con más evidencia para ganar fuerza y masa magra, también entrenando como mujer. Smart Muscle es el mismo protocolo, con la asesoría ajustada a tu rutina y objetivo.',
    metaTitle: 'Suplementos para ganar masa muscular en mujeres | ProteinaSmart',
    metaDescription:
      'Proteína + creatina para mujeres que entrenan fuerza y quieren ganar masa magra. Protocolo Smart Muscle, con asesoría por WhatsApp.',
    whatsappMensaje:
      'Hola ProteinaSmart 👋 Soy mujer, entreno fuerza y quiero ganar masa muscular. Me interesa Smart Muscle.',
  },
  {
    slug: 'bajar-grasa-hombres',
    skuId: 'smart-cut',
    h1: 'Bajar grasa sin perder masa muscular',
    intro:
      'Whey isolate o vegetal más EAA para sostener masa muscular durante el déficit; MCT o un sustituto de comida para llegar a la noche sin descontrolarte. Smart Cut es el protocolo que armamos para hombres en definición.',
    metaTitle: 'Suplementos para bajar grasa (hombres) | ProteinaSmart',
    metaDescription:
      'Protocolo Smart Cut: proteína isolate + EAA para bajar grasa sin perder masa muscular. Asesoría real por WhatsApp antes de comprar.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Quiero bajar grasa sin perder masa y me interesa Smart Cut.',
  },
  {
    slug: 'bajar-grasa-mujeres',
    skuId: 'smart-cut',
    h1: 'Bajar grasa sin perder masa muscular (mujeres)',
    intro:
      'El mismo desafío que en cualquier definición: bajar grasa sin quedarte sin proteína suficiente. Smart Cut combina una proteína de alta saciedad con EAA, pensado para mujeres que entrenan y quieren un protocolo claro, no una dieta genérica.',
    metaTitle: 'Suplementos para bajar grasa en mujeres | ProteinaSmart',
    metaDescription:
      'Protocolo Smart Cut para mujeres: proteína isolate o vegetal + EAA para bajar grasa cuidando la masa muscular. Asesoría por WhatsApp.',
    whatsappMensaje:
      'Hola ProteinaSmart 👋 Soy mujer y quiero bajar grasa sin perder masa muscular. Me interesa Smart Cut.',
  },
  {
    slug: 'keto-low-carb',
    skuId: 'smart-cut',
    h1: 'Suplementos que sí funcionan con keto y low carb',
    intro:
      'Si ya estás en el estilo de vida keto o low carb, lo que te falta no es motivación, es producto confiable: MCT, proteína sin carga glucémica y un sustituto de comida que no te saque de cetosis. Ese es el eje de Smart Cut.',
    metaTitle: 'Suplementos para dieta keto y low carb | ProteinaSmart',
    metaDescription:
      'MCT, proteína isolate y sustitutos de comida aptos para keto y low carb. Protocolo Smart Cut, con asesoría real por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Estoy en keto/low carb y quiero info sobre Smart Cut.',
  },
  {
    slug: 'energia-y-foco',
    skuId: 'smart-40-plus',
    h1: 'Energía y foco mental, sin depender solo de la cafeína',
    intro:
      'Omega 3 y magnesio glicinato como base, con un nootrópico si tu prioridad es concentración o MCT si buscás energía sostenida durante el día. Smart 40+ es el protocolo que armamos para cansancio mental y bajón de energía.',
    metaTitle: 'Suplementos para energía y foco mental | ProteinaSmart',
    metaDescription:
      'Omega 3, magnesio y nootrópicos para energía y foco sin abusar de la cafeína. Protocolo Smart 40+, con asesoría por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Ando con poca energía y foco, quiero info sobre Smart 40+.',
  },
  {
    slug: 'longevidad-40',
    skuId: 'smart-40-plus',
    h1: 'Longevidad después de los 40: qué suplementar con criterio',
    intro:
      'Pasados los 40 el objetivo cambia: sostener energía, función cognitiva y una base antiinflamatoria simple. Omega 3 y magnesio son el núcleo de Smart 40+, el mismo protocolo que en energía y foco, pensado para sostenerse en el tiempo.',
    metaTitle: 'Suplementos para longevidad después de los 40 | ProteinaSmart',
    metaDescription:
      'Omega 3 y magnesio como base para sostener energía y función cognitiva después de los 40. Protocolo Smart 40+, con asesoría por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Tengo más de 40 y busco un protocolo de longevidad, Smart 40+.',
  },
  {
    slug: 'piel-pelo-unas',
    skuId: 'smart-glow',
    h1: 'Piel, pelo y uñas: colágeno con criterio',
    intro:
      'Colágeno hidrolizado con vitamina C (que ayuda a su síntesis) más omega 3 y vitamina D3+K2 como sostén general. Smart Glow es el protocolo que armamos para piel, pelo y uñas, tomado todos los días en ayunas.',
    metaTitle: 'Colágeno para piel, pelo y uñas | ProteinaSmart',
    metaDescription:
      'Colágeno hidrolizado + vitamina C, omega 3 y D3+K2. Protocolo Smart Glow para piel, pelo y uñas, con asesoría por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Quiero cuidar piel, pelo y uñas, me interesa Smart Glow.',
  },
  {
    slug: 'articulaciones',
    skuId: 'smart-glow',
    h1: 'Bienestar articular: colágeno y omega 3',
    intro:
      'El mismo núcleo que usamos para piel y pelo — colágeno hidrolizado y omega 3 — es también la base más usada para acompañar la salud articular día a día. Smart Glow no reemplaza un diagnóstico: es un complemento, no un tratamiento.',
    metaTitle: 'Colágeno y omega 3 para las articulaciones | ProteinaSmart',
    metaDescription:
      'Colágeno hidrolizado y omega 3 como complemento para el bienestar articular diario. Protocolo Smart Glow, con asesoría por WhatsApp.',
    whatsappMensaje: 'Hola ProteinaSmart 👋 Busco algo para acompañar mis articulaciones, me interesa Smart Glow.',
  },
];

export function obtenerLanding(slug: string): ObjetivoLanding | undefined {
  return OBJETIVOS_LANDINGS.find((landing) => landing.slug === slug);
}
