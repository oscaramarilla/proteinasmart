import { whatsappUrl } from "./negocio.ts";
import { productCommercialData } from "./product-commercial-data.ts";
import { isPastTimestamp, isPositiveInteger } from "./product-validation.ts";

export type StockStatus = "in_stock" | "low_stock" | "on_request" | "out_of_stock" | "pending_confirmation";
export type PriceStatus = "confirmed" | "pending_confirmation";
export type Goal = "MASS" | "CUT" | "PERFORMANCE" | "LONGEVITY";
export type RecommendationStatus = "PRIMARY_ELIGIBLE" | "OPTIONAL_ELIGIBLE" | "CATALOG_ONLY" | "MANUAL_REVIEW";
export type PublicationStatus = "DRAFT" | "PUBLISHABLE" | "VERIFIED" | "COMPLETE";
export type AuthenticityEvidence = { type: "front_photo" | "seal_photo" | "lot_photo" | "expiration_photo" | "distributor_document"; url?: string; verifiedAt?: string; reviewedBy?: string };
export type NutritionalInfo = {
  basis: "per_serving";
  energyKcal?: number; proteinGrams?: number; carbohydrateGrams?: number; fatGrams?: number; sodiumMilligrams?: number;
  activeIngredients?: { name: string; amount: number; unit: "g" | "mg" | "mcg" | "IU" }[];
};
export type ProductFormulation = {
  classification: "COMPLETE_PROTEIN" | "COLLAGEN" | "CREATINE_MONOHYDRATE_SINGLE" | "CREATINE_BLEND" | "EAA" | "RECOVERY_AMINO" | "OTHER";
  verifiedAt: string; evidenceUrl: string; reviewedBy: string;
};
export type ProductRecommendationReview = {
  productId: string; priority: string; protocolId: string; role: "PRIMARY" | "OPTIONAL"; decision: "APPROVED" | "REJECTED";
  reviewedAt: string; expiresAt: string; evidenceUrl: string; reviewedBy: string;
  allowedConditionCodes?: ("PROTEIN_GAP_CONFIRMED" | "EAA_CONTEXT_REVIEWED" | "CONDITIONAL_SUPPORT_REVIEWED")[];
};
export type InapplicableField = "flavor" | "proteinPerServing" | "importerOrDistributor";
export type FieldExemption = { reason: string; evidenceUrl: string; verifiedAt: string; reviewedBy: string };

// Rol funcional del producto dentro del catálogo. Es el punto de unión entre
// `Product` y `SmartProtocol`: el protocolo declara prioridades semánticas y
// cada prioridad se satisface con uno o más roles. Ningún protocolo nombra un
// SKU ni una marca.
export type ProductRole =
  | "PROTEIN_GAP" | "COLLAGEN" | "CREATINE" | "EAA" | "RECOVERY_AMINO" | "PRE_WORKOUT"
  | "MCT" | "LOW_CARB_SNACK" | "MEAL_REPLACEMENT" | "SWEETENER"
  | "OMEGA3" | "MAGNESIUM" | "VITAMIN_D_K" | "NOOTROPIC";

export const productRoleLabels: Record<ProductRole, string> = {
  PROTEIN_GAP: "Proteína en polvo", COLLAGEN: "Colágeno", CREATINE: "Creatina", EAA: "Aminoácidos esenciales",
  RECOVERY_AMINO: "Aminoácido aislado", PRE_WORKOUT: "Pre-entreno", MCT: "Grasa MCT", LOW_CARB_SNACK: "Snack bajo en carbohidratos",
  MEAL_REPLACEMENT: "Sustituto de comida", SWEETENER: "Endulzante", OMEGA3: "Omega 3", MAGNESIUM: "Magnesio",
  VITAMIN_D_K: "Vitamina D3 + K2", NOOTROPIC: "Nootrópico",
};

export type Product = {
  id: string; slug: string; name: string; category: "proteinas" | "creatina" | "rendimiento" | "keto" | "longevidad"; description: string;
  roles: ProductRole[];
  brand?: string; flavor?: string; presentation?: string; servings?: number; servingSize?: string; proteinPerServing?: number;
  ingredients?: string[]; ingredientsVerifiedAt?: string; ingredientsEvidenceUrl?: string;
  nutritionalInfo?: NutritionalInfo; nutritionStatus?: "pending_confirmation" | "verified"; nutritionVerifiedAt?: string; nutritionEvidenceUrl?: string;
  price?: number; priceStatus: PriceStatus; currency: "PYG"; priceUpdatedAt?: string;
  stockStatus: StockStatus; stockQuantity?: number; stockUpdatedAt?: string; imageUrl?: string; imageVerified: boolean;
  imageStatus?: "missing" | "reference" | "verified_real"; imageReferenceApproved?: boolean; imageVerifiedAt?: string; imageEvidenceUrl?: string;
  supplier?: string; importer?: string; distributor?: string; lot?: string; expirationDate?: string; authenticityEvidence?: AuthenticityEvidence[];
  ctaUrl?: string; fieldExemptions?: Partial<Record<InapplicableField, FieldExemption>>;
  formulation?: ProductFormulation; recommendationReviews?: ProductRecommendationReview[];
  excludedProtocols?: string[]; excludedPriorities?: string[];
  safety?: { reviewedAt: string; reviewedBy: string; evidenceUrl: string; excludedContextFlags: string[] };
  goals: Goal[]; recommendationStatus: RecommendationStatus; active: boolean;
};

