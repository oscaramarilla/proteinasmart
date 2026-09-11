import Link from "next/link";
import type { Product } from "../../lib/products";
import { formatPyg, isPriceConfirmed } from "../../lib/products";
import AddProductToCart from "./AddProductToCart";

type Props = {
  products: Product[];
  title: string;
  /** Texto corto bajo el título: para qué sirve esta lista. */
  description?: string;
  /** Reemplaza el vacío por defecto cuando ningún producto está habilitado. */
  emptyNote?: string;
  /** Jerarquía del título dentro de la página (2 por defecto). */
  level?: 2 | 3;
};

const emptyDefault =
  "Todavía no hay productos con datos suficientes para una recomendación automática. Podés pedir una revisión manual por WhatsApp.";

export default function RecommendedProducts({ products, title, description, emptyNote, level = 2 }: Props) {
  const Heading = level === 3 ? "h3" : "h2";
  const headingClass = level === 3 ? "text-xl font-bold" : "text-2xl font-bold";
  return (
    <section>
      <Heading className={headingClass}>{title}</Heading>
      {description ? <p className="mt-2 leading-7 text-slate-700">{description}</p> : null}
      {products.length === 0 ? (
        <p className="mt-3 text-slate-600">{emptyNote ?? emptyDefault}</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="font-bold">
                <Link className="underline" href={`/productos/${product.slug}`}>
                  {product.name}
                </Link>
              </h4>
              <p className="mt-2 text-sm text-slate-600">{product.presentation ?? "Presentación a confirmar"}</p>
              <p className="mt-3 font-semibold">{formatPyg(product.price)}</p>
              <div className="mt-4">
                <AddProductToCart
                  id={product.id}
                  name={product.name}
                  price={isPriceConfirmed(product) ? product.price : undefined}
                  presentation={product.presentation}
                  imageUrl={product.imageUrl}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
