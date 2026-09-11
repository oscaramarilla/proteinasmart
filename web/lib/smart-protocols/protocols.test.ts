import assert from "node:assert/strict";
import test from "node:test";
import { priorityProductRoles } from "../product-eligibility.ts";
import { products, type Product } from "../products.ts";
import { getProtocol, smartProtocols } from "./definitions.ts";
import { resolveProtocol, tierPolicy, type ProtocolSafetyContext } from "./resolve.ts";

const now = new Date("2026-09-11T00:00:00.000Z");
const past = "2026-09-01T12:00:00.000Z";
const future = "2027-09-01T12:00:00.000Z";
const evidence = "https://evidencia.proteinasmart.com/creatina.pdf";
const cleared: ProtocolSafetyContext = { status: "CLEARED", flags: [] };

const verifiedCreatine: Product = {
  id: "creatina-verificada", slug: "creatina-verificada", name: "Creatina Monohidratada Verificada",
  category: "creatina", roles: ["CREATINE"], description: "Creatina monohidratada verificada para el test.",
  brand: "Marca verificada", presentation: "300 g", servings: 100, servingSize: "3 g",
  ingredients: ["Creatina monohidratada"], ingredientsVerifiedAt: past, ingredientsEvidenceUrl: evidence,
  nutritionalInfo: { basis: "per_serving", activeIngredients: [{ name: "Creatina monohidratada", amount: 3, unit: "g" }] },
  nutritionStatus: "verified", nutritionVerifiedAt: past, nutritionEvidenceUrl: evidence,
  price: 235000, priceStatus: "confirmed", currency: "PYG", priceUpdatedAt: past,
  stockStatus: "in_stock", stockQuantity: 10, stockUpdatedAt: past,
  imageUrl: "/images/creatinamonohidratada.webp", imageVerified: true, imageStatus: "verified_real",
  imageVerifiedAt: past, imageEvidenceUrl: evidence,
  supplier: "Proveedor verificado", distributor: "Distribuidor verificado", lot: "L-2026-09", expirationDate: "2027-12-31",
  authenticityEvidence: [{ type: "seal_photo", url: evidence, verifiedAt: past, reviewedBy: "Oscar Amarilla" }],
  formulation: { classification: "CREATINE_MONOHYDRATE_SINGLE", verifiedAt: past, evidenceUrl: evidence, reviewedBy: "Oscar Amarilla" },
  safety: { reviewedAt: past, reviewedBy: "Oscar Amarilla", evidenceUrl: evidence, excludedContextFlags: [] },
  recommendationStatus: "PRIMARY_ELIGIBLE",
  recommendationReviews: [{
    productId: "creatina-verificada", priority: "CREATINE", protocolId: "SMART_MUSCLE", role: "PRIMARY",
    decision: "APPROVED", reviewedAt: past, expiresAt: future, evidenceUrl: evidence, reviewedBy: "Oscar Amarilla",
  }],
  goals: ["MASS"], active: true,
};

const verifiedGlutamine: Product = { ...verifiedCreatine, id: "glutamina-verificada", slug: "glutamina-verificada", name: "L-Glutamina Verificada", category: "rendimiento", roles: ["RECOVERY_AMINO"] };

test("los slugs publicados de protocolo son estables", () => {
  assert.deepEqual(smartProtocols.map((protocol) => protocol.slug), ["smart-start", "smart-muscle", "smart-cut", "smart-40"]);
});

test("cada prioridad se define por roles, nunca por un SKU", () => {
  for (const protocol of smartProtocols) {
    for (const priority of protocol.priorities) {
      assert.ok(priority.roles.length > 0, `${protocol.id}/${priority.key} sin roles`);
      // Los roles de la prioridad tienen que estar cubiertos por el gate de
      // elegibilidad, o la prioridad nunca podría resolver un producto.
      const allowed = priorityProductRoles[priority.eligibility];
      for (const role of priority.roles) {
        assert.ok(allowed.includes(role), `${protocol.id}/${priority.key}: el rol ${role} no lo evalúa ${priority.eligibility}`);
      }
    }
  }
});

