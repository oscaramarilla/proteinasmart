import { getProductCompleteness } from "./product-completeness.ts";
import { isPriceConfirmed, isStockConfirmed } from "./products.ts";
import type { Product, ProductFormulation, ProductRole, RecommendationStatus } from "./products.ts";
import { hasCompleteNutrition, hasVerifiedAuthenticity, hasVerifiedIngredients, isEvidenceUrl, isPastTimestamp } from "./product-validation.ts";

export type ProductPriority = "CREATINE" | "PROTEIN_GAP" | "EAA" | "RECOVERY" | "CONDITIONAL_SUPPORT";
export type RecommendationRole = "PRIMARY" | "OPTIONAL";
export type ConditionCode = "PROTEIN_GAP_CONFIRMED" | "EAA_CONTEXT_REVIEWED" | "CONDITIONAL_SUPPORT_REVIEWED";
export type ReviewedRecommendationCondition = {
  code: ConditionCode;
  productId: string;
  protocolId: string;
  rationaleCode: "DIETARY_GAP_REVIEWED" | "MEAL_ACCESS_LIMITED" | "DIETARY_RESTRICTION_REVIEWED" | "INDIVIDUAL_SUPPORT_REVIEWED";
  reviewedBy: string;
  reviewedAt: string;
  expiresAt: string;
  evidenceUrl: string;
};
export type ProductEligibilityRules = {
  excludedProductIds?: readonly string[];
  excludedPriorities?: readonly ProductPriority[];
  excludedCategories?: readonly Product["category"][];
  excludedFormulations?: readonly ProductFormulation["classification"][];
};
export type ProductEligibilityContext = {
  priority?: ProductPriority;
  protocolId?: string;
  now?: Date;
  safety?: { status: "CLEARED" | "REVIEW_REQUIRED" | "UNKNOWN"; flags: string[] };
  conditions?: ReviewedRecommendationCondition[];
  rules?: ProductEligibilityRules;
};
export type ProductEligibility = {
  eligible: boolean;
  role: RecommendationRole;
  status: RecommendationStatus;
  reasons: string[];
  reasonCodes: string[];
};

// Las relaciones semánticas sirven para descubrir candidatos; nunca los aprueban.
export const priorityProductRoles: Record<ProductPriority, readonly ProductRole[]> = {
  CREATINE: ["CREATINE"],
  PROTEIN_GAP: ["PROTEIN_GAP"],
  EAA: ["EAA"],
  RECOVERY: ["RECOVERY_AMINO"],
  // Los roles keto (sustituto, snack, endulzante) entran acá porque las
  // prioridades "comida resuelta" y "reemplazo de azúcar" de Smart Cut se
  // evalúan como apoyo condicional. Categoría y formulación siguen filtrando.
  CONDITIONAL_SUPPORT: ["MCT", "OMEGA3", "MAGNESIUM", "VITAMIN_D_K", "MEAL_REPLACEMENT", "LOW_CARB_SNACK", "SWEETENER"],
};
const priorityCategories: Record<ProductPriority, readonly Product["category"][]> = {
  CREATINE: ["creatina"], PROTEIN_GAP: ["proteinas"], EAA: ["rendimiento"],
  RECOVERY: ["rendimiento"], CONDITIONAL_SUPPORT: ["keto", "longevidad"],
};
const priorityFormulations: Record<ProductPriority, readonly ProductFormulation["classification"][]> = {
  CREATINE: ["CREATINE_MONOHYDRATE_SINGLE"], PROTEIN_GAP: ["COMPLETE_PROTEIN"],
  EAA: ["EAA"], RECOVERY: ["RECOVERY_AMINO"], CONDITIONAL_SUPPORT: ["OTHER"],
};
export function matchesProductPriority(product: Product, priority: ProductPriority): boolean {
  return (product.roles ?? []).some((role) => priorityProductRoles[priority]?.includes(role));
}
const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
function validReview(review: { reviewedBy: string; reviewedAt: string; expiresAt: string; evidenceUrl: string }, now: Date): boolean {
  const expiry = Date.parse(review.expiresAt);
  return hasText(review.reviewedBy) && isPastTimestamp(review.reviewedAt, now) && isEvidenceUrl(review.evidenceUrl)
    && /^\d{4}-\d{2}-\d{2}T/.test(review.expiresAt) && Number.isFinite(expiry)
    && expiry > now.getTime() && expiry > Date.parse(review.reviewedAt);
}

