import type { Product } from "./products.ts";

export const isMeaningfulText = (value: unknown): value is string => typeof value === "string"
  && value.trim().length > 0
  && !/^(?:[-—–]|n\/?a|s\/?d|sin datos|pendiente(?: de confirmar)?|por confirmar|a confirmar|desconocid[oa])$/i.test(value.trim());

export const isPositiveInteger = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
export const isNonNegativeNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

/** ISO dates only. Date.parse alone accepts nonexistent dates such as Feb 30. */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const day = value.slice(0, 10);
  const parsedDay = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(parsedDay.getTime()) && parsedDay.toISOString().slice(0, 10) === day && Number.isFinite(Date.parse(value));
}

export const isPastTimestamp = (value: unknown, now = new Date()): value is string =>
  isValidDate(value) && Date.parse(value) <= now.getTime();

export function isEvidenceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && Boolean(url.hostname) && !url.hash;
  } catch { return false; }
}

export function hasRealImage(product: Product, now = new Date()): boolean {
  return product.imageStatus === "verified_real" && product.imageVerified === true
    && hasSafeImageUrl(product.imageUrl) && isPastTimestamp(product.imageVerifiedAt, now)
    && isEvidenceUrl(product.imageEvidenceUrl);
}

export function hasSafeImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^\/images\/[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)$/.test(value) || isEvidenceUrl(value);
}

/** A manually approved reference may be displayed, but never counts as a real image. */
export function hasPublishableImage(product: Product, now = new Date()): boolean {
  return hasRealImage(product, now) || (product.imageStatus === "reference"
    && product.imageReferenceApproved === true && hasSafeImageUrl(product.imageUrl));
}

export function hasFunctionalCta(product: Product): boolean {
  if (!product.ctaUrl) return false;
  try {
    const url = new URL(product.ctaUrl);
    return url.protocol === "https:" && url.hostname === "wa.me" && !url.username && !url.password
      && !url.port && /^\/[1-9][0-9]{7,14}$/.test(url.pathname) && isMeaningfulText(url.searchParams.get("text"));
  } catch { return false; }
}

export function hasVerifiedIngredients(product: Product, now = new Date()): boolean {
  return Array.isArray(product.ingredients) && product.ingredients.length > 0 && product.ingredients.every(isMeaningfulText)
    && isPastTimestamp(product.ingredientsVerifiedAt, now) && isEvidenceUrl(product.ingredientsEvidenceUrl);
}

export function hasCompleteNutrition(product: Product, now = new Date()): boolean {
  const info = product.nutritionalInfo;
  if (product.nutritionStatus !== "verified" || !isPastTimestamp(product.nutritionVerifiedAt, now)
    || !isEvidenceUrl(product.nutritionEvidenceUrl) || info?.basis !== "per_serving") return false;
  const macronutrients = [info.energyKcal, info.proteinGrams, info.carbohydrateGrams, info.fatGrams, info.sodiumMilligrams];
  const fullFoodPanel = macronutrients.every(isNonNegativeNumber);
  // Supplements can have an active-ingredient panel rather than food macros.
  const fullSupplementPanel = Array.isArray(info.activeIngredients) && info.activeIngredients.length > 0
    && info.activeIngredients.every((item) => isMeaningfulText(item.name) && isNonNegativeNumber(item.amount)
      && item.amount > 0 && ["g", "mg", "mcg", "IU"].includes(item.unit));
  return fullFoodPanel || fullSupplementPanel;
}

export function hasVerifiedAuthenticity(product: Product, now = new Date()): boolean {
  return Array.isArray(product.authenticityEvidence) && product.authenticityEvidence.some((evidence) =>
    ["seal_photo", "distributor_document"].includes(evidence.type)
    && isEvidenceUrl(evidence.url) && isPastTimestamp(evidence.verifiedAt, now) && isMeaningfulText(evidence.reviewedBy));
}

export function isFieldExempt(product: Product, field: "flavor" | "proteinPerServing" | "importerOrDistributor", now = new Date()): boolean {
  const exemption = product.fieldExemptions?.[field];
  // Protein comparison cannot opt out of protein data, even via a manual note.
  if (field === "proteinPerServing" && product.roles.includes("PROTEIN_GAP")) return false;
  return Boolean(exemption && isMeaningfulText(exemption.reason) && isMeaningfulText(exemption.reviewedBy)
    && isEvidenceUrl(exemption.evidenceUrl) && isPastTimestamp(exemption.verifiedAt, now));
}

export function hasCurrentExpiration(product: Product, now = new Date()): boolean {
  return isValidDate(product.expirationDate) && product.expirationDate.slice(0, 10) >= now.toISOString().slice(0, 10);
}

export function isTraceable(product: Product, now = new Date()): boolean {
  return isMeaningfulText(product.supplier)
    && (isMeaningfulText(product.importer) || isMeaningfulText(product.distributor) || isFieldExempt(product, "importerOrDistributor", now))
    && isMeaningfulText(product.lot) && hasCurrentExpiration(product, now) && hasVerifiedAuthenticity(product, now);
}

export const isNutritionComplete = hasCompleteNutrition;
