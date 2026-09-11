"use client";
import { useCartStore } from "../../lib/useCartStore";
type Props = { id: string; name: string; price?: number; presentation?: string; imageUrl?: string };
export default function AddProductToCart({ id, name, price, presentation, imageUrl }: Props) {
  const add = useCartStore((state) => state.agregarItem);
  if (price === undefined) return null;
  return <button type="button" onClick={() => add({ id, nombre: name, precio: price, unidad: presentation ?? "Presentación a confirmar", imagenUrl: imageUrl })} className="rounded-xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900">Agregar al carrito</button>;
}
