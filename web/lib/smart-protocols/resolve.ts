import {
  evaluateProductEligibility,
  type ProductEligibilityContext,
  type RecommendationRole,
} from "../product-eligibility.ts";
import { products as defaultCatalog, productsByRole, type Product, type ProductRole } from "../products.ts";
import type { BudgetTier } from "../smart-quiz/engine.ts";
import type { PriorityLevel, ProtocolPriority, SmartProtocol } from "./types.ts";

/** Contexto de seguridad individual. Sin él no hay recomendación automática. */
export type ProtocolSafetyContext = NonNullable<ProductEligibilityContext["safety"]>;

export type ResolveOptions = { catalog?: Product[]; safety?: ProtocolSafetyContext; now?: Date };

/** Producto del catálogo que cumple la prioridad pero todavía no puede recomendarse. */
export type BlockedCandidate = { product: Product; reasons: string[]; reasonCodes: string[] };

export type PriorityResolution = {
  priority: ProtocolPriority;
  /** Las prioridades base y condicionales exigen el permiso PRIMARY; las opcionales, OPTIONAL. */
  role: RecommendationRole;
  products: Product[];
  blocked: BlockedCandidate[];
};

export type ResolvedProtocol = {
  protocol: SmartProtocol;
  required: PriorityResolution[];
  conditional: PriorityResolution[];
  optional: PriorityResolution[];
  /** Productos que el protocolo deja fuera a propósito, con el motivo. */
  redundant: Array<{ product: Product; reason: string }>;
  /** Prioridades sin ningún producto habilitado hoy: se resuelven a mano. */
  pending: ProtocolPriority[];
  /** `true` cuando se resolvió con un contexto individual (Quiz con Safety Gate pasado). */
  contextual: boolean;
  eligibleCount: number;
};

const roleFor = (level: PriorityLevel): RecommendationRole => (level === "optional" ? "OPTIONAL" : "PRIMARY");

const redundantRolesOf = (protocol: SmartProtocol): ProductRole[] =>
  protocol.redundancies.flatMap((redundancy) => redundancy.roles);

export function resolvePriority(
  priority: ProtocolPriority,
  protocolId: string,
  options: ResolveOptions = {},
  excludedRoles: readonly ProductRole[] = [],
): PriorityResolution {
  const { catalog = defaultCatalog, safety, now } = options;
  const role = roleFor(priority.level);
  // Los roles descubren candidatos; la elegibilidad decide si se pueden recomendar.
  const candidates = productsByRole(priority.roles, catalog).filter(
    (product) => !product.roles.some((productRole) => excludedRoles.includes(productRole)),
  );
  const products: Product[] = [];
  const blocked: BlockedCandidate[] = [];
  for (const product of candidates) {
    const eligibility = evaluateProductEligibility(product, role, {
      priority: priority.eligibility,
      protocolId,
      safety,
      now,
    });
    if (eligibility.eligible) products.push(product);
    else blocked.push({ product, reasons: eligibility.reasons, reasonCodes: eligibility.reasonCodes });
  }
  return { priority, role, products, blocked };
}

export function resolveProtocol(protocol: SmartProtocol, options: ResolveOptions = {}): ResolvedProtocol {
  const { catalog = defaultCatalog } = options;
  const excludedRoles = redundantRolesOf(protocol);
  const resolutions = protocol.priorities.map((priority) =>
    resolvePriority(priority, protocol.id, options, excludedRoles),
  );
  const byLevel = (level: PriorityLevel) => resolutions.filter((item) => item.priority.level === level);

  const redundant = protocol.redundancies.flatMap((redundancy) =>
    productsByRole(redundancy.roles, catalog).map((product) => ({ product, reason: redundancy.reason })),
  );

  return {
    protocol,
    required: byLevel("required"),
    conditional: byLevel("conditional"),
    optional: byLevel("optional"),
    redundant,
    pending: resolutions.filter((item) => item.products.length === 0).map((item) => item.priority),
    contextual: Boolean(options.safety),
    eligibleCount: resolutions.reduce((total, item) => total + item.products.length, 0),
  };
}

/**
 * El presupuesto no cambia el protocolo: cambia cuántas prioridades entran hoy.
 * Lo que queda afuera sigue visible como "más adelante", no desaparece.
 */
export function tierPolicy(tier: BudgetTier): { levels: PriorityLevel[]; note: string } {
  if (tier === "ESSENTIAL") {
    return { levels: ["required"], note: "Con este presupuesto vamos solo por lo base. Lo demás queda anotado para más adelante." };
  }
  if (tier === "LITE") {
    return { levels: ["required", "conditional"], note: "Alcanza para lo base y para lo que tu contexto justifique. Los opcionales pueden esperar." };
  }
  if (tier === "CORE") {
    return { levels: ["required", "conditional", "optional"], note: "Alcanza para el protocolo completo. Igual conviene empezar de a uno y sumar después." };
  }
  return { levels: ["required", "conditional", "optional"], note: "El presupuesto no es la limitación. Sumá de a uno para saber qué te funciona y qué no." };
}
