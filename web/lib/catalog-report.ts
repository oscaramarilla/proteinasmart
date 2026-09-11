import { completenessFields, getCatalogCompleteness, type CompletenessField } from "./product-completeness.ts";
import { evaluateProductEligibility, matchesProductPriority, type ProductEligibilityContext } from "./product-eligibility.ts";
import { formatPyg, getStockLabel, isPriceConfirmed, isStockConfirmed, products, type Product } from "./products.ts";
import { smartStacks } from "./smart-stacks.ts";

export const completenessLabels: Record<CompletenessField, string> = {
  name: "Nombre", slug: "Slug", category: "Categoría", price: "Precio",
  priceUpdatedAt: "priceUpdatedAt", image: "Foto real verificada", brand: "Marca",
  flavor: "Sabor", presentation: "Presentación", servings: "Servings",
  servingSize: "Serving size", proteinPerServing: "Proteína por servicio",
  ingredients: "Ingredientes", nutrition: "Tabla nutricional", stock: "Stock confirmado",
  stockUpdatedAt: "stockUpdatedAt", supplier: "Proveedor", importerOrDistributor: "Importador/distribuidor",
  lot: "Lote", expirationDate: "Vencimiento", authenticity: "Evidencia de autenticidad", active: "Estado activo",
};

const present = (value: unknown): string =>
  value === undefined || value === null || value === "" ? "Pendiente" : String(value);

export function getCompletenessFieldValue(product: Product, field: CompletenessField): string {
  switch (field) {
    case "image": return product.imageUrl
      ? `${product.imageUrl} · ${product.imageStatus === "verified_real" ? "declarada real; revisar evidencia" : "referencia; falta foto real verificada"}`
      : "Falta foto";
    case "price": return `${formatPyg(product.price)} · ${isPriceConfirmed(product) ? "confirmado" : "pendiente de confirmar"}`;
    case "stock": return `${getStockLabel(product)} · cantidad: ${present(product.stockQuantity)}`;
    case "ingredients": return product.ingredients?.length ? product.ingredients.join(", ") : "Pendiente";
    case "nutrition": return product.nutritionalInfo && Object.keys(product.nutritionalInfo).length
      ? Object.entries(product.nutritionalInfo).map(([key, value]) => `${key}: ${value}`).join("; ")
      : "Pendiente";
    case "importerOrDistributor": return [product.importer && `Importador: ${product.importer}`, product.distributor && `Distribuidor: ${product.distributor}`].filter(Boolean).join("; ") || "Pendiente";
    case "authenticity": return product.authenticityEvidence?.length
      ? product.authenticityEvidence.map((evidence) => `${evidence.type} · ${present(evidence.url)} · verificado: ${present(evidence.verifiedAt)}`).join("; ")
      : "Pendiente";
    case "active": return product.active ? "Sí" : "No";
    case "proteinPerServing": return product.proteinPerServing === undefined ? "Pendiente" : `${product.proteinPerServing} g`;
    default: return present(product[field]);
  }
}

// Commercial impact is calculated from the current semantic definitions, never
// from a hand-picked SKU ranking. A match describes data work, not endorsement.
export function buildCatalogReport(catalog: Product[] = products, context: ProductEligibilityContext = {}) {
  const summary = getCatalogCompleteness(catalog);
  const entries = summary.reports.map(({ product, completeness }) => {
    const matches = smartStacks.flatMap((stack) => stack.priorities
      .filter((priority) => matchesProductPriority(product, priority.key))
      .map((priority) => ({
        stackId: stack.id, stackName: stack.name, priority: priority.key, label: priority.label,
        required: priority.required,
        eligibility: evaluateProductEligibility(product, priority.required ? "PRIMARY" : "OPTIONAL", {
          ...context, protocolId: stack.id, priority: priority.key,
        }),
      })));
    const primary = matches.filter((match) => match.required);
    const optional = matches.filter((match) => !match.required);
    const primaryEligible = primary.some((match) => match.eligibility.eligible);
    const optionalEligible = optional.some((match) => match.eligibility.eligible);
    const reasons = (matching: typeof matches, role: "PRIMARY" | "OPTIONAL") => matching.length
      ? [...new Set(matching.flatMap((match) => match.eligibility.reasons))]
      : ["Sin prioridad semántica en los Smart Stacks actuales", ...evaluateProductEligibility(product, role, context).reasons];
    return {
      product, completeness, matches, primaryEligible, optionalEligible,
      primaryReasons: reasons(primary, "PRIMARY"), optionalReasons: reasons(optional, "OPTIONAL"),
      semanticImpact: primary.length * 2 + optional.length,
      confirmedPrice: isPriceConfirmed(product), confirmedStock: isStockConfirmed(product),
      fields: completenessFields.map((key) => ({ key, label: completenessLabels[key], complete: completeness.fields[key], value: getCompletenessFieldValue(product, key) })),
    };
  });
  entries.sort((a, b) => {
    const rank = (entry: typeof a) => entry.primaryEligible || entry.optionalEligible ? 2 : entry.completeness.publicationStatus !== "DRAFT" ? 1 : 0;
    return rank(b) - rank(a) || b.semanticImpact - a.semanticImpact || b.completeness.percentage - a.completeness.percentage || a.product.name.localeCompare(b.product.name, "es");
  });
  return { ...summary, entries, primaryEligible: entries.filter((entry) => entry.primaryEligible).length, optionalEligible: entries.filter((entry) => entry.optionalEligible).length };
}

