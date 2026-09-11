import type { Product, PublicationStatus } from "./products.ts";
import {
  hasCompleteNutrition, hasCurrentExpiration, hasPublishableImage, hasRealImage, hasVerifiedAuthenticity,
  hasVerifiedIngredients, isFieldExempt, isMeaningfulText, isPastTimestamp, isPositiveInteger,
} from "./product-validation.ts";
import { isPriceConfirmed, isStockConfirmed } from "./products.ts";

export const completenessFields = ["name", "slug", "category", "price", "priceUpdatedAt", "image", "brand", "flavor", "presentation", "servings", "servingSize", "proteinPerServing", "ingredients", "nutrition", "stock", "stockUpdatedAt", "supplier", "importerOrDistributor", "lot", "expirationDate", "authenticity", "active"] as const;
export type CompletenessField = typeof completenessFields[number];
export type ProductCompleteness = {
  fields: Record<CompletenessField, boolean>; completed: number; total: number; percentage: number;
  publicationStatus: PublicationStatus; missing: CompletenessField[];
  /** Foto publicable: real verificada o referencia aprobada a mano. Nunca acredita envase real. */
  imageAdequate: boolean;
  nutritionComplete: boolean;
  /** Por qué la ficha todavía no es publicable. Vacío = cumple el mínimo. */
  publicationBlockers: string[];
};

export function getProductCompleteness(product: Product, now = new Date()): ProductCompleteness {
  const imageAdequate = hasPublishableImage(product, now);
  const nutritionComplete = hasCompleteNutrition(product, now);
  const fields: Record<CompletenessField, boolean> = {
    name: isMeaningfulText(product.name), slug: isMeaningfulText(product.slug), category: isMeaningfulText(product.category),
    price: isPositiveInteger(product.price), priceUpdatedAt: isPastTimestamp(product.priceUpdatedAt, now),
    // "image" es la foto real verificada; la referencia aprobada se reporta en `imageAdequate`.
    image: hasRealImage(product, now),
    brand: isMeaningfulText(product.brand), flavor: isMeaningfulText(product.flavor) || isFieldExempt(product, "flavor", now),
    presentation: isMeaningfulText(product.presentation), servings: isPositiveInteger(product.servings),
    servingSize: isMeaningfulText(product.servingSize),
    proteinPerServing: isPositiveInteger(product.proteinPerServing) || isFieldExempt(product, "proteinPerServing", now),
    ingredients: hasVerifiedIngredients(product, now), nutrition: nutritionComplete,
    stock: isStockConfirmed(product, now), stockUpdatedAt: isPastTimestamp(product.stockUpdatedAt, now),
    supplier: isMeaningfulText(product.supplier),
    importerOrDistributor: isMeaningfulText(product.importer) || isMeaningfulText(product.distributor) || isFieldExempt(product, "importerOrDistributor", now),
    lot: isMeaningfulText(product.lot), expirationDate: hasCurrentExpiration(product, now),
    authenticity: hasVerifiedAuthenticity(product, now), active: product.active === true,
  };

  const publicationBlockers: string[] = [];
  if (!fields.name || !fields.slug || !fields.category) publicationBlockers.push("faltan identidad, slug o categoría");
  if (!imageAdequate) publicationBlockers.push("falta una foto real verificada o una referencia aprobada");
  if (!fields.presentation) publicationBlockers.push("falta la presentación");
  if (!fields.active) publicationBlockers.push("el producto está inactivo");

  const publishable = publicationBlockers.length === 0;
  const priceConfirmed = isPriceConfirmed(product, now);
  const verified = publishable && fields.brand && fields.supplier && fields.importerOrDistributor && fields.authenticity
    && priceConfirmed && fields.priceUpdatedAt && fields.stock && fields.stockUpdatedAt;
  const complete = verified && fields.ingredients && fields.nutrition && fields.servings && fields.servingSize;
  const publicationStatus: PublicationStatus = complete ? "COMPLETE" : verified ? "VERIFIED" : publishable ? "PUBLISHABLE" : "DRAFT";
  const completed = completenessFields.filter((field) => fields[field]).length;
  return {
    fields, completed, total: completenessFields.length,
    percentage: Math.round((completed / completenessFields.length) * 100),
    publicationStatus, missing: completenessFields.filter((field) => !fields[field]),
    imageAdequate, nutritionComplete, publicationBlockers,
  };
}

export function getCatalogCompleteness(products: Product[], now = new Date()) {
  const reports = products.map((product) => ({ product, completeness: getProductCompleteness(product, now) }));
  const percentageTotal = reports.reduce((total, report) => total + report.completeness.percentage, 0);
  return {
    reports, total: reports.length,
    averagePercentage: reports.length === 0 ? 0 : Math.round(percentageTotal / reports.length),
    complete: reports.filter((report) => report.completeness.publicationStatus === "COMPLETE").length,
    publishable: reports.filter((report) => report.completeness.publicationStatus !== "DRAFT").length,
    confirmedPrice: products.filter((product) => isPriceConfirmed(product, now)).length,
    confirmedStock: products.filter((product) => isStockConfirmed(product, now)).length,
    completeNutrition: reports.filter((report) => report.completeness.nutritionComplete && report.completeness.fields.ingredients && report.completeness.fields.servingSize).length,
    traceable: reports.filter((report) => report.completeness.fields.authenticity && (report.completeness.fields.supplier || report.completeness.fields.importerOrDistributor)).length,
    /** Foto real verificada. Una referencia aprobada no cuenta acá. */
    realImage: reports.filter((report) => report.completeness.fields.image).length,
    /** Foto suficiente para publicar (real o referencia aprobada). */
    adequateImage: reports.filter((report) => report.completeness.imageAdequate).length,
  };
}
