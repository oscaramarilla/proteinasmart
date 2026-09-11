export type Goal = "MASS" | "CUT" | "PERFORMANCE" | "LONGEVITY";
export type Frequency = "LOW" | "MEDIUM" | "HIGH";
export type BudgetTier = "ESSENTIAL" | "LITE" | "CORE" | "FULL";
export type SmartStack = "SMART_START" | "SMART_MUSCLE" | "SMART_CUT" | "SMART_40_PLUS";
export type SafetyStatus = "OK" | "REVIEW_REQUIRED";
export type QuizInput = { goal: Goal; frequency: Frequency; trainingMonths: number; structuredRoutine: boolean; budget: number; safetyRedFlag: boolean };
export type QuizResult = { stack?: SmartStack; tier: BudgetTier; safetyStatus: SafetyStatus; priorities: string[]; optionalProducts: string[]; avoidProducts: string[]; rationale: string };

export function resolveBudgetTier(budget: number): BudgetTier {
  if (budget <= 300000) return "ESSENTIAL";
  if (budget <= 500000) return "LITE";
  if (budget <= 700000) return "CORE";
  return "FULL";
}
export function resolveQuiz(input: QuizInput): QuizResult {
  const tier = resolveBudgetTier(input.budget);
  if (input.safetyRedFlag) return { tier, safetyStatus: "REVIEW_REQUIRED", priorities: [], optionalProducts: [], avoidProducts: [], rationale: "Tus respuestas requieren orientación profesional antes de una recomendación automatizada." };
  let stack: SmartStack;
  if (input.goal === "CUT") stack = "SMART_CUT";
  else if (input.goal === "LONGEVITY") stack = "SMART_40_PLUS";
  else if (input.goal === "MASS") stack = input.frequency === "HIGH" || (input.frequency === "MEDIUM" && input.trainingMonths >= 6 && input.structuredRoutine) ? "SMART_MUSCLE" : "SMART_START";
  else stack = input.frequency === "HIGH" || (input.frequency === "MEDIUM" && input.trainingMonths >= 6) ? "SMART_MUSCLE" : "SMART_START";
  const priorities = stack === "SMART_MUSCLE" ? ["Creatina", "Completar la brecha proteica"] : stack === "SMART_CUT" ? ["Cubrir la brecha proteica si existe", "Hábitos sostenibles"] : stack === "SMART_40_PLUS" ? ["Fuerza y proteína suficiente", "Revisar opciones según contexto"] : ["Entrenamiento y alimentación consistentes", "Completar la brecha proteica si existe"];
  return { stack, tier, safetyStatus: "OK", priorities, optionalProducts: ["Opcionales solo cuando el contexto lo justifique"], avoidProducts: ["Productos redundantes o promesas milagrosas"], rationale: "El presupuesto cambia la prioridad y cantidad de productos, no el protocolo base." };
}
