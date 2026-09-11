import type { SmartProtocol } from "./types.ts";

// Contenido editorial de los 4 protocolos. Reglas de la casa (AGENTS.md):
// voseo, sin promesas de resultado, sin dosis ni lenguaje de tratamiento.
// Ninguna definición nombra una marca ni un SKU: solo prioridades y roles.
export const smartProtocols: SmartProtocol[] = [
  {
    id: "SMART_START",
    slug: "smart-start",
    name: "Smart Start",
    tagline: "Empezar sin comprar de más.",
    goal: "Ordenar lo básico y sostenerlo tres meses seguidos antes de sumar nada.",
    forWho: [
      "Empezás o retomás el entrenamiento después de un parate.",
      "Entrenás de 0 a 3 veces por semana y todavía no tenés una rutina fija.",
      "Querés saber qué comprar primero y qué puede esperar.",
    ],
    notForWho: [
      "Buscás reemplazar comida, descanso o entrenamiento con suplementos.",
      "Ya entrenás con rutina estructurada hace más de seis meses: ahí va Smart Muscle.",
      "Tenés una condición de salud, medicación, embarazo o lactancia para revisar antes.",
    ],
    practicalFoundation: [
      "Lo que decide el resultado es la adherencia. El suplemento solo resuelve una brecha puntual.",
      "Antes de sumar un producto miramos cuánta proteína llegás a cubrir con comida.",
      "Uno o dos productos bien elegidos se sostienen en el tiempo; seis no.",
    ],
    priorities: [
      {
        key: "PROTEIN_GAP",
        label: "Cerrar la brecha proteica",
        level: "conditional",
        condition: "Si con tus comidas no llegás al objetivo diario de proteína.",
        reason: "Es la forma más práctica y barata de cerrar esa diferencia. Si ya llegás con comida, no hace falta.",
        roles: ["PROTEIN_GAP"],
        eligibility: "PROTEIN_GAP",
      },
      {
        key: "CREATINE",
        label: "Creatina",
        level: "optional",
        reason: "Se suma cuando ya sostenés la rutina y revisaste la etiqueta, no el primer día.",
        roles: ["CREATINE"],
        eligibility: "CREATINE",
      },
    ],
    redundancies: [
      { roles: ["EAA"], reason: "Si cubrís la proteína del día, sumar aminoácidos esenciales aparte no agrega nada al empezar." },
      { roles: ["RECOVERY_AMINO"], reason: "Un aminoácido aislado no es prioridad cuando todavía estás armando la base." },
      { roles: ["PRE_WORKOUT"], reason: "Un estimulante no resuelve lo que falta al empezar: constancia, sueño y comida." },
    ],
    avoid: [
      "Packs de cinco productos para arrancar.",
      "Quemadores, detox o promesas de definición rápida.",
      "Elegir por promesa de resultado en vez de mirar la etiqueta.",
    ],
    expectations: [
      "En 4 semanas lo razonable es una rutina más sostenible y menos decisiones improvisadas, no un cambio visible.",
      "Ningún suplemento acelera lo que no hace el entrenamiento.",
      "Si en 3 meses no sostuviste la rutina, el problema no se arregla comprando otra cosa.",
    ],
    commonMistakes: [
      "Comprar todo junto el primer mes y abandonarlo el segundo.",
      "Descuidar comida y descanso confiando en el suplemento.",
      "Cambiar de producto cada dos semanas sin darle tiempo a nada.",
    ],
    smartCheck: [
      { day: 7, focus: "Practicidad", question: "¿Lo pudiste tomar todos los días sin que te complique la rutina?" },
      { day: 21, focus: "Tolerancia y adherencia", question: "¿Te cayó bien y seguís entrenando con la frecuencia que planificaste?" },
      { day: 30, focus: "Ajuste", question: "¿Conviene sostener lo mismo, cambiar la presentación o todavía no sumar nada?" },
    ],
    whatsappContext: "Estoy viendo el protocolo Smart Start y quiero confirmar por dónde empezar en mi caso.",
  },
  {
    id: "SMART_MUSCLE",
    slug: "smart-muscle",
    name: "Smart Muscle",
    tagline: "Lo que sostiene el entrenamiento de fuerza, sin relleno.",
    goal: "Acompañar un plan de fuerza que ya existe: proteína suficiente y creatina diaria.",
    forWho: [
      "Entrenás fuerza 4 o más veces por semana, o 3 con rutina estructurada y progresión registrada.",
      "Ya tenés constancia y querés ordenar qué suma de verdad.",
      "Buscás entender qué mirar en la etiqueta antes de pagar.",
    ],
    notForWho: [
      "Todavía no tenés una práctica de fuerza consistente: empezá por Smart Start.",
      "Esperás que el suplemento reemplace el déficit de entrenamiento o de comida.",
      "Tenés una condición de salud o medicación que requiere evaluación profesional previa.",
    ],
    practicalFoundation: [
      "La progresión de carga y la proteína total del día mandan. El suplemento acompaña, no dirige.",
      "La creatina monohidratada es el suplemento más estudiado para entrenamiento de fuerza: lo que importa es que sea monohidratada y que la tomes todos los días, entrenes o no.",
      "La proteína en polvo no es mejor que la comida: es más práctica cuando la comida no llega.",
    ],
    priorities: [
      {
        key: "CREATINE",
        label: "Creatina monohidratada",
        level: "required",
        reason: "Es la base del protocolo. Diaria y constante; no se cicla ni se suspende los días de descanso.",
        roles: ["CREATINE"],
        eligibility: "CREATINE",
      },
      {
        key: "PROTEIN_GAP",
        label: "Cerrar la brecha proteica",
        level: "conditional",
        condition: "Si con comida no llegás al objetivo diario de proteína.",
        reason: "Cubre la diferencia entre lo que comés y lo que tu plan necesita. Si ya llegás, es gasto.",
        roles: ["PROTEIN_GAP"],
        eligibility: "PROTEIN_GAP",
      },
      {
        key: "EAA",
        label: "Aminoácidos esenciales",
        level: "optional",
        reason: "Solo si entrenás en ayunas o te cuesta ubicar proteína alrededor del entrenamiento. Con proteína suficiente, es redundante.",
        roles: ["EAA"],
        eligibility: "EAA",
      },
    ],
    redundancies: [
      { roles: ["RECOVERY_AMINO"], reason: "Un aminoácido aislado se superpone con la proteína y los EAA que ya estarías tomando." },
      { roles: ["COLLAGEN"], reason: "No lo contamos dentro de la proteína del día: su perfil de aminoácidos no cumple la misma función." },
    ],
    avoid: [
      "Sumar un pre-entreno para tapar falta de sueño.",
      "Duplicar aminoácidos: proteína, EAA y BCAA a la vez.",
      "Fórmulas con mezcla propietaria que no declaran cuánto traen de cada cosa.",
      "Subir la dosis por tu cuenta porque el resultado no llega.",
    ],
    expectations: [
      "La creatina necesita semanas de uso constante; no se nota al tercer día.",
      "Lo que más cambia el resultado sigue siendo la progresión de carga y dormir bien.",
      "Si el entrenamiento no progresa, sumar productos no lo arregla.",
    ],
    commonMistakes: [
      "Confundir el suplemento con el plan.",
      "Elegir por marketing antes que por etiqueta.",
      "Tomar creatina solo los días de entrenamiento.",
      "Comprar el envase más grande antes de saber si lo vas a sostener.",
    ],
    smartCheck: [
      { day: 7, focus: "Tolerancia", question: "¿Te cayó bien y pudiste sostener la toma diaria?" },
      { day: 21, focus: "Entrenamiento", question: "¿Pudiste sostener la frecuencia y la progresión que tenías planificada?" },
      { day: 30, focus: "Ajuste y reposición", question: "¿Cuánto producto te queda y conviene mantener la misma presentación?" },
    ],
    whatsappContext: "Estoy viendo el protocolo Smart Muscle y quiero confirmar qué opciones aplican a mi entrenamiento.",
  },
  {
    id: "SMART_CUT",
    slug: "smart-cut",
    name: "Smart Cut",
    tagline: "Sostener el déficit sin perder músculo ni la cabeza.",
    goal: "Ordenar proteína y saciedad para que el déficit se pueda sostener. Sin quemadores.",
    forWho: [
      "Estás en déficit o querés ordenar la alimentación para bajar grasa.",
      "El problema real es llegar a la proteína del día y tener comidas resueltas.",
      "Entrenás con alguna regularidad y querés conservar masa muscular.",
    ],
    notForWho: [
      "Buscás un producto que queme grasa: no lo vendemos ni lo recomendamos.",
      "Venís de restricciones extremas o de una relación difícil con la comida: eso se trabaja con un profesional, no con suplementos.",
      "Tenés una bandera de seguridad pendiente de revisar.",
    ],
    practicalFoundation: [
      "En déficit, la proteína es lo primero que se cae y lo primero que ordenamos.",
      "La saciedad es un problema de logística: si a mediodía no tenés nada resuelto, el déficit se rompe solo.",
      "Ningún producto crea déficit. El déficit lo crea lo que comés en la semana.",
    ],
    priorities: [
      {
        key: "PROTEIN_GAP",
        label: "Proteína suficiente en déficit",
        level: "required",
        reason: "Es lo que más cuesta sostener cuando bajás calorías, y lo que más conviene no descuidar.",
        roles: ["PROTEIN_GAP"],
        eligibility: "PROTEIN_GAP",
      },
      {
        key: "SATIETY_SUPPORT",
        label: "Comida resuelta",
        level: "conditional",
        condition: "Si el punto de fuga es el almuerzo fuera de casa o la picada de la tarde.",
        reason: "Una comida práctica y baja en carbohidratos evita la decisión improvisada. Si ya tenés la logística resuelta, no hace falta.",
        roles: ["MEAL_REPLACEMENT", "LOW_CARB_SNACK"],
        eligibility: "CONDITIONAL_SUPPORT",
      },
      {
        key: "CREATINE",
        label: "Creatina",
        level: "optional",
        reason: "Si ya la venías tomando, no hay razón para dejarla durante el déficit.",
        roles: ["CREATINE"],
        eligibility: "CREATINE",
      },
      {
        key: "SUGAR_SWAP",
        label: "Reemplazo de azúcar",
        level: "optional",
        reason: "Solo si el azúcar del café o del postre es tu punto de fuga concreto.",
        roles: ["SWEETENER"],
        eligibility: "CONDITIONAL_SUPPORT",
      },
    ],
    redundancies: [
      { roles: ["PRE_WORKOUT"], reason: "Un estimulante no es una estrategia de déficit y puede tapar señales de fatiga que conviene escuchar." },
      { roles: ["MCT"], reason: "Suma calorías de grasa: en déficit no lo incluimos, salvo que vengas de una dieta keto ya armada." },
      { roles: ["RECOVERY_AMINO"], reason: "Se superpone con la proteína que ya estás priorizando." },
    ],
    avoid: [
      "Quemadores, termogénicos y detox.",
      "Reemplazar dos comidas por batidos para ir más rápido.",
      "Sumar ayuno agresivo arriba de un déficit agresivo.",
      "Bajar la proteína para que entren más calorías de otra cosa.",
    ],
    expectations: [
      "Un déficit sostenible se mide en meses, no en semanas.",
      "Lo esperable es llegar mejor a la proteína del día y tener menos comidas improvisadas.",
      "Si el peso no se mueve, se revisa la alimentación de la semana, no el suplemento.",
    ],
    commonMistakes: [
      "Eliminar grupos de alimentos sin criterio.",
      "Comprar estimulantes como estrategia central.",
      "Medir el progreso solo con la balanza y abandonar a la tercera semana.",
    ],
    smartCheck: [
      { day: 7, focus: "Logística", question: "¿Las comidas difíciles de la semana quedaron resueltas?" },
      { day: 21, focus: "Saciedad y energía", question: "¿Pudiste sostener el plan sin episodios de hambre que te lo rompan?" },
      { day: 30, focus: "Ajuste", question: "¿Conviene sostener, ajustar porciones o revisar el plan con un profesional?" },
    ],
    whatsappContext: "Estoy viendo el protocolo Smart Cut y quiero confirmar cómo ordenar proteína y comidas en mi caso.",
  },
  {
    id: "SMART_40_PLUS",
    slug: "smart-40",
    name: "Smart 40+",
    tagline: "Fuerza y proteína para los próximos veinte años.",
    goal: "Sostener masa muscular y capacidad funcional con decisiones simples y revisadas.",
    forWho: [
      "Tenés 40 o más y querés conservar fuerza y autonomía a largo plazo.",
      "Entrenás fuerza o estás por empezar, y querés ordenar la alimentación alrededor.",
      "Preferís pocas decisiones bien fundamentadas antes que una lista larga de productos.",
    ],
    notForWho: [
      "Buscás un protocolo antiedad: no existe y no lo vendemos.",
      "Tomás medicación habitual o tenés una condición diagnosticada y todavía no lo hablaste con tu médico.",
      "Esperás que el suplemento reemplace el entrenamiento de fuerza.",
    ],
    practicalFoundation: [
      "Con los años cuesta más sostener masa muscular: el entrenamiento de fuerza es la parte que no se reemplaza.",
      "La proteína importa todos los días, no solo los días que entrenás.",
      "Cuantos más productos sumás, más importa revisar el contexto completo con tu médico.",
    ],
    priorities: [
      {
        key: "PROTEIN_GAP",
        label: "Proteína suficiente todos los días",
        level: "required",
        reason: "Es la prioridad del protocolo. Primero se revisa la comida; el polvo entra donde la comida no llega.",
        roles: ["PROTEIN_GAP"],
        eligibility: "PROTEIN_GAP",
      },
      {
        key: "DAILY_SUPPORT",
        label: "Apoyo diario según tu contexto",
        level: "conditional",
        condition: "Según tu alimentación y lo que ya hayas conversado con tu médico.",
        reason: "Se revisa caso por caso, de a uno por vez. Nunca los tres juntos por defecto.",
        roles: ["OMEGA3", "MAGNESIUM", "VITAMIN_D_K"],
        eligibility: "CONDITIONAL_SUPPORT",
      },
      {
        key: "CREATINE",
        label: "Creatina",
        level: "optional",
        reason: "Se evalúa junto con el entrenamiento de fuerza y con tu contexto de salud, no de forma automática.",
        roles: ["CREATINE"],
        eligibility: "CREATINE",
      },
    ],
    redundancies: [
      { roles: ["PRE_WORKOUT"], reason: "No lo sumamos por defecto: si tomás medicación o tenés presión alta, un estimulante es justo lo que conviene revisar antes con tu médico." },
      { roles: ["RECOVERY_AMINO"], reason: "No agrega sobre una proteína diaria suficiente." },
      { roles: ["COLLAGEN"], reason: "El colágeno es una decisión personal y puede estar en tu compra, pero no entra como prioridad del protocolo: no cumple la misma función que la proteína del día." },
    ],
    avoid: [
      "Protocolos antiedad milagrosos.",
      "Sumar cinco cápsulas distintas sin saber cuál hace qué.",
      "Dejar el entrenamiento de fuerza en segundo plano.",
      "Empezar tres productos el mismo día: si algo no cae bien, no sabés cuál fue.",
    ],
    expectations: [
      "El objetivo es sostener fuerza y hábitos, no revertir la edad.",
      "Los cambios en composición corporal a esta altura son lentos y dependen del entrenamiento.",
      "Lo que sí se nota rápido es tener la alimentación ordenada y menos decisiones sueltas.",
    ],
    commonMistakes: [
      "Suplementar sin entrenar fuerza.",
      "Tomar varios productos sin revisar interacciones con la medicación.",
      "Bajar la proteína por miedo, sin haberlo conversado con un profesional.",
    ],
    smartCheck: [
      { day: 7, focus: "Tolerancia", question: "¿Te cayó bien y pudiste sostener la rutina de tomas?" },
      { day: 21, focus: "Fuerza y hábitos", question: "¿Sostuviste el entrenamiento de fuerza y la proteína del día?" },
      { day: 30, focus: "Revisión", question: "¿Hay algo para revisar con tu médico antes de sostener o cambiar algo?" },
    ],
    whatsappContext: "Estoy viendo el protocolo Smart 40+ y quiero confirmar qué corresponde revisar en mi caso.",
  },
];

export const getProtocol = (id: SmartProtocol["id"]) => smartProtocols.find((protocol) => protocol.id === id);
export const getProtocolBySlug = (slug: string) => smartProtocols.find((protocol) => protocol.slug === slug);