type SourceProduct = Omit<Product, "slug" | "currency" | "stockStatus" | "priceStatus" | "imageVerified" | "active" | "roles">;
const p = (id: string, name: string, category: Product["category"], presentation: string, price: number, goals: Goal[], recommendationStatus: RecommendationStatus, extra: Partial<SourceProduct> = {}): SourceProduct => ({ id, name, category, presentation, price, goals, recommendationStatus, description: `${name}; confirmá composición y etiqueta del fabricante antes de comprar.`, ...extra });
const source: SourceProduct[] = [
  p("whey-isolate-2lb", "Whey Protein Isolate", "proteinas", "2 lb · 27 servicios", 330000, ["MASS", "CUT"], "MANUAL_REVIEW", { servings: 27, imageUrl: "/images/wheyptrotein.webp" }),
  p("whey-concentrada-5lb", "Whey Protein Concentrada", "proteinas", "5 lb · 68 servicios", 450000, ["MASS"], "MANUAL_REVIEW", { servings: 68 }),
  p("proteina-vegana", "Proteína Vegetal (arveja + arroz)", "proteinas", "1 kg · 30 servicios", 265000, ["MASS", "CUT"], "MANUAL_REVIEW", { servings: 30, imageUrl: "/images/proteinavegetal.webp" }),
  p("colageno-hidrolizado", "Colágeno Hidrolizado + Vitamina C", "proteinas", "300 g · 30 servicios", 215000, ["LONGEVITY"], "CATALOG_ONLY", { servings: 30 }),
  p("creatina-mono", "Creatina Monohidratada Micronizada", "creatina", "300 g · 100 servicios", 235000, ["MASS", "PERFORMANCE", "LONGEVITY"], "MANUAL_REVIEW", { servings: 100, imageUrl: "/images/creatinamonohidratada.webp" }),
  p("pre-entreno", "Pre-Entreno sin azúcar", "rendimiento", "300 g · 30 servicios", 255000, ["PERFORMANCE"], "CATALOG_ONLY", { servings: 30, imageUrl: "/images/preentrenopowerboost.webp" }),
  p("eaa-bcaa", "Aminoácidos Esenciales (EAA)", "rendimiento", "400 g · 40 servicios", 185000, ["MASS", "PERFORMANCE"], "MANUAL_REVIEW", { servings: 40, imageUrl: "/images/aminoacidos.webp" }),
  p("glutamina", "L-Glutamina", "rendimiento", "300 g · 60 servicios", 145000, ["PERFORMANCE"], "CATALOG_ONLY", { servings: 60, imageUrl: "/images/lglutamina.webp" }),
  p("aceite-mct", "Aceite MCT C8/C10", "keto", "500 ml", 185000, ["PERFORMANCE"], "CATALOG_ONLY", { imageUrl: "/images/aceitedecocomct.webp" }),
  p("barras-keto", "Barras Keto (caja x 12)", "keto", "12 unidades", 145000, ["CUT"], "CATALOG_ONLY", { imageUrl: "/images/barrasketo.webp" }),
  p("sustituto-comida", "Sustituto de Comida Low Carb", "keto", "1 kg · 20 servicios", 295000, ["CUT"], "CATALOG_ONLY", { servings: 20, imageUrl: "/images/akmuerzosmart.webp" }),
  p("endulzante-monkfruit", "Endulzante Monk Fruit + Eritritol", "keto", "250 g", 89000, ["CUT"], "CATALOG_ONLY", { imageUrl: "/images/eritritolyfrutosdelbosque.webp" }),
  p("omega-3", "Omega 3 Ultra (EPA/DHA)", "longevidad", "120 cápsulas", 169000, ["LONGEVITY"], "MANUAL_REVIEW", { imageUrl: "/images/omega3.webp" }),
  p("magnesio-glicinato", "Magnesio Glicinato", "longevidad", "120 cápsulas", 165000, ["LONGEVITY"], "MANUAL_REVIEW", { imageUrl: "/images/magnesio.webp" }),
  p("vitamina-d3-k2", "Vitamina D3 + K2", "longevidad", "90 cápsulas", 145000, ["LONGEVITY"], "MANUAL_REVIEW", { imageUrl: "/images/vitaminade3yk2.webp" }),
  p("nootropico-focus", "Nootrópico Focus (L-teanina + colina)", "longevidad", "60 cápsulas", 195000, ["PERFORMANCE"], "CATALOG_ONLY", { imageUrl: "/images/nootropico.webp" }),
];
// Relación catálogo ↔ protocolos. Es el único lugar del código donde un SKU se
// asocia a una prioridad: los protocolos hablan de roles, nunca de productos ni
// marcas. Espeja la tabla `product_roles` que va a Supabase en el cutover.
const productRoles: Record<string, ProductRole[]> = {
  "whey-isolate-2lb": ["PROTEIN_GAP"], "whey-concentrada-5lb": ["PROTEIN_GAP"], "proteina-vegana": ["PROTEIN_GAP"],
  "colageno-hidrolizado": ["COLLAGEN"], "creatina-mono": ["CREATINE"], "pre-entreno": ["PRE_WORKOUT"],
  "eaa-bcaa": ["EAA"], "glutamina": ["RECOVERY_AMINO"], "aceite-mct": ["MCT"], "barras-keto": ["LOW_CARB_SNACK"],
  "sustituto-comida": ["MEAL_REPLACEMENT"], "endulzante-monkfruit": ["SWEETENER"], "omega-3": ["OMEGA3"],
  "magnesio-glicinato": ["MAGNESIUM"], "vitamina-d3-k2": ["VITAMIN_D_K"], "nootropico-focus": ["NOOTROPIC"],
};

