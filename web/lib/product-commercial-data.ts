import type { Product } from "./products.ts";
import { hasSafeImageUrl, isPastTimestamp, isPositiveInteger } from "./product-validation.ts";

export type ProductCommercialData = Partial<Pick<Product,
  "price" | "priceStatus" | "priceUpdatedAt" | "stockStatus" | "stockQuantity" | "stockUpdatedAt"
  | "brand" | "flavor" | "presentation" | "servings" | "servingSize" | "proteinPerServing"
  | "ingredients" | "ingredientsVerifiedAt" | "ingredientsEvidenceUrl" | "nutritionalInfo" | "nutritionStatus" | "nutritionVerifiedAt" | "nutritionEvidenceUrl"
  | "imageUrl" | "imageStatus" | "imageVerified" | "imageVerifiedAt" | "imageEvidenceUrl" | "imageReferenceApproved"
  | "supplier" | "importer" | "distributor" | "lot" | "expirationDate" | "authenticityEvidence" | "fieldExemptions"
  | "recommendationStatus" | "formulation" | "recommendationReviews" | "safety" | "excludedProtocols" | "excludedPriorities" | "active"
>>;

/**
 * Editing surface for real supplier data, keyed by the existing product id.
 * Empty entries deliberately preserve unknown values. Never add today's date
 * merely to fill a field: use the date on which that fact was checked.
 * No writes to Supabase and no secrets belong in this file.
 */
export const productCommercialData: Record<string, ProductCommercialData> = {
  "whey-isolate-2lb": {},
  "whey-concentrada-5lb": {},
  "proteina-vegana": {},
  "colageno-hidrolizado": {},
  "creatina-mono": {},
  "pre-entreno": {},
  "eaa-bcaa": {},
  "glutamina": {},
  "aceite-mct": {},
  "barras-keto": {},
  "sustituto-comida": {},
  "endulzante-monkfruit": {},
  "omega-3": {},
  "magnesio-glicinato": {},
  "vitamina-d3-k2": {},
  "nootropico-focus": {},
};

/** Reject contradictory operational edits before marking data confirmed. */
export function validateCommercialData(data: ProductCommercialData, now = new Date()): string[] {
  const errors: string[] = [];
  if (data.price !== undefined && !isPositiveInteger(data.price)) errors.push("price debe ser un entero positivo en guaraníes");
  if (data.priceUpdatedAt !== undefined && !isPastTimestamp(data.priceUpdatedAt, now)) errors.push("priceUpdatedAt debe ser una fecha ISO real y no futura");
  if (data.priceStatus === "confirmed" && (!isPositiveInteger(data.price) || !isPastTimestamp(data.priceUpdatedAt, now))) errors.push("Un precio confirmado requiere price y priceUpdatedAt válidos");
  if (data.stockUpdatedAt !== undefined && !isPastTimestamp(data.stockUpdatedAt, now)) errors.push("stockUpdatedAt debe ser una fecha ISO real y no futura");
  if (data.stockQuantity !== undefined && (!Number.isSafeInteger(data.stockQuantity) || data.stockQuantity < 0)) errors.push("stockQuantity debe ser un entero no negativo");
  if (data.stockStatus && data.stockStatus !== "pending_confirmation" && !isPastTimestamp(data.stockUpdatedAt, now)) errors.push("Un stock confirmado requiere stockUpdatedAt válido");
  if (["in_stock", "low_stock"].includes(data.stockStatus ?? "") && data.stockQuantity === 0) errors.push("En stock no puede tener cero unidades");
  if (["out_of_stock", "on_request"].includes(data.stockStatus ?? "") && data.stockQuantity !== undefined && data.stockQuantity !== 0) errors.push("Agotado o a pedido no puede tener unidades en stock");
  if (data.imageUrl !== undefined && data.imageUrl !== "" && !hasSafeImageUrl(data.imageUrl)) errors.push("imageUrl debe ser una ruta de imagen local o HTTPS");
  return errors;
}