const escapeMarkdown = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
const check = (complete: boolean) => complete ? "✓" : "✗";

export function renderCatalogChecklist(catalog: Product[] = products): string {
  const report = buildCatalogReport(catalog);
  const metrics = [
    ["Productos completos", report.complete], ["Productos publicables", report.publishable],
    ["Precio confirmado", report.confirmedPrice], ["Stock confirmado", report.confirmedStock],
    ["Nutrición completa", report.completeNutrition], ["Con trazabilidad", report.traceable], ["Con imagen real", report.realImage],
  ];
  const lines = [
    "# Checklist interno de catálogo — ProteínaSmart", "",
    "Generado desde `web/lib/products.ts`, las reglas de completitud y los Smart Stacks vigentes. No se completan datos por inferencia. Regenerá este informe después de editar el catálogo.", "",
    `Completitud global: **${report.averagePercentage}%**. Productos: **${report.total}**. Recomendación automática principal: **${report.primaryEligible}**; opcional: **${report.optionalEligible}**.`, "",
    ...metrics.map(([label, value]) => `- ${label}: **${value}/${report.total}**.`), "",
    "Orden: elegibles para recomendación automática; fichas publicables; impacto semántico en Smart Stacks (prioridad principal = 2, opcional = 1); completitud. Una coincidencia semántica no autoriza una recomendación.", "",
    "Foto: «Referencia» permite publicar si fue aprobada como tal, pero no acredita envase real. Precio ✓ exige monto válido, estado confirmado y timestamp real. Stock ✓ exige estado verificable y timestamp real; agotado también es un estado confirmado. Nutrition ✓ exige el conjunto de datos nutricionales y su evidencia. «Pendiente» nunca significa en stock.", "",
    "| Producto / slug | Foto | Marca | Precio | Stock | Nutrition | Proveedor | Lote | Nivel | Completitud |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...report.entries.map(({ product, completeness, confirmedPrice, confirmedStock }) => {
      const cells = [
        `${product.name} / ${product.slug}`, completeness.fields.image ? "✓ Real verificada" : completeness.imageAdequate ? "Referencia; falta foto real" : "✗ Falta foto adecuada",
        product.brand || "✗ Pendiente", `${check(confirmedPrice)} ${formatPyg(product.price)}${confirmedPrice ? " confirmado" : " referencial; confirmar"}`,
        `${check(confirmedStock)} ${getStockLabel(product)}`, `${check(completeness.nutritionComplete)} ${completeness.nutritionComplete ? "Completa" : "Pendiente"}`,
        product.supplier || "✗ Pendiente", product.lot || "✗ Pendiente", completeness.publicationStatus, `${completeness.percentage}%`,
      ];
      return `| ${cells.map(escapeMarkdown).join(" | ")} |`;
    }), "", "## Qué datos entregar por producto", "",
    "Entregá cada valor con su fuente cuando corresponda. La fecha del archivo o de una carga técnica no confirma precio, stock, autenticidad ni nutrición. Declarar ausencia de un sabor o de un importador requiere el estado explícito admitido por el modelo; no completar con texto de relleno.", "",
  ];
  for (const entry of report.entries) {
    const { product, completeness } = entry;
    lines.push(`### ${escapeMarkdown(product.name)} — ${completeness.percentage}%`, "",
      `Slug: \`${product.slug}\` · Categoría: ${product.category} · Nivel: **${completeness.publicationStatus}**.`, "",
      `- Datos faltantes para completitud: ${completeness.missing.map((field) => completenessLabels[field]).join(", ") || "ninguno"}.`,
      `- Publicación: ${completeness.publicationBlockers.join("; ") || "cumple el mínimo; confirmá las condiciones comerciales antes de cobrar"}.`,
      `- Prioridades semánticas: ${[...new Set(entry.matches.map((match) => `${match.stackName}: ${match.label} (${match.required ? "principal" : "opcional"})`))].join("; ") || "sin coincidencias en los Smart Stacks actuales"}.`,
      `- Recomendación principal: ${entry.primaryEligible ? "elegible" : entry.primaryReasons.join("; ")}.`,
      `- Recomendación opcional: ${entry.optionalEligible ? "elegible" : entry.optionalReasons.join("; ")}.`, "",
      "| Campo | Estado | Valor disponible |", "| --- | --- | --- |",
      ...entry.fields.map((field) => `| ${field.label} | ${check(field.complete)} | ${escapeMarkdown(field.value)} |`), "");
  }
  lines.push("## Uso interno", "",
    "Regenerar: `node --experimental-strip-types scripts/catalog-report.ts`.", "",
    "Dashboard: `/admin/catalogo` en la aplicación `web/`. Está cerrado por defecto. Requiere `CATALOG_REPORT_ENABLED=true` y `CATALOG_ADMIN_TOKEN` de al menos 24 caracteres en el entorno privado del servidor, más inicio de sesión. El token no debe incluirse en Git ni usar prefijo `NEXT_PUBLIC_`. La sesión firmada vence a las 8 horas; rotar el token invalida sesiones anteriores. Usá HTTPS en producción y protección de acceso del despliegue para uso interno. `noindex` es una regla para buscadores, no autenticación.", "",
    "El dashboard es de lectura. Editá los datos reales en `web/lib/products.ts`; este cambio no publica ni reemplaza el sitio vanilla.", "");
  return lines.join("\n");
}
