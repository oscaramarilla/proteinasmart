import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogSessionCookie, hasCatalogSession, isCatalogAccessConfigured } from "../../../lib/catalog-access";
import { getCatalogCompleteness } from "../../../lib/product-completeness";
import { evaluateProductEligibility } from "../../../lib/product-eligibility";
import { formatPyg, products } from "../../../lib/products";
import { loginCatalogReport, logoutCatalogReport } from "./actions";
export const metadata: Metadata = { title: "Completitud de catálogo | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const labels = { name: "Nombre", slug: "Slug", category: "Categoría", price: "Precio", priceUpdatedAt: "Fecha de precio", image: "Foto", brand: "Marca", flavor: "Sabor", presentation: "Presentación", servings: "Porciones", servingSize: "Tamaño de porción", proteinPerServing: "Proteína/porción", ingredients: "Ingredientes", nutrition: "Tabla nutricional", stock: "Stock", stockUpdatedAt: "Fecha de stock", supplier: "Proveedor", importerOrDistributor: "Importador/distribuidor", lot: "Lote", expirationDate: "Vencimiento", authenticity: "Autenticidad", active: "Activo" } as const;
const impact = (id: string) => ["creatina-mono", "whey-isolate-2lb", "whey-concentrada-5lb", "proteina-vegana", "eaa-bcaa", "omega-3", "magnesio-glicinato", "vitamina-d3-k2"].indexOf(id);

// Sin sesion valida: 404 si la funcion ni siquiera esta prendida
// (CATALOG_REPORT_ENABLED + CATALOG_ADMIN_TOKEN), formulario de acceso si
// esta prendida pero falta la cookie ps_catalog_session. El reporte en si
// no cambia una linea de abajo.
export default async function CatalogCompletenessPage({
  searchParams,
}: {
  searchParams: Promise<{ access?: string }>;
}) {
  const secret = process.env.CATALOG_ADMIN_TOKEN;
  if (!isCatalogAccessConfigured(process.env.CATALOG_REPORT_ENABLED, secret)) {
    notFound();
  }

  const sesionCookie = (await cookies()).get(catalogSessionCookie)?.value;
  const autorizado = hasCatalogSession(sesionCookie, secret!);

  if (!autorizado) {
    const { access } = await searchParams;
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
        <form
          action={loginCatalogReport}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Administración interna
          </p>
          <h1 className="mt-2 text-2xl font-bold">Reporte de catálogo</h1>
          <label className="mt-6 block text-sm">
            <span className="font-medium text-slate-700">Clave de acceso</span>
            <input
              type="password"
              name="accessKey"
              required
              autoFocus
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </label>
          {access === "denied" && <p className="mt-3 text-sm text-red-600">Clave incorrecta.</p>}
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const summary = getCatalogCompleteness(products); const sorted = [...summary.reports].sort((a, b) => { const ai = impact(a.product.id), bi = impact(b.product.id); return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi); }); const metrics = [["Productos completos", summary.complete], ["Productos publicables", summary.publishable], ["Precio confirmado", summary.confirmedPrice], ["Stock confirmado", summary.confirmedStock], ["Nutrición completa", summary.completeNutrition], ["Con trazabilidad", summary.traceable], ["Con imagen real", summary.realImage]]; return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6"><div className="mx-auto max-w-7xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Administración interna · noindex</p><h1 className="mt-2 text-4xl font-bold">Completitud del catálogo</h1><p className="mt-3 text-slate-600">Los precios publicados hoy son referencias pendientes; no cuentan como confirmados.</p></div><form action={logoutCatalogReport}><button type="submit" className="whitespace-nowrap text-sm font-semibold text-slate-500 underline hover:text-slate-700">Cerrar sesión</button></form></div><section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <article key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}/{summary.total}</p></article>)}</section><section className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-100"><tr>{["Producto", "Foto", "Marca", "Precio", "Stock", "Nutrition", "Proveedor", "Lote", "Nivel", "%"].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>)}</tr></thead><tbody>{sorted.map(({ product, completeness }) => <tr key={product.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{product.name}<span className="block text-xs text-slate-500">{product.slug}</span></td>{[completeness.fields.image, completeness.fields.brand, product.priceStatus === "confirmed", completeness.fields.stock, completeness.fields.nutrition, completeness.fields.supplier, completeness.fields.lot].map((ok, index) => <td key={index} className="px-4 py-3">{ok ? "✓" : "✗"}</td>)}<td className="px-4 py-3">{completeness.publicationStatus}</td><td className="px-4 py-3 font-bold">{completeness.percentage}%</td></tr>)}</tbody></table></section><section className="mt-10 space-y-4">{sorted.map(({ product, completeness }) => { const primary = evaluateProductEligibility(product, "PRIMARY"); return <details key={product.id} className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold">{product.name} · {completeness.percentage}% · {completeness.publicationStatus}</summary><dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Item label="Slug" value={product.slug} /><Item label="Categoría" value={product.category} /><Item label="Precio" value={`${formatPyg(product.price)} · ${product.priceStatus}`} /><Item label="priceUpdatedAt" value={product.priceUpdatedAt} /><Item label="Stock" value={product.stockStatus} /><Item label="stockQuantity" value={product.stockQuantity} /><Item label="stockUpdatedAt" value={product.stockUpdatedAt} /><Item label="Foto" value={product.imageVerified ? product.imageUrl : undefined} /><Item label="Marca" value={product.brand} /><Item label="Sabor" value={product.flavor} /><Item label="Presentación" value={product.presentation} /><Item label="Servings" value={product.servings} /><Item label="Serving size" value={product.servingSize} /><Item label="Proteína/servicio" value={product.proteinPerServing} /><Item label="Ingredientes" value={product.ingredients?.join(", ")} /><Item label="Tabla nutricional" value={product.nutritionalInfo ? JSON.stringify(product.nutritionalInfo) : undefined} /><Item label="Proveedor" value={product.supplier} /><Item label="Importador/distribuidor" value={product.importer ?? product.distributor} /><Item label="Lote" value={product.lot} /><Item label="Vencimiento" value={product.expirationDate} /><Item label="Evidencia" value={product.authenticityEvidence?.map((e) => e.type).join(", ")} /><Item label="Activo" value={product.active ? "Sí" : "No"} /></dl><p className="mt-5 text-sm text-rose-700">Recomendación automática: {primary.eligible ? "habilitada" : `bloqueada — ${primary.reasons.join("; ")}`}</p><p className="mt-2 text-xs text-slate-500">Faltan: {completeness.missing.map((field) => labels[field]).join(", ") || "ninguno"}</p></details>; })}</section></div></main>;
}
function Item({ label, value }: { label: string; value: string | number | undefined }) { return <div><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words">{value ?? "Pendiente"}</dd></div>; }