test("las prioridades condicionales dicen cuándo aplican", () => {
  for (const protocol of smartProtocols) {
    for (const priority of protocol.priorities) {
      if (priority.level === "conditional") assert.ok(priority.condition && priority.condition.length > 0, `${protocol.id}/${priority.key} sin condición`);
      assert.ok(priority.reason.length > 0);
    }
  }
});

test("ninguna prioridad se superpone con una exclusión del mismo protocolo", () => {
  for (const protocol of smartProtocols) {
    const excluded = new Set(protocol.redundancies.flatMap((redundancy) => redundancy.roles));
    for (const priority of protocol.priorities) {
      for (const role of priority.roles) {
        assert.ok(!excluded.has(role), `${protocol.id}: ${role} es prioridad y exclusión a la vez`);
      }
    }
  }
});

test("todo producto del catálogo declara al menos un rol", () => {
  for (const product of products) assert.ok(product.roles.length > 0, `${product.id} sin rol`);
});

test("Smart Muscle: creatina es base y la proteína es condicional", () => {
  const protocol = getProtocol("SMART_MUSCLE");
  assert.ok(protocol);
  const resolved = resolveProtocol(protocol, { now });
  assert.deepEqual(resolved.required.map((item) => item.priority.key), ["CREATINE"]);
  assert.deepEqual(resolved.conditional.map((item) => item.priority.key), ["PROTEIN_GAP"]);
  assert.deepEqual(resolved.optional.map((item) => item.priority.key), ["EAA"]);
});

test("sin contexto individual no hay recomendación automática", () => {
  const protocol = getProtocol("SMART_MUSCLE")!;
  const resolved = resolveProtocol(protocol, { catalog: [verifiedCreatine], now });
  assert.equal(resolved.contextual, false);
  assert.equal(resolved.eligibleCount, 0);
  assert.ok(resolved.required[0].blocked[0].reasonCodes.includes("SAFETY_CONTEXT"));
});

test("con el catálogo real todavía no hay ningún producto recomendable", () => {
  for (const protocol of smartProtocols) {
    const resolved = resolveProtocol(protocol, { safety: cleared, now });
    assert.equal(resolved.eligibleCount, 0, `${protocol.id} no debería recomendar nada todavía`);
    assert.equal(resolved.pending.length, protocol.priorities.length);
  }
});

test("un producto verificado y aprobado sí resuelve la prioridad base", () => {
  const protocol = getProtocol("SMART_MUSCLE")!;
  const resolved = resolveProtocol(protocol, { catalog: [verifiedCreatine], safety: cleared, now });
  assert.equal(resolved.contextual, true);
  assert.deepEqual(resolved.required[0].products.map((product) => product.id), ["creatina-verificada"]);
  assert.equal(resolved.eligibleCount, 1);
});

test("una exclusión del protocolo saca al producto de toda prioridad", () => {
  const protocol = getProtocol("SMART_MUSCLE")!;
  const catalog = [verifiedCreatine, verifiedGlutamine];
  const resolved = resolveProtocol(protocol, { catalog, safety: cleared, now });
  const recommended = [...resolved.required, ...resolved.conditional, ...resolved.optional].flatMap((item) => item.products.map((product) => product.id));
  assert.ok(!recommended.includes("glutamina-verificada"));
  assert.deepEqual(resolved.redundant.map((item) => item.product.id), ["glutamina-verificada"]);
});

test("el presupuesto cambia cuántas prioridades entran, no el protocolo", () => {
  assert.deepEqual(tierPolicy("ESSENTIAL").levels, ["required"]);
  assert.deepEqual(tierPolicy("LITE").levels, ["required", "conditional"]);
  assert.ok(tierPolicy("FULL").levels.includes("optional"));
});
