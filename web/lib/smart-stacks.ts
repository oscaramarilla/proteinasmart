// DEPRECADO — adaptador de compatibilidad.
//
// El modelo real vive en `lib/smart-protocols/` (definiciones + resolver).
// Este módulo sobrevive para no romper el código y los tests que ya
// importaban la API vieja de "stacks". Código nuevo: importar
// `lib/smart-protocols` directamente.
import { evaluateProductEligibility, type RecommendationRole } from "./product-eligibility.ts";
import { products, productsByRole, type Product, type ProductRole } from "./products.ts";
import { getProtocol, smartProtocols } from "./smart-protocols/definitions.ts";
import { resolveProtocol } from "./smart-protocols/resolve.ts";
import type { ProtocolPriorityKey } from "./smart-protocols/types.ts";
import type { SmartStack } from "./smart-quiz/engine.ts";

export type ProductPriority = "CREATINE" | "PROTEIN_GAP" | "EAA" | "RECOVERY" | "CONDITIONAL_SUPPORT";
export type SmartStackDefinition = {
  id: SmartStack; slug: string; name: string; goal: string; forWho: string; notForWho: string;
  practicalFoundation: string; priorities: Array<{ key: ProductPriority; label: string; reason: string; required: boolean }>;
  exclusions: string[]; expectations: string; commonMistakes: string[];
};

const legacyKey: Record<ProtocolPriorityKey, ProductPriority> = {
  PROTEIN_GAP: "PROTEIN_GAP", CREATINE: "CREATINE", EAA: "EAA",
  SATIETY_SUPPORT: "CONDITIONAL_SUPPORT", SUGAR_SWAP: "CONDITIONAL_SUPPORT",
  DAILY_SUPPORT: "CONDITIONAL_SUPPORT",
};

const legacyRoles: Record<ProductPriority, ProductRole[]> = {
  CREATINE: ["CREATINE"],
  PROTEIN_GAP: ["PROTEIN_GAP"],
  EAA: ["EAA"],
  RECOVERY: ["RECOVERY_AMINO"],
  CONDITIONAL_SUPPORT: ["MCT", "LOW_CARB_SNACK", "MEAL_REPLACEMENT", "SWEETENER", "OMEGA3", "MAGNESIUM", "VITAMIN_D_K", "COLLAGEN", "NOOTROPIC"],
};

export const smartStacks: SmartStackDefinition[] = smartProtocols.map((protocol) => ({
  id: protocol.id,
  slug: protocol.slug,
  name: protocol.name,
  goal: protocol.goal,
  forWho: protocol.forWho.join(" "),
  notForWho: protocol.notForWho.join(" "),
  practicalFoundation: protocol.practicalFoundation.join(" "),
  // "required" acá significa "es parte de la base del protocolo": incluye las
  // prioridades condicionales, que el modelo nuevo distingue aparte.
  priorities: protocol.priorities.map((priority) => ({
    key: legacyKey[priority.key],
    label: priority.label,
    reason: priority.reason,
    required: priority.level !== "optional",
  })),
  exclusions: [...protocol.avoid, ...protocol.redundancies.map((redundancy) => redundancy.reason)],
  expectations: protocol.expectations.join(" "),
  commonMistakes: protocol.commonMistakes,
}));

export function getSmartStackBySlug(slug: string) { return smartStacks.find((stack) => stack.slug === slug); }
export function getSmartStack(id: SmartStack) { return smartStacks.find((stack) => stack.id === id); }

export function resolvePriorityProducts(priority: ProductPriority, role: RecommendationRole, catalog: Product[] = products): Product[] {
  return productsByRole(legacyRoles[priority], catalog).filter((product) => evaluateProductEligibility(product, role).eligible);
}

export function resolveStackProducts(stack: SmartStackDefinition, optional = false): Product[] {
  const protocol = getProtocol(stack.id);
  if (!protocol) return [];
  const resolved = resolveProtocol(protocol);
  const groups = optional ? [resolved.optional] : [resolved.required, resolved.conditional];
  return groups.flat().flatMap((resolution) => resolution.products);
}
