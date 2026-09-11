import assert from "node:assert/strict";
import test from "node:test";
import { getCatalogCompleteness, getProductCompleteness } from "./product-completeness.ts";
import { evaluateProductEligibility } from "./product-eligibility.ts";
import { products, type Product } from "./products.ts";

const now = new Date("2026-09-11T00:00:00.000Z");
const past = "2026-09-01T12:00:00.000Z";
const future = "2027-09-01T12:00:00.000Z";
const evidence = "https://evidencia.proteinasmart.com/creatina.pdf";

test("el catálogo tiene 14 fotos de referencia aprobadas, ninguna real verificada y ningún precio o stock confirmado", () => {
  const report = getCatalogCompleteness(products, now);
  assert.equal(report.total, 16);
  assert.equal(report.adequateImage, 14);
  assert.equal(report.realImage, 0);
  assert.equal(report.confirmedPrice, 0);
  assert.equal(report.confirmedStock, 0);
});

test("publicable no significa verificado ni completo", () => {
  const report = getProductCompleteness(products.find((p) => p.id === "whey-isolate-2lb")!, now);
  assert.equal(report.publicationStatus, "PUBLISHABLE");
  assert.deepEqual(report.publicationBlockers, []);
  assert.ok(report.imageAdequate);
  assert.ok(!report.fields.image);
  assert.ok(report.percentage < 100);
});

test("una ficha sin foto adecuada no es publicable y dice por qué", () => {
  const report = getProductCompleteness(products.find((p) => p.id === "whey-concentrada-5lb")!, now);
  assert.equal(report.publicationStatus, "DRAFT");
  assert.ok(report.publicationBlockers.some((blocker) => blocker.includes("foto")));
});

test("la coincidencia semántica no habilita recomendación automática", () => {
  const product = products.find((p) => p.id === "creatina-mono")!;
  const result = evaluateProductEligibility(product, "PRIMARY", { priority: "CREATINE", protocolId: "SMART_MUSCLE", safety: { status: "CLEARED", flags: [] }, now });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("Precio no confirmado"));
  assert.ok(result.reasons.includes("Formulación sin verificar"));
});

test("un producto verificado y habilitado puede ser elegible", () => {
  const base = products.find((p) => p.id === "creatina-mono")!;
  const candidate: Product = {
    ...base,
    brand: "Marca verificada", servingSize: "3 g", supplier: "Proveedor verificado", distributor: "Distribuidor verificado",
    lot: "L-2026-09", expirationDate: "2027-12-31",
    ingredients: ["Creatina monohidratada"], ingredientsVerifiedAt: past, ingredientsEvidenceUrl: evidence,
    nutritionalInfo: { basis: "per_serving", activeIngredients: [{ name: "Creatina monohidratada", amount: 3, unit: "g" }] },
    nutritionStatus: "verified", nutritionVerifiedAt: past, nutritionEvidenceUrl: evidence,
    priceStatus: "confirmed", priceUpdatedAt: past, stockStatus: "in_stock", stockQuantity: 10, stockUpdatedAt: past,
    imageVerified: true, imageStatus: "verified_real", imageVerifiedAt: past, imageEvidenceUrl: evidence,
    authenticityEvidence: [{ type: "seal_photo", url: evidence, verifiedAt: past, reviewedBy: "Oscar Amarilla" }],
    formulation: { classification: "CREATINE_MONOHYDRATE_SINGLE", verifiedAt: past, evidenceUrl: evidence, reviewedBy: "Oscar Amarilla" },
    safety: { reviewedAt: past, reviewedBy: "Oscar Amarilla", evidenceUrl: evidence, excludedContextFlags: [] },
    recommendationStatus: "PRIMARY_ELIGIBLE",
    recommendationReviews: [{ productId: base.id, priority: "CREATINE", protocolId: "SMART_MUSCLE", role: "PRIMARY", decision: "APPROVED", reviewedAt: past, expiresAt: future, evidenceUrl: evidence, reviewedBy: "Oscar Amarilla" }],
  };
  const result = evaluateProductEligibility(candidate, "PRIMARY", { priority: "CREATINE", protocolId: "SMART_MUSCLE", safety: { status: "CLEARED", flags: [] }, now });
  assert.deepEqual(result.reasons, []);
  assert.equal(result.eligible, true);
});
