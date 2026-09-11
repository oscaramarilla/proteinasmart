import type { ProductPriority } from "../product-eligibility.ts";
import type { ProductRole } from "../products.ts";
import type { SmartStack } from "../smart-quiz/engine.ts";

// Un protocolo describe prioridades, no productos. La única forma de llegar a
// un SKU es: prioridad -> roles -> productos activos del catálogo que cumplen
// ese rol y pasan el gate de elegibilidad (`product-eligibility.ts`).
export type PriorityLevel = "required" | "conditional" | "optional";

export type ProtocolPriorityKey =
  | "PROTEIN_GAP"
  | "CREATINE"
  | "EAA"
  | "SATIETY_SUPPORT"
  | "SUGAR_SWAP"
  | "DAILY_SUPPORT";

export type ProtocolPriority = {
  key: ProtocolPriorityKey;
  label: string;
  level: PriorityLevel;
  /** Obligatorio cuando `level` es "conditional": cuándo aplica. */
  condition?: string;
  reason: string;
  /** Roles del catálogo que pueden cumplirla. Descubre candidatos, no los aprueba. */
  roles: ProductRole[];
  /** Código con el que `product-eligibility.ts` evalúa la aprobación. */
  eligibility: ProductPriority;
};

/** Exclusión estructural por rol: qué queda fuera del protocolo y por qué. */
export type ProtocolRedundancy = { roles: ProductRole[]; reason: string };

/** Revisión posterior a la compra. Sin automatización todavía (ver docs/REORDER_ENGINE.md). */
export type SmartCheckPoint = { day: number; focus: string; question: string };

export type SmartProtocol = {
  id: SmartStack;
  slug: string;
  name: string;
  tagline: string;
  goal: string;
  forWho: string[];
  notForWho: string[];
  practicalFoundation: string[];
  priorities: ProtocolPriority[];
  redundancies: ProtocolRedundancy[];
  /** Lo que no recomendamos, en lenguaje comercial (complementa `redundancies`). */
  avoid: string[];
  expectations: string[];
  commonMistakes: string[];
  smartCheck: SmartCheckPoint[];
  /** Semilla del mensaje de WhatsApp contextual. Nunca lleva datos clínicos. */
  whatsappContext: string;
};

export const priorityLevelLabels: Record<PriorityLevel, string> = {
  required: "Base",
  conditional: "Según tu caso",
  optional: "Opcional",
};
