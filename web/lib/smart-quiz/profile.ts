import { getProtocol } from "../smart-protocols/definitions.ts";
import { resolveProtocol, tierPolicy, type PriorityResolution, type ResolvedProtocol } from "../smart-protocols/resolve.ts";
import type { SmartProtocol } from "../smart-protocols/types.ts";
import {
  resolveQuiz,
  type BudgetTier,
  type Frequency,
  type Goal,
  type QuizInput,
  type SafetyStatus,
  type SmartStack,
} from "./engine.ts";

/** Razón breve y legible de cada decisión del motor. Nunca es un diagnóstico. */
export type ProfileDecision = { title: string; detail: string };

export type SmartProfile = {
  goal: Goal;
  goalLabel: string;
  frequency: Frequency;
  frequencyLabel: string;
  trainingMonths: number;
  experienceLabel: string;
  structuredRoutine: boolean;
  tier: BudgetTier;
  tierLabel: string;
  tierNote: string;
  safetyStatus: SafetyStatus;
  stack?: SmartStack;
  protocol?: SmartProtocol;
  resolved?: ResolvedProtocol;
  /** Prioridades que entran hoy, según el presupuesto declarado. */
  suggested: PriorityResolution[];
  /** Prioridades opcionales dentro del presupuesto. */
  optional: PriorityResolution[];
  /** Prioridades reales del protocolo que el presupuesto deja para más adelante. */
  later: PriorityResolution[];
  /** Lo que no recomendamos, con su motivo. */
  avoid: Array<{ label: string; reason: string }>;
  decisions: ProfileDecision[];
};

export const goalLabels: Record<Goal, string> = {
  MASS: "Ganar masa muscular",
  CUT: "Bajar grasa y cuidar la composición corporal",
  PERFORMANCE: "Rendimiento y energía",
  LONGEVITY: "Salud, fuerza y longevidad",
};

export const frequencyLabels: Record<Frequency, string> = {
  LOW: "0 a 2 veces por semana",
  MEDIUM: "3 a 4 veces por semana",
  HIGH: "5 o más veces por semana",
};

export const tierLabels: Record<BudgetTier, string> = {
  ESSENTIAL: "Essential · hasta Gs. 300.000",
  LITE: "Lite · hasta Gs. 500.000",
  CORE: "Core · hasta Gs. 700.000",
  FULL: "Full · más de Gs. 700.000",
};

export function experienceLabel(months: number): string {
  if (months <= 0) return "Estoy empezando";
  if (months < 6) return "Menos de 6 meses";
  if (months < 12) return "Entre 6 y 12 meses";
  return "Más de un año";
}

function explainStackChoice(input: QuizInput, protocol: SmartProtocol): string {
  const frequency = frequencyLabels[input.frequency].toLowerCase();
  if (protocol.id === "SMART_CUT") {
    return `Elegiste bajar grasa, así que el protocolo prioriza proteína suficiente y comidas resueltas antes que cualquier otra cosa. Entrenar ${frequency} define el volumen, no el protocolo.`;
  }
  if (protocol.id === "SMART_40_PLUS") {
    return "Elegiste salud, fuerza y longevidad: el protocolo arranca por proteína diaria y entrenamiento de fuerza, y revisa el resto de a uno según tu contexto.";
  }
  if (protocol.id === "SMART_MUSCLE") {
    const experience = input.trainingMonths >= 6 ? `con ${experienceLabel(input.trainingMonths).toLowerCase()} de entrenamiento` : "con la frecuencia que declaraste";
    const routine = input.structuredRoutine ? " y una rutina estructurada" : "";
    return `Entrenás ${frequency} ${experience}${routine}, así que el protocolo asume una práctica de fuerza que ya existe y se enfoca en sostenerla.`;
  }
  return `Entrenás ${frequency} y todavía estás armando la base, así que el protocolo prioriza consistencia y una sola decisión de compra a la vez. Cuando la rutina se sostenga, el paso siguiente es Smart Muscle.`;
}