// Revisión manual documentada en images/README.md: habilita mostrar una
// referencia con aviso; NO verifica que sea el SKU, su etiqueta o su lote.
const approvedReferenceImages = new Set([
  "whey-isolate-2lb", "proteina-vegana", "creatina-mono", "pre-entreno", "eaa-bcaa", "glutamina",
  "aceite-mct", "barras-keto", "sustituto-comida", "endulzante-monkfruit", "omega-3",
  "magnesio-glicinato", "vitamina-d3-k2", "nootropico-focus",
]);

export const products: Product[] = source.map((product) => ({
  ...product, slug: product.id, roles: productRoles[product.id] ?? [], currency: "PYG",
  priceStatus: "pending_confirmation", stockStatus: "pending_confirmation", active: true,
  imageVerified: false, imageStatus: product.imageUrl ? "reference" : "missing",
  imageReferenceApproved: approvedReferenceImages.has(product.id), nutritionStatus: "pending_confirmation",
  ctaUrl: whatsappUrl(`Hola, quiero consultar ${product.name}. ¿Me confirmás presentación, precio y disponibilidad?`),
  ...productCommercialData[product.id],
}));
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

// Resolución por dato, no por SKU: productos activos que cumplen alguno de los
// roles pedidos, en el orden del catálogo. No evalúa elegibilidad: eso lo hace
// `evaluateProductEligibility` sobre el resultado.
export const productsByRole = (roles: readonly ProductRole[], catalog: Product[] = products): Product[] =>
  catalog.filter((product) => product.active && product.roles.some((role) => roles.includes(role)));
export const isPriceConfirmed = (product: Product, now = new Date()) =>
  isPositiveInteger(product.price) && product.priceStatus === "confirmed" && isPastTimestamp(product.priceUpdatedAt, now);

// El estado sin fecha válida nunca se presenta como stock confirmado. Una
// cantidad informada debe ser coherente; bajo pedido puede no tener unidades.
export function isStockConfirmed(product: Product, now = new Date()): boolean {
  if (!isPastTimestamp(product.stockUpdatedAt, now)) return false;
  const quantity = product.stockQuantity;
  if (quantity !== undefined && (!Number.isSafeInteger(quantity) || quantity < 0)) return false;
  switch (product.stockStatus) {
    case "in_stock": case "low_stock": return quantity === undefined || quantity > 0;
    case "out_of_stock": case "on_request": return quantity === undefined || quantity === 0;
    default: return false;
  }
}

export function getStockLabel(product: Product, now = new Date()): string {
  if (!isStockConfirmed(product, now)) return "Pendiente de confirmar";
  const labels: Record<Exclude<StockStatus, "pending_confirmation">, string> = {
    in_stock: "En stock", low_stock: "Últimas unidades", on_request: "Disponible a pedido", out_of_stock: "Agotado",
  };
  return product.stockStatus === "pending_confirmation" ? "Pendiente de confirmar" : labels[product.stockStatus];
}
export const formatPyg = (amount?: number) => !isPositiveInteger(amount) ? "Precio pendiente de confirmar" : `Gs. ${amount!.toLocaleString("es-PY")}`;
