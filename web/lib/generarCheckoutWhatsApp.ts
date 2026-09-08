import type { CartItem } from './useCartStore';
import { FLETE_DISCLAIMER } from './checkoutEntrega';

const NUMERO_WHATSAPP = '595985864209';

type DetalleEntregaMensaje = {
  metodoLabel: string;
  esEncomienda: boolean;
  resumenCampos: Record<string, string>;
};

export function generarCheckoutWhatsApp(
  carrito: CartItem[],
  total: number,
  entrega: DetalleEntregaMensaje,
) {
  const precioFormateado = new Intl.NumberFormat('es-PY').format(total);
  const itemsFormateados = carrito.map(
    (item) => `- ${item.cantidad}x ${item.nombre} (${item.unidad})`,
  );

  const lineasEntrega = [
    '',
    `Método de entrega: ${entrega.metodoLabel}`,
    ...Object.entries(entrega.resumenCampos).map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
    ...(entrega.esEncomienda ? [FLETE_DISCLAIMER] : []),
  ];

  const mensaje = [
    '¡Hola! Quiero confirmar mi pedido en Proteina Smart:',
    '',
    ...itemsFormateados,
    `Total: ${precioFormateado} Gs.`,
    ...lineasEntrega,
    'Por favor, envíame los métodos de pago para coordinar.',
  ].join('\n');

  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