export function buildSmartProfile(input: QuizInput): SmartProfile {
  const result = resolveQuiz(input);
  const policy = tierPolicy(result.tier);
  const base: Omit<SmartProfile, "suggested" | "optional" | "later" | "avoid" | "decisions"> = {
    goal: input.goal,
    goalLabel: goalLabels[input.goal],
    frequency: input.frequency,
    frequencyLabel: frequencyLabels[input.frequency],
    trainingMonths: input.trainingMonths,
    experienceLabel: experienceLabel(input.trainingMonths),
    structuredRoutine: input.structuredRoutine,
    tier: result.tier,
    tierLabel: tierLabels[result.tier],
    tierNote: policy.note,
    safetyStatus: result.safetyStatus,
    stack: result.stack,
  };

  const protocol = result.stack ? getProtocol(result.stack) : undefined;

  // Safety Gate: sin protocolo, sin productos y sin explicaciones que parezcan
  // un diagnóstico. Solo el motivo de la derivación.
  if (result.safetyStatus === "REVIEW_REQUIRED" || !protocol) {
    return {
      ...base,
      protocol: undefined,
      resolved: undefined,
      suggested: [],
      optional: [],
      later: [],
      avoid: [],
      decisions: [
        {
          title: "Por qué no hay una recomendación automática",
          detail: "Marcaste algo que preferimos revisar con una persona antes de sugerir productos. No es un diagnóstico ni una contraindicación: es el criterio de la casa.",
        },
      ],
    };
  }

  // El Quiz sin banderas es el único contexto de seguridad que el sistema
  // puede afirmar hoy. Sin él, la elegibilidad falla cerrada por diseño.
  const resolved = resolveProtocol(protocol, { safety: { status: "CLEARED", flags: [] } });
  const withinBudget = (resolution: PriorityResolution) => policy.levels.includes(resolution.priority.level);
  const baseResolutions = [...resolved.required, ...resolved.conditional];
  const suggested = baseResolutions.filter(withinBudget);
  const optional = resolved.optional.filter(withinBudget);
  const later = [...baseResolutions, ...resolved.optional].filter((resolution) => !withinBudget(resolution));

  const decisions: ProfileDecision[] = [
    { title: `Por qué ${protocol.name}`, detail: explainStackChoice(input, protocol) },
    { title: `Por qué el nivel ${result.tier}`, detail: `${policy.note} El presupuesto cambia cuántas prioridades entran hoy, nunca cuál es el protocolo.` },
    ...suggested.map((resolution) => ({
      title: `Por qué ${resolution.priority.label.toLowerCase()}`,
      detail: resolution.priority.condition ? `${resolution.priority.condition} ${resolution.priority.reason}` : resolution.priority.reason,
    })),
    ...optional.map((resolution) => ({
      title: `Por qué ${resolution.priority.label.toLowerCase()} es opcional`,
      detail: resolution.priority.reason,
    })),
  ];

  if (resolved.eligibleCount === 0) {
    decisions.push({
      title: "Por qué todavía no ves productos concretos",
      detail: "Solo recomendamos fichas con precio, disponibilidad, formulación y autenticidad confirmados. Las que faltan se confirman por WhatsApp antes de que compres, no después.",
    });
  }

  return {
    ...base,
    protocol,
    resolved,
    suggested,
    optional,
    later,
    avoid: [
      ...protocol.redundancies.map((redundancy) => ({ label: "Fuera del protocolo", reason: redundancy.reason })),
      ...protocol.avoid.map((item) => ({ label: "No recomendamos", reason: item })),
    ],
    decisions,
  };
}

const goals: Goal[] = ["MASS", "CUT", "PERFORMANCE", "LONGEVITY"];
const frequencies: Frequency[] = ["LOW", "MEDIUM", "HIGH"];
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Lee los parámetros del Quiz. Devuelve `null` si falta lo mínimo para resolver. */
export function parseQuizParams(params: Record<string, string | string[] | undefined>): QuizInput | null {
  const goal = first(params.goal);
  const frequency = first(params.frequency);
  if (!goal || !goals.includes(goal as Goal)) return null;
  if (!frequency || !frequencies.includes(frequency as Frequency)) return null;
  const months = Number(first(params.months));
  const budget = Number(first(params.budget));
  return {
    goal: goal as Goal,
    frequency: frequency as Frequency,
    trainingMonths: Number.isFinite(months) && months > 0 ? months : 0,
    structuredRoutine: first(params.structured) === "true",
    budget: Number.isFinite(budget) && budget > 0 ? budget : 0,
    safetyRedFlag: first(params.safety) === "true",
  };
}

/**
 * Mensaje de WhatsApp del resultado. Sin nombre, sin teléfono y sin ninguna
 * respuesta clínica: objetivo, frecuencia, experiencia, protocolo y nivel.
 */
export function buildProfileWhatsAppMessage(profile: SmartProfile): string {
  if (profile.safetyStatus === "REVIEW_REQUIRED") {
    return "Hola ProteínaSmart. Hice el Smart Quiz y prefiero una revisión con una persona antes de cualquier recomendación.";
  }
  return [
    "Hola ProteínaSmart. Este es mi Smart Profile:",
    `Objetivo: ${profile.goalLabel}`,
    `Entrenamiento: ${profile.frequencyLabel} · ${profile.experienceLabel}`,
    `Protocolo: ${profile.protocol?.name ?? "a definir"}`,
    `Nivel: ${profile.tier}`,
    "",
    "Quiero confirmar qué opciones concretas corresponden a mis prioridades.",
  ].join("\n");
}