/**
 * Fail closed: publicar una ficha o asignarle una categoría no habilita una
 * recomendación. PRIMARY y OPTIONAL son permisos separados, sin herencia.
 * El contexto individual nunca se construye a partir de texto libre de la URL.
 */
export function evaluateProductEligibility(product: Product, role: RecommendationRole, context: ProductEligibilityContext = {}): ProductEligibility {
  const now = context.now ?? new Date();
  const reasons: string[] = [];
  const reasonCodes: string[] = [];
  const block = (code: string, reason: string) => { reasonCodes.push(code); reasons.push(reason); };
  const priority = context.priority;
  if (product.active !== true) block("INACTIVE", "Producto inactivo");
  if (getProductCompleteness(product, now).publicationStatus === "DRAFT") block("NOT_PUBLISHABLE", "Ficha no publicable");
  if (!isPriceConfirmed(product, now)) block("PRICE_UNCONFIRMED", "Precio no confirmado");
  if (!isStockConfirmed(product, now)) block("STOCK_UNCONFIRMED", "Disponibilidad no confirmada");
  if (product.stockStatus === "out_of_stock" || product.stockQuantity === 0) block("UNAVAILABLE", "Producto agotado");
  if (product.stockStatus === "on_request") block("ON_REQUEST", "Disponible a pedido: requiere coordinación manual");
  if (!hasText(product.brand) || !hasText(product.presentation) || !hasText(product.servingSize)) block("MINIMUM_INFORMATION", "Marca, presentación o tamaño de porción pendientes");
  if (!hasVerifiedIngredients(product, now)) block("INGREDIENTS_UNVERIFIED", "Formulación sin verificar");
  if (!hasCompleteNutrition(product, now)) block("NUTRITION_UNVERIFIED", "Información nutricional insuficiente o sin verificar");
  if (!hasVerifiedAuthenticity(product, now)) block("AUTHENTICITY_UNVERIFIED", "Evidencia de autenticidad pendiente");
  if (!hasText(product.supplier)) block("SUPPLIER_MISSING", "Proveedor pendiente");
  if (product.expirationDate && Date.parse(`${product.expirationDate}T23:59:59.999Z`) < now.getTime()) block("EXPIRED", "Producto vencido");

  if (!priority || !priorityProductRoles[priority]) block("PRIORITY_REQUIRED", "Falta una prioridad válida para evaluar la recomendación");
  else {
    if (!matchesProductPriority(product, priority)) block("ROLE_MISMATCH", "El rol del producto no corresponde a esta prioridad");
    if (!priorityCategories[priority].includes(product.category)) block("CATEGORY_MISMATCH", "La categoría no corresponde a esta prioridad");
    if (!product.formulation || !priorityFormulations[priority].includes(product.formulation.classification)) block("FORMULATION_MISMATCH", "La formulación no corresponde a esta prioridad");
    // Un colágeno o una mezcla no heredan las reglas de proteína completa/creatina aislada.
    if (priority === "PROTEIN_GAP" && product.roles.includes("COLLAGEN")) block("COLLAGEN_EXCLUDED", "Colágeno no cubre la prioridad de proteína completa");
    if (priority === "EAA" && role !== "OPTIONAL") block("EAA_OPTIONAL_ONLY", "EAA solo puede evaluarse como opción contextual");
  }
  if (!product.formulation || !hasText(product.formulation.reviewedBy) || !isPastTimestamp(product.formulation.verifiedAt, now) || !isEvidenceUrl(product.formulation.evidenceUrl)) block("FORMULATION_UNVERIFIED", "Clasificación de formulación sin evidencia revisada");
  if (!hasText(context.protocolId)) block("PROTOCOL_REQUIRED", "Falta el protocolo para evaluar la recomendación");
  if (context.protocolId && product.excludedProtocols?.includes(context.protocolId)) block("PROTOCOL_EXCLUDED", "Producto excluido de este protocolo");
  if (priority && product.excludedPriorities?.includes(priority)) block("PRIORITY_EXCLUDED", "Producto excluido de esta prioridad");
  if (context.rules?.excludedProductIds?.includes(product.id) || context.rules?.excludedCategories?.includes(product.category)
    || (priority && context.rules?.excludedPriorities?.includes(priority))
    || (product.formulation && context.rules?.excludedFormulations?.includes(product.formulation.classification))) block("PROTOCOL_RULE", "El producto incumple una exclusión del protocolo o del contexto");

  if (!context.safety || context.safety.status !== "CLEARED" || !Array.isArray(context.safety.flags) || context.safety.flags.length > 0) block("SAFETY_CONTEXT", "Falta completar la revisión de seguridad del contexto individual");
  if (!product.safety || !hasText(product.safety.reviewedBy) || !isPastTimestamp(product.safety.reviewedAt, now)
    || !isEvidenceUrl(product.safety.evidenceUrl) || !Array.isArray(product.safety.excludedContextFlags)) block("SAFETY_UNREVIEWED", "Seguridad y exclusiones del producto sin revisar");
  if (product.safety?.excludedContextFlags.some((flag) => context.safety?.flags.includes(flag))) block("SAFETY_EXCLUSION", "Una exclusión de seguridad del producto aplica al contexto");

  const allowed = role === "PRIMARY" ? product.recommendationStatus === "PRIMARY_ELIGIBLE" : product.recommendationStatus === "OPTIONAL_ELIGIBLE";
  if (!allowed) block("STATUS_NOT_APPROVED", product.recommendationStatus === "MANUAL_REVIEW" ? "Requiere revisión manual" : "No habilitado para este tipo de recomendación");
  const reviews = (product.recommendationReviews ?? []).filter((review) => review.productId === product.id && review.priority === priority && review.protocolId === context.protocolId && review.role === role);
  const approval = reviews.filter((review) => validReview(review, now)).sort((a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt))[0];
  if (!approval || approval.decision !== "APPROVED") block("REVIEW_REQUIRED", "Falta una aprobación vigente para este producto, prioridad, protocolo y rol");

  const conditionCode = priority === "PROTEIN_GAP" ? "PROTEIN_GAP_CONFIRMED" : priority === "EAA" ? "EAA_CONTEXT_REVIEWED" : priority === "CONDITIONAL_SUPPORT" ? "CONDITIONAL_SUPPORT_REVIEWED" : undefined;
  if (conditionCode) {
    const rationaleCodes = conditionCode === "PROTEIN_GAP_CONFIRMED" ? ["DIETARY_GAP_REVIEWED"]
      : conditionCode === "EAA_CONTEXT_REVIEWED" ? ["MEAL_ACCESS_LIMITED", "DIETARY_RESTRICTION_REVIEWED"] : ["INDIVIDUAL_SUPPORT_REVIEWED"];
    const justified = approval?.allowedConditionCodes?.includes(conditionCode) && context.conditions?.some((condition) =>
      condition.code === conditionCode && condition.productId === product.id && condition.protocolId === context.protocolId
      && rationaleCodes.includes(condition.rationaleCode) && validReview(condition, now));
    if (!justified) block("CONTEXT_JUSTIFICATION", "Falta una justificación contextual revisada y permitida por la aprobación del producto");
  }
  return { eligible: reasons.length === 0, role, status: product.recommendationStatus, reasons, reasonCodes };
}
