import { getProductCompleteness } from "./product-completeness.ts";
import { formatPyg, isPriceConfirmed, isStockConfirmed, type Product } from "./products.ts";

/** Un precio de referencia nunca se convierte en una oferta confirmada. */
export function getPriceLabel(product: Product): string {
  if (isPriceConfirmed(product)) return formatPyg(product.price);
  return typeof product.price === "number" && Number.isSafeInteger(product.price) && product.price >= 0
    ? `Precio de referencia: ${formatPyg(product.price)}`
    : "Precio pendiente de confirmar";
}

/** Datos estructurados solo para fichas publicables y ofertas comprobadas. */
export function getProductSchema(product: Product, origin: string): Record<string, unknown> | null {
  if (!product.active || getProductCompleteness(product).publicationStatus === "DRAFT") return null;
  const url = new URL(`/productos/${product.slug}`, origin).href;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "Product",
    name: product.name, description: product.description, url,
  };
  if (product.imageUrl) schema.image = new URL(product.imageUrl, origin).href;
  if (product.brand?.trim()) schema.brand = { "@type": "Brand", name: product.brand };
  if (isPriceConfirmed(product) && isStockConfirmed(product)) {
    const availability = {
      in_stock: "InStock", low_stock: "LimitedAvailability", on_request: "PreOrder",
      out_of_stock: "OutOfStock", pending_confirmation: "",
    }[product.stockStatus];
    if (availability) schema.offers = {
      "@type": "Offer", price: product.price, priceCurrency: "PYG", url,
      availability: `https://schema.org/${availability}`,
    };
  }
  return schema;
}

/** Evita que contenido del proveedor pueda cerrar la etiqueta script. */
export function serializeProductSchema(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
