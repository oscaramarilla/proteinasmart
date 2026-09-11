import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getStockLabel, isPriceConfirmed, isStockConfirmed } from "../../../lib/products";
import { getProductCompleteness } from "../../../lib/product-completeness";
import { getPriceLabel, getProductSchema, serializeProductSchema } from "../../../lib/product-presentation";
import { negocio } from "../../../lib/negocio";
import AddProductToCart from "../../../components/product/AddProductToCart";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product?.active) return { robots: { index: false, follow: false } };
  const publication = getProductCompleteness(product).publicationStatus;
  return {
    title: `${product.name} | ProteínaSmart`, description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
    robots: { index: publication !== "DRAFT", follow: true },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product?.active) notFound();
  const priceConfirmed = isPriceConfirmed(product);
  const stockConfirmed = isStockConfirmed(product);
  const schema = getProductSchema(product, negocio.dominio);
  const canAdd = priceConfirmed && stockConfirmed && ["in_stock", "low_stock"].includes(product.stockStatus);

  return <main className="mx-auto min-h-screen max-w-5xl px-6 py-12 text-slate-900">
    <nav className="text-sm text-slate-600"><Link href="/catalogo">Catálogo</Link> / {product.name}</nav>
    <div className="mt-8 grid gap-10 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {product.imageUrl ? <Image src={product.imageUrl} alt={product.imageVerified ? product.name : `Imagen referencial de ${product.name}`} fill className="object-contain p-8" sizes="(max-width: 768px) 100vw, 50vw" /> : <span className="flex h-full items-center justify-center p-8 text-center text-slate-500">Fotografía pendiente de verificación</span>}
        </div>
        {product.imageUrl && !product.imageVerified && <p className="mt-3 text-sm text-slate-600">Imagen referencial. Confirmá la presentación, etiqueta y lote del producto que recibirás antes de pagar.</p>}
      </div>
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{product.category}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-5 leading-7 text-slate-700">{product.description}</p>
        <p className="mt-6 text-2xl font-bold">{getPriceLabel(product)}</p>
        <p className="mt-1 text-sm text-slate-500">{priceConfirmed ? `Precio actualizado: ${product.priceUpdatedAt}` : "Precio final pendiente de confirmar"}</p>
        <p className="mt-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">{getStockLabel(product)}</p>
        <p className="mt-1 text-sm text-slate-500">{stockConfirmed ? `Stock actualizado: ${product.stockUpdatedAt}` : "Stock pendiente de confirmación"}</p>
        <p className="mt-3 text-sm text-slate-600">Entrega, costo de envío y total final a confirmar antes del pago.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {canAdd && <AddProductToCart id={product.id} name={product.name} price={product.price} presentation={product.presentation} imageUrl={product.imageUrl} />}
          {product.ctaUrl && <a className="inline-flex rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white" href={product.ctaUrl} target="_blank" rel="noreferrer">Confirmar por WhatsApp</a>}
        </div>
      </section>
    </div>
    <section className="mt-14 grid gap-8 rounded-2xl bg-slate-50 p-7 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold">Información disponible</h2>
        <dl className="mt-4 space-y-3 text-slate-700">
          <div><dt className="font-medium">Marca</dt><dd>{product.brand ?? "Pendiente de confirmar"}</dd></div>
          <div><dt className="font-medium">Presentación</dt><dd>{product.presentation ?? "Pendiente de confirmar"}</dd></div>
          <div><dt className="font-medium">Sabor</dt><dd>{product.flavor ?? "Pendiente de confirmar"}</dd></div>
          <div><dt className="font-medium">Porciones</dt><dd>{product.servings === undefined ? "Pendiente de confirmar" : `${product.servings}${product.nutritionStatus === "verified" ? "" : " · referencia pendiente de verificar"}`}</dd></div>
          <div><dt className="font-medium">Tamaño de porción</dt><dd>{product.servingSize ?? "Pendiente de confirmar"}</dd></div>
          <div><dt className="font-medium">Proteína por servicio</dt><dd>{product.proteinPerServing === undefined ? "Pendiente de confirmar" : `${product.proteinPerServing} g`}</dd></div>
        </dl>
      </div>
      <div>
        <h2 className="text-xl font-bold">Antes de comprar</h2>
        <p className="mt-4 leading-7 text-slate-700">Solicitá la etiqueta, ingredientes, lote, vencimiento y origen del envase que recibirás. Los datos pendientes requieren confirmación antes de cobrar.</p>
        <Link className="mt-4 inline-block font-semibold text-emerald-800 underline" href="/como-verificamos">Cómo verificamos productos</Link>
      </div>
    </section>
    {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeProductSchema(schema) }} />}
  </main>;
}
